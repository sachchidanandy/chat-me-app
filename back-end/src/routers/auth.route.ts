import { Router } from "express";

import { tryCatchWrapper } from '@utils/wrapper';
import { fetchLogedInUser, loginUser, logoutUser, signup } from "@controllers/auth.controller";
import protectedPathMiddleware from "@middleware/protectedPath.middleware";

const authRouter = Router();

authRouter.post("/sign-up", tryCatchWrapper(signup));
authRouter.post("/login", tryCatchWrapper(loginUser));
authRouter.get("/logout", tryCatchWrapper(logoutUser));
authRouter.get("/user", protectedPathMiddleware, tryCatchWrapper(fetchLogedInUser));

export default authRouter;
