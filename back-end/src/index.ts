import '../newrelic';
import express, { Express, NextFunction, Request, Response } from 'express';
import cors from 'cors';

import router from '@routers/index';
import { PORT, CORS_ALLOWED_DOMAIN } from '@utils/config';
import connectDB from '@utils/connectDB';
import { sendErrorResponse } from '@utils/wrapper';
import { INTERNAL_SERVER_ERROR, NOT_FOUND } from '@constants/statusCode';
import { INT_SER_ERROR, URL_DO_NOT_EXIST } from '@constants/errorMessages';
import { ErrorResponse } from '@utils/errorResponse';

const app: Express = express();
app.use(cors({
  origin: CORS_ALLOWED_DOMAIN, // Replace with your React app's origin
  credentials: true, // Allow credentials (cookies, authorization headers, etc.)
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', router);

// 404 Handler: Catch-all route for unmatched routes
app.use((req: Request, res: Response) => {
  sendErrorResponse(res, URL_DO_NOT_EXIST(req.method, req.path), NOT_FOUND);
});

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("===== ERROR =====", error);
  if (error instanceof ErrorResponse) {
    sendErrorResponse(res, error.message, error.status);
  } else {
    sendErrorResponse(res, INT_SER_ERROR, INTERNAL_SERVER_ERROR);
  }
});

connectDB(() => {
  app.listen(PORT, () => {
    console.log(`[server]: Server is running at http://localhost:${PORT}`);
  });
});
