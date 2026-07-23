import { Router } from 'express';

import authRouter from '@modules/auth/presentation/auth.route';

const router = Router();

router.get('/', (req, res) => {
  res.json({
    status: 'Server is up and running',
  });
});

router.use('/auth', authRouter);

export default router;
