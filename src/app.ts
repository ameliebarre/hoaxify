import express, { Request, Response } from 'express';

const app = express();

app.use(express.json());

app.post('/api/1.0/auth', async (req: Request, res: Response) => {
  return res.send({ message: 'User created' });
});

export default app;
