import {
  HoaxNotFoundError,
  UnauthorizedHoaxDeletionError,
} from '@modules/hoax/domain/errors/hoax.error';

export const HoaxErrors = {
  notFound(): HoaxNotFoundError {
    return {
      type: 'HoaxNotFound',
      message: 'Hoax not found.',
    };
  },

  unauthorizedDeletion(): UnauthorizedHoaxDeletionError {
    return {
      type: 'UnauthorizedHoaxDeletion',
      message: 'You are not allowed to delete this hoax.',
    };
  },
} as const;
