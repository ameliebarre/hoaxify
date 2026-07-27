import jwt from 'jsonwebtoken';

import env from '@core/config/env';
import { UnauthorizedError } from '@core/errors/unauthorized-error';
import { JwtService } from '@infrastructure/security/infrastructure/jwt.service';

describe('JwtService', () => {
  let jwtService: JwtService;

  beforeEach(() => {
    jwtService = new JwtService();
  });

  it('generates an access token', () => {
    const token = jwtService.generateAccessToken({ userId: 1 });

    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
  });

  it('verifies a valid token', () => {
    const token = jwtService.generateAccessToken({ userId: 1 });

    const payload = jwtService.verifyAccessToken(token);

    expect(payload).toMatchObject({
      userId: 1,
    });
  });

  it('throws UnauthorizedError when token is invalid', () => {
    expect(() => jwtService.verifyAccessToken('invalid-token')).toThrow(
      UnauthorizedError,
    );
  });

  it('throws UnauthorizedError when token has expired', async () => {
    const expiredToken = jwt.sign({ userId: 1 }, env.JWT_SECRET, {
      expiresIn: -1,
    });

    expect(() => jwtService.verifyAccessToken(expiredToken)).toThrow(
      UnauthorizedError,
    );
  });
});
