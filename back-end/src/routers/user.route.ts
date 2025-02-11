import { Router } from "express";

import { tryCatchWrapper } from '@utils/wrapper';
import { searchUsers } from "@controllers/user.controller";
import protectedPathMiddleware from "@middleware/protectedPath.middleware";

const userRouter = Router();

userRouter.get("/:searchQuery/:page?/:limit?", protectedPathMiddleware, tryCatchWrapper(searchUsers));

export default userRouter;