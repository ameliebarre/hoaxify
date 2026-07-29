import { UserNotFoundError } from '@modules/user/domain/errors/user.error';

export const UserErrors = {
  notFound(): UserNotFoundError {
    return {
      type: 'UserNotFound',
      message: 'User not found.',
    };
  },
} as const;
