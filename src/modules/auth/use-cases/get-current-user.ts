import { inject, injectable } from 'tsyringe';

import { IUserRepository } from '@/modules/user/user.repository.interface';
import { TOKENS } from '@/shared';

@injectable()
export class GetCurrentUserUseCase {
  constructor(
    @inject(TOKENS.UserRepository)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(userId: number) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email,
    };
  }
}
