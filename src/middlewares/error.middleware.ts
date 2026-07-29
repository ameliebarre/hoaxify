import { ErrorRequestHandler } from 'express';

export const errorMiddleware: ErrorRequestHandler = (
  error,
  _req,
  res,
  next,
) => {
  if (
    error instanceof SyntaxError &&
    (error as NodeJS.ErrnoException).message &&
    'body' in error
  ) {
    return res.status(400).json({
      error: {
        type: 'InvalidJson',
        message: 'Invalid JSON body',
      },
    });
  }

  return next(error);
};
