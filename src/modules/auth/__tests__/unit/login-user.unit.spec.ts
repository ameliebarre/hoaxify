import { UnauthorizedError } from '@core/errors/unauthorized-error';
import { IPasswordService } from '@infrastructure/security/domain/password.service.interface';
import { ITokenService } from '@infrastructure/security/domain/token.service.interface';
import { LoginUserUseCase } from '@modules/auth/use-cases/login-user.use-case';
import { IUserRepository } from '@modules/user/domain/user.repository.interface';

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

  it('returns user when credentials are valid', async () => {
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

    expect(result).toEqual({
      user: {
        id: 1,
        username: 'john',
        email: 'john@mail.com',
      },
      accessToken: 'fake-token',
    });

    expect(userRepository.findByEmail).toHaveBeenCalledWith('john@mail.com');

    expect(passwordService.compare).toHaveBeenCalledWith(
      'P4ssword',
      'hashed-password',
    );

    expect(tokenService.generateAccessToken).toHaveBeenCalledWith({
      userId: 1,
    });
  });

  it('throws unauthorized error when user does not exist', async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    await expect(
      useCase.execute({
        email: 'unknown@mail.com',
        password: 'P4ssword',
      }),
    ).rejects.toThrow(UnauthorizedError);
  });

  it('throws unauthorized error when password is invalid', async () => {
    userRepository.findByEmail.mockResolvedValue({
      id: 1,
      username: 'john',
      email: 'john@mail.com',
      password: 'hashed-password',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    passwordService.compare.mockResolvedValue(false);

    await expect(
      useCase.execute({
        email: 'john@mail.com',
        password: 'WrongPassword',
      }),
    ).rejects.toThrow(UnauthorizedError);
  });
});
