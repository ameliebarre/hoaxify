import { Result, ok, err } from 'neverthrow';
import { inject, injectable } from 'tsyringe';

import { TOKENS } from '@core/di/token';
import { UserNotFoundError } from '@core/errors/user-not-found.error';
import { PublicUser } from '@modules/auth/domain/auth.types';

import type { IUserRepository } from '@modules/user/domain/user.repository.interface';

@injectable()
export class GetCurrentUserUseCase {
  constructor(
    @inject(TOKENS.UserRepository)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(
    userId: number,
  ): Promise<Result<PublicUser, UserNotFoundError>> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      return err(new UserNotFoundError());
    }

    return ok({
      id: user.id,
      username: user.username,
      email: user.email,
    });
  }
}
