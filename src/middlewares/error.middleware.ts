import { ErrorRequestHandler } from 'express';

// Terminal handler: never delegates to Express's built-in error handler,
// whose stack-trace exposure depends on NODE_ENV — a variable this app
// never sets (it uses its own ENV instead). Sanitizing and responding here
// keeps that behavior independent of how NODE_ENV happens to be configured.
export const errorMiddleware: ErrorRequestHandler = (
  error,
  _req,
  res,
  _next,
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

  console.error('Unhandled error', error);

  return res.status(500).json({
    error: {
      type: 'InternalServerError',
      message: 'An unexpected error occurred. Please try again later.',
    },
  });
};
