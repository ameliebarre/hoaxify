import { injectable, inject } from 'tsyringe';

import { EmailAlreadyExistsError } from '@/errors/email-already-exists.error';
import { IPasswordService } from '@/modules/security/password.service.interface';
import { IUserService } from '@/modules/user/user.service.interface';
import { TOKENS } from '@/shared';

import { SignUpDto } from '../auth.types';

@injectable()
export class RegisterUserUseCase {
  constructor(
    @inject(TOKENS.UserService)
    private readonly userService: IUserService,

    @inject(TOKENS.PasswordService)
    private readonly passwordService: IPasswordService,
  ) {}

  async execute(data: SignUpDto) {
    const user = await this.userService.getByEmail(data.email);

    if (user) {
      throw new EmailAlreadyExistsError();
    }

    const hashedPassword = await this.passwordService.hash(data.password);

    return this.userService.createUser({
      ...data,
      password: hashedPassword,
    });
  }
}
