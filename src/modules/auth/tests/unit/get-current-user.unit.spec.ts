import { IUserRepository } from '@/modules/user/user.repository.interface';

import { GetCurrentUserUseCase } from '../../use-cases/get-current-user';

describe('GetCurrentUserUseCase', () => {
  let useCase: GetCurrentUserUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  const userId = 1;

  beforeEach(() => {
    userRepository = {
      findById: jest.fn(),
    } as never;

    useCase = new GetCurrentUserUseCase(userRepository);
  });

  it('returns public user', async () => {
    userRepository.findById.mockResolvedValue({
      id: 1,
      username: 'john',
      email: 'john@mail.com',
      password: 'hashed-password',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await useCase.execute(userId);

    expect(result).toEqual({
      id: 1,
      username: 'john',
      email: 'john@mail.com',
    });
  });

  it('returns null when user does not exist', async () => {
    userRepository.findById.mockResolvedValue(null);

    const result = await useCase.execute(userId);

    expect(result).toBeNull();
  });
});
