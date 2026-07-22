import express from 'express';
import '@/composition-root';

import apiRouter from '@/config/router';
import { errorHandler } from '@/middlewares/error-handler';

const app = express();

app.use(express.json());

app.use('/api/1.0', apiRouter);

app.use(errorHandler);

export default app;
