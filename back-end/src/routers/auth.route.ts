import { Router, Request, Response } from "express";
import tryCatchWrapper from '@utils/tryCatchWrapper';

const authRouter = Router();

authRouter.get("/", tryCatchWrapper(async (req: Request, res: Response) => {
  res.send("auth");
}));

export default authRouter;
