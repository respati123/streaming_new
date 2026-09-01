import { describe, expect, it } from 'bun:test';
import type { AppEnvironment } from '@core/types/context.types';
import { Hono } from 'hono';
import { rateLimiter } from './rate-limit.middleware';

describe('Rate Limiter Middleware', () => {
  it('should allow requests within limit and attach RateLimit headers', async () => {
    const app = new Hono<AppEnvironment>();
    app.use('*', rateLimiter({ windowMs: 1000, max: 2 }));
    app.get('/test', (c) => c.text('OK'));

    const res1 = await app.request('/test');
    expect(res1.status).toBe(200);
    expect(res1.headers.get('RateLimit-Remaining')).toBe('1');

    const res2 = await app.request('/test');
    expect(res2.status).toBe(200);
    expect(res2.headers.get('RateLimit-Remaining')).toBe('0');
  });

  it('should block requests exceeding the threshold with 429 status', async () => {
    const app = new Hono<AppEnvironment>();
    app.use('*', rateLimiter({ windowMs: 1000, max: 1 }));
    app.get('/test', (c) => c.text('OK'));

    await app.request('/test');
    const resBlocked = await app.request('/test');
    expect(resBlocked.status).toBe(429);
    expect(resBlocked.headers.get('Retry-After')).toBeDefined();
  });
});
