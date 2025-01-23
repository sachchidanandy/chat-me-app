import '../newrelic';
import express, { Express, NextFunction, Request, Response } from 'express';

import router from '@routers/index';
import { PORT } from '@utils/config';
import connectDB from '@utils/connectDB';
import { sendErrorResponse } from '@utils/wrapper';
import { NOT_FOUND } from '@constants/statusCode';
import { URL_DO_NOT_EXIST } from '@constants/errorMessages';

const app: Express = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', router);
app.use((req: Request, res: Response) => {
  sendErrorResponse(res, URL_DO_NOT_EXIST(req.method, req.path), NOT_FOUND);
});

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(error);
  sendErrorResponse(res, error.message);
});

connectDB(() => {
  app.listen(PORT, () => {
    console.log(`[server]: Server is running at http://localhost:${PORT}`);
  });
});
