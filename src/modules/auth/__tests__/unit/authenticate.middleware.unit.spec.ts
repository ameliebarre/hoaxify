import { NextFunction, Request, Response } from 'express';

import { UnauthorizedError } from '@core/errors/unauthorized-error';
import { ITokenService } from '@infrastructure/security/domain/token.service.interface';
import { authenticateMiddleware } from '@modules/auth/presentation/auth.middleware';

describe('authentication middleware', () => {
  let tokenService: jest.Mocked<ITokenService>;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    tokenService = {
      verifyAccessToken: jest.fn(),
      generateAccessToken: jest.fn(),
    };

    req = {
      headers: {},
    };

    res = {};

    next = jest.fn();
  });

  describe('when token is missing', () => {
    it('throws unauthorized error', () => {
      const authMiddleware = authenticateMiddleware(tokenService);

      expect(() =>
        authMiddleware(req as Request, res as Response, next),
      ).toThrow(UnauthorizedError);

      expect(tokenService.verifyAccessToken).not.toHaveBeenCalled();

      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('when token is invalid', () => {
    it('throws unauthorized error', () => {
      req.headers = {
        authorization: 'Bearer invalid-token',
      };

      tokenService.verifyAccessToken.mockImplementation(() => {
        throw new UnauthorizedError();
      });

      const middleware = authenticateMiddleware(tokenService);

      expect(() => middleware(req as Request, res as Response, next)).toThrow(
        UnauthorizedError,
      );

      expect(tokenService.verifyAccessToken).toHaveBeenCalledWith(
        'invalid-token',
      );

      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('when token is valid', () => {
    it('adds user to request and calls next', async () => {
      req.headers = {
        authorization: 'Bearer valid-token',
      };

      tokenService.verifyAccessToken.mockReturnValue({
        userId: 1,
      });

      const middleware = authenticateMiddleware(tokenService);

      middleware(req as Request, res as Response, next);

      expect(tokenService.verifyAccessToken).toHaveBeenCalledWith(
        'valid-token',
      );

      expect(req.user).toEqual({
        userId: 1,
      });

      expect(next).toHaveBeenCalled();
    });
  });
});
