import jwt from 'jsonwebtoken';

import env from '@core/config/env';
import { JwtService } from '@infrastructure/security/jwt/jwt.service';

describe('JwtService', () => {
  let jwtService: JwtService;

  beforeEach(() => {
    jwtService = new JwtService();
  });

  describe('Given a valid user payload', () => {
    describe('When generating an access token', () => {
      it('Then it should return a valid JWT', async () => {
        const result = await jwtService.generateAccessToken({
          userId: 1,
        });

        expect(result.isOk()).toBe(true);

        const token = result._unsafeUnwrap();

        expect(typeof token).toBe('string');
        expect(token).toBeTruthy();
      });
    });
  });

  describe('Given a valid access token', () => {
    describe('When verifying the token', () => {
      it('Then it should return the authenticated user', async () => {
        const signResult = await jwtService.generateAccessToken({
          userId: 1,
        });

        const token = signResult._unsafeUnwrap();

        const verifyResult = await jwtService.verifyAccessToken(token);

        expect(verifyResult.isOk()).toBe(true);

        expect(verifyResult._unsafeUnwrap()).toEqual({
          userId: 1,
        });
      });
    });
  });

  describe('Given a valid user payload with a token id', () => {
    describe('When generating a refresh token', () => {
      it('Then it should return a valid JWT', async () => {
        const result = await jwtService.generateRefreshToken({
          userId: 1,
          jti: 'refresh-token-id',
        });

        expect(result.isOk()).toBe(true);

        expect(typeof result._unsafeUnwrap()).toBe('string');
      });
    });
  });

  describe('Given a valid refresh token', () => {
    describe('When verifying the token', () => {
      it('Then it should return the authenticated user and the token id', async () => {
        const signResult = await jwtService.generateRefreshToken({
          userId: 1,
          jti: 'refresh-token-id',
        });

        const token = signResult._unsafeUnwrap();

        const verifyResult = await jwtService.verifyRefreshToken(token);

        expect(verifyResult.isOk()).toBe(true);

        expect(verifyResult._unsafeUnwrap()).toEqual({
          userId: 1,
          jti: 'refresh-token-id',
        });
      });
    });
  });

  describe('Given an access token', () => {
    describe('When verifying it as a refresh token', () => {
      it('Then it should return a JwtVerifyError', async () => {
        const signResult = await jwtService.generateAccessToken({
          userId: 1,
        });

        const token = signResult._unsafeUnwrap();

        const result = await jwtService.verifyRefreshToken(token);

        expect(result.isErr()).toBe(true);

        const error = result._unsafeUnwrapErr();

        expect(error.type).toBe('JwtVerifyError');
        expect(error.message).toContain('JsonWebTokenError');
      });
    });
  });

  describe('Given a refresh token', () => {
    describe('When verifying it as an access token', () => {
      it('Then it should return a JwtVerifyError', async () => {
        const signResult = await jwtService.generateRefreshToken({
          userId: 1,
          jti: 'refresh-token-id',
        });

        const token = signResult._unsafeUnwrap();

        const result = await jwtService.verifyAccessToken(token);

        expect(result.isErr()).toBe(true);
      });
    });
  });

  describe('Given a refresh token without a token id', () => {
    describe('When verifying the token', () => {
      it('Then it should return a JwtVerifyError', async () => {
        const token = jwt.sign({ userId: 1 }, env.REFRESH_SECRET, {
          algorithm: 'HS256',
        });

        const result = await jwtService.verifyRefreshToken(token);

        expect(result.isErr()).toBe(true);

        const error = result._unsafeUnwrapErr();

        expect(error.type).toBe('JwtVerifyError');
        expect(error.message).toContain('Invalid JWT payload');
      });
    });
  });

  describe('Given an invalid JWT token', () => {
    describe('When verifying the token', () => {
      it('Then it should return a JwtVerifyError', async () => {
        const result = await jwtService.verifyAccessToken('invalid-token');

        expect(result.isErr()).toBe(true);

        const error = result._unsafeUnwrapErr();

        expect(error.type).toBe('JwtVerifyError');
        expect(error.message).toContain('JsonWebTokenError');
      });
    });
  });

  describe('Given an expired JWT token', () => {
    describe('When verifying the token', () => {
      it('Then it should return a JwtVerifyError', async () => {
        const expiredToken = jwt.sign({ userId: 1 }, env.ACCESS_SECRET, {
          expiresIn: -1,
          algorithm: 'HS256',
        });

        const result = await jwtService.verifyAccessToken(expiredToken);

        expect(result.isErr()).toBe(true);

        const error = result._unsafeUnwrapErr();

        expect(error.type).toBe('JwtVerifyError');
        expect(error.message).toContain('TokenExpiredError');
      });
    });
  });

  describe('Given a JWT without userId', () => {
    describe('When verifying the token', () => {
      it('Then it should return a JwtVerifyError', async () => {
        const token = jwt.sign({ hello: 'world' }, env.ACCESS_SECRET, {
          algorithm: 'HS256',
        });

        const result = await jwtService.verifyAccessToken(token);

        expect(result.isErr()).toBe(true);

        const error = result._unsafeUnwrapErr();

        expect(error.type).toBe('JwtVerifyError');
        expect(error.message).toContain('Invalid JWT payload');
      });
    });
  });
});