import { errAsync, okAsync, ResultAsync } from 'neverthrow';
import { inject, injectable } from 'tsyringe';

import { TOKENS } from '@core/di/token';
import { CurrentUser } from '@modules/auth/domain/auth.types';
import { GetCurrentUserError } from '@modules/auth/domain/errors/get-current-user.error';
import { UserErrors } from '@modules/user/domain/errors/user-errors';

import type { IUserRepository } from '@modules/user/domain/user.repository.interface';

@injectable()
export class GetCurrentUserUseCase {
  constructor(
    @inject(TOKENS.UserRepository)
    private readonly userRepository: IUserRepository,
  ) {}

  execute(userId: number): ResultAsync<CurrentUser, GetCurrentUserError> {
    return this.userRepository
      .findById(userId)
      .andThen((user) => {
        if (!user) {
          return errAsync(UserErrors.notFound());
        }

        return okAsync(user);
      })
      .map(({ id, username, email }) => ({
        id,
        username,
        email,
      }));
  }
}
