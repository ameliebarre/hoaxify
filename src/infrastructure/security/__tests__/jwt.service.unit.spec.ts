import jwt from 'jsonwebtoken';

import env from '@core/config/env';
import { JwtService } from '@infrastructure/security/jwt/jwt.service';

describe('JwtService', () => {
  let jwtService: JwtService;

  beforeEach(() => {
    jwtService = new JwtService();
  });

  describe('Given a valid user payload', () => {
    describe('When generating a JWT token', () => {
      it('Then it should return a valid token', async () => {
        const result = await jwtService.sign({
          userId: 1,
        });

        expect(result.isOk()).toBe(true);

        const token = result._unsafeUnwrap();

        expect(token).toBeDefined();
        expect(typeof token).toBe('string');
      });
    });
  });

  describe('Given a valid JWT token', () => {
    describe('When verifying the token', () => {
      it('Then it should return the user payload', async () => {
        const signResult = await jwtService.sign({
          userId: 1,
        });

        expect(signResult.isOk()).toBe(true);

        const token = signResult._unsafeUnwrap();

        const verifyResult = await jwtService.verify(token);

        expect(verifyResult.isOk()).toBe(true);

        const payload = verifyResult._unsafeUnwrap();

        expect(payload).toEqual({
          userId: 1,
        });
      });
    });
  });

  describe('Given an invalid JWT token', () => {
    describe('When verifying the token', () => {
      it('Then it should return a JwtVerifyError', async () => {
        const result = await jwtService.verify('invalid-token');

        expect(result.isErr()).toBe(true);

        const error = result._unsafeUnwrapErr();

        expect(error).toEqual({
          type: 'JwtVerifyError',
          message: expect.any(String),
        });
      });
    });
  });

  describe('Given an expired JWT token', () => {
    describe('When verifying the token', () => {
      it('Then it should return a JwtVerifyError', async () => {
        const expiredToken = jwt.sign({ userId: 1 }, env.JWT_SECRET, {
          expiresIn: -1,
        });

        const result = await jwtService.verify(expiredToken);

        expect(result.isErr()).toBe(true);

        const error = result._unsafeUnwrapErr();

        expect(error).toEqual({
          type: 'JwtVerifyError',
          message: expect.any(String),
        });
      });
    });
  });
});
