import '@/composition-root';
import express from 'express';

import apiRouter from '@core/config/router';
import { errorMiddleware } from '@middlewares/error.middleware';

const app = express();

app.use(express.json());

app.use('/api/1.0', apiRouter);

app.use(errorMiddleware);

export default app;
