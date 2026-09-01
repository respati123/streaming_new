import { env } from '@core/config/env';
import { logger } from '@core/logger/logger';
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

export const queryClient = postgres(env.DATABASE_URL, {
  max: env.NODE_ENV === 'production' ? 20 : 5,
  idle_timeout: 30,
  connect_timeout: 10,
  onnotice: () => {},
});

export const db = drizzle(queryClient, {
  schema,
  logger: env.NODE_ENV === 'development' && env.LOG_LEVEL === 'debug',
});

/**
 * Validates database connectivity with a lightweight ping query.
 */
export async function checkDatabaseHealth(): Promise<{ isHealthy: boolean; latencyMs: number }> {
  const start = performance.now();
  try {
    await db.execute(sql`SELECT 1`);
    const latencyMs = Math.round((performance.now() - start) * 100) / 100;
    return { isHealthy: true, latencyMs };
  } catch (err) {
    logger.warn('Database healthcheck ping failed', {}, err as Error);
    return { isHealthy: false, latencyMs: -1 };
  }
}

logger.info('Database connection pool initialized', {
  databaseUrl: env.DATABASE_URL.replace(/:[^:@]+@/, ':****@'),
});
