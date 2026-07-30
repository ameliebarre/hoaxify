import { Router } from 'express';

import authRouter from '@modules/auth/presentation/auth.route';
import hoaxRouter from '@modules/hoax/presentation/hoax.route';

const router = Router();

router.get('/', (req, res) => {
  res.json({
    status: 'Server is up and running',
  });
});

router.use('/auth', authRouter);
router.use('/hoaxes', hoaxRouter);

export default router;
