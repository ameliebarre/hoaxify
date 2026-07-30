import { Options, rateLimit, RateLimitRequestHandler } from 'express-rate-limit';

type RateLimiterOptions = Pick<Partial<Options>, 'windowMs' | 'limit' | 'skip'>;

export function createRateLimiter(
  options: RateLimiterOptions,
): RateLimitRequestHandler {
  return rateLimit({
    windowMs: options.windowMs,
    limit: options.limit,
    skip: options.skip,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) => {
      res.status(429).json({
        error: {
          type: 'TooManyRequests',
          message: 'Too many requests, please try again later.',
        },
      });
    },
  });
}