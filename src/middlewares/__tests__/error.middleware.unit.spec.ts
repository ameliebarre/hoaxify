import { NextFunction, Request, Response } from 'express';

import { errorMiddleware } from '@middlewares/error.middleware';

describe('errorMiddleware', () => {
  let req: Request;
  let res: Response;
  let next: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    req = {} as Request;

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    next = jest.fn();
  });

  describe('Given the request body contains invalid JSON', () => {
    describe('When the error middleware is executed', () => {
      it('Then it should return a 400 Bad Request response', () => {
        const error = new SyntaxError('Unexpected token');

        Object.assign(error, {
          body: '{ invalid json',
        });

        errorMiddleware(error, req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);

        expect(res.json).toHaveBeenCalledWith({
          error: {
            type: 'InvalidJson',
            message: 'Invalid JSON body',
          },
        });

        expect(next).not.toHaveBeenCalled();
      });
    });
  });

  describe('Given the error is not a JSON parsing error', () => {
    describe('When the error middleware is executed', () => {
      it('Then it should return a generic 500 response without leaking the error message', () => {
        const error = new Error('connection refused at 10.0.0.5:5432');

        errorMiddleware(error, req, res, next);

        expect(res.status).toHaveBeenCalledWith(500);

        expect(res.json).toHaveBeenCalledWith({
          error: {
            type: 'InternalServerError',
            message: expect.any(String),
          },
        });

        const [body] = (res.json as jest.Mock).mock.calls[0];
        expect(body.error.message).not.toContain('10.0.0.5');

        expect(next).not.toHaveBeenCalled();
      });
    });
  });

  describe('Given the error is a SyntaxError without a body property', () => {
    describe('When the error middleware is executed', () => {
      it('Then it should return a generic 500 response', () => {
        const error = new SyntaxError('Unexpected token');

        errorMiddleware(error, req, res, next);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalled();

        expect(next).not.toHaveBeenCalled();
      });
    });
  });
});
