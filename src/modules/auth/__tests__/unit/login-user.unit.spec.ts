import { UnauthorizedError } from '@core/errors/unauthorized-error';
import { ITokenService } from '@infrastructure/security/domain/token.service.interface';
import { LoginUserUseCase } from '@modules/auth/use-cases/login-user.use-case';
import { IUserRepository } from '@modules/user/domain/user.repository.interface';

import type { IPasswordService } from '@infrastructure/security/domain/password.service.interface';

describe('LoginUserUseCase', () => {
  let useCase: LoginUserUseCase;

  let userRepository: jest.Mocked<IUserRepository>;
  let passwordService: jest.Mocked<IPasswordService>;
  let tokenService: jest.Mocked<ITokenService>;

  beforeEach(() => {
    userRepository = {
      findByEmail: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
    };

    passwordService = {
      hash: jest.fn(),
      compare: jest.fn(),
    };

    tokenService = {
      generateAccessToken: jest.fn(),
      verifyAccessToken: jest.fn(),
    };

    useCase = new LoginUserUseCase(
      userRepository,
      passwordService,
      tokenService,
    );
  });

  it('returns Ok(AuthResponse) when credentials are valid', async () => {
    const user = {
      id: 1,
      username: 'john',
      email: 'john@mail.com',
      password: 'hashed-password',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    userRepository.findByEmail.mockResolvedValue(user);

    passwordService.compare.mockResolvedValue(true);

    tokenService.generateAccessToken.mockReturnValue('fake-token');

    const result = await useCase.execute({
      email: 'john@mail.com',
      password: 'P4ssword',
    });

    expect(passwordService.compare).toHaveBeenCalledWith(
      'P4ssword',
      'hashed-password',
    );
    expect(tokenService.generateAccessToken).toHaveBeenCalledWith({
      userId: 1,
    });
    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap()).toEqual({
      user: {
        id: 1,
        username: 'john',
        email: 'john@mail.com',
      },
      accessToken: 'fake-token',
    });
  });

  it('returns Err(UnauthorizedError) when user does not exist', async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    const result = await useCase.execute({
      email: 'unknown@mail.com',
      password: 'P4ssword',
    });

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr()).toBeInstanceOf(UnauthorizedError);
    expect(userRepository.findByEmail).toHaveBeenCalledWith('unknown@mail.com');
  });

  it('returns Err(UnauthorizedError) when password is incorrect', async () => {
    const user = {
      id: 1,
      username: 'john',
      email: 'john@mail.com',
      password: 'hashed-password',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    userRepository.findByEmail.mockResolvedValue(user);
    passwordService.compare.mockResolvedValue(false);

    const result = await useCase.execute({
      email: 'john@mail.com',
      password: 'WrongPass',
    });

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr()).toBeInstanceOf(UnauthorizedError);
    expect(tokenService.generateAccessToken).not.toHaveBeenCalled();
  });
});
