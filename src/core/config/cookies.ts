import env from '@core/config/env';
import { REFRESH_TOKEN_TTL_MS } from '@core/config/token-ttl';

export const cookieConfig = {
  refreshToken: {
    httpOnly: true,
    secure: env.ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: REFRESH_TOKEN_TTL_MS,
  },
};
