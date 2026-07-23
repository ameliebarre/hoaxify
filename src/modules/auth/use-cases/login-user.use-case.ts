import { inject, injectable } from 'tsyringe';

import { TOKENS } from '@core/di/token';
import { UnauthorizedError } from '@core/errors/unauthorized-error';
import { IPasswordService } from '@infrastructure/security/domain/password.service.interface';
import { ITokenService } from '@infrastructure/security/domain/token.service.interface';
import { LoginDto } from '@modules/auth/domain/auth.types';
import { IUserRepository } from '@modules/user/domain/user.repository.interface';

@injectable()
export class LoginUserUseCase {
  constructor(
    @inject(TOKENS.UserRepository)
    private readonly userRepository: IUserRepository,

    @inject(TOKENS.PasswordService)
    private readonly passwordService: IPasswordService,

    @inject(TOKENS.TokenService)
    private readonly tokenService: ITokenService,
  ) {}

  async execute(data: LoginDto) {
    const user = await this.userRepository.findByEmail(data.email);

    if (!user) {
      throw new UnauthorizedError();
    }

    const passwordMatch = await this.passwordService.compare(
      data.password,
      user.password,
    );

    if (!passwordMatch) {
      throw new UnauthorizedError();
    }

    const accessToken = this.tokenService.generateAccessToken({
      userId: user.id,
    });

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      accessToken,
    };
  }
}
