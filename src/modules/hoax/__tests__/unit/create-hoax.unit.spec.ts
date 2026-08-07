import { errAsync, okAsync } from 'neverthrow';

import { CreateHoaxUseCase } from '@modules/hoax/use-cases/create-hoax.use-case';

import type { IHoaxRepository } from '@modules/hoax/domain/hoax.repository.interface';

describe('CreateHoaxUseCase', () => {
  let useCase: CreateHoaxUseCase;
  let hoaxRepository: jest.Mocked<IHoaxRepository>;

  const persistedHoax = {
    id: 1,
    content: 'This is a valid hoax content.',
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

    useCase = new CreateHoaxUseCase(hoaxRepository);
  });

  describe('Given valid hoax content', () => {
    beforeEach(() => {
      hoaxRepository.create.mockReturnValue(okAsync(persistedHoax));
    });

    describe('When creating a hoax for an authenticated user', () => {
      it('Then it should persist the hoax for that user', async () => {
        await useCase.execute(1, { content: 'This is a valid hoax content.' });

        expect(hoaxRepository.create).toHaveBeenCalledWith({
          content: 'This is a valid hoax content.',
          userId: 1,
        });
      });

      it('Then it should return the created hoax', async () => {
        const result = await useCase.execute(1, {
          content: 'This is a valid hoax content.',
        });

        expect(result.isOk()).toBe(true);

        expect(result._unsafeUnwrap()).toEqual({
          id: 1,
          content: 'This is a valid hoax content.',
          userId: 1,
          createdAt: persistedHoax.createdAt,
        });
      });
    });
  });

  describe('Given the repository fails to persist the hoax', () => {
    beforeEach(() => {
      hoaxRepository.create.mockReturnValue(
        errAsync({ type: 'DatabaseError', message: 'connection lost' }),
      );
    });

    describe('When creating a hoax', () => {
      it('Then it should return a database error', async () => {
        const result = await useCase.execute(1, {
          content: 'This is a valid hoax content.',
        });

        expect(result.isErr()).toBe(true);

        expect(result._unsafeUnwrapErr()).toMatchObject({
          type: 'DatabaseError',
        });
      });
    });
  });
});