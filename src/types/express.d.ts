import { AuthUser } from '@modules/auth/domain/auth.types';

declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthUser;
  }
}

export {};
