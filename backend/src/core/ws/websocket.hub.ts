import { logger } from '@core/logger/logger';
import { streamerbotService } from '@modules/streamerbot/streamerbot.service';
import type { WSContext } from 'hono/ws';

export type ClientType = 'dashboard' | 'overlay' | 'viewer' | 'unknown';

export interface WSClientInfo {
  id: string;
  type: ClientType;
  connectedAt: string;
  ip?: string;
  ws: WSContext;
}

export interface WSEventMessage<T = any> {
  event: string;
  data: T;
  timestamp?: string;
}

class WebSocketHub {
  private clients = new Map<string, WSClientInfo>();
  private pingInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.setupStreamerbotBridge();
  }

  /**
   * Register new WebSocket client
   */
  public registerClient(id: string, ws: WSContext, type: ClientType = 'unknown', ip?: string): void {
    const client: WSClientInfo = {
      id,
      type,
      connectedAt: new Date().toISOString(),
      ip,
      ws,
    };
    this.clients.set(id, client);

    logger.info(`🔌 [WebSocketHub] Client connected: ${id} (${type}) [Total: ${this.clients.size}]`);

    // Send welcome / initial status snapshot
    this.sendTo(id, 'system:welcome', {
      clientId: id,
      serverTime: new Date().toISOString(),
      streamerbotStatus: streamerbotService.getStatus(),
      activeClientsCount: this.clients.size,
    });
  }

  /**
   * Unregister disconnected WebSocket client
   */
  public unregisterClient(id: string): void {
    const client = this.clients.get(id);
    if (client) {
      this.clients.delete(id);
      logger.info(`❌ [WebSocketHub] Client disconnected: ${id} [Remaining: ${this.clients.size}]`);
    }
  }

  /**
   * Broadcast typed event to all connected clients (or specific client type)
   */
  public broadcast<T = any>(event: string, data: T, targetType?: ClientType): void {
    const payload = JSON.stringify({
      event,
      data,
      timestamp: new Date().toISOString(),
    });

    for (const [id, client] of this.clients.entries()) {
      if (targetType && client.type !== targetType) continue;

      try {
        if (client.ws.readyState === 1) { // OPEN
          client.ws.send(payload);
        }
      } catch (err) {
        logger.warn(`[WebSocketHub] Failed to send to client ${id}, removing`, {}, err as Error);
        this.clients.delete(id);
      }
    }
  }

  /**
   * Send typed event to a specific client
   */
  public sendTo<T = any>(clientId: string, event: string, data: T): boolean {
    const client = this.clients.get(clientId);
    if (!client || client.ws.readyState !== 1) return false;

    try {
      client.ws.send(
        JSON.stringify({
          event,
          data,
          timestamp: new Date().toISOString(),
        })
      );
      return true;
    } catch (err) {
      logger.warn(`[WebSocketHub] Error sending message to ${clientId}`, {}, err as Error);
      return false;
    }
  }

  /**
   * Handle incoming message from a client
   */
  public async handleMessage(clientId: string, rawMessage: string | ArrayBuffer): Promise<void> {
    try {
      const text = typeof rawMessage === 'string' ? rawMessage : new TextDecoder().decode(rawMessage);
      const parsed: WSEventMessage = JSON.parse(text);

      switch (parsed.event) {
        case 'ping':
          this.sendTo(clientId, 'pong', { timestamp: Date.now() });
          break;

        case 'client:identify':
          if (this.clients.has(clientId) && parsed.data?.type) {
            this.clients.get(clientId)!.type = parsed.data.type;
            logger.info(`🏷️ [WebSocketHub] Client ${clientId} identified as ${parsed.data.type}`);
          }
          break;

        case 'chat:send': {
          const { streamsService } = await import('@modules/streams/streams.service');
          const chatPayload = parsed.data;
          const result = await streamsService.ingestChatMessage({
            message: chatPayload.message,
            username: chatPayload.username || 'Anonymous',
            youtubeChannelId: chatPayload.youtubeChannelId,
            userAvatarUrl: chatPayload.userAvatarUrl,
            isOwner: chatPayload.isOwner || false,
            isModerator: chatPayload.isModerator || false,
            isSponsor: chatPayload.isSponsor || false,
          });

          // Broadcast new chat to all clients
          this.broadcast('chat:message', {
            id: result.message.id,
            streamId: result.stream.id,
            user: result.user.name,
            userId: result.user.id,
            avatarUrl: result.user.avatarUrl,
            role: result.user.role,
            message: result.message.message,
            isOwner: result.message.isOwner,
            isModerator: result.message.isModerator,
            isSponsor: result.message.isSponsor,
            timestamp: result.message.publishedAt,
          });
          break;
        }

        case 'action:trigger': {
          const { action, args } = parsed.data || {};
          const result = await streamerbotService.doAction(action, args);
          this.sendTo(clientId, 'action:result', {
            action,
            success: result.success,
            data: result.data,
            error: result.error,
          });
          break;
        }

        case 'alert:test': {
          const alertData = parsed.data;
          await streamerbotService.triggerDonationAlert(alertData);
          this.broadcast('donation:alert', alertData);
          break;
        }

        default:
          logger.debug(`[WebSocketHub] Unhandled event: ${parsed.event}`, parsed.data);
      }
    } catch (err) {
      logger.error(`[WebSocketHub] Error parsing client message from ${clientId}`, {}, err as Error);
    }
  }

  /**
   * Automatically bridge Streamer.bot events to connected WebSocket clients
   */
  private setupStreamerbotBridge(): void {
    streamerbotService.on('chat:message', (data) => {
      this.broadcast('chat:message', data);
    });

    streamerbotService.on('donation:alert', (data) => {
      this.broadcast('donation:alert', data);
    });

    streamerbotService.on('status:changed', (status) => {
      this.broadcast('status:changed', {
        status,
        timestamp: new Date().toISOString(),
      });
    });

    streamerbotService.on('member:new', (data) => {
      this.broadcast('member:new', data);
    });
  }

  /**
   * Get active connection stats
   */
  public getStats() {
    return {
      totalClients: this.clients.size,
      clients: Array.from(this.clients.values()).map((c) => ({
        id: c.id,
        type: c.type,
        connectedAt: c.connectedAt,
        ip: c.ip,
      })),
    };
  }
}

export const wsHub = new WebSocketHub();
