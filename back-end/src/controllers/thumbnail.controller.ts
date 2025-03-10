import { INVALID_THUMBNAIL } from "@constants/errorMessages";
import { BAD_REQUEST } from "@constants/statusCode";
import Thumbnail from "@models/thumbnail.model";
import { ErrorResponse } from "@utils/errorResponse";
import { sendSuccessResponse } from "@utils/wrapper";
import { Request, Response } from "express";

export const uploadThumbnail = async (req: Request, res: Response) => {
  const { thumbnailUrl, fileName } = req.body;
  if (!thumbnailUrl || !fileName) {
    throw new ErrorResponse(INVALID_THUMBNAIL, BAD_REQUEST);
  }

  await new Thumbnail({ thumbnailUrl, fileName }).save();

  return sendSuccessResponse(res, { fileName });
};

export const fetchThumbnail = async (req: Request, res: Response) => {
  const { fileName } = req.params;
  const thumbnail = await Thumbnail.findOne({ fileName }).select("thumbnailUrl");

  if (!thumbnail) {
    throw new ErrorResponse(INVALID_THUMBNAIL, BAD_REQUEST);
  }
  return sendSuccessResponse(res, { thumbnailUrl: thumbnail.thumbnailUrl });
};
