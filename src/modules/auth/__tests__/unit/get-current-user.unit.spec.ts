import { UserNotFoundError } from '@core/errors/user-not-found.error';
import { GetCurrentUserUseCase } from '@modules/auth/use-cases/get-current-user.use-case';
import { IUserRepository } from '@modules/user/domain/user.repository.interface';

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

  it('returns Ok(PublicUser) when user exists', async () => {
    userRepository.findById.mockResolvedValue({
      id: 1,
      username: 'john',
      email: 'john@mail.com',
      password: 'hashed-password',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await useCase.execute(userId);

    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap()).toEqual({
      id: 1,
      username: 'john',
      email: 'john@mail.com',
    });
  });

  it('returns Err(UserNotFoundError) when user does not exist', async () => {
    userRepository.findById.mockResolvedValue(null);

    const result = await useCase.execute(userId);

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr()).toBeInstanceOf(UserNotFoundError);
  });
});
