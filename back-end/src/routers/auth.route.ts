import { Router } from "express";

import { tryCatchWrapper } from '@utils/wrapper';
import {
    fetchLogedInUser,
    forgotPassword,
    loginUser,
    logoutUser,
    signup,
    tabClosedLogout,
    resetPassword,
} from "@controllers/auth.controller";
import protectedPathMiddleware from "@middleware/protectedPath.middleware";

const authRouter = Router();

authRouter.post("/sign-up", tryCatchWrapper(signup));
authRouter.post("/login", tryCatchWrapper(loginUser));
authRouter.get("/logout", tryCatchWrapper(logoutUser));
authRouter.post("/forgot-password", tryCatchWrapper(forgotPassword));
authRouter.post("/reset-password", tryCatchWrapper(resetPassword));
authRouter.post("/tab-closed-logout", protectedPathMiddleware, tryCatchWrapper(tabClosedLogout));
authRouter.get("/user", protectedPathMiddleware, tryCatchWrapper(fetchLogedInUser));

export default authRouter;
