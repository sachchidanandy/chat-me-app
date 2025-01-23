import '../newrelic';
import express, { Express, NextFunction, Request, Response } from 'express';

import router from '@routers/index';
import { PORT } from '@utils/config';

const app: Express = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', router);

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(error);
  res.status(500).json({ error: error.message || 'Something went wrong' });
});

app.listen(PORT, () => {
  console.log(`[server]: Server is running at http://localhost:${PORT}`);
});