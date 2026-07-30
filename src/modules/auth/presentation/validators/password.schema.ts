import { z } from 'zod';

// bcrypt silently truncates anything past 72 bytes, so a longer password
// gives users a false sense of security without this check.
export const BCRYPT_MAX_BYTES = 72;

export function withMaxBytes<T extends z.ZodString>(schema: T) {
  return schema.refine(
    (value) => Buffer.byteLength(value, 'utf8') <= BCRYPT_MAX_BYTES,
    { message: `Password must not exceed ${BCRYPT_MAX_BYTES} bytes` },
  );
}
