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
      it('Then it should pass the error to the next middleware', () => {
        const error = new Error('Something went wrong');

        errorMiddleware(error, req, res, next);

        expect(next).toHaveBeenCalledWith(error);

        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
      });
    });
  });

  describe('Given the error is a SyntaxError without a body property', () => {
    describe('When the error middleware is executed', () => {
      it('Then it should pass the error to the next middleware', () => {
        const error = new SyntaxError('Unexpected token');

        errorMiddleware(error, req, res, next);

        expect(next).toHaveBeenCalledWith(error);

        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
      });
    });
  });
});
