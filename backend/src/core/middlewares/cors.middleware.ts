import { env } from '@core/config/env';
import { cors } from 'hono/cors';

export const corsMiddleware = cors({
  origin: (origin) => {
    if (!origin) return '*';
    const allowed = env.CORS_ORIGINS.split(',').map((o) => o.trim());
    if (allowed.includes('*') || allowed.includes(origin)) {
      return origin;
    }
    return allowed[0] || '*';
  },
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'x-request-id', 'Cookie', 'Set-Cookie', 'better-auth-api-key', 'better-auth-session-token'],
  exposeHeaders: ['x-request-id', 'Content-Length', 'Set-Cookie'],
  credentials: true,
  maxAge: 86400,
});
