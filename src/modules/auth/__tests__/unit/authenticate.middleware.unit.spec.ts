import { NextFunction, Request, Response } from 'express';
import { errAsync, okAsync } from 'neverthrow';

import { authenticateMiddleware } from '@modules/auth/presentation/auth.middleware';

import type { IJwtService } from '@infrastructure/security/jwt/jwt.service.interface';

describe('authenticateMiddleware', () => {
  let jwtService: jest.Mocked<IJwtService>;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    jwtService = {
      generateAccessToken: jest.fn(),
      generateRefreshToken: jest.fn(),
      verifyAccessToken: jest.fn(),
      verifyRefreshToken: jest.fn(),
    };

    req = {
      headers: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    next = jest.fn();
  });

  describe('Given no Authorization header is provided', () => {
    describe('When the middleware is executed', () => {
      it('Then it should return a 401 response', async () => {
        const middleware = authenticateMiddleware(jwtService);

        await middleware(req as Request, res as Response, next);

        expect(jwtService.verifyAccessToken).not.toHaveBeenCalled();

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalled();

        expect(next).not.toHaveBeenCalled();
      });
    });
  });

  describe('Given the Authorization header does not use the Bearer scheme', () => {
    beforeEach(() => {
      req.headers = {
        authorization: 'Basic token',
      };
    });

    describe('When the middleware is executed', () => {
      it('Then it should return a 401 response', async () => {
        const middleware = authenticateMiddleware(jwtService);

        await middleware(req as Request, res as Response, next);

        expect(jwtService.verifyAccessToken).not.toHaveBeenCalled();

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalled();

        expect(next).not.toHaveBeenCalled();
      });
    });
  });

  describe('Given the Bearer token is missing', () => {
    beforeEach(() => {
      req.headers = {
        authorization: 'Bearer',
      };
    });

    describe('When the middleware is executed', () => {
      it('Then it should return a 401 response', async () => {
        const middleware = authenticateMiddleware(jwtService);

        await middleware(req as Request, res as Response, next);

        expect(jwtService.verifyAccessToken).not.toHaveBeenCalled();

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalled();

        expect(next).not.toHaveBeenCalled();
      });
    });
  });

  describe('Given the token is invalid', () => {
    beforeEach(() => {
      req.headers = {
        authorization: 'Bearer invalid-token',
      };

      jwtService.verifyAccessToken.mockReturnValue(
        errAsync({
          type: 'JwtVerifyError',
          message: 'Invalid token',
        }),
      );
    });

    describe('When the middleware is executed', () => {
      it('Then it should return a 401 response', async () => {
        const middleware = authenticateMiddleware(jwtService);

        await middleware(req as Request, res as Response, next);

        expect(jwtService.verifyAccessToken).toHaveBeenCalledWith(
          'invalid-token',
        );

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalled();

        expect(next).not.toHaveBeenCalled();
      });
    });
  });

  describe('Given the token is valid', () => {
    beforeEach(() => {
      req.headers = {
        authorization: 'Bearer valid-token',
      };

      jwtService.verifyAccessToken.mockReturnValue(
        okAsync({
          userId: 1,
        }),
      );
    });

    describe('When the middleware is executed', () => {
      it('Then it should attach the authenticated user to the request', async () => {
        const middleware = authenticateMiddleware(jwtService);

        await middleware(req as Request, res as Response, next);

        expect(jwtService.verifyAccessToken).toHaveBeenCalledWith(
          'valid-token',
        );

        expect(req.user).toEqual({
          userId: 1,
        });

        expect(next).toHaveBeenCalledTimes(1);

        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
      });
    });
  });
});
