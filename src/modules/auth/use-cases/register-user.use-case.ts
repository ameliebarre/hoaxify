import { Result, ok, err } from 'neverthrow';
import { injectable, inject } from 'tsyringe';

import { TOKENS } from '@core/di/token';
import { EmailAlreadyExistsError } from '@core/errors/email-already-exists.error';
import { SignUpDto } from '@modules/auth/domain/auth.types';
import { User } from '@modules/user/domain/user.types';

import type { IPasswordService } from '@infrastructure/security/domain/password.service.interface';
import type { IUserRepository } from '@modules/user/domain/user.repository.interface';

@injectable()
export class RegisterUserUseCase {
  constructor(
    @inject(TOKENS.UserRepository)
    private readonly userRepository: IUserRepository,

    @inject(TOKENS.PasswordService)
    private readonly passwordService: IPasswordService,
  ) {}

  async execute(
    data: SignUpDto,
  ): Promise<Result<User, EmailAlreadyExistsError>> {
    const existingUser = await this.userRepository.findByEmail(data.email);

    if (existingUser) {
      return err(new EmailAlreadyExistsError());
    }

    const hashedPassword = await this.passwordService.hash(data.password);

    const createdUser = await this.userRepository.create({
      ...data,
      password: hashedPassword,
    });

    return ok(createdUser);
  }
}
