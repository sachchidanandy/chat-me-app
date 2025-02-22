import {
  acknowledgeRequest,
  getAllFriendRequest,
  getAllFriends,
  sendRequest,
  fetchSpecificFriendDetail
} from "@controllers/friend.controller";
import { tryCatchWrapper } from "@utils/wrapper";
import { Router } from "express";

const friendsRouter = Router();

friendsRouter.post('/request', tryCatchWrapper(sendRequest));
friendsRouter.patch('/request', tryCatchWrapper(acknowledgeRequest));
friendsRouter.get('/request', tryCatchWrapper(getAllFriendRequest));
friendsRouter.get('/all', tryCatchWrapper(getAllFriends));
friendsRouter.get('/details', tryCatchWrapper(fetchSpecificFriendDetail));

export default friendsRouter;
