import { Request, Response } from 'express';

export default function tryCatchWrapper(controller: (req: Request, res: Response) => Promise<void>) {
  return async (req: Request, res: Response) => {
    try {
      await controller(req, res);
    } catch (error: unknown) {
      console.error(error);
      res.status(500).json({ error: (error as Error).message || 'Something went wrong' });
    }
  };
}