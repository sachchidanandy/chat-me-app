import { Request, Response } from "express";

import User from '@models/user.model';
import { BAD_REQUEST, CREATED, UNAUTHORISED } from "@constants/statusCode";
import { sendSuccessResponse } from "@utils/wrapper";
import { EMAIL_ALREADY_REGISTERED, INVALID_CREDENTIALS, USER_NOT_FOUND } from "@constants/errorMessages";
import { ErrorResponse } from "@utils/errorResponse";
import { generateToken } from "@utils/jwtToken";
import { encryptPassword, comparePassword } from "@utils/encryption";
import { activeUsers } from "./socket.controller";
import { redisPub, redisStore } from "../index";

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
    sameSite: 'none',
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
    sameSite: 'strict',
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
  res.clearCookie('access_token');
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
