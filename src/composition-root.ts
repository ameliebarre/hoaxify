import { container } from 'tsyringe';

import { JwtService } from '@/infrastructure/security/jwt/jwt.service';
import { IJwtService } from '@/infrastructure/security/jwt/jwt.service.interface';
import { PasswordService } from '@/infrastructure/security/password/password.service';
import { IPasswordService } from '@/infrastructure/security/password/password.service.interface';

import { TOKENS } from '@core/di/token';
import { AuthController } from '@modules/auth/presentation/auth.controller';
import { LoginUserUseCase } from '@modules/auth/use-cases/login-user.use-case';
import { RegisterUserUseCase } from '@modules/auth/use-cases/register-user.use-case';
import { IUserRepository } from '@modules/user/domain/user.repository.interface';
import { UserRepository } from '@modules/user/infrastructure/user.repository';

import { GetCurrentUserUseCase } from './modules/auth/use-cases/get-current-user.use-case';

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
container.registerSingleton<IJwtService>(TOKENS.JwtService, JwtService);

// Use Cases
container.register(RegisterUserUseCase, {
  useClass: RegisterUserUseCase,
});
container.register(LoginUserUseCase, {
  useClass: LoginUserUseCase,
});
container.register(GetCurrentUserUseCase, {
  useClass: GetCurrentUserUseCase,
});

// Controllers
container.register(AuthController, { useClass: AuthController });

export { container };
