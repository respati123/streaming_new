import { db } from '@core/database';
import { streamerbotActions } from '@core/database/schema';
import type { AppEnvironment } from '@core/types/context.types';
import { sendSuccess } from '@core/utils/response.util';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { streamSSE } from 'hono/streaming';
import { streamerbotService } from './streamerbot.service';
import { testAlertSchema, triggerActionSchema } from './streamerbot.types';

export const streamerbotController = new Hono<AppEnvironment>();

/**
 * GET /api/v1/streamerbot/status
 * Check current WebSocket connection status to Streamer.bot
 */
streamerbotController.get('/status', (c) => {
  const status = streamerbotService.getStatus();
  return sendSuccess(c, status, 'Streamer.bot status retrieved successfully');
});

/**
 * POST /api/v1/streamerbot/connect
 * Manually trigger / re-initialize connection to Streamer.bot
 */
streamerbotController.post('/connect', async (c) => {
  await streamerbotService.initialize(true);
  const status = streamerbotService.getStatus();
  return sendSuccess(c, status, 'Reconnection attempt initiated');
});

/**
 * GET /api/v1/streamerbot/actions
 * List all available actions from Streamer.bot and DB
 */
streamerbotController.get('/actions', async (c) => {
  // Fetch live actions from connected Streamer.bot instance
  const liveActions = await streamerbotService.getAvailableActions();
  // Also fetch saved preset deck buttons from DB
  const dbActions = await db.select().from(streamerbotActions);

  return sendSuccess(
    c,
    {
      liveActions,
      savedDeckActions: dbActions,
    },
    'Streamer.bot actions retrieved successfully'
  );
});

/**
 * POST /api/v1/streamerbot/actions/trigger
 * Trigger an action in Streamer.bot dynamically
 */
streamerbotController.post(
  '/actions/trigger',
  zValidator('json', triggerActionSchema),
  async (c) => {
    const { action, args } = c.req.valid('json');
    const result = await streamerbotService.doAction(action, args);

    if (!result.success) {
      return c.json(
        {
          success: false,
          message: result.error || 'Failed to trigger action',
          statusCode: 503,
        },
        503
      );
    }

    return sendSuccess(c, result.data, `Action '${action}' triggered successfully`);
  }
);

/**
 * POST /api/v1/streamerbot/test-alert
 * Trigger a simulated donation alert
 */
streamerbotController.post(
  '/test-alert',
  zValidator('json', testAlertSchema),
  async (c) => {
    const body = c.req.valid('json');
    const alertData = {
      donorName: body.donorName,
      amount: body.amount,
      currency: body.currency,
      message: body.message,
      source: 'manual_test' as const,
      timestamp: new Date().toISOString(),
    };

    const isExecutedInBot = await streamerbotService.triggerDonationAlert(alertData);

    return sendSuccess(
      c,
      {
        alert: alertData,
        streamerbotTriggered: isExecutedInBot,
      },
      'Test donation alert broadcasted successfully'
    );
  }
);

/**
 * GET /api/v1/streamerbot/events/stream
 * Server-Sent Events (SSE) stream for OBS Overlay & Frontend Dashboard
 */
streamerbotController.get('/events/stream', (c) => {
  return streamSSE(c, async (stream) => {
    // Send initial connection handshake
    await stream.writeSSE({
      event: 'system:ready',
      data: JSON.stringify({
        message: 'Connected to Stream Hub Event Stream',
        status: streamerbotService.getStatus(),
        timestamp: new Date().toISOString(),
      }),
    });

    // Listen to local & Streamer.bot events
    const onDonationAlert = async (data: any) => {
      await stream.writeSSE({
        event: 'donation:alert',
        data: JSON.stringify(data),
      });
    };

    const onChatMessage = async (data: any) => {
      await stream.writeSSE({
        event: 'chat:message',
        data: JSON.stringify(data),
      });
    };

    const onStatusChanged = async (status: string) => {
      await stream.writeSSE({
        event: 'status:changed',
        data: JSON.stringify({ status, timestamp: new Date().toISOString() }),
      });
    };

    streamerbotService.on('donation:alert', onDonationAlert);
    streamerbotService.on('chat:message', onChatMessage);
    streamerbotService.on('status:changed', onStatusChanged);

    // Keep alive ping interval
    const pingInterval = setInterval(async () => {
      try {
        await stream.writeSSE({
          event: 'ping',
          data: JSON.stringify({ timestamp: Date.now() }),
        });
      } catch {
        clearInterval(pingInterval);
      }
    }, 15000);

    // Cleanup on disconnect
    stream.onAbort(() => {
      clearInterval(pingInterval);
      streamerbotService.off('donation:alert', onDonationAlert);
      streamerbotService.off('chat:message', onChatMessage);
      streamerbotService.off('status:changed', onStatusChanged);
    });

    // Keep stream open
    while (true) {
      await stream.sleep(10000);
    }
  });
});
