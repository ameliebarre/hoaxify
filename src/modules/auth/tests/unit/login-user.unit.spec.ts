import { InvalidCredentialsError } from '@/errors/invalid-credentials-error';
import { IPasswordService } from '@/modules/security/password.service.interface';
import { IUserRepository } from '@/modules/user/user.repository.interface';

import { LoginUserUseCase } from '../../use-cases/login-user';

describe('LoginUserUseCase', () => {
  let useCase: LoginUserUseCase;

  let userRepository: jest.Mocked<IUserRepository>;
  let passwordService: jest.Mocked<IPasswordService>;

  beforeEach(() => {
    userRepository = {
      findByEmail: jest.fn(),
      create: jest.fn(),
    };

    passwordService = {
      hash: jest.fn(),
      compare: jest.fn(),
    };

    useCase = new LoginUserUseCase(userRepository, passwordService);
  });

  it('returns ser when credentials are valid', async () => {
    const user = {
      id: 1,
      username: 'john',
      email: 'john@mail.com',
      password: 'hashed-password',
    };

    userRepository.findByEmail.mockResolvedValue(user);

    passwordService.compare.mockResolvedValue(true);

    const result = await useCase.execute({
      email: 'john@mail.com',
      password: 'P4ssword',
    });

    expect(result).toEqual(user);
    expect(userRepository.findByEmail).toHaveBeenCalledWith('john@mail.com');
    expect(passwordService.compare).toHaveBeenCalledWith(
      'P4ssword',
      'hashed-password',
    );
  });

  it('throws when user does not exist', async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    await expect(
      useCase.execute({
        email: 'unknown@mail.com',
        password: 'P4ssword',
      }),
    ).rejects.toThrow(InvalidCredentialsError);
  });

  it('throws when password is invalid', async () => {
    userRepository.findByEmail.mockResolvedValue({
      username: 'john',
      email: 'john@mail.com',
      password: 'hashed-password',
    });

    passwordService.compare.mockResolvedValue(false);

    await expect(
      useCase.execute({
        email: 'john@mail.com',
        password: 'WrongPassword',
      }),
    ).rejects.toThrow(InvalidCredentialsError);
  });
});
