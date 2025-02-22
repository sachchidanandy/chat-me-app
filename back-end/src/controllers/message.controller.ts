import { SEARCH_QUERY_REQ } from "@constants/errorMessages";
import { BAD_REQUEST } from "@constants/statusCode";
import { fetchUserMessages } from "@services/message.services";
import { ErrorResponse } from "@utils/errorResponse";
import { sendSuccessResponse } from "@utils/wrapper";
import { Request, Response } from "express";

export const fetchMessages = async (req: Request, res: Response) => {
  const { friendsId } = req.params;
  const { userId } = req?.body;
  const page = parseInt(req.query?.page as string) || 1;
  const limit = parseInt(req.query?.limit as string) || 50;
  const offset = (page - 1) * limit;

  if (!friendsId) {
    throw new ErrorResponse(SEARCH_QUERY_REQ, BAD_REQUEST);
  }

  const messages = await fetchUserMessages(userId, friendsId, offset, limit);
  return sendSuccessResponse(res, { messages });
};