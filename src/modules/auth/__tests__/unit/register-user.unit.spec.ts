import { EmailAlreadyExistsError } from '@core/errors/email-already-exists.error';
import { createUser } from '@modules/auth/__tests__/factories/user.factory';
import { RegisterUserUseCase } from '@modules/auth/use-cases/register-user.use-case';
import { IUserRepository } from '@modules/user/domain/user.repository.interface';

import type { IPasswordService } from '@infrastructure/security/domain/password.service.interface';

describe('RegisterUserUseCase', () => {
  const userRepository: jest.Mocked<IUserRepository> = {
    findByEmail: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
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

  const createdUser = {
    id: 1,
    username: 'john',
    email: 'john@mail.com',
    password: 'hashed-password',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  let useCase: RegisterUserUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new RegisterUserUseCase(userRepository, passwordService);
  });

  describe('when email does not exist', () => {
    it('returns Ok(User)', async () => {
      userRepository.findByEmail.mockResolvedValue(null);
      passwordService.hash.mockResolvedValue('hashed-password');
      userRepository.create.mockResolvedValue(createdUser);

      const result = await useCase.execute(user);

      expect(result.isOk()).toBe(true);
      expect(result._unsafeUnwrap()).toEqual(createdUser);
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
  });

  describe('when email already exists', () => {
    it('returns Err(EmailAlreadyExistsError)', async () => {
      userRepository.findByEmail.mockResolvedValue(
        createUser({ username: 'existing-user' }),
      );

      const result = await useCase.execute(user);

      expect(result.isErr()).toBe(true);
      expect(result._unsafeUnwrapErr()).toBeInstanceOf(EmailAlreadyExistsError);
    });

    it('does not hash password', async () => {
      userRepository.findByEmail.mockResolvedValue(
        createUser({ username: 'existing-user' }),
      );

      await useCase.execute(user);

      expect(passwordService.hash).not.toHaveBeenCalled();
    });

    it('does not create user', async () => {
      userRepository.findByEmail.mockResolvedValue(
        createUser({ username: 'existing-user' }),
      );

      await useCase.execute(user);

      expect(userRepository.create).not.toHaveBeenCalled();
    });
  });
});
