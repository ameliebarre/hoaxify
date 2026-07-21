import { EmailAlreadyExistsError } from '@/errors/email-already-exists.error';
import { IPasswordService } from '@/modules/security/password.service.interface';
import { IUserService } from '@/modules/user/user.service.interface';

import { RegisterUserUseCase } from './register-user';

describe('RegisterUserUseCase', () => {
  const userService: jest.Mocked<IUserService> = {
    getByEmail: jest.fn(),
    createUser: jest.fn(),
  };

  const passwordService: jest.Mocked<IPasswordService> = {
    hash: jest.fn(),
  };

  const user = {
    username: 'john',
    email: 'john@mail.com',
    password: 'P4ssword',
  };

  let useCase: RegisterUserUseCase;

  beforeEach(() => {
    jest.clearAllMocks();

    useCase = new RegisterUserUseCase(userService, passwordService);
  });

  it('creates a user when email does not exist', async () => {
    userService.getByEmail.mockResolvedValue(null);

    passwordService.hash.mockResolvedValue('hashed-password');

    await useCase.execute(user);

    expect(userService.createUser).toHaveBeenCalledTimes(1);
  });

  it('checks if email already exists', async () => {
    userService.getByEmail.mockResolvedValue(null);

    passwordService.hash.mockResolvedValue('hashed-password');

    await useCase.execute(user);

    expect(userService.getByEmail).toHaveBeenCalledWith(user.email);
  });

  it('hashes the password before creating the user', async () => {
    userService.getByEmail.mockResolvedValue(null);

    passwordService.hash.mockResolvedValue('hashed-password');

    await useCase.execute(user);

    expect(passwordService.hash).toHaveBeenCalledWith(user.password);
  });

  it('creates the user with hashed password', async () => {
    userService.getByEmail.mockResolvedValue(null);

    passwordService.hash.mockResolvedValue('hashed-password');

    await useCase.execute(user);

    expect(userService.createUser).toHaveBeenCalledWith({
      ...user,
      password: 'hashed-password',
    });
  });

  it('throws EmailAlreadyExistsError when email already exists', async () => {
    userService.getByEmail.mockResolvedValue({
      username: 'existing-user',
      email: 'john@mail.com',
      password: 'hashed-password',
    });

    await expect(useCase.execute(user)).rejects.toThrow(
      EmailAlreadyExistsError,
    );
  });

  it('does not hash password when email already exists', async () => {
    userService.getByEmail.mockResolvedValue({
      username: 'existing-user',
      email: 'john@mail.com',
      password: 'hashed-password',
    });

    await expect(useCase.execute(user)).rejects.toThrow();

    expect(passwordService.hash).not.toHaveBeenCalled();
  });

  it('does not create user when email already exists', async () => {
    userService.getByEmail.mockResolvedValue({
      username: 'existing-user',
      email: 'john@mail.com',
      password: 'hashed-password',
    });

    await expect(useCase.execute(user)).rejects.toThrow();

    expect(userService.createUser).not.toHaveBeenCalled();
  });
});
