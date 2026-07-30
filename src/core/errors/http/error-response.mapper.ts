import { AppError } from '@core/errors/domain/app.error';
import { httpError } from '@core/errors/http/http-error';

const INTERNAL_ERROR_MESSAGE =
  'An unexpected error occurred. Please try again later.';

// Internal error messages (DB driver text, bcrypt/jsonwebtoken internals) can
// contain implementation details that must never reach the client on a 500.
function internalError(error: AppError) {
  console.error(`[${error.type}]`, error.message);

  return httpError(500, { ...error, message: INTERNAL_ERROR_MESSAGE });
}

export function mapErrorToHttp(error: AppError) {
  switch (error.type) {
    // 401 Unauthorized
    case 'Unauthorized':
    case 'InvalidCredentials':
    case 'UserNotFound':
    case 'JwtVerifyError':
    case 'InvalidRefreshToken':
      return httpError(401, error);

    // 409 Conflict
    case 'EmailAlreadyExists':
    case 'UsernameAlreadyExists':
      return httpError(409, error);

    // 500 Internal Server Error
    case 'DatabaseError':
    case 'PasswordHashError':
    case 'PasswordCompareError':
    case 'JwtSignError':
      return internalError(error);

    default:
      console.error('Unmapped domain error', error);

      return {
        status: 500,
        body: {
          error: {
            type: 'InternalServerError',
            message: INTERNAL_ERROR_MESSAGE,
          },
        },
      };
  }
}
