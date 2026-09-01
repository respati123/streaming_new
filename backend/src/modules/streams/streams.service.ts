import { db } from '@core/database';
import {
  type ChatMessageTable,
  type StreamGoalTable,
  type StreamSessionTable,
  type StreamSettingsTable,
  type UserTable,
  chatMessages,
  donations,
  streamGoals,
  streamSessions,
  user,
  youtubeEmotes,
} from '@core/database/schema';
import { logger } from '@core/logger/logger';
import { desc, eq, sql } from 'drizzle-orm';
import { HTTPException } from 'hono/http-exception';
import type { IncomingChatMessageDTO, StartStreamDTO } from './streams.types';

export class StreamsService {
  /**
   * Get or automatically create the currently active live stream session
   */
  async getOrCreateActiveStream(): Promise<StreamSessionTable> {
    const active = await db.query.streamSessions.findFirst({
      where: eq(streamSessions.status, 'live'),
      orderBy: [desc(streamSessions.startedAt)],
    });

    if (active) {
      return active;
    }

    // Auto-create a default live session if none exists
    const [newSession] = await db
      .insert(streamSessions)
      .values({
        title: `Live Stream Session - ${new Date().toLocaleDateString('id-ID')}`,
        status: 'live',
        startedAt: new Date(),
      })
      .returning();

    logger.info('🎬 [StreamsService] Created new default active stream session', {
      streamId: newSession.id,
      title: newSession.title,
    });

    return newSession;
  }

  /**
   * Start a new live stream session and end any previously active sessions
   */
  async startStream(dto: StartStreamDTO): Promise<StreamSessionTable> {
    // 1. Mark existing live sessions as ended
    await db
      .update(streamSessions)
      .set({
        status: 'ended',
        endedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(streamSessions.status, 'live'));

    // 2. Insert new live stream session
    const [newSession] = await db
      .insert(streamSessions)
      .values({
        title: dto.title,
        youtubeBroadcastId: dto.youtubeBroadcastId,
        status: 'live',
        startedAt: new Date(),
      })
      .returning();

    logger.info('🔴 [StreamsService] Stream session started', {
      streamId: newSession.id,
      title: newSession.title,
      broadcastId: newSession.youtubeBroadcastId,
    });

    return newSession;
  }

  /**
   * End an active stream session
   */
  async endStream(streamId: string): Promise<StreamSessionTable> {
    const session = await db.query.streamSessions.findFirst({
      where: eq(streamSessions.id, streamId),
    });

    if (!session) {
      throw new HTTPException(404, { message: 'Stream session not found.' });
    }

    const [updated] = await db
      .update(streamSessions)
      .set({
        status: 'ended',
        endedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(streamSessions.id, streamId))
      .returning();

    logger.info('⏹️ [StreamsService] Stream session ended', {
      streamId: updated.id,
      totalMessages: updated.totalMessages,
      totalChatters: updated.totalChatters,
    });

    return updated;
  }

  /**
   * Ingest a chat message from Streamer.bot (YouTube / Twitch / Google)
   * Upserts the user record and saves the message attached to the active stream session.
   */
  async ingestChatMessage(dto: IncomingChatMessageDTO): Promise<{
    message: ChatMessageTable;
    user: UserTable;
    stream: StreamSessionTable;
  }> {
    const stream = await this.getOrCreateActiveStream();

    // 1. Upsert into unified 'user' & 'account' tables and award +5 loyalty PTS
    const { pointsService } = await import('@modules/points/points.service');
    const gamifiedProfile = await pointsService.upsertUserFromYouTubeChat({
      username: dto.username,
      youtubeChannelId: dto.youtubeChannelId,
      userAvatarUrl: dto.userAvatarUrl,
      isOwner: dto.isOwner,
      isModerator: dto.isModerator,
      isSponsor: dto.isSponsor,
    });

    const userRecord = gamifiedProfile.user;

    // 2. Insert chat message linked to this stream session & user with emotes & rich parts
    const [insertedMsg] = await db
      .insert(chatMessages)
      .values({
        streamId: stream.id,
        userId: userRecord.id,
        youtubeMessageId: dto.youtubeMessageId || null,
        message: dto.message,
        emotes: dto.emotes ? JSON.stringify(dto.emotes) : null,
        parts: dto.parts ? JSON.stringify(dto.parts) : null,
        isOwner: dto.isOwner || false,
        isModerator: dto.isModerator || false,
        isSponsor: dto.isSponsor || false,
        isVerified: dto.isVerified || false,
        publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : new Date(),
      })
      .returning();

    // 3. Cache discovered custom emotes in youtube_emotes table
    if (dto.emotes && dto.emotes.length > 0) {
      for (const emote of dto.emotes) {
        const img = emote.imageUrl || emote.url;
        if (emote.name && img) {
          try {
            await db
              .insert(youtubeEmotes)
              .values({
                id: emote.name,
                name: emote.name,
                imageUrl: img,
                type: emote.type || 'youtube',
                useCount: 1,
              })
              .onConflictDoUpdate({
                target: youtubeEmotes.name,
                set: {
                  useCount: sql`${youtubeEmotes.useCount} + 1`,
                  imageUrl: img,
                  lastSeenAt: new Date(),
                },
              });
          } catch {
            // non-blocking emote caching
          }
        }
      }
    }

    // 4. Update Stream Session Counters
    const [updatedStream] = await db
      .update(streamSessions)
      .set({
        totalMessages: sql`${streamSessions.totalMessages} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(streamSessions.id, stream.id))
      .returning();

    return {
      message: insertedMsg,
      user: userRecord,
      stream: updatedStream,
    };
  }

  /**
   * Get unique chatters / users who participated in a specific stream session
   */
  async getStreamChatters(streamId: string) {
    // Aggregate distinct users and message counts in this stream joining 'user' table
    const chatters = await db
      .select({
        userId: chatMessages.userId,
        username: sql<string>`coalesce(${user.name}, 'Anonymous')`,
        youtubeChannelId: user.youtubeChannelId,
        userAvatarUrl: user.image,
        tier: user.tier,
        points: user.points,
        isOwner: chatMessages.isOwner,
        isModerator: chatMessages.isModerator,
        isSponsor: chatMessages.isSponsor,
        messageCount: sql<number>`count(${chatMessages.id})`,
        lastMessageAt: sql<string>`max(${chatMessages.publishedAt})`,
      })
      .from(chatMessages)
      .leftJoin(user, eq(chatMessages.userId, user.id))
      .where(eq(chatMessages.streamId, streamId))
      .groupBy(
        chatMessages.userId,
        user.name,
        user.youtubeChannelId,
        user.image,
        user.tier,
        user.points,
        chatMessages.isOwner,
        chatMessages.isModerator,
        chatMessages.isSponsor
      )
      .orderBy(desc(sql`count(${chatMessages.id})`));

    return chatters;
  }

  /**
   * Get message history for a stream session
   */
  async getStreamChats(streamId: string, limit = 100) {
    return await db.query.chatMessages.findMany({
      where: eq(chatMessages.streamId, streamId),
      with: {
        user: true,
      },
      orderBy: [desc(chatMessages.publishedAt)],
      limit,
    });
  }

  /**
   * List all stream sessions
   */
  async getAllStreams(): Promise<StreamSessionTable[]> {
    return await db.query.streamSessions.findMany({
      orderBy: [desc(streamSessions.startedAt)],
    });
  }

  /**
   * List all known users / chatters across all streams
   */
  async getAllChatters(): Promise<UserTable[]> {
    return await db.query.user.findMany({
      orderBy: [desc(user.createdAt)],
    });
  }

  /**
   * Get singleton Stream Settings
   */
  async getStreamSettings(): Promise<StreamSettingsTable | null> {
    const settings = await db.query.streamSettings.findFirst();
    return settings || null;
  }

  /**
   * Get Active Stream Goals
   */
  async getActiveStreamGoals(): Promise<StreamGoalTable[]> {
    return await db.query.streamGoals.findMany({
      where: eq(streamGoals.isActive, true),
      orderBy: [desc(streamGoals.createdAt)],
    });
  }

  /**
   * Get Aggregated Overlay Summary for OBS Top Ticker & Widgets
   */
  async getOverlaySummary() {
    const [settings, activeStream, goals, latestDonation, topDonation] = await Promise.all([
      this.getStreamSettings(),
      this.getOrCreateActiveStream(),
      this.getActiveStreamGoals(),
      db.query.donations.findFirst({
        orderBy: [desc(donations.createdAt)],
      }),
      db.query.donations.findFirst({
        orderBy: [desc(donations.amount)],
      }),
    ]);

    return {
      settings: settings || {
        id: 'default',
        streamerName: 'Respati',
        streamerHandle: '@respati_stream',
        youtubeChannelUrl: 'https://youtube.com/@respati_stream',
        tiktokHandle: '@respati',
        overlayTheme: 'dark_esports',
        alertMinAmount: '10000',
        alertSoundEnabled: true,
        updatedAt: new Date(),
      },
      activeStream,
      goals,
      latestDonation: latestDonation
        ? {
            donorName: latestDonation.donorName,
            amount: Number(latestDonation.amount),
            currency: latestDonation.currency,
          }
        : null,
      topDonation: topDonation
        ? {
            donorName: topDonation.donorName,
            amount: Number(topDonation.amount),
            currency: topDonation.currency,
          }
        : null,
    };
  }
}

export const streamsService = new StreamsService();
