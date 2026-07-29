import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

import { validate } from '@middlewares/validate.middleware';

describe('validate middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.MockedFunction<NextFunction>;

  const schema = z.object({
    username: z.string().min(3),
    email: z.string().email(),
  });

  beforeEach(() => {
    req = {
      body: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    next = jest.fn();
  });

  describe('Given a request body matching the schema', () => {
    beforeEach(() => {
      req.body = {
        username: 'john',
        email: 'john@mail.com',
      };
    });

    describe('When the validation middleware is executed', () => {
      it('Then it should call next middleware', () => {
        const middleware = validate(schema);

        middleware(req as Request, res as Response, next);

        expect(next).toHaveBeenCalledTimes(1);

        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
      });

      it('Then it should keep the validated body', () => {
        const middleware = validate(schema);

        middleware(req as Request, res as Response, next);

        expect(req.body).toEqual({
          username: 'john',
          email: 'john@mail.com',
        });
      });
    });
  });

  describe('Given a request body that does not match the schema', () => {
    beforeEach(() => {
      req.body = {
        username: 'jo',
        email: 'invalid-email',
      };
    });

    describe('When the validation middleware is executed', () => {
      it('Then it should return a 400 response', () => {
        const middleware = validate(schema);

        middleware(req as Request, res as Response, next);

        expect(res.status).toHaveBeenCalledWith(400);

        expect(res.json).toHaveBeenCalled();

        expect(next).not.toHaveBeenCalled();
      });
    });
  });

  describe('Given a schema with transformations', () => {
    const transformedSchema = z.object({
      email: z.string().trim().toLowerCase(),
    });

    beforeEach(() => {
      req.body = {
        email: '  JOHN@MAIL.COM ',
      };
    });

    describe('When the validation middleware is executed', () => {
      it('Then it should replace the body with the parsed data', () => {
        const middleware = validate(transformedSchema);

        middleware(req as Request, res as Response, next);

        expect(req.body).toEqual({
          email: 'john@mail.com',
        });

        expect(next).toHaveBeenCalled();
      });
    });
  });
});
