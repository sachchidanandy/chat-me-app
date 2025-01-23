import { Request, Response } from "express";

import User from '@models/user.model';
import { BAD_REQUEST } from "@constants/statusCode";
import { sendSuccessResponse } from "@utils/wrapper";
import { EMAIL_ALREADY_REGISTERED } from "@constants/errorMessages";
import { ErrorResponse } from "@utils/errorResponse";

export const signup = async (req: Request, res: Response) => {
  const { username, email, full_name, password, pub_key, priv_key } = req.body;

  // check if email already exist
  const existingUser = await User.find({ email });
  if (existingUser) {
    throw new ErrorResponse(EMAIL_ALREADY_REGISTERED, BAD_REQUEST);
  }

  return sendSuccessResponse(res, { message: 'User registered successfully!' });
}