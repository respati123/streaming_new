import type { AppEnvironment } from '@core/types/context.types';
import type { Context, Next } from 'hono';

export const REQUEST_ID_HEADER = 'x-request-id';

/**
 * Injects a unique Request ID (UUID v4) into the Hono context and response headers.
 * If incoming request already contains `x-request-id`, it will reuse and propagate it.
 */
export async function requestIdMiddleware(c: Context<AppEnvironment>, next: Next) {
  const incomingId = c.req.header(REQUEST_ID_HEADER);
  const requestId =
    incomingId && incomingId.trim().length > 0 ? incomingId.trim() : crypto.randomUUID();

  c.set('requestId', requestId);

  c.res.headers.set(REQUEST_ID_HEADER, requestId);

  await next();

  c.res.headers.set(REQUEST_ID_HEADER, requestId);
}
