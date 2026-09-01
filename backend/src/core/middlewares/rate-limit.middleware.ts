import type { AppEnvironment } from '@core/types/context.types';
import type { Context, Next } from 'hono';
import { HTTPException } from 'hono/http-exception';

interface RateLimiterOptions {
  windowMs: number;
  max: number;
  message?: string;
}

interface ClientRecord {
  count: number;
  resetTime: number;
}

export function rateLimiter(options: RateLimiterOptions) {
  const { windowMs, max, message = 'Too many requests. Please try again later.' } = options;
  const store = new Map<string, ClientRecord>();

  setInterval(
    () => {
      const now = Date.now();
      for (const [ip, record] of store.entries()) {
        if (now > record.resetTime) {
          store.delete(ip);
        }
      }
    },
    5 * 60 * 1000
  );

  return async (c: Context<AppEnvironment>, next: Next) => {
    const clientIp =
      c.req.header('x-forwarded-for')?.split(',')[0].trim() ||
      c.req.header('x-real-ip') ||
      '127.0.0.1';

    const now = Date.now();
    const record = store.get(clientIp);

    if (!record || now > record.resetTime) {
      store.set(clientIp, {
        count: 1,
        resetTime: now + windowMs,
      });
      c.res.headers.set('RateLimit-Limit', String(max));
      c.res.headers.set('RateLimit-Remaining', String(max - 1));
      c.res.headers.set('RateLimit-Reset', String(Math.ceil((now + windowMs) / 1000)));
      await next();
      return;
    }

    if (record.count >= max) {
      const retryAfterSeconds = Math.max(1, Math.ceil((record.resetTime - now) / 1000));
      c.res.headers.set('RateLimit-Limit', String(max));
      c.res.headers.set('RateLimit-Remaining', '0');
      c.res.headers.set('RateLimit-Reset', String(Math.ceil(record.resetTime / 1000)));
      c.res.headers.set('Retry-After', String(retryAfterSeconds));

      throw new HTTPException(429, { message });
    }

    record.count += 1;
    c.res.headers.set('RateLimit-Limit', String(max));
    c.res.headers.set('RateLimit-Remaining', String(max - record.count));
    c.res.headers.set('RateLimit-Reset', String(Math.ceil(record.resetTime / 1000)));

    await next();
  };
}
