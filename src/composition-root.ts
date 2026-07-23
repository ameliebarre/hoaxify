import { container } from 'tsyringe';

import { TOKENS } from '@core/di/token';
import { IPasswordService } from '@infrastructure/security/domain/password.service.interface';
import { ITokenService } from '@infrastructure/security/domain/token.service.interface';
import { JwtService } from '@infrastructure/security/infrastructure/jwt.service';
import { PasswordService } from '@infrastructure/security/infrastructure/password.service';
import { AuthController } from '@modules/auth/presentation/auth.controller';
import { LoginUserUseCase } from '@modules/auth/use-cases/login-user.use-case';
import { RegisterUserUseCase } from '@modules/auth/use-cases/register-user.use-case';
import { IUserRepository } from '@modules/user/domain/user.repository.interface';
import { UserRepository } from '@modules/user/infrastructure/user.repository';

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
