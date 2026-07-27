import { NextFunction, Request, Response } from 'express';

import { EmailAlreadyExistsError } from '@core/errors/email-already-exists.error';
import { UnauthorizedError } from '@core/errors/unauthorized-error';
import { UserNotFoundError } from '@core/errors/user-not-found.error';
import { errorHandler } from '@middlewares/error-handler';

describe('errorHandler', () => {
  let req: Request;
  let res: Response;
  let next: NextFunction;

  beforeEach(() => {
    req = {} as Request;

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    next = jest.fn();
  });

  it('returns 409 for EmailALreadyExistsError', () => {
    const error = new EmailAlreadyExistsError();

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      message: error.message,
    });
  });

  it('returns 401 for UnauthorizedError', () => {
    const error = new UnauthorizedError();

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: error.message,
    });
  });

  it('returns 401 for UserNotFoundError', () => {
    const error = new UserNotFoundError();

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: error.message,
    });
  });

  it('returns 500 for generic Error', () => {
    const error = new Error('Something went wrong');

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Something went wrong',
    });
  });

  it('returns 500 for unknown error', () => {
    errorHandler('unexpected error', req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Unknown error',
    });
  });
});
