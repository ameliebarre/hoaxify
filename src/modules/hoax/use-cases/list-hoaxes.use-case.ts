import { ResultAsync } from 'neverthrow';
import { inject, injectable } from 'tsyringe';

import { TOKENS } from '@core/di/token';
import { ListHoaxesError } from '@modules/hoax/domain/errors/list-hoaxes.error';
import { HoaxWithAuthor } from '@modules/hoax/domain/hoax.types';
import { ListHoaxesQuery } from '@modules/hoax/presentation/validators/list-hoaxes.validator';

import type { IHoaxRepository } from '@modules/hoax/domain/hoax.repository.interface';

export interface PaginatedHoaxes {
  content: HoaxWithAuthor[];
  page: number;
  size: number;
  totalPages: number;
}

@injectable()
export class ListHoaxesUseCase {
  constructor(
    @inject(TOKENS.HoaxRepository)
    private readonly hoaxRepository: IHoaxRepository,
  ) {}

  execute(query: ListHoaxesQuery): ResultAsync<PaginatedHoaxes, ListHoaxesError> {
    return this.hoaxRepository
      .findMany({
        page: query.page,
        size: query.size,
        userId: query.userId,
      })
      .map(({ hoaxes, totalCount }) => ({
        content: hoaxes,
        page: query.page,
        size: query.size,
        totalPages: Math.ceil(totalCount / query.size),
      }));
  }
}