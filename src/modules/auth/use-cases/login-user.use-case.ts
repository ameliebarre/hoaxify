import { randomUUID } from 'node:crypto';

import { errAsync, ResultAsync } from 'neverthrow';
import { inject, injectable } from 'tsyringe';

import { REFRESH_TOKEN_TTL_MS } from '@core/config/token-ttl';
import { TOKENS } from '@core/di/token';
import { LoginResponse } from '@modules/auth/domain/auth.types';
import { AuthErrors } from '@modules/auth/domain/errors/auth-errors';
import { LoginError } from '@modules/auth/domain/errors/login-user.error';
import { LoginInput } from '@modules/auth/presentation/validators/login.validator';

import type { IJwtService } from '@infrastructure/security/jwt/jwt.service.interface';
import type { IPasswordService } from '@infrastructure/security/password/password.service.interface';
import type { IRefreshTokenRepository } from '@modules/auth/domain/refresh-token.repository.interface';
import type { IUserRepository } from '@modules/user/domain/user.repository.interface';

@injectable()
export class LoginUserUseCase {
  constructor(
    @inject(TOKENS.UserRepository)
    private readonly userRepository: IUserRepository,

    @inject(TOKENS.PasswordService)
    private readonly passwordService: IPasswordService,

    @inject(TOKENS.JwtService)
    private readonly jwtService: IJwtService,

    @inject(TOKENS.RefreshTokenRepository)
    private readonly refreshTokenRepository: IRefreshTokenRepository,
  ) {}

  execute(data: LoginInput): ResultAsync<LoginResponse, LoginError> {
    return this.userRepository.findByEmail(data.email).andThen((user) => {
      if (!user) {
        return errAsync(AuthErrors.invalidCredentials());
      }

      return this.passwordService
        .compare(data.password, user.password)
        .andThen((isPasswordValid) => {
          if (!isPasswordValid) {
            return errAsync(AuthErrors.invalidCredentials());
          }

          const jti = randomUUID();
          const familyId = randomUUID();

          return this.refreshTokenRepository
            .create({
              id: jti,
              userId: user.id,
              familyId,
              expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
            })
            .andThen(() =>
              ResultAsync.combine([
                this.jwtService.generateAccessToken({
                  userId: user.id,
                }),
                this.jwtService.generateRefreshToken({
                  userId: user.id,
                  jti,
                }),
              ]),
            )
            .map(([accessToken, refreshToken]) => ({
              user: {
                id: user.id,
                username: user.username,
                email: user.email,
              },
              accessToken,
              refreshToken,
            }));
        });
    });
  }
}