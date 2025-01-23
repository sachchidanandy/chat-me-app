import { Request, Response } from 'express';

import { INT_SER_ERROR } from '@constants/errorMessages';
import { INTERNAL_SERVER_ERROR, SUCCESS } from '@constants/statusCode';
import { ErrorResponse } from './errorResponse';

type controller = (req: Request, res: Response) => Promise<Response>;

export const sendErrorResponse = (
  res: Response,
  message: string = INT_SER_ERROR,
  status: number = INTERNAL_SERVER_ERROR,
) => (
  res.status(status).json({
    status: 'error',
    error: {
      message,
    }
  })
);

export const sendSuccessResponse = (
  res: Response,
  data: Object = {},
  status: number = SUCCESS,
) => (
  res.status(status).json({
    status: 'success',
    data: data
  })
);

export const tryCatchWrapper = (controller: controller) => {
  return async (req: Request, res: Response) => {
    try {
      await controller(req, res);
    } catch (error: unknown) {
      console.error(error);
      if (error instanceof ErrorResponse) {
        sendErrorResponse(res, error.message, error.status);
      } else {
        sendErrorResponse(res, (error as Error).message);
      }
    }
  };
};
