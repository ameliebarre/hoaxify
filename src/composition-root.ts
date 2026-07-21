import { container } from 'tsyringe';

import { TOKENS } from '@/shared';

import { AuthController } from './modules/auth/auth.controller';
import { RegisterUserUseCase } from './modules/auth/use-cases/register-user';
import { PasswordService } from './modules/security/password.service';
import { IPasswordService } from './modules/security/password.service.interface';
import { UserRepository } from './modules/user/user.repository';
import { IUserRepository } from './modules/user/user.repository.interface';
import { UserService } from './modules/user/user.service';
import { IUserService } from './modules/user/user.service.interface';

// ====================== ENREGISTREMENT ======================

// Repositories
container.registerSingleton<IUserRepository>(
  TOKENS.UserRepository,
  UserRepository,
);

// Services
container.registerSingleton<IUserService>(TOKENS.UserService, UserService);
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
