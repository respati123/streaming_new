import { EventEmitter } from 'node:events';
import { env } from '@core/config/env';
import { logger } from '@core/logger/logger';
import { StreamerbotClient } from '@streamerbot/client';
import type {
  DonationAlertEventData,
  StreamerbotConnectionStatus,
} from './streamerbot.types';

export class StreamerbotService extends EventEmitter {
  private client: StreamerbotClient | null = null;
  private status: StreamerbotConnectionStatus = 'DISCONNECTED';
  private lastConnectedAt: string | null = null;
  private host: string;
  private port: number;
  private scheme: string;
  private endpoint: string;
  private password?: string;

  constructor() {
    super();
    let rawHost = env.STREAMERBOT_HOST;
    let scheme = env.STREAMERBOT_SCHEME || 'ws';
    let port = env.STREAMERBOT_PORT || 8080;
    let endpoint = env.STREAMERBOT_ENDPOINT || '/websocket';

    // Auto-detect and parse full URLs (such as ngrok HTTPS/WSS URLs)
    if (rawHost.includes('://')) {
      try {
        const parsedUrl = new URL(rawHost);
        scheme = parsedUrl.protocol.startsWith('https') || parsedUrl.protocol.startsWith('wss') ? 'wss' : 'ws';
        rawHost = parsedUrl.hostname;
        port = parsedUrl.port ? Number(parsedUrl.port) : (scheme === 'wss' ? 443 : 8080);
        if (parsedUrl.pathname && parsedUrl.pathname !== '/') {
          endpoint = parsedUrl.pathname;
        }
      } catch {}
    } else if (rawHost.includes('ngrok')) {
      scheme = 'wss';
      if (port === 8080) port = 443;
    }

    this.host = rawHost;
    this.scheme = scheme;
    this.port = port;
    this.endpoint = endpoint;
    this.password = env.STREAMERBOT_PASSWORD;
  }

  /**
   * Initialize and connect to Streamer.bot WebSocket Server
   */
  public async initialize(force = false): Promise<void> {
    if (!env.STREAMERBOT_ENABLED && !force) {
      this.setStatus('DISCONNECTED');
      logger.debug('[StreamerbotService] Skipping connection (STREAMERBOT_ENABLED=false)');
      return;
    }

    if (this.client && !force && this.status === 'CONNECTED') {
      logger.debug('[StreamerbotService] Already connected');
      return;
    }

    if (this.client) {
      try {
        await this.client.disconnect();
      } catch {}
      this.client = null;
    }

    this.setStatus('CONNECTING');
    logger.info(`[StreamerbotService] Connecting to Streamer.bot at ${this.scheme}://${this.host}:${this.port}${this.endpoint}...`);

    try {
      this.client = new StreamerbotClient({
        host: this.host,
        port: this.port,
        scheme: this.scheme as any,
        endpoint: this.endpoint,
        password: this.password,
        autoReconnect: true,
        retries: -1,
        immediate: true,
        subscribe: {
          YouTube: ['SuperChat', 'SuperSticker', 'NewSponsor', 'MemberMileStone', 'NewSubscriber', 'Message', 'FirstWords'],
          Twitch: ['Cheer', 'ChatMessage', 'Sub', 'ReSub', 'GiftSub'],
          General: ['Custom'],
        },
        onConnect: (info) => {
          this.setStatus('CONNECTED');
          this.lastConnectedAt = new Date().toISOString();
          logger.info('✅ [StreamerbotService] Successfully connected to Streamer.bot', {
            host: this.host,
            port: this.port,
            info,
          });
          this.emit('connected', { host: this.host, port: this.port, info });
        },
        onDisconnect: () => {
          this.setStatus('RECONNECTING');
          logger.warn('⚠️ [StreamerbotService] Disconnected from Streamer.bot. Auto-reconnecting...');
          this.emit('disconnected');
        },
        onError: (err) => {
          this.setStatus('ERROR');
          logger.error('❌ [StreamerbotService] WebSocket Error:', {}, err as Error);
          this.emit('error', err);
        },
      });

      this.setupEventListeners();
    } catch (error) {
      this.setStatus('ERROR');
      logger.error('[StreamerbotService] Failed to instantiate StreamerbotClient', {}, error as Error);
    }
  }

  /**
   * Set up typed event listeners for incoming stream events from Streamer.bot
   */
  private setupEventListeners(): void {
    if (!this.client) return;

    // 1. YouTube SuperChat
    this.client.on('YouTube.SuperChat', (event: any) => {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🎉 [STREAMER.BOT RAW SUPERCHAT RECEIVED]:');
      console.log(JSON.stringify(event, null, 2));
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      const data = event.data || {};
      const alert: DonationAlertEventData = {
        id: data.id,
        donorName: data.user?.name || data.user?.displayName || 'Anonymous',
        amount: data.microAmount ? data.microAmount / 1_000_000 : parseFloat(data.amount?.replace(/[^0-9.]/g, '') || '0'),
        currency: data.currency || 'IDR',
        message: data.message || '',
        source: 'youtube_superchat',
        timestamp: event.timeStamp || new Date().toISOString(),
      };

      logger.info('🎉 [StreamerbotService] YouTube SuperChat received', {
        donorName: alert.donorName,
        amount: alert.amount,
        currency: alert.currency,
        message: alert.message,
      });
      this.emit('donation:alert', alert);
    });

    // 2. YouTube Chat Message -> Auto Ingest to Database & Broadcast
    this.client.on('YouTube.Message', async (event: any) => {
      const data = event.data || {};
      const user = data.user || {};

      // ─── FULL RAW LOGS FROM STREAMER.BOT ───
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📥 [STREAMER.BOT RAW CHAT EVENT RECEIVED]:');
      console.log(JSON.stringify(event, null, 2));
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      try {
        const { streamsService } = await import('@modules/streams/streams.service');
        const result = await streamsService.ingestChatMessage({
          message: data.message || '',
          username: user.name || user.displayName || 'Viewer',
          youtubeChannelId: user.id || user.channelId,
          youtubeMessageId: data.id,
          userAvatarUrl: user.profileImageUrl || user.avatarUrl || null,
          emotes: data.emotes || [],
          parts: data.parts || [],
          isOwner: data.isOwner || user.isOwner || false,
          isModerator: data.isModerator || user.isModerator || false,
          isSponsor: data.isSponsor || user.isSponsor || false,
          isVerified: user.isVerified || false,
          publishedAt: event.timeStamp || new Date().toISOString(),
        });

        logger.info(`💬 [Streamer.bot YouTube Chat] ${user.name || user.displayName}: "${data.message}"`);

        const { pointsService } = await import('@modules/points/points.service');
        const userProfile = await pointsService.getUserProfile(result.user.id);

        this.emit('chat:message', {
          id: result.message.id,
          streamId: result.stream.id,
          user: result.user.name,
          userId: result.user.id,
          youtubeHandle: user.customUrl || result.user.youtubeHandle || null,
          avatarUrl: result.user.image || user.profileImageUrl || user.avatarUrl || null,
          role: result.user.role,
          tier: userProfile?.tier || 'bronze',
          points: userProfile?.points || 5,
          message: result.message.message,
          emotes: data.emotes || [],
          parts: data.parts || [],
          isOwner: result.message.isOwner,
          isModerator: result.message.isModerator,
          isSponsor: result.message.isSponsor,
          isVerified: result.message.isVerified || user.isVerified || false,
          timestamp: result.message.publishedAt,
        });
      } catch (err) {
        logger.error('Failed to ingest live chat message', {}, err as Error);
      }
    });

    // 3. YouTube New Sponsor / Member
    this.client.on('YouTube.NewSponsor', (event: any) => {
      logger.info('⭐ [StreamerbotService] New YouTube Member joined', event.data);
      this.emit('member:new', event.data);
    });

    // 4. YouTube Member Milestone
    this.client.on('YouTube.MemberMileStone', (event: any) => {
      logger.info('🏆 [StreamerbotService] YouTube Member Milestone', event.data);
      this.emit('member:milestone', event.data);
    });

    // 5. YouTube New Subscriber
    this.client.on('YouTube.NewSubscriber', (event: any) => {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🔔 [STREAMER.BOT RAW NEW SUBSCRIBER RECEIVED]:');
      console.log(JSON.stringify(event, null, 2));
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      const data = event.data || {};
      const user = data.user || {};
      const subscriberName = user.name || user.displayName || 'New Subscriber';
      const subscriberId = user.id || user.channelId;
      const avatarUrl = user.profileImageUrl || user.avatarUrl || null;

      logger.info(`🔔 [StreamerbotService] New YouTube Subscriber: ${subscriberName} (${subscriberId || 'No ID'})`);

      this.emit('subscriber:new', {
        id: data.id || `sub_${Date.now()}`,
        subscriberName,
        subscriberId,
        avatarUrl,
        source: 'youtube_subscriber',
        timestamp: event.timeStamp || new Date().toISOString(),
      });
    });
  }

  /**
   * Execute an Action in Streamer.bot
   */
  public async doAction(
    actionIdOrName: string,
    args: Record<string, any> = {}
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    if (this.status !== 'CONNECTED' || !this.client) {
      const msg = `Cannot execute action '${actionIdOrName}': Streamer.bot is currently ${this.status}`;
      logger.warn(`[StreamerbotService] ${msg}`);
      return { success: false, error: msg };
    }

    try {
      const actionIdentifier = actionIdOrName.includes('-')
        ? actionIdOrName
        : { name: actionIdOrName };

      const response = await this.client.doAction(actionIdentifier, args);
      logger.info(`[StreamerbotService] Action '${actionIdOrName}' triggered successfully`, { args, response });
      return { success: true, data: response };
    } catch (error) {
      const err = error as Error;
      logger.error(`[StreamerbotService] Failed to execute action '${actionIdOrName}'`, {}, err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Trigger Donation Alert Action in Streamer.bot & emit to local overlays
   */
  public async triggerDonationAlert(
    donation: DonationAlertEventData,
    actionIdOrName = 'Alert_Donation'
  ): Promise<boolean> {
    // 1. Emit locally to all connected OBS overlay clients
    this.emit('donation:alert', donation);

    // 2. Trigger in Streamer.bot if connected
    const result = await this.doAction(actionIdOrName, {
      donorName: donation.donorName,
      amount: donation.amount,
      currency: donation.currency,
      message: donation.message || '',
      source: donation.source,
      timestamp: donation.timestamp,
    });

    return result.success;
  }

  /**
   * Fetch all registered Actions from Streamer.bot
   */
  public async getAvailableActions(): Promise<any[]> {
    if (this.status !== 'CONNECTED' || !this.client) {
      return [];
    }

    try {
      const res = await this.client.getActions();
      return res?.actions || [];
    } catch (error) {
      logger.error('[StreamerbotService] Failed to fetch actions from Streamer.bot', {}, error as Error);
      return [];
    }
  }

  /**
   * Get Current Connection Status
   */
  public getStatus() {
    return {
      status: this.status,
      host: this.host,
      port: this.port,
      lastConnectedAt: this.lastConnectedAt,
    };
  }

  private setStatus(newStatus: StreamerbotConnectionStatus): void {
    if (this.status !== newStatus) {
      this.status = newStatus;
      this.emit('status:changed', this.status);
    }
  }
}

// Global Singleton Export
export const streamerbotService = new StreamerbotService();
