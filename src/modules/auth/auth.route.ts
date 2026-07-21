import express from 'express';

import { container } from '@/composition-root';
import { validate } from '@/middlewares/validate';

import { AuthController } from './auth.controller';
import { loginSchema, signupSchema } from './auth.validation';

const router = express.Router();

const authController = container.resolve<AuthController>(AuthController);

router.post(
  '/signup',
  validate(signupSchema),
  authController.signup.bind(authController),
);

router.post(
  '/login',
  validate(loginSchema),
  authController.login.bind(authController),
);

export default router;
