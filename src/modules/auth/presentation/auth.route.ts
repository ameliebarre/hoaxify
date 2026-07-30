import 'reflect-metadata';
import express from 'express';

import { container } from '@/composition-root';

import env from '@core/config/env';
import { TOKENS } from '@core/di/token';
import { IJwtService } from '@infrastructure/security/jwt/jwt.service.interface';
import { createRateLimiter } from '@middlewares/rate-limit.middleware';
import { validate } from '@middlewares/validate.middleware';
import { AuthController } from '@modules/auth/presentation/auth.controller';
import { authenticateMiddleware } from '@modules/auth/presentation/auth.middleware';
import { loginSchema } from '@modules/auth/presentation/validators/login.validator';
import { signupSchema } from '@modules/auth/presentation/validators/signup.validator';

const router = express.Router();

const authController = container.resolve<AuthController>(AuthController);
const jwtService = container.resolve<IJwtService>(TOKENS.JwtService);

const authenticate = authenticateMiddleware(jwtService);

const skipInTests = () => env.ENV === 'testing';

const signupLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  skip: skipInTests,
});

const loginLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  skip: skipInTests,
});

const refreshLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  skip: skipInTests,
});

const logoutLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  skip: skipInTests,
});

router.post(
  '/signup',
  signupLimiter,
  validate(signupSchema),
  authController.signup,
);

router.post('/login', loginLimiter, validate(loginSchema), authController.login);

router.get('/me', authenticate, authController.me);

router.post('/refresh', refreshLimiter, authController.refresh);

router.post('/logout', logoutLimiter, authController.logout);

export default router;
