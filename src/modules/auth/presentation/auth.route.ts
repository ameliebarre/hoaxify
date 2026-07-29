import 'reflect-metadata';
import express from 'express';

import { container } from '@/composition-root';

import { TOKENS } from '@core/di/token';
import { IJwtService } from '@infrastructure/security/jwt/jwt.service.interface';
import { validate } from '@middlewares/validate.middleware';
import { AuthController } from '@modules/auth/presentation/auth.controller';
import { authenticateMiddleware } from '@modules/auth/presentation/auth.middleware';
import { loginSchema } from '@modules/auth/presentation/validators/login.validator';
import { signupSchema } from '@modules/auth/presentation/validators/signup.validator';

const router = express.Router();

const authController = container.resolve<AuthController>(AuthController);
const jwtService = container.resolve<IJwtService>(TOKENS.JwtService);

const authenticate = authenticateMiddleware(jwtService);

router.post('/signup', validate(signupSchema), authController.signup);

router.post('/login', validate(loginSchema), authController.login);

router.get('/me', authenticate, authController.me);

router.post('/refresh', authController.refresh);

router.post('/logout', authController.logout);

export default router;
