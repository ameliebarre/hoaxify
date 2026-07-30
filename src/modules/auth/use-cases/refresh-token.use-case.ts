import { randomUUID } from 'node:crypto';

import { errAsync, ResultAsync } from 'neverthrow';
import { inject, injectable } from 'tsyringe';

import { REFRESH_TOKEN_TTL_MS } from '@core/config/token-ttl';
import { TOKENS } from '@core/di/token';
import { AuthErrors } from '@modules/auth/domain/errors/auth-errors';
import { RefreshTokenError } from '@modules/auth/domain/errors/refresh-token.error';
import { UserErrors } from '@modules/user/domain/errors/user-errors';

import type { IJwtService } from '@infrastructure/security/jwt/jwt.service.interface';
import type { IRefreshTokenRepository } from '@modules/auth/domain/refresh-token.repository.interface';
import type { IUserRepository } from '@modules/user/domain/user.repository.interface';

@injectable()
export class RefreshTokenUseCase {
  constructor(
    @inject(TOKENS.UserRepository)
    private readonly userRepository: IUserRepository,

    @inject(TOKENS.JwtService)
    private readonly jwtService: IJwtService,

    @inject(TOKENS.RefreshTokenRepository)
    private readonly refreshTokenRepository: IRefreshTokenRepository,
  ) {}

  execute(refreshToken: string): ResultAsync<
    {
      accessToken: string;
      refreshToken: string;
    },
    RefreshTokenError
  > {
    if (!refreshToken) {
      return errAsync(AuthErrors.invalidRefreshToken());
    }

    return this.jwtService
      .verifyRefreshToken(refreshToken)
      .andThen(({ userId, jti }) =>
        this.userRepository.findById(userId).andThen((user) => {
          if (!user) {
            return errAsync(UserErrors.notFound());
          }

          const newJti = randomUUID();

          return this.refreshTokenRepository
            .rotate({
              oldId: jti,
              newId: newJti,
              userId: user.id,
              expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
            })
            .andThen((rotated) => {
              if (!rotated) {
                return this.handleFailedRotation(jti);
              }

              return ResultAsync.combine([
                this.jwtService.generateAccessToken({ userId: user.id }),
                this.jwtService.generateRefreshToken({
                  userId: user.id,
                  jti: newJti,
                }),
              ]).map(([accessToken, newRefreshToken]) => ({
                accessToken,
                refreshToken: newRefreshToken,
              }));
            });
        }),
      );
  }

  // Rotation atomically claims the old token (`WHERE id = ? AND revoked_at
  // IS NULL`), so a failed claim means either the token is unknown or it
  // was already used — including by a concurrent request racing this one.
  // Either way, that's a replay signal: revoke the whole family.
  private handleFailedRotation(
    jti: string,
  ): ResultAsync<never, RefreshTokenError> {
    return this.refreshTokenRepository.findById(jti).andThen((record) => {
      if (!record) {
        return errAsync(AuthErrors.invalidRefreshToken());
      }

      return this.refreshTokenRepository
        .revokeFamily(record.familyId)
        .andThen(() => errAsync(AuthErrors.invalidRefreshToken()));
    });
  }
}