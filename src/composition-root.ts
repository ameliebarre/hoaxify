import { container } from 'tsyringe';

import { TOKENS } from '@core/di/token';
import { JwtService } from '@infrastructure/security/jwt/jwt.service';
import { IJwtService } from '@infrastructure/security/jwt/jwt.service.interface';
import { PasswordService } from '@infrastructure/security/password/password.service';
import { IPasswordService } from '@infrastructure/security/password/password.service.interface';
import { IRefreshTokenRepository } from '@modules/auth/domain/refresh-token.repository.interface';
import { RefreshTokenRepository } from '@modules/auth/infrastructure/refresh-token.repository';
import { AuthController } from '@modules/auth/presentation/auth.controller';
import { GetCurrentUserUseCase } from '@modules/auth/use-cases/get-current-user.use-case';
import { LoginUserUseCase } from '@modules/auth/use-cases/login-user.use-case';
import { LogoutUseCase } from '@modules/auth/use-cases/logout.use-case';
import { RefreshTokenUseCase } from '@modules/auth/use-cases/refresh-token.use-case';
import { RegisterUserUseCase } from '@modules/auth/use-cases/register-user.use-case';
import { IHoaxRepository } from '@modules/hoax/domain/hoax.repository.interface';
import { HoaxRepository } from '@modules/hoax/infrastructure/hoax.repository';
import { HoaxController } from '@modules/hoax/presentation/hoax.controller';
import { CreateHoaxUseCase } from '@modules/hoax/use-cases/create-hoax.use-case';
import { IUserRepository } from '@modules/user/domain/user.repository.interface';
import { UserRepository } from '@modules/user/infrastructure/user.repository';

// ====================== ENREGISTREMENT ======================

// Repositories
container.registerSingleton<IUserRepository>(
  TOKENS.UserRepository,
  UserRepository,
);
container.registerSingleton<IRefreshTokenRepository>(
  TOKENS.RefreshTokenRepository,
  RefreshTokenRepository,
);
container.registerSingleton<IHoaxRepository>(
  TOKENS.HoaxRepository,
  HoaxRepository,
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
container.register(RefreshTokenUseCase, {
  useClass: RefreshTokenUseCase,
});
container.register(LogoutUseCase, {
  useClass: LogoutUseCase,
});
container.register(CreateHoaxUseCase, {
  useClass: CreateHoaxUseCase,
});

// Controllers
container.register(AuthController, { useClass: AuthController });
container.register(HoaxController, { useClass: HoaxController });

export { container };
