import express from 'express';

import { container } from '@/composition-root';

import { TOKENS } from '@core/di/token';
import { ITokenService } from '@infrastructure/security/domain/token.service.interface';
import { validate } from '@middlewares/validate';
import { AuthController } from '@modules/auth/presentation/auth.controller';
import { authenticateMiddleware } from '@modules/auth/presentation/auth.middleware';
import {
  loginSchema,
  signupSchema,
} from '@modules/auth/presentation/auth.validation';

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
