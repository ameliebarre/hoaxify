import { errAsync, ResultAsync } from 'neverthrow';
import { inject, injectable } from 'tsyringe';

import { TOKENS } from '@core/di/token';
import { DeleteHoaxError } from '@modules/hoax/domain/errors/delete-hoax.error';
import { HoaxErrors } from '@modules/hoax/domain/errors/hoax-errors';

import type { IHoaxRepository } from '@modules/hoax/domain/hoax.repository.interface';

@injectable()
export class DeleteHoaxUseCase {
  constructor(
    @inject(TOKENS.HoaxRepository)
    private readonly hoaxRepository: IHoaxRepository,
  ) {}

  execute(
    hoaxId: number,
    requestingUserId: number,
  ): ResultAsync<void, DeleteHoaxError> {
    return this.hoaxRepository.findById(hoaxId).andThen((hoax) => {
      if (!hoax) {
        return errAsync(HoaxErrors.notFound());
      }

      if (hoax.userId !== requestingUserId) {
        return errAsync(HoaxErrors.unauthorizedDeletion());
      }

      return this.hoaxRepository.deleteById(hoaxId);
    });
  }
}
