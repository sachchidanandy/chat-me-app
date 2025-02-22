import { fetchMessages } from "@controllers/message.controller";
import { tryCatchWrapper } from "@utils/wrapper";
import { Router } from "express";

const messageRouter = Router();

messageRouter.get("/:friendsId", tryCatchWrapper(fetchMessages));

export default messageRouter;