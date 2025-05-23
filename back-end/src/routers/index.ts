import { Router } from 'express';
import protectedPathMiddleware from "@middleware/protectedPath.middleware";
import authRouter from './auth.route';
import userRouter from './user.route';
import friendsRouter from './friend.router';
import messageRouter from './message.route';
import thumbnailRouter from './thumbnail.route';

const router = Router();

router.use('/auth', authRouter);
router.use('/users', protectedPathMiddleware, userRouter);
router.use('/friend', protectedPathMiddleware, friendsRouter);
router.use('/message', protectedPathMiddleware, messageRouter);
router.use('/thumbnail', protectedPathMiddleware, thumbnailRouter);

export default router;
