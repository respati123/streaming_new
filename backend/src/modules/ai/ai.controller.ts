import { env } from '@core/config/env';
import type { AppEnvironment } from '@core/types/context.types';
import { sendSuccess } from '@core/utils/response.util';
import { Hono } from 'hono';
import { chatAiService } from './chat-ai.service';
import { elevenLabsService } from './elevenlabs.service';
import { piService } from './pi.service';

export const aiController = new Hono<AppEnvironment>();

aiController.get('/interactions', async (c) => {
  const requestedLimit = Number(c.req.query('limit') || 20);
  const limit = Number.isInteger(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 50) : 20;
  const interactions = await chatAiService.listRecent(limit);
  return sendSuccess(c, interactions, 'ChatAI interactions retrieved successfully');
});

aiController.get('/status', async (c) => {
  const pi = await piService.getStatus();

  return sendSuccess(
    c,
    {
      elevenlabs: {
        enabled: env.ELEVENLABS_ENABLED,
        configured: elevenLabsService.isConfigured(),
      },
      pi,
    },
    'AI integration status retrieved successfully'
  );
});
