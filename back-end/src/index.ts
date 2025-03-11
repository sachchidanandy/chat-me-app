import '../newrelic';
import http from 'http';
import { Server } from 'socket.io';
import Redis from "ioredis"
import express, { Express, NextFunction, Request, Response } from 'express';
import cookieParser from "cookie-parser";
import cors from 'cors';

import router from '@routers/index';
import { PORT, CORS_ALLOWED_DOMAIN, REDIS_URL } from '@utils/config';
import connectDB from '@utils/connectDB';
import { sendErrorResponse } from '@utils/wrapper';
import { BAD_REQUEST, INTERNAL_SERVER_ERROR, NOT_FOUND } from '@constants/statusCode';
import { INT_SER_ERROR, URL_DO_NOT_EXIST } from '@constants/errorMessages';
import { ErrorResponse } from '@utils/errorResponse';
import { handleRedisSubscription, handleSocketConnection } from '@controllers/socket.controller';
import { MulterError } from 'multer';

const app: Express = express();
const server = http.createServer(app);
export const io = new Server(server, { cors: { origin: `${CORS_ALLOWED_DOMAIN}` } });

// Publisher for publishing events & storing active users
export const redisPub = new Redis(REDIS_URL);
export const redisStore = new Redis(REDIS_URL);

// Subscriber for listening to events
const redisSub = new Redis(REDIS_URL);

// register socket listner and redisPub functions
handleSocketConnection(io, redisPub, redisStore);
handleRedisSubscription(io, redisSub);

app.use(cors({
  origin: CORS_ALLOWED_DOMAIN, // Replace with your React app's origin
  credentials: true, // Allow credentials (cookies, authorization headers, etc.)
}));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());

app.use('/api', router);

// 404 Handler: Catch-all route for unmatched routes
app.use((req: Request, res: Response) => {
  sendErrorResponse(res, URL_DO_NOT_EXIST(req.method, req.path), NOT_FOUND);
});

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  const reqBody = { ...req?.body };
  delete reqBody.password;
  delete reqBody.publicKey;
  delete reqBody.encryptedPrivateKey;


  console.error("ERROR LOG : ", {
    url: req?.path,
    req_header: req?.headers,
    query_params: req?.query,
    body: reqBody,
    error: error
  });

  if (error instanceof ErrorResponse) {
    sendErrorResponse(res, error.message, error.status);
  } else if (error instanceof MulterError) {
    sendErrorResponse(res, error.message, BAD_REQUEST);
  } else {
    sendErrorResponse(res, INT_SER_ERROR, INTERNAL_SERVER_ERROR);
  }
});

connectDB(() => {
  server.listen(PORT, () => {
    console.log(`[server]: Server is running at http://localhost:${PORT}`);
  });
});
