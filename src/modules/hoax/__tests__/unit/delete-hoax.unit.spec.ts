import { errAsync, okAsync } from 'neverthrow';

import { DeleteHoaxUseCase } from '@modules/hoax/use-cases/delete-hoax.use-case';

import type { IHoaxRepository } from '@modules/hoax/domain/hoax.repository.interface';

describe('DeleteHoaxUseCase', () => {
  let useCase: DeleteHoaxUseCase;
  let hoaxRepository: jest.Mocked<IHoaxRepository>;

  const existingHoax = {
    id: 1,
    content: 'A hoax content.',
    userId: 1,
    createdAt: new Date(),
  };

  beforeEach(() => {
    hoaxRepository = {
      create: jest.fn(),
      findMany: jest.fn(),
      findById: jest.fn(),
      deleteById: jest.fn(),
    };

    useCase = new DeleteHoaxUseCase(hoaxRepository);
  });

  describe('Given the hoax exists and belongs to the requesting user', () => {
    beforeEach(() => {
      hoaxRepository.findById.mockReturnValue(okAsync(existingHoax));
      hoaxRepository.deleteById.mockReturnValue(okAsync(undefined));
    });

    describe('When deleting the hoax', () => {
      it('Then it should delete it', async () => {
        const result = await useCase.execute(1, 1);

        expect(result.isOk()).toBe(true);

        expect(hoaxRepository.deleteById).toHaveBeenCalledWith(1);
      });
    });
  });

  describe('Given the hoax does not exist', () => {
    beforeEach(() => {
      hoaxRepository.findById.mockReturnValue(okAsync(null));
    });

    describe('When deleting the hoax', () => {
      it('Then it should return a not found error', async () => {
        const result = await useCase.execute(1, 1);

        expect(result.isErr()).toBe(true);

        expect(result._unsafeUnwrapErr()).toMatchObject({
          type: 'HoaxNotFound',
        });

        expect(hoaxRepository.deleteById).not.toHaveBeenCalled();
      });
    });
  });

  describe('Given the hoax exists but belongs to another user', () => {
    beforeEach(() => {
      hoaxRepository.findById.mockReturnValue(
        okAsync({ ...existingHoax, userId: 2 }),
      );
    });

    describe('When deleting the hoax', () => {
      it('Then it should return an unauthorized error', async () => {
        const result = await useCase.execute(1, 1);

        expect(result.isErr()).toBe(true);

        expect(result._unsafeUnwrapErr()).toMatchObject({
          type: 'UnauthorizedHoaxDeletion',
        });

        expect(hoaxRepository.deleteById).not.toHaveBeenCalled();
      });
    });
  });

  describe('Given the repository fails while looking up the hoax', () => {
    beforeEach(() => {
      hoaxRepository.findById.mockReturnValue(
        errAsync({ type: 'DatabaseError', message: 'connection lost' }),
      );
    });

    describe('When deleting the hoax', () => {
      it('Then it should return a database error', async () => {
        const result = await useCase.execute(1, 1);

        expect(result.isErr()).toBe(true);

        expect(result._unsafeUnwrapErr()).toMatchObject({
          type: 'DatabaseError',
        });
      });
    });
  });
});
