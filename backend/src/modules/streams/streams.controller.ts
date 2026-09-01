import type { AppEnvironment } from '@core/types/context.types';
import { sendSuccess } from '@core/utils/response.util';
import { zValidator } from '@hono/zod-validator';
import { streamerbotService } from '@modules/streamerbot/streamerbot.service';
import { Hono } from 'hono';
import { streamsService } from './streams.service';
import { incomingChatMessageSchema, startStreamSchema } from './streams.types';

export const streamsController = new Hono<AppEnvironment>();

/**
 * GET /api/v1/streams/active
 * Get active live stream session details
 */
streamsController.get('/active', async (c) => {
  const activeStream = await streamsService.getOrCreateActiveStream();
  return sendSuccess(c, activeStream, 'Active stream session retrieved');
});

/**
 * POST /api/v1/streams/start
 * Start a new stream session
 */
streamsController.post('/start', zValidator('json', startStreamSchema), async (c) => {
  const body = c.req.valid('json');
  const stream = await streamsService.startStream(body);
  return sendSuccess(c, stream, 'Live stream session started', 201);
});

/**
 * POST /api/v1/streams/:id/end
 * End an active stream session
 */
streamsController.post('/:id/end', async (c) => {
  const streamId = c.req.param('id');
  const stream = await streamsService.endStream(streamId);
  return sendSuccess(c, stream, 'Stream session ended successfully');
});

/**
 * GET /api/v1/streams/:id/chatters
 * Get users who participated in this specific stream session
 */
streamsController.get('/:id/chatters', async (c) => {
  const streamId = c.req.param('id');
  const chatters = await streamsService.getStreamChatters(streamId);
  return sendSuccess(c, chatters, 'Stream chatters retrieved');
});

/**
 * GET /api/v1/streams/:id/chats
 * Get chat messages for this stream session (Supports limit=20 and id='active')
 */
streamsController.get('/:id/chats', async (c) => {
  const streamId = c.req.param('id');
  const limitQuery = c.req.query('limit');
  const limit = limitQuery ? Math.min(Math.max(parseInt(limitQuery, 10) || 20, 1), 100) : 20;

  let targetStreamId = streamId;
  if (streamId === 'active') {
    const activeStream = await streamsService.getOrCreateActiveStream();
    targetStreamId = activeStream.id;
  }

  const chats = await streamsService.getStreamChats(targetStreamId, limit);
  return sendSuccess(c, chats, 'Stream chat messages retrieved');
});

/**
 * GET /api/v1/streams
 * List all stream sessions
 */
streamsController.get('/', async (c) => {
  const allSessions = await streamsService.getAllStreams();
  return sendSuccess(c, allSessions, 'Stream sessions list retrieved');
});

/**
 * GET /api/v1/streams/overlay-summary
 * Aggregated live summary for OBS Overlay Widgets & Top Ticker
 */
streamsController.get('/overlay-summary', async (c) => {
  const summary = await streamsService.getOverlaySummary();
  return sendSuccess(c, summary, 'Overlay summary retrieved');
});

/**
 * GET /api/v1/streams/settings
 * Get current streamer identity and overlay settings
 */
streamsController.get('/settings', async (c) => {
  const settings = await streamsService.getStreamSettings();
  return sendSuccess(c, settings, 'Stream settings retrieved');
});

/**
 * GET /api/v1/streams/goals
 * Get active stream goals
 */
streamsController.get('/goals', async (c) => {
  const goals = await streamsService.getActiveStreamGoals();
  return sendSuccess(c, goals, 'Active stream goals retrieved');
});

/**
 * GET /api/v1/streams/chatters/all
 * List all known users/chatters across all streams
 */
streamsController.get('/chatters/all', async (c) => {
  const allChatters = await streamsService.getAllChatters();
  return sendSuccess(c, allChatters, 'All chatters retrieved');
});

/**
 * POST /api/v1/streams/test-chat
 * Test endpoint to inject a simulated chat message for testing
 */
streamsController.post(
  '/test-chat',
  zValidator('json', incomingChatMessageSchema),
  async (c) => {
    const body = c.req.valid('json');
    const result = await streamsService.ingestChatMessage(body);

    // Emit live event to SSE for real-time frontend update
    streamerbotService.emit('chat:message', {
      id: result.message.id,
      streamId: result.stream.id,
      user: result.user.name,
      userId: result.user.id,
      avatarUrl: result.user.image,
      role: result.user.role,
      message: result.message.message,
      isOwner: result.message.isOwner,
      isModerator: result.message.isModerator,
      isSponsor: result.message.isSponsor,
      timestamp: result.message.publishedAt,
    });

    return sendSuccess(c, result, 'Simulated chat message ingested successfully', 201);
  }
);
