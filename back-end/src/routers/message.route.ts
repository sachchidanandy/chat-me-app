import { fetchMessages, fetchChatList, uploadMessageAttachement } from "@controllers/message.controller";
import uploadFileMiddleware from "@middleware/fileUpload.middleware";
import { tryCatchWrapper } from "@utils/wrapper";
import { Router } from "express";

const messageRouter = Router();

messageRouter.get("/fetch-chat-list", tryCatchWrapper(fetchChatList));
messageRouter.post("/upload-message-attachment", uploadFileMiddleware, tryCatchWrapper(uploadMessageAttachement));
messageRouter.get("/:friendsId", tryCatchWrapper(fetchMessages));

export default messageRouter;
