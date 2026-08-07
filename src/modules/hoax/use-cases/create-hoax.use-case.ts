import { ResultAsync } from 'neverthrow';
import { inject, injectable } from 'tsyringe';

import { TOKENS } from '@core/di/token';
import { CreateHoaxError } from '@modules/hoax/domain/errors/create-hoax.error';
import { CreateHoaxInput } from '@modules/hoax/presentation/validators/create-hoax.validator';

import type { IHoaxRepository } from '@modules/hoax/domain/hoax.repository.interface';

export interface CreatedHoax {
  id: number;
  content: string;
  createdAt: Date;
  userId: number;
}

@injectable()
export class CreateHoaxUseCase {
  constructor(
    @inject(TOKENS.HoaxRepository)
    private readonly hoaxRepository: IHoaxRepository,
  ) {}

  execute(
    userId: number,
    data: CreateHoaxInput,
  ): ResultAsync<CreatedHoax, CreateHoaxError> {
    return this.hoaxRepository
      .create({
        content: data.content,
        userId,
      })
      .map((hoax) => ({
        id: hoax.id,
        content: hoax.content,
        createdAt: hoax.createdAt,
        userId: hoax.userId,
      }));
  }
}