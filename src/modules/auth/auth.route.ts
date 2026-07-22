import express from 'express';

import { container } from '@/composition-root';
import { validate } from '@/middlewares/validate';
import { TOKENS } from '@/shared';

import { ITokenService } from '../security/domain/token.service.interface';

import { AuthController } from './auth.controller';
import { authenticateMiddleware } from './auth.middleware';
import { loginSchema, signupSchema } from './auth.validation';

const router = express.Router();

const authController = container.resolve<AuthController>(AuthController);
const tokenService = container.resolve<ITokenService>(TOKENS.TokenService);

const authenticate = authenticateMiddleware(tokenService);

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

router.get('/me', authenticate, authController.me.bind(authController));

export default router;
