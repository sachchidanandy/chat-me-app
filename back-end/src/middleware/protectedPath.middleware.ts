import { NextFunction, Request, Response } from "express";

import { INVALID_TOKEN, AUTH_TOKEN_REQ } from "@constants/errorMessages";
import { UNAUTHORISED } from "@constants/statusCode";
import { ErrorResponse } from "@utils/errorResponse";
import { verifyToken } from "@utils/jwtToken";
import { tryCatchWrapper } from "@utils/wrapper";

export default tryCatchWrapper(async (req: Request, res: Response, next: NextFunction) => {
  const authToken = req.cookies['access_token'];
  if (!authToken) {
    throw new ErrorResponse(AUTH_TOKEN_REQ, UNAUTHORISED);
  }
  const tokenData = verifyToken(authToken);
  if (!tokenData) {
    res.clearCookie('access_token');
    throw new ErrorResponse(INVALID_TOKEN, UNAUTHORISED);
  }

  // Check if tokenData is an object with a user_id property
  if (typeof tokenData === 'object' && 'user_id' in tokenData) {
    req.body.userId = tokenData.user_id;
  } else {
    res.clearCookie('access_token');
    throw new ErrorResponse(INVALID_TOKEN, UNAUTHORISED);
  }

  next();
});
