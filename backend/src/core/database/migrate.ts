import { logger } from '@core/logger/logger';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { db, queryClient } from './index';

/**
 * Programmatic Database Migration Runner
 * Executes all pending versioned SQL migrations in the drizzle folder.
 */
async function runMigrations() {
  logger.info('Starting database migrations from drizzle folder...');
  try {
    await migrate(db, { migrationsFolder: './drizzle' });
    logger.info('✅ Database migrations applied successfully.');
  } catch (error) {
    logger.error('Failed to run database migrations', {}, error as Error);
    process.exit(1);
  } finally {
    await queryClient.end();
  }
}

runMigrations();
