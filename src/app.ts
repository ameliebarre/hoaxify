import '@/composition-root';
import cookieParser from 'cookie-parser';
import express from 'express';

import apiRouter from '@core/config/router';
import { errorMiddleware } from '@middlewares/error.middleware';

const app = express();

app.use(express.json());

app.use(cookieParser());

app.use('/api/1.0', apiRouter);

app.use(errorMiddleware);

export default app;
