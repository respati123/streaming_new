import { logger } from '@core/logger/logger';
import { createBunWebSocket } from 'hono/bun';
import type { ServerWebSocket } from 'bun';
import { nanoid } from 'nanoid';
import { wsHub, type ClientType } from './websocket.hub';

export const { upgradeWebSocket, websocket } = createBunWebSocket<ServerWebSocket>();

/**
 * WebSocket upgrade middleware and event handlers for Hono
 */
export const handleWebSocket = upgradeWebSocket((c) => {
  const clientId = nanoid(10);
  const clientType = (c.req.query('type') as ClientType) || 'unknown';
  const clientIp = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || '127.0.0.1';

  return {
    onOpen(_event, ws) {
      wsHub.registerClient(clientId, ws, clientType, clientIp);
    },
    onMessage(event) {
      wsHub.handleMessage(clientId, event.data as string | ArrayBuffer);
    },
    onClose() {
      wsHub.unregisterClient(clientId);
    },
    onError(event) {
      logger.error(`[WebSocket] Error for client ${clientId}:`, {}, event as any);
      wsHub.unregisterClient(clientId);
    },
  };
});
