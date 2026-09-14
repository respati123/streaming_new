import { env } from '@core/config/env';
import { queryClient } from '@core/database';
import { logger } from '@core/logger/logger';
import { websocket } from '@core/ws/websocket.server';
import { startChatAiWorker, stopChatAiWorker } from '@modules/ai/chat-ai.queue';
import { chatAiService } from '@modules/ai/chat-ai.service';
import { streamerbotService } from '@modules/streamerbot/streamerbot.service';
import type { ChatAiRequestEventData } from '@modules/streamerbot/streamerbot.types';
import { app } from './app';

const server = Bun.serve({
  port: env.PORT,
  fetch: app.fetch,
  websocket,
});

if (env.CHATAI_ENABLED) {
  streamerbotService.on('chatai:request', (request: ChatAiRequestEventData) => {
    chatAiService.enqueue(request).catch((error) => {
      logger.error('[ChatAi] Failed to queue interaction', { chatId: request.id }, error as Error);
    });
  });
  startChatAiWorker(
    chatAiService.process.bind(chatAiService),
    chatAiService.markFailed.bind(chatAiService),
    chatAiService.reportAttemptFailure.bind(chatAiService)
  )
    .then(() => logger.info('[ChatAi] Worker ready', { concurrency: 1 }))
    .catch((error) => logger.error('[ChatAi] Worker failed to start', {}, error as Error));
}

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

    await stopChatAiWorker();
    await chatAiService.close();

    logger.info('Graceful shutdown completed. Process exiting.');
    process.exit(0);
  } catch (err) {
    logger.error('Error occurred during graceful shutdown', {}, err as Error);
    process.exit(1);
  }
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
