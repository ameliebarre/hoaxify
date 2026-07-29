import { errAsync, ResultAsync } from 'neverthrow';
import { injectable, inject } from 'tsyringe';

import { TOKENS } from '@core/di/token';
import { RegisteredUser } from '@modules/auth/domain/auth.types';
import { AuthErrors } from '@modules/auth/domain/errors/auth-errors';
import { SignupError } from '@modules/auth/domain/errors/signup-user.error';
import { SignupInput } from '@modules/auth/presentation/validators/signup.validator';

import type { IPasswordService } from '@infrastructure/security/password/password.service.interface';
import type { IUserRepository } from '@modules/user/domain/user.repository.interface';

@injectable()
export class RegisterUserUseCase {
  constructor(
    @inject(TOKENS.UserRepository)
    private readonly userRepository: IUserRepository,

    @inject(TOKENS.PasswordService)
    private readonly passwordService: IPasswordService,
  ) {}

  execute(data: SignupInput): ResultAsync<RegisteredUser, SignupError> {
    return this.userRepository
      .findByEmail(data.email)
      .andThen((existingUser) => {
        if (existingUser) {
          return errAsync(AuthErrors.emailAlreadyExists(data.email));
        }

        return this.userRepository.findByUsername(data.username);
      })
      .andThen((existingUser) => {
        if (existingUser) {
          return errAsync(AuthErrors.usernameAlreadyExists(data.username));
        }

        return this.passwordService.hash(data.password);
      })
      .andThen((hashedPassword) =>
        this.userRepository.create({
          ...data,
          password: hashedPassword,
        }),
      )
      .map((user) => ({
        id: user.id,
        username: user.username,
        email: user.email,
      }));
  }
}
