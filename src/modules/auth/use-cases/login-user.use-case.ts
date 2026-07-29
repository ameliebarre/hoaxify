import { errAsync, ResultAsync } from 'neverthrow';
import { inject, injectable } from 'tsyringe';

import { TOKENS } from '@core/di/token';
import { AuthErrors } from '@modules/auth/domain/errors/auth-errors';
import { LoginError } from '@modules/auth/domain/errors/login-user.error';
import { LoginInput } from '@modules/auth/presentation/validators/login.validator';

import type { IJwtService } from '@infrastructure/security/jwt/jwt.service.interface';
import type { IPasswordService } from '@infrastructure/security/password/password.service.interface';
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
  ) {}

  execute(data: LoginInput): ResultAsync<
    {
      user: {
        id: number;
        username: string;
        email: string;
      };
      accessToken: string;
    },
    LoginError
  > {
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

          return this.jwtService
            .sign({
              userId: user.id,
            })
            .map((accessToken) => ({
              user: {
                id: user.id,
                username: user.username,
                email: user.email,
              },
              accessToken,
            }));
        });
    });
  }
}
