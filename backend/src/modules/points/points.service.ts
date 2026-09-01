import { db } from '@core/database';
import * as schema from '@core/database/schema';
import { eq } from 'drizzle-orm';
import { logger } from '@core/logger/logger';

export interface UserGamificationProfile {
  userId: string;
  name: string;
  youtubeHandle: string | null;
  youtubeChannelTitle: string | null;
  points: number;
  tier: string;
  totalChatCount: number;
  totalDonationAmount: number;
}

export class PointsService {
  /**
   * Determine loyalty tier based on accumulated points
   */
  private calculateTier(points: number): 'bronze' | 'silver' | 'gold' | 'diamond' {
    if (points >= 2000) return 'diamond';
    if (points >= 500) return 'gold';
    if (points >= 100) return 'silver';
    return 'bronze';
  }
  /**
   * Automatically upsert user & account record from incoming YouTube chat
   * - If user already exists (by youtubeChannelId or username), update stats and award +5 PTS
   * - If user is new, insert into 'user' table and 'account' table (providerId: 'youtube'), and award first +5 PTS
   */
  async upsertUserFromYouTubeChat(dto: {
    username: string;
    youtubeChannelId?: string | null;
    userAvatarUrl?: string | null;
    youtubeHandle?: string | null;
    isOwner?: boolean;
    isModerator?: boolean;
    isSponsor?: boolean;
  }): Promise<{ user: typeof schema.user.$inferSelect; pointsAdded: number }> {
    const determinedRole = dto.isOwner ? 'admin' : dto.isModerator ? 'moderator' : dto.isSponsor ? 'member' : 'viewer';
    const cleanUsername = dto.username || 'YouTube Viewer';
    const channelId = dto.youtubeChannelId || null;
    const handle = dto.youtubeHandle || (cleanUsername.startsWith('@') ? cleanUsername : `@${cleanUsername.toLowerCase().replace(/\s+/g, '')}`);
    const email = `${channelId || cleanUsername.toLowerCase().replace(/[^a-z0-9]/g, '')}@youtube.viewer`;

    let existingUser: typeof schema.user.$inferSelect | undefined;

    // 1. Search existing user by youtubeChannelId
    if (channelId) {
      const [u] = await db
        .select()
        .from(schema.user)
        .where(eq(schema.user.youtubeChannelId, channelId))
        .limit(1);
      existingUser = u;
    }

    // 2. Search existing user by email
    if (!existingUser) {
      const [u] = await db
        .select()
        .from(schema.user)
        .where(eq(schema.user.email, email))
        .limit(1);
      existingUser = u;
    }

    // 3. Search existing user by exact name
    if (!existingUser) {
      const [u] = await db
        .select()
        .from(schema.user)
        .where(eq(schema.user.name, cleanUsername))
        .limit(1);
      existingUser = u;
    }

    const pointsToAdd = 5;

    if (existingUser) {
      const newPoints = (existingUser.points || 0) + pointsToAdd;
      const newChatCount = (existingUser.totalChatCount || 0) + 1;
      const newTier = this.calculateTier(newPoints);

      const [updatedUser] = await db
        .update(schema.user)
        .set({
          name: cleanUsername,
          image: dto.userAvatarUrl || existingUser.image,
          youtubeChannelId: channelId || existingUser.youtubeChannelId,
          youtubeHandle: existingUser.youtubeHandle || handle,
          youtubeChannelTitle: cleanUsername,
          role: existingUser.role === 'admin' ? 'admin' : determinedRole,
          points: newPoints,
          totalChatCount: newChatCount,
          tier: newTier,
          updatedAt: new Date(),
        })
        .where(eq(schema.user.id, existingUser.id))
        .returning();

      // Ensure account record exists for this user
      if (channelId) {
        const [existingAcc] = await db
          .select()
          .from(schema.account)
          .where(eq(schema.account.userId, existingUser.id))
          .limit(1);

        if (!existingAcc) {
          await db.insert(schema.account).values({
            id: `acc_yt_${channelId}`,
            accountId: channelId,
            providerId: 'youtube',
            userId: existingUser.id,
          });
        }
      }

      // Record point transaction
      await db.insert(schema.pointTransactions).values({
        userId: existingUser.id,
        amount: pointsToAdd,
        type: 'CHAT_REWARD',
        description: `Poin reward live chat YouTube (${cleanUsername}) (+5 PTS)`,
        metadata: JSON.stringify({ youtubeChannelId: channelId, handle }),
      });

      return { user: updatedUser, pointsAdded: pointsToAdd };
    } else {
      // Create new user in `user` table
      const newUserId = channelId ? `yt_${channelId}` : `yt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const initialPoints = pointsToAdd;
      const initialTier = this.calculateTier(initialPoints);

      const [createdUser] = await db
        .insert(schema.user)
        .values({
          id: newUserId,
          name: cleanUsername,
          email,
          emailVerified: true,
          image: dto.userAvatarUrl || null,
          role: determinedRole,
          youtubeChannelId: channelId,
          youtubeHandle: handle,
          youtubeChannelTitle: cleanUsername,
          points: initialPoints,
          tier: initialTier,
          totalChatCount: 1,
          totalDonationAmount: 0,
        })
        .returning();

      // Create linked account record in `account` table
      await db.insert(schema.account).values({
        id: `acc_${newUserId}`,
        accountId: channelId || newUserId,
        providerId: 'youtube',
        userId: newUserId,
      });

      // Record point transaction
      await db.insert(schema.pointTransactions).values({
        userId: newUserId,
        amount: initialPoints,
        type: 'CHAT_REWARD',
        description: `Poin reward chat pertama YouTube (${cleanUsername}) (+5 PTS)`,
        metadata: JSON.stringify({ youtubeChannelId: channelId, handle }),
      });

      logger.info(`👤 [PointsService] Created new user & account from YouTube chat: ${cleanUsername} (${newUserId})`);

      return { user: createdUser, pointsAdded: initialPoints };
    }
  }

  /**
   * Award points when a viewer sends a chat message (+5 points per chat)
   */
  async awardChatPoints(userId: string, chatMessageId?: string): Promise<{ pointsAdded: number; totalPoints: number; tier: string } | null> {
    try {
      const [currentUser] = await db
        .select()
        .from(schema.user)
        .where(eq(schema.user.id, userId))
        .limit(1);

      if (!currentUser) return null;

      const pointsToAdd = 5;
      const newPoints = (currentUser.points || 0) + pointsToAdd;
      const newChatCount = (currentUser.totalChatCount || 0) + 1;
      const newTier = this.calculateTier(newPoints);

      await db
        .update(schema.user)
        .set({
          points: newPoints,
          totalChatCount: newChatCount,
          tier: newTier,
          updatedAt: new Date(),
        })
        .where(eq(schema.user.id, userId));

      // Record point transaction
      await db.insert(schema.pointTransactions).values({
        userId,
        amount: pointsToAdd,
        type: 'CHAT_REWARD',
        description: 'Poin apresiasi live chat aktif (+5 PTS)',
        metadata: JSON.stringify({ chatMessageId }),
      });

      logger.info(`[PointsService] Awarded +${pointsToAdd} PTS to user ${currentUser.name} (${userId}). Total: ${newPoints} PTS (Tier: ${newTier})`);

      return {
        pointsAdded: pointsToAdd,
        totalPoints: newPoints,
        tier: newTier,
      };
    } catch (error) {
      logger.error('[PointsService] Failed to award chat points:', {}, error as Error);
      return null;
    }
  }

  /**
   * Award points when a viewer makes a donation (+1 point per Rp 100)
   */
  async awardDonationPoints(
    userId: string,
    amount: number,
    donationId?: string
  ): Promise<{ pointsAdded: number; totalPoints: number; tier: string } | null> {
    try {
      const [currentUser] = await db
        .select()
        .from(schema.user)
        .where(eq(schema.user.id, userId))
        .limit(1);

      if (!currentUser) return null;

      const pointsToAdd = Math.max(1, Math.floor(amount / 100)); // Rp 10,000 = 100 PTS
      const newPoints = (currentUser.points || 0) + pointsToAdd;
      const newTotalDonation = (currentUser.totalDonationAmount || 0) + amount;
      const newTier = this.calculateTier(newPoints);

      await db
        .update(schema.user)
        .set({
          points: newPoints,
          totalDonationAmount: newTotalDonation,
          tier: newTier,
          updatedAt: new Date(),
        })
        .where(eq(schema.user.id, userId));

      // Record point transaction
      await db.insert(schema.pointTransactions).values({
        userId,
        amount: pointsToAdd,
        type: 'DONATION_REWARD',
        description: `Poin donasi sawer Rp ${amount.toLocaleString('id-ID')} (+${pointsToAdd} PTS)`,
        metadata: JSON.stringify({ donationId, amount }),
      });

      logger.info(`[PointsService] Awarded +${pointsToAdd} PTS for Rp ${amount} donation to user ${currentUser.name} (${userId})`);

      return {
        pointsAdded: pointsToAdd,
        totalPoints: newPoints,
        tier: newTier,
      };
    } catch (error) {
      logger.error('[PointsService] Failed to award donation points:', {}, error as Error);
      return null;
    }
  }

  /**
   * Fetch and sync YouTube Channel name & handle using user's Google OAuth Access Token
   */
  async syncYouTubeProfile(userId: string, accessToken: string): Promise<void> {
    try {
      const response = await fetch('https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        logger.warn(`[YouTube Sync] YouTube API returned status ${response.status} for user ${userId}`);
        return;
      }

      const data = await response.json();
      if (data.items && data.items.length > 0) {
        const channel = data.items[0];
        const youtubeChannelId = channel.id;
        const youtubeChannelTitle = channel.snippet?.title || null;
        const youtubeHandle = channel.snippet?.customUrl || null;
        const youtubeAvatar = channel.snippet?.thumbnails?.high?.url || channel.snippet?.thumbnails?.default?.url || null;

        await db
          .update(schema.user)
          .set({
            youtubeChannelId,
            youtubeChannelTitle,
            youtubeHandle,
            ...(youtubeAvatar ? { image: youtubeAvatar } : {}),
            updatedAt: new Date(),
          })
          .where(eq(schema.user.id, userId));

        logger.info(`[YouTube Sync] Synced YouTube channel for user ${userId}: ${youtubeChannelTitle} (${youtubeHandle || 'No handle'})`);
      }
    } catch (error) {
      logger.error(`[YouTube Sync] Error syncing YouTube channel for user ${userId}:`, {}, error as Error);
    }
  }

  /**
   * Get complete gamification profile for user
   */
  async getUserProfile(userId: string): Promise<UserGamificationProfile | null> {
    const [user] = await db
      .select()
      .from(schema.user)
      .where(eq(schema.user.id, userId))
      .limit(1);

    if (!user) return null;

    return {
      userId: user.id,
      name: user.name,
      youtubeHandle: user.youtubeHandle,
      youtubeChannelTitle: user.youtubeChannelTitle,
      points: user.points || 0,
      tier: user.tier || 'bronze',
      totalChatCount: user.totalChatCount || 0,
      totalDonationAmount: user.totalDonationAmount || 0,
    };
  }
}

export const pointsService = new PointsService();
