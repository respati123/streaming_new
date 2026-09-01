import { env } from '@core/config/env';
import { queryClient } from '@core/database';
import { logger } from '@core/logger/logger';
import { app } from './app';
import { websocket } from '@core/ws/websocket.server';
import { streamerbotService } from '@modules/streamerbot/streamerbot.service';

const server = Bun.serve({
  port: env.PORT,
  fetch: app.fetch,
  websocket,
});

// Initialize Streamer.bot WebSocket connection in the background if enabled
if (env.STREAMERBOT_ENABLED) {
  streamerbotService.initialize().catch((err) => {
    logger.warn('Streamer.bot initial connection deferred', {}, err as Error);
  });
} else {
  logger.info('ℹ️ [StreamerbotService] Integration is disabled (STREAMERBOT_ENABLED=false)');
}

logger.info(`🚀 Server running at http://localhost:${server.port}`, {
  port: server.port,
  environment: env.NODE_ENV,
  apiPrefix: env.API_PREFIX,
  docsUrl: `http://localhost:${server.port}/docs`,
});

async function gracefulShutdown(signal: string) {
  logger.info(`Received ${signal}. Gracefully terminating backend server...`);

  try {
    server.stop();
    logger.info('HTTP server stopped.');

    await queryClient.end();
    logger.info('PostgreSQL connection pool closed.');

    logger.info('Graceful shutdown completed. Process exiting.');
    process.exit(0);
  } catch (err) {
    logger.error('Error occurred during graceful shutdown', {}, err as Error);
    process.exit(1);
  }
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
