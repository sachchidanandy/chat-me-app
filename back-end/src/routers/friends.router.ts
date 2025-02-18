import {
  acknowledgeRequest,
  getAllFriendRequest,
  getAllFriends,
  sendRequest
} from "@controllers/friend.controller";
import { tryCatchWrapper } from "@utils/wrapper";
import { Router } from "express";

const friendsRouter = Router();

friendsRouter.post('/request', tryCatchWrapper(sendRequest));
friendsRouter.patch('/request', tryCatchWrapper(acknowledgeRequest));
friendsRouter.get('/request', tryCatchWrapper(getAllFriendRequest));
friendsRouter.get('/all', tryCatchWrapper(getAllFriends));

export default friendsRouter;
