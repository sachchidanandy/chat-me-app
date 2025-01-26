import { Request, Response } from "express";

import User from '@models/user.model';
import { BAD_REQUEST, CREATED } from "@constants/statusCode";
import { sendSuccessResponse } from "@utils/wrapper";
import { EMAIL_ALREADY_REGISTERED, INVALID_CREDENTIALS } from "@constants/errorMessages";
import { ErrorResponse } from "@utils/errorResponse";
import { generateToken } from "@utils/jwtToken";
import { encryptPassword, comparePassword } from "@utils/encryption";

export const signup = async (req: Request, res: Response) => {
  const { username, email, fullName, password, publicKey, encryptedPrivateKey } = req.body;

  // check if email already exist
  const existingUser = await User.find({ email });
  if (existingUser) {
    throw new ErrorResponse(EMAIL_ALREADY_REGISTERED, BAD_REQUEST);
  }

  // ecrypt password
  const encryptedPassword = encryptPassword(password);

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
    sameSite: 'none',
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
