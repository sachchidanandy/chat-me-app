import { Router } from "express";

import { tryCatchWrapper } from '@utils/wrapper';
import { signup } from "@controllers/auth.controller";

const authRouter = Router();

authRouter.post("/sign-up", tryCatchWrapper(signup));

export default authRouter;
