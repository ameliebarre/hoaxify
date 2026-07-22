import { Request } from 'express';

import { AuthUser } from '@/modules/auth/auth.types';

export interface AuthenticatedRequest extends Request {
  user: AuthUser;
}
