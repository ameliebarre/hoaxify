import { flattenError, ZodError } from 'zod';

export function validationErrorResponse(error: ZodError) {
  return {
    error: {
      type: 'ValidationError',
      message: 'Invalid request data',
      details: flattenError(error),
    },
  };
}
