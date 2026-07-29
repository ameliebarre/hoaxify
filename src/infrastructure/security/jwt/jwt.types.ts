import { AuthUser } from '@modules/auth/domain/auth.types';

export type RefreshTokenPayload = AuthUser & {
  jti: string;
};