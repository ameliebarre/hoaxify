import { inject, injectable } from 'tsyringe';

import { InvalidCredentialsError } from '@/errors/invalid-credentials-error';
import { IPasswordService } from '@/modules/security/password.service.interface';
import { IUserRepository } from '@/modules/user/user.repository.interface';
import { TOKENS } from '@/shared';

import { LoginDto } from '../auth.types';

@injectable()
export class LoginUserUseCase {
  constructor(
    @inject(TOKENS.UserRepository)
    private readonly userRepository: IUserRepository,

    @inject(TOKENS.PasswordService)
    private readonly passwordService: IPasswordService,
  ) {}

  async execute(data: LoginDto) {
    const user = await this.userRepository.findByEmail(data.email);

    if (!user) {
      throw new InvalidCredentialsError();
    }

    const passwordMatch = await this.passwordService.compare(
      data.password,
      user.password,
    );

    if (!passwordMatch) {
      throw new InvalidCredentialsError();
    }

    return user;
  }
}
