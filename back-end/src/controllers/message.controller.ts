import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

import { SEARCH_QUERY_REQ, NO_FILE_FOUND } from "@constants/errorMessages";
import { BAD_REQUEST } from "@constants/statusCode";
import { fetchUserChatList, fetchUserMessages } from "@services/message.services";
import { handleFileUpload } from "@services/uploadFile.services";
import { ErrorResponse } from "@utils/errorResponse";
import { sendSuccessResponse } from "@utils/wrapper";
import { Request, Response } from "express";
import { io, redisStore } from "src";
import { AWS_S3_BUCKET_NAME } from '@utils/config';

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

export const fetchChatList = async (req: Request, res: Response) => {
  const { userId } = req?.body;
  let chatList = await fetchUserChatList(userId);
  if (chatList?.length) {
    // get all active users { "123": "socket123xyz", "456": "socket456abc" }
    const activeUsers = await redisStore.hgetall("active_users");
    if (Object.keys(activeUsers).length) {
      chatList = chatList.map(chat => ({ ...chat, isOnline: activeUsers[chat.id] ? true : false }))
    }
  }
  return sendSuccessResponse(res, { chatList });
};

export const uploadMessageAttachement = async (req: Request, res: Response) => {
  if (!req.file) throw new ErrorResponse(NO_FILE_FOUND, BAD_REQUEST);

  // Type assertion to ensure req.file is treated as multer's File type
  const file = req.file as Express.MulterS3.File;
  const fileId = uuidv4();
  try {
    const { upload, fileKey } = handleFileUpload(file, fileId);

    sendSuccessResponse(res, { message: 'File upload in progress!', fileId });

    let lastEmittedProgress = 0;
    upload.on("httpUploadProgress", (progress) => {
      if (progress.loaded && progress.total) {
        const percent = Math.round((progress.loaded / progress.total) * 100);

        // Emit only if progress increased by at least 5% (to reduce WebSocket spam)
        if (percent >= lastEmittedProgress + 5) {
          io.emit(`uploadProgress-${fileId}`, percent);
          lastEmittedProgress = percent;
        }
      }
    });

    const result = await upload.done(); // Wait for upload to complete

    // Remove file from storage after successful upload
    fs.unlink(file.path, (err) => {
      if (err) {
        console.error(err);
      }
    });

    // Check if S3 returned a Location field
    const fileUrl = result.Location
      ? result.Location
      : `https://${AWS_S3_BUCKET_NAME}.s3.amazonaws.com/${fileKey}`;

    io.emit(`uploadComplete-${fileId}`, {
      fileUrl,
      fileName: file.originalname,
      fileSize: file.size,
      fileType: file.mimetype,
      uploadedAt: new Date(),
      expiredAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
  } catch (error) {
    io.emit(`uploadError-${fileId}`, "Upload failed. Please try again.");
    throw error;
  }
};
