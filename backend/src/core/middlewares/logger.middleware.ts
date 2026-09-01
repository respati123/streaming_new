import { logger } from '@core/logger/logger';
import type { AppEnvironment } from '@core/types/context.types';
import type { Context, Next } from 'hono';

export async function requestLoggerMiddleware(c: Context<AppEnvironment>, next: Next) {
  const start = performance.now();
  const method = c.req.method;
  const path = c.req.path;
  const requestId = c.get('requestId') || 'unknown';
  const clientIp = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || '127.0.0.1';

  await next();

  const durationMs = Math.round((performance.now() - start) * 100) / 100;
  const statusCode = c.res.status;

  const logContext = {
    requestId,
    method,
    path,
    statusCode,
    durationMs,
    clientIp,
  };

  const message = `${method} ${path} -> ${statusCode} (${durationMs}ms)`;

  if (statusCode >= 500) {
    logger.error(message, logContext);
  } else if (statusCode >= 400) {
    logger.warn(message, logContext);
  } else {
    logger.info(message, logContext);
  }
}
