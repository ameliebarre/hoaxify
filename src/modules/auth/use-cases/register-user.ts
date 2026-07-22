import { injectable, inject } from 'tsyringe';

import { EmailAlreadyExistsError } from '@/errors/email-already-exists.error';
import { IPasswordService } from '@/modules/security/domain/password.service.interface';
import { IUserRepository } from '@/modules/user/user.repository.interface';
import { TOKENS } from '@/shared';

import { SignUpDto } from '../auth.types';

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
