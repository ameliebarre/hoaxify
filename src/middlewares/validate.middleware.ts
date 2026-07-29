import { NextFunction, Request, Response } from 'express';
import { ZodType } from 'zod';

import { validationErrorResponse } from '@core/errors/http/validation.error';

export function validate(schema: ZodType) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json(validationErrorResponse(result.error));
    }

    req.body = result.data;
    next();
  };
}
