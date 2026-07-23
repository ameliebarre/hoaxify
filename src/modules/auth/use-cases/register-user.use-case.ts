import { injectable, inject } from 'tsyringe';

import { TOKENS } from '@core/di/token';
import { EmailAlreadyExistsError } from '@core/errors/email-already-exists.error';
import { IPasswordService } from '@infrastructure/security/domain/password.service.interface';
import { SignUpDto } from '@modules/auth/domain/auth.types';
import { IUserRepository } from '@modules/user/domain/user.repository.interface';

@injectable()
export class RegisterUserUseCase {
  constructor(
    @inject(TOKENS.UserRepository)
    private readonly userRepository: IUserRepository,

    @inject(TOKENS.PasswordService)
    private readonly passwordService: IPasswordService,
  ) {}

  async execute(data: SignUpDto) {
    const user = await this.userRepository.findByEmail(data.email);

    if (user) {
      throw new EmailAlreadyExistsError();
    }

    const hashedPassword = await this.passwordService.hash(data.password);

    return this.userRepository.create({
      ...data,
      password: hashedPassword,
    });
  }
}
