import { errAsync, okAsync } from 'neverthrow';

import { ListHoaxesUseCase } from '@modules/hoax/use-cases/list-hoaxes.use-case';

import type { IHoaxRepository } from '@modules/hoax/domain/hoax.repository.interface';

describe('ListHoaxesUseCase', () => {
  let useCase: ListHoaxesUseCase;
  let hoaxRepository: jest.Mocked<IHoaxRepository>;

  const hoax = {
    id: 1,
    content: 'A valid hoax content.',
    createdAt: new Date(),
    user: { id: 1, username: 'john' },
  };

  beforeEach(() => {
    hoaxRepository = {
      create: jest.fn(),
      findMany: jest.fn(),
    };

    useCase = new ListHoaxesUseCase(hoaxRepository);
  });

  describe('Given hoaxes exist', () => {
    beforeEach(() => {
      hoaxRepository.findMany.mockReturnValue(
        okAsync({ hoaxes: [hoax], totalCount: 25 }),
      );
    });

    describe('When listing hoaxes', () => {
      it('Then it should return the paginated content with computed total pages', async () => {
        const result = await useCase.execute({ page: 0, size: 10 });

        expect(result.isOk()).toBe(true);

        expect(result._unsafeUnwrap()).toEqual({
          content: [hoax],
          page: 0,
          size: 10,
          totalPages: 3,
        });
      });

      it('Then it should forward pagination and the optional userId filter to the repository', async () => {
        await useCase.execute({ page: 2, size: 5, userId: 7 });

        expect(hoaxRepository.findMany).toHaveBeenCalledWith({
          page: 2,
          size: 5,
          userId: 7,
        });
      });
    });
  });

  describe('Given no hoax exists', () => {
    beforeEach(() => {
      hoaxRepository.findMany.mockReturnValue(
        okAsync({ hoaxes: [], totalCount: 0 }),
      );
    });

    describe('When listing hoaxes', () => {
      it('Then it should return an empty page with zero total pages', async () => {
        const result = await useCase.execute({ page: 0, size: 10 });

        expect(result._unsafeUnwrap()).toEqual({
          content: [],
          page: 0,
          size: 10,
          totalPages: 0,
        });
      });
    });
  });

  describe('Given the repository fails', () => {
    beforeEach(() => {
      hoaxRepository.findMany.mockReturnValue(
        errAsync({ type: 'DatabaseError', message: 'connection lost' }),
      );
    });

    describe('When listing hoaxes', () => {
      it('Then it should return a database error', async () => {
        const result = await useCase.execute({ page: 0, size: 10 });

        expect(result.isErr()).toBe(true);

        expect(result._unsafeUnwrapErr()).toMatchObject({
          type: 'DatabaseError',
        });
      });
    });
  });
});