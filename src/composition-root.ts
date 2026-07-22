import { container } from 'tsyringe';

import { TOKENS } from '@/shared';

import { AuthController } from './modules/auth/auth.controller';
import { LoginUserUseCase } from './modules/auth/use-cases/login-user';
import { RegisterUserUseCase } from './modules/auth/use-cases/register-user';
import { IPasswordService } from './modules/security/domain/password.service.interface';
import { ITokenService } from './modules/security/domain/token.service.interface';
import { JwtService } from './modules/security/infrastructure/jwt.service';
import { PasswordService } from './modules/security/infrastructure/password.service';
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
container.registerSingleton<ITokenService>(TOKENS.TokenService, JwtService);

// Use Cases
container.register(RegisterUserUseCase, {
  useClass: RegisterUserUseCase,
});
container.register(LoginUserUseCase, {
  useClass: LoginUserUseCase,
});

// Controllers
container.register(AuthController, { useClass: AuthController });

export { container };
