import { EmailAlreadyExistsError } from '@/errors/email-already-exists.error';
import { IPasswordService } from '@/modules/security/domain/password.service.interface';
import { IUserRepository } from '@/modules/user/user.repository.interface';

import { RegisterUserUseCase } from '../../use-cases/register-user';
import { createUser } from '../factories/user.factory';

describe('RegisterUserUseCase', () => {
  const userRepository: jest.Mocked<IUserRepository> = {
    findByEmail: jest.fn(),
    create: jest.fn(),
  };

  const passwordService: jest.Mocked<IPasswordService> = {
    hash: jest.fn(),
    compare: jest.fn(),
  };

  const user = {
    username: 'john',
    email: 'john@mail.com',
    password: 'P4ssword',
  };

  let useCase: RegisterUserUseCase;

  beforeEach(() => {
    jest.clearAllMocks();

    useCase = new RegisterUserUseCase(userRepository, passwordService);
  });

  it('creates a user when email does not exist', async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    passwordService.hash.mockResolvedValue('hashed-password');

    await useCase.execute(user);

    expect(userRepository.create).toHaveBeenCalledTimes(1);
  });

  it('checks if email already exists', async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    passwordService.hash.mockResolvedValue('hashed-password');

    await useCase.execute(user);

    expect(userRepository.findByEmail).toHaveBeenCalledWith(user.email);
  });

  it('hashes the password before creating the user', async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    passwordService.hash.mockResolvedValue('hashed-password');

    await useCase.execute(user);

    expect(passwordService.hash).toHaveBeenCalledWith(user.password);
  });

  it('creates the user with hashed password', async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    passwordService.hash.mockResolvedValue('hashed-password');

    await useCase.execute(user);

    expect(userRepository.create).toHaveBeenCalledWith({
      ...user,
      password: 'hashed-password',
    });
  });

  it('checks whether the email already exists', async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    await useCase.execute(user);

    expect(userRepository.findByEmail).toHaveBeenCalledWith(user.email);
  });

  it('throws EmailAlreadyExistsError when email already exists', async () => {
    userRepository.findByEmail.mockResolvedValue(
      createUser({
        username: 'existing-user',
      }),
    );

    await expect(useCase.execute(user)).rejects.toThrow(
      EmailAlreadyExistsError,
    );
  });

  it('does not hash password when email already exists', async () => {
    userRepository.findByEmail.mockResolvedValue(
      createUser({
        username: 'existing-user',
      }),
    );

    await expect(useCase.execute(user)).rejects.toThrow();

    expect(passwordService.hash).not.toHaveBeenCalled();
  });

  it('does not create user when email already exists', async () => {
    userRepository.findByEmail.mockResolvedValue(
      createUser({
        username: 'existing-user',
      }),
    );

    await expect(useCase.execute(user)).rejects.toThrow();

    expect(userRepository.create).not.toHaveBeenCalled();
  });
});
