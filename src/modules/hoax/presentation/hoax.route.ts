import 'reflect-metadata';
import express from 'express';

import { container } from '@/composition-root';

import { TOKENS } from '@core/di/token';
import { IJwtService } from '@infrastructure/security/jwt/jwt.service.interface';
import { validate } from '@middlewares/validate.middleware';
import { authenticateMiddleware } from '@modules/auth/presentation/auth.middleware';
import { HoaxController } from '@modules/hoax/presentation/hoax.controller';
import { createHoaxSchema } from '@modules/hoax/presentation/validators/create-hoax.validator';

const router = express.Router();

const hoaxController = container.resolve<HoaxController>(HoaxController);
const jwtService = container.resolve<IJwtService>(TOKENS.JwtService);

const authenticate = authenticateMiddleware(jwtService);

router.get('/', hoaxController.list);

router.post(
  '/',
  authenticate,
  validate(createHoaxSchema),
  hoaxController.create,
);

export default router;