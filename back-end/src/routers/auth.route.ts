import { Router } from "express";

import { tryCatchWrapper } from '@utils/wrapper';
import { loginUser, logoutUser, signup } from "@controllers/auth.controller";

const authRouter = Router();

authRouter.post("/sign-up", tryCatchWrapper(signup));
authRouter.post("/login", tryCatchWrapper(loginUser));
authRouter.get("/logout", tryCatchWrapper(logoutUser));

export default authRouter;
