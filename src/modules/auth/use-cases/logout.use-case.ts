import { okAsync, ResultAsync } from 'neverthrow';
import { inject, injectable } from 'tsyringe';

import { TOKENS } from '@core/di/token';

import type { IJwtService } from '@infrastructure/security/jwt/jwt.service.interface';
import type { IRefreshTokenRepository } from '@modules/auth/domain/refresh-token.repository.interface';

@injectable()
export class LogoutUseCase {
  constructor(
    @inject(TOKENS.JwtService)
    private readonly jwtService: IJwtService,

    @inject(TOKENS.RefreshTokenRepository)
    private readonly refreshTokenRepository: IRefreshTokenRepository,
  ) {}

  execute(refreshToken?: string): ResultAsync<void, never> {
    if (!refreshToken) {
      return okAsync(undefined);
    }

    return this.jwtService
      .verifyRefreshToken(refreshToken)
      .andThen(({ jti }) => this.refreshTokenRepository.revoke(jti))
      .map(() => undefined)
      .orElse(() => okAsync(undefined));
  }
}