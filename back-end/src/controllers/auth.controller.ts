import { Request, Response } from "express";

import User from '@models/user.model';
import { BAD_REQUEST, CREATED, UNAUTHORISED } from "@constants/statusCode";
import { sendSuccessResponse } from "@utils/wrapper";
import {
  EMAIL_ALREADY_REGISTERED,
  INVALID_CREDENTIALS,
  USER_NOT_FOUND,
  INVALID_REST_PASSWORD_TOKEN,
  PASSWORD_MISMATCH,
  EXPIRED_REST_PASSWORD_TOKEN,
} from "@constants/errorMessages";
import { ErrorResponse } from "@utils/errorResponse";
import { generateToken } from "@utils/jwtToken";
import { encryptPassword, comparePassword } from "@utils/encryption";
import { activeUsers } from "./socket.controller";
import { redisPub, redisStore } from "../index";
import { sendEmail } from "@utils/mailer";
import { generateResetPasswordToken, isNotValidResetToken } from "@utils/helper";

export const signup = async (req: Request, res: Response) => {
  const { username, email, fullName, password, publicKey, encryptedPrivateKey } = req.body;

  // check if email already exist
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ErrorResponse(EMAIL_ALREADY_REGISTERED, BAD_REQUEST);
  }

  // ecrypt password
  const encryptedPassword = await encryptPassword(password);

  // create new user
  const createdUser = new User({
    username,
    email,
    full_name: fullName,
    password: encryptedPassword,
    pub_key: publicKey,
    priv_key: encryptedPrivateKey,
  });

  // geneate jwt token
  const jwtToken = generateToken(createdUser._id as unknown as string);

  // Save new user to db
  await createdUser.save();

  res.cookie('access_token', jwtToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  const responseBody = {
    userId: createdUser._id as unknown as string,
    username: createdUser.username,
    fullName: createdUser.full_name,
    email: createdUser.email,
    profilePicUrl: createdUser.profile_pic_url,
  }

  return sendSuccessResponse(res, { user: responseBody, message: 'User created successfully!' }, CREATED);
};

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    throw new ErrorResponse(INVALID_CREDENTIALS, BAD_REQUEST);
  }

  const isValidPassword = await comparePassword(password, user.password as string);
  if (!isValidPassword) {
    throw new ErrorResponse(INVALID_CREDENTIALS, BAD_REQUEST);
  }

  // geneate jwt token
  const jwtToken = generateToken(user._id as unknown as string);

  res.cookie('access_token', jwtToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  const responseBody = {
    userId: user._id as unknown as string,
    username: user.username,
    fullName: user.full_name,
    email: user.email,
    profilePicUrl: user.profile_pic_url,
    pubKey: user.pub_key,
    priKey: user.priv_key,
  };

  return sendSuccessResponse(res, { user: responseBody, message: 'User logged in successfully!' });
};

export const logoutUser = async (req: Request, res: Response) => {
  res.clearCookie('access_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
  });
  return sendSuccessResponse(res, { message: 'User logged out successfully!' });
};

export const tabClosedLogout = async (req: Request, res: Response) => {
  const { userId } = req.body;
  await User.updateOne({ _id: userId }, { $set: { last_seen: new Date() } });
  activeUsers.delete(userId);
  await redisStore.hdel('active_users', userId);
  redisPub.publish("user_status_channel", JSON.stringify({ userId, status: "offline" }));
  return sendSuccessResponse(res);
};

export const fetchLogedInUser = async (req: Request, res: Response) => {
  const userId = req.body?.userId;

  if (!userId) {
    throw new ErrorResponse(INVALID_CREDENTIALS, UNAUTHORISED);
  }

  const userDetails = await User.findById(userId).select({ createdAt: 0, updatedAt: 0, priv_key: 0, password: 0 });
  if (!userDetails) {
    throw new ErrorResponse(USER_NOT_FOUND, UNAUTHORISED);
  }

  const responseBody = {
    userId: userDetails._id as unknown as string,
    username: userDetails.username,
    fullName: userDetails.full_name,
    email: userDetails.email,
    profilePicUrl: userDetails.profile_pic_url,
    pubKey: userDetails.pub_key,
  };

  return sendSuccessResponse(res, { user: responseBody, message: 'User detail fetched successfully.' });
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    throw new ErrorResponse(USER_NOT_FOUND, BAD_REQUEST);
  }

  const { resetToken, hashedToken } = generateResetPasswordToken();
  const link = `${process.env.CORS_ALLOWED_DOMAIN}/reset-password/${resetToken}/${user._id}`;

  const html = `<p>Click the link below to reset your password:</p>
    <a href="${link}">Reset Password</a>
    <span>This link will expire in 30 minutes.</span>
    <br/>
    <span>Thank you.</span>
    <br/>
    <span>Plain Url In Case of Error:</span>
    <br/>
    <span>${link}</span>
  `;

  // seve reset token to db
  user.reset_password_token = hashedToken;
  user.reset_password_token_expiry = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
  await user.save();

  await sendEmail(process.env.EMAIL_ADDRESS ? [process.env.EMAIL_ADDRESS] : [user.email], 'Reset Password', html);
  return sendSuccessResponse(res, { message: 'Password reset link having expiry of 30 minutes has been sent to registered email.' });
};

export const resetPassword = async (req: Request, res: Response) => {
  const { confirmPassword, password, token, userId } = req.body;

  if (password !== confirmPassword) {
    throw new ErrorResponse(PASSWORD_MISMATCH, BAD_REQUEST);
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ErrorResponse(USER_NOT_FOUND, BAD_REQUEST);
  }

  if (isNotValidResetToken(token, user.reset_password_token || '')) {
    throw new ErrorResponse(INVALID_REST_PASSWORD_TOKEN, BAD_REQUEST);
  }

  if (!user.reset_password_token_expiry || user.reset_password_token_expiry < new Date()) {
    throw new ErrorResponse(EXPIRED_REST_PASSWORD_TOKEN, BAD_REQUEST);
  }

  // ecrypt password
  const encryptedPassword = await encryptPassword(password);

  user.password = encryptedPassword;
  user.reset_password_token = undefined;
  user.reset_password_token_expiry = undefined;
  await user.save();

  return sendSuccessResponse(res, { message: 'Password reset successfully. Please login' });
};
