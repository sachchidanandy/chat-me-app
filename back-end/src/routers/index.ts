import { Router } from 'express';
import protectedPathMiddleware from "@middleware/protectedPath.middleware";
import authRouter from './auth.route';
import userRouter from './user.route';
import friendsRouter from './friends.router';

const router = Router();

router.use('/auth', authRouter);
router.use('/users', protectedPathMiddleware, userRouter);
router.use('/friend', protectedPathMiddleware, friendsRouter);

export default router;
