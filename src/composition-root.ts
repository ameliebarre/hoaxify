import { container } from 'tsyringe';

import { TOKENS } from '@/shared';

import { AuthController } from './modules/auth/auth.controller';
import { RegisterUserUseCase } from './modules/auth/use-cases/register-user';
import { PasswordService } from './modules/security/password.service';
import { IPasswordService } from './modules/security/password.service.interface';
import { UserRepository } from './modules/user/user.repository';
import { IUserRepository } from './modules/user/user.repository.interface';

// ====================== ENREGISTREMENT ======================

// Repositories
container.registerSingleton<IUserRepository>(
  TOKENS.UserRepository,
  UserRepository,
);

// Services
container.registerSingleton<IPasswordService>(
  TOKENS.PasswordService,
  PasswordService,
);

// Use Cases
container.register(RegisterUserUseCase, {
  useClass: RegisterUserUseCase,
});

// Controllers
container.register(AuthController, { useClass: AuthController });

export { container };
