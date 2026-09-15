import { logger } from '@core/logger/logger';
import { streamerbotService } from '@modules/streamerbot/streamerbot.service';
import type { WSContext } from 'hono/ws';

export type ClientType = 'dashboard' | 'overlay' | 'viewer' | 'unknown';
export type PlaybackMode = 'controller' | 'monitor';

export interface WSClientInfo {
  id: string;
  type: ClientType;
  playbackMode: PlaybackMode;
  connectedAt: string;
  ip?: string;
  ws: WSContext;
}

export interface WSEventMessage<T = any> {
  event: string;
  data: T;
  timestamp?: string;
}

export type StreamEventType = 'donation' | 'chatai' | 'subscriber' | 'member' | 'system';
export type StreamEventStatus =
  | 'queued'
  | 'processing'
  | 'ready'
  | 'playing'
  | 'completed'
  | 'failed';

export interface UnifiedStreamEvent {
  id: string;
  type: StreamEventType;
  title: string;
  subtitle?: string;
  author: {
    name: string;
    avatarUrl?: string | null;
    role?: string;
  };
  payload: {
    amount?: number;
    currency?: string;
    message?: string;
    prompt?: string;
    answer?: string;
    mood?: string;
    template?: string;
    audioUrl?: string;
  };
  status: StreamEventStatus;
  progressPhase?: string;
  error?: string | null;
  createdAt: string;
  updatedAt: string;
}

class WebSocketHub {
  private clients = new Map<string, WSClientInfo>();
  private isDonationAlertPaused = false;
  private donationAlertQueue: any[] = [];
  private eventsQueue: UnifiedStreamEvent[] = [];
  private drainTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.setupStreamerbotBridge();
    this.loadInitialHistory();
  }

  private async loadInitialHistory(): Promise<void> {
    try {
      const { db } = await import('@core/database');
      const { aiInteractions, donations } = await import('@core/database/schema');
      const { desc } = await import('drizzle-orm');

      const [recentAi, recentDonations] = await Promise.all([
        db.query.aiInteractions.findMany({
          orderBy: [desc(aiInteractions.createdAt)],
          limit: 30,
        }),
        db.query.donations.findMany({
          orderBy: [desc(donations.createdAt)],
          limit: 30,
        }),
      ]);

      const initialEvents: UnifiedStreamEvent[] = [];

      for (const d of recentDonations) {
        initialEvents.push({
          id: d.id,
          type: 'donation',
          title: `Donasi Rp ${Number(d.amount).toLocaleString('id-ID')} • ${d.donorName}`,
          subtitle: d.message || 'Saweria / QRIS Tip',
          author: { name: d.donorName },
          payload: {
            amount: Number(d.amount),
            currency: d.currency,
            message: d.message || '',
            template: d.alertTemplate || 'fire-glass',
          },
          status: d.status === 'completed' ? 'completed' : d.status === 'pending' ? 'queued' : 'failed',
          progressPhase: d.status,
          createdAt: d.createdAt.toISOString(),
          updatedAt: d.updatedAt.toISOString(),
        });
      }

      for (const ai of recentAi) {
        initialEvents.push({
          id: ai.id,
          type: 'chatai',
          title: `Chat AI • ${ai.viewerName}`,
          subtitle: ai.prompt,
          author: {
            name: ai.viewerName,
            avatarUrl: ai.viewerAvatarUrl,
          },
          payload: {
            prompt: ai.prompt,
            answer: ai.answer || undefined,
            mood: ai.mood,
          },
          status:
            ai.status === 'completed'
              ? 'completed'
              : ai.status === 'ready'
                ? 'ready'
                : ai.status === 'playing'
                  ? 'playing'
                  : ai.status === 'failed'
                    ? 'failed'
                    : 'processing',
          progressPhase: ai.status,
          error: ai.error || null,
          createdAt: ai.createdAt.toISOString(),
          updatedAt: ai.updatedAt.toISOString(),
        });
      }

      initialEvents.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      this.eventsQueue = initialEvents.slice(0, 30);
    } catch {
      // Database not ready on initial instantiation
    }
  }

  /**
   * Register new WebSocket client
   */
  public registerClient(
    id: string,
    ws: WSContext,
    type: ClientType = 'unknown',
    ip?: string,
    playbackMode: PlaybackMode = 'controller'
  ): void {
    const client: WSClientInfo = {
      id,
      type,
      playbackMode,
      connectedAt: new Date().toISOString(),
      ip,
      ws,
    };
    this.clients.set(id, client);

    logger.info(
      `🔌 [WebSocketHub] Client connected: ${id} (${type}) [Total: ${this.clients.size}]`
    );

    // Send welcome / initial status snapshot
    this.sendTo(id, 'system:welcome', {
      clientId: id,
      serverTime: new Date().toISOString(),
      streamerbotStatus: streamerbotService.getStatus(),
      activeClientsCount: this.clients.size,
      isDonationAlertPaused: this.isDonationAlertPaused,
      donationAlertQueue: this.donationAlertQueue,
      eventsQueue: this.getEventsQueue(),
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
      if (
        client.type === 'overlay' &&
        (client.playbackMode === 'controller' || !this.hasOverlayClient())
      ) {
        void import('@modules/ai/chat-ai.service').then(({ chatAiService }) =>
          chatAiService.releasePlayback()
        );
      }
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
        if (client.ws.readyState === 1) {
          // OPEN
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
    if (client?.ws.readyState !== 1) return false;

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
      const text =
        typeof rawMessage === 'string' ? rawMessage : new TextDecoder().decode(rawMessage);
      const parsed: WSEventMessage = JSON.parse(text);

      switch (parsed.event) {
        case 'ping':
          this.sendTo(clientId, 'pong', { timestamp: Date.now() });
          break;

        case 'client:identify':
          {
            const client = this.clients.get(clientId);
            if (!client || !parsed.data?.type) break;
            client.type = parsed.data.type;
            if (parsed.data.mode === 'monitor' || parsed.data.mode === 'controller') {
              client.playbackMode = parsed.data.mode;
            }
            logger.info(`🏷️ [WebSocketHub] Client ${clientId} identified as ${parsed.data.type}`);
            if (parsed.data.type === 'overlay' && this.hasPlaybackController()) {
              this.dispatchChatAi();
            }
          }
          break;

        case 'chatai:finished': {
          const interactionId = parsed.data?.interactionId;
          if (typeof interactionId === 'string') {
            const { chatAiService } = await import('@modules/ai/chat-ai.service');
            await chatAiService.completePlayback(interactionId);
            this.updateEvent(interactionId, { status: 'completed', progressPhase: 'completed' });
          }
          break;
        }

        case 'overlay:alert:finished':
        case 'overlay:event:completed': {
          const eventId = parsed.data?.id || parsed.data?.interactionId;
          if (typeof eventId === 'string') {
            this.updateEvent(eventId, { status: 'completed', progressPhase: 'completed' });
            const { chatAiService } = await import('@modules/ai/chat-ai.service');
            await chatAiService.completePlayback(eventId);
          }
          break;
        }

        case 'chat:send': {
          const { streamsService } = await import('@modules/streams/streams.service');
          const { pointsService } = await import('@modules/points/points.service');
          const chatPayload = parsed.data;
          const result = await streamsService.ingestChatMessage({
            message: chatPayload.message,
            username: chatPayload.username || 'Anonymous',
            youtubeChannelId: chatPayload.youtubeChannelId,
            userAvatarUrl: chatPayload.userAvatarUrl,
            isOwner: chatPayload.isOwner || false,
            isModerator: chatPayload.isModerator || false,
            isSponsor: chatPayload.isSponsor || false,
            isVerified: chatPayload.isVerified || false,
          });

          // Award loyalty points for chatting (+5 PTS)
          let pointsInfo = null;
          if (chatPayload.userId) {
            pointsInfo = await pointsService.awardChatPoints(chatPayload.userId, result.message.id);
          }

          streamerbotService.publishChatMessage({
            id: result.message.id,
            streamId: result.stream.id,
            user: result.user.name,
            userId: result.user.id,
            youtubeHandle: chatPayload.youtubeHandle || null,
            avatarUrl: result.user.image,
            role: result.user.role,
            tier: pointsInfo?.tier || 'bronze',
            points: pointsInfo?.totalPoints,
            message: result.message.message,
            emotes: chatPayload.emotes || [],
            parts: chatPayload.parts || [],
            isOwner: result.message.isOwner,
            isModerator: result.message.isModerator,
            isSponsor: result.message.isSponsor,
            isVerified: result.message.isVerified,
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

        case 'alert:trigger':
        case 'alert:test': {
          const { pointsService } = await import('@modules/points/points.service');
          const { streamsService } = await import('@modules/streams/streams.service');
          const { db } = await import('@core/database');
          const { donations } = await import('@core/database/schema');
          const alertData = parsed.data;

          // Award loyalty points for donation (+1 PTS per Rp 100)
          if (alertData.userId && alertData.amount) {
            await pointsService.awardDonationPoints(
              alertData.userId,
              Number(alertData.amount),
              alertData.id
            );
          }

          // Persist test alert in database so it survives refresh
          try {
            const stream = await streamsService.getOrCreateActiveStream();
            await db
              .insert(donations)
              .values({
                streamId: stream.id,
                donorName: alertData.donorName || 'Supporter',
                amount: String(alertData.amount || 10000),
                currency: alertData.currency || 'IDR',
                message: alertData.message || null,
                status: 'completed',
                paymentMethod: 'sandbox_qris',
                alertTemplate: alertData.template || 'fire-glass',
                streamerbotTriggered: true,
              })
              .onConflictDoNothing();
          } catch {
            // Non-critical persistence
          }

          await streamerbotService.triggerDonationAlert(alertData);
          if (this.isDonationAlertPaused) {
            this.donationAlertQueue.push(alertData);
            this.broadcastQueueStatus();
          } else {
            this.broadcast('donation:alert', alertData);
            this.broadcast('overlay:alert:triggered', alertData);
          }
          break;
        }

        case 'overlay:alert:pause':
          this.isDonationAlertPaused = true;
          if (this.drainTimer) {
            clearTimeout(this.drainTimer);
            this.drainTimer = null;
          }
          this.broadcastEventsQueue();
          break;

        case 'overlay:alert:resume':
          this.isDonationAlertPaused = false;
          this.broadcastEventsQueue();
          this.drainNextQueuedAlert();
          break;

        case 'overlay:alert:clear-queue':
          this.clearQueue();
          break;

        case 'overlay:alert:remove-item': {
          const targetId = parsed.data?.id;
          if (targetId) {
            this.removeEvent(targetId);
          }
          break;
        }

        case 'overlay:alert:play-item': {
          const targetId = parsed.data?.id;
          const itemIndex = this.donationAlertQueue.findIndex((i) => i.id === targetId);
          if (itemIndex >= 0) {
            const [item] = this.donationAlertQueue.splice(itemIndex, 1);
            this.broadcast('donation:alert', item);
            this.broadcast('overlay:alert:triggered', item);
            this.updateEvent(targetId, { status: 'playing', progressPhase: 'overlay_playing' });
            setTimeout(() => {
              this.updateEvent(targetId, { status: 'completed', progressPhase: 'completed' });
            }, 8500);
            this.broadcastEventsQueue();
          }
          break;
        }

        default:
          logger.debug(`[WebSocketHub] Unhandled event: ${parsed.event}`, parsed.data);
      }
    } catch (err) {
      logger.error(
        `[WebSocketHub] Error parsing client message from ${clientId}`,
        {},
        err as Error
      );
    }
  }

  /**
   * Automatically bridge Streamer.bot events to connected WebSocket clients
   */
  private setupStreamerbotBridge(): void {
    streamerbotService.on('chat:message', (data) => {
      this.broadcast('chat:message', data);
    });

    streamerbotService.on('chatai:interaction-ready', () => {
      if (this.hasPlaybackController()) this.dispatchChatAi();
    });

    streamerbotService.on('chatai:progress', (data: any) => {
      this.broadcast('chatai:progress', data, 'dashboard');
      this.upsertEvent({
        id: data.interactionId || data.id,
        type: 'chatai',
        title: `Chat AI • ${data.viewerName}`,
        subtitle: data.prompt,
        author: {
          name: data.viewerName,
          avatarUrl: data.viewerAvatarUrl,
        },
        payload: {
          prompt: data.prompt,
          answer: data.answer || undefined,
          mood: data.mood,
          audioUrl: data.answerAudioUrl || undefined,
        },
        status:
          data.status === 'completed' || data.phase === 'completed'
            ? 'completed'
            : data.status === 'failed' || data.phase === 'failed'
              ? 'failed'
              : data.phase === 'playing'
                ? 'playing'
                : data.phase === 'ready'
                  ? 'ready'
                  : data.phase === 'queued'
                    ? 'queued'
                    : 'processing',
        progressPhase: data.phase,
        error: data.error || null,
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    });

    streamerbotService.on('chatai:ready', (data) => {
      this.broadcast('chatai:ready', data, 'overlay');
      this.updateEvent(data.interactionId, { status: 'playing', progressPhase: 'playing' });
    });

    streamerbotService.on('chatai:playback-completed', (data) => {
      this.broadcast('chatai:playback-completed', data, 'overlay');
      this.updateEvent(data.interactionId, { status: 'completed', progressPhase: 'completed' });
    });

    streamerbotService.on('donation:alert', (data) => {
      const eventId = data.id || `alert-${Date.now()}`;
      const isSub = data.source === 'youtube_subscriber';
      const event: UnifiedStreamEvent = {
        id: eventId,
        type: isSub ? 'subscriber' : 'donation',
        title: isSub
          ? `Subscriber Baru • ${data.donorName}`
          : `Donasi Rp ${Number(data.amount || 0).toLocaleString('id-ID')} • ${data.donorName}`,
        subtitle: data.message || (isSub ? 'New Subscriber' : 'Saweria / QRIS Tip'),
        author: {
          name: data.donorName || 'Supporter',
          avatarUrl: data.avatarUrl || null,
        },
        payload: {
          amount: Number(data.amount || 0),
          currency: data.currency || 'IDR',
          message: data.message || '',
          template: data.template || 'fire-glass',
        },
        status: this.isDonationAlertPaused ? 'queued' : 'playing',
        progressPhase: this.isDonationAlertPaused ? 'buffered' : 'overlay_playing',
        createdAt: data.timestamp || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.upsertEvent(event);

      if (this.isDonationAlertPaused) {
        this.donationAlertQueue.push(data);
        this.broadcastEventsQueue();
      } else {
        this.broadcast('donation:alert', data);
        this.broadcast('overlay:alert:triggered', data);
        setTimeout(() => {
          this.updateEvent(eventId, { status: 'completed', progressPhase: 'completed' });
        }, 8500);
      }
    });

    streamerbotService.on('status:changed', (status) => {
      this.broadcast('status:changed', {
        status,
        timestamp: new Date().toISOString(),
      });
    });

    streamerbotService.on('stream:started', (stream) => {
      this.broadcast('stream:started', stream);
    });

    streamerbotService.on('stream:ended', (stream) => {
      this.broadcast('stream:ended', stream);
    });

    streamerbotService.on('member:new', (data) => {
      this.broadcast('member:new', data);
    });

    streamerbotService.on('subscriber:new', (data) => {
      this.broadcast('subscriber:new', data);
      // Trigger visual alert banner on OBS Overlay
      this.broadcast('donation:alert', {
        id: data.id,
        donorName: data.subscriberName,
        amount: 0,
        currency: 'SUB',
        message: 'Baru saja Subscribe channel YouTube! 🎉 Terima kasih dukungannya!',
        template: 'fire-glass',
        durationSec: 8,
        source: 'youtube_subscriber',
      });
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

  public getEventsQueue() {
    const activeCount = this.eventsQueue.filter(
      (e) =>
        e.status === 'playing' ||
        e.status === 'processing' ||
        e.status === 'queued' ||
        e.status === 'ready'
    ).length;
    return {
      isPaused: this.isDonationAlertPaused,
      activeCount,
      events: this.eventsQueue,
    };
  }

  public async getEventsQueueSnapshot() {
    if (this.eventsQueue.length === 0) {
      await this.loadInitialHistory();
    }
    return this.getEventsQueue();
  }

  public broadcastEventsQueue(): void {
    this.broadcast('events:queue:update', this.getEventsQueue(), 'dashboard');
    this.broadcastQueueStatus();
  }

  public upsertEvent(event: UnifiedStreamEvent): void {
    const existingIndex = this.eventsQueue.findIndex((e) => e.id === event.id);
    if (existingIndex >= 0) {
      this.eventsQueue[existingIndex] = {
        ...this.eventsQueue[existingIndex],
        ...event,
        updatedAt: new Date().toISOString(),
      };
    } else {
      this.eventsQueue.unshift(event);
      if (this.eventsQueue.length > 60) {
        this.eventsQueue = this.eventsQueue.slice(0, 60);
      }
    }
    this.broadcastEventsQueue();
  }

  public updateEvent(id: string, partial: Partial<UnifiedStreamEvent>): void {
    const existing = this.eventsQueue.find((e) => e.id === id);
    if (existing) {
      Object.assign(existing, partial, { updatedAt: new Date().toISOString() });
      this.broadcastEventsQueue();
    }
  }

  public removeEvent(id: string): void {
    this.eventsQueue = this.eventsQueue.filter((e) => e.id !== id);
    this.donationAlertQueue = this.donationAlertQueue.filter((e) => e.id !== id);
    this.broadcastEventsQueue();
  }

  public clearQueue(): void {
    this.eventsQueue = this.eventsQueue.filter(
      (e) => e.status === 'completed' || e.status === 'failed'
    );
    this.donationAlertQueue = [];
    if (this.drainTimer) {
      clearTimeout(this.drainTimer);
      this.drainTimer = null;
    }
    this.broadcastEventsQueue();
  }

  public broadcastQueueStatus(): void {
    this.broadcast('overlay:alert:queue-status', {
      isPaused: this.isDonationAlertPaused,
      queue: this.donationAlertQueue,
      queueCount: this.donationAlertQueue.length,
    });
  }

  private drainNextQueuedAlert(): void {
    if (this.isDonationAlertPaused || this.donationAlertQueue.length === 0) {
      if (this.drainTimer) {
        clearTimeout(this.drainTimer);
        this.drainTimer = null;
      }
      return;
    }

    const nextAlert = this.donationAlertQueue.shift();
    if (nextAlert) {
      this.broadcast('donation:alert', nextAlert);
      this.broadcast('overlay:alert:triggered', nextAlert);
      this.updateEvent(nextAlert.id, {
        status: 'playing',
        progressPhase: 'overlay_playing',
      });
      setTimeout(() => {
        this.updateEvent(nextAlert.id, {
          status: 'completed',
          progressPhase: 'completed',
        });
      }, 8500);
    }
    this.broadcastEventsQueue();

    if (this.donationAlertQueue.length > 0) {
      this.drainTimer = setTimeout(() => {
        this.drainNextQueuedAlert();
      }, 8500);
    }
  }

  private hasOverlayClient(): boolean {
    return [...this.clients.values()].some((client) => client.type === 'overlay');
  }

  private hasPlaybackController(): boolean {
    return [...this.clients.values()].some(
      (client) => client.type === 'overlay' && client.playbackMode === 'controller'
    );
  }

  private dispatchChatAi(): void {
    void import('@modules/ai/chat-ai.service')
      .then(({ chatAiService }) => chatAiService.dispatchNext())
      .catch((error) =>
        logger.error('[WebSocketHub] Failed to dispatch ChatAI', {}, error as Error)
      );
  }
}

export const wsHub = new WebSocketHub();
