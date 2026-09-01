import { relations } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

/**
 * Better Auth Tables (Audience / User Social Auth)
 */
export const user = pgTable(
  'user',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    emailVerified: boolean('email_verified').default(false).notNull(),
    image: text('image'),
    role: text('role').default('viewer').notNull(),
    // YouTube Data Tracking
    youtubeChannelId: text('youtube_channel_id'),
    youtubeHandle: text('youtube_handle'), // e.g. "@tyorespati"
    youtubeChannelTitle: text('youtube_channel_title'), // e.g. "Tyo Respati Official"
    // Gamification & Loyalty Point System
    points: integer('points').default(0).notNull(),
    tier: text('tier').default('bronze').notNull(), // 'bronze' | 'silver' | 'gold' | 'diamond'
    totalChatCount: integer('total_chat_count').default(0).notNull(),
    totalDonationAmount: integer('total_donation_amount').default(0).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index('idx_user_youtube_channel_id').on(table.youtubeChannelId),
    index('idx_user_youtube_handle').on(table.youtubeHandle),
    index('idx_user_points').on(table.points),
    index('idx_user_tier').on(table.tier),
    index('idx_user_created_at').on(table.createdAt),
  ]
);

export const pointTransactions = pgTable(
  'point_transactions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    amount: integer('amount').notNull(),
    type: text('type').notNull(), // 'CHAT_REWARD' | 'DONATION_REWARD' | 'DAILY_BONUS' | 'REDEEM'
    description: text('description'),
    metadata: text('metadata'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('idx_point_tx_user_created').on(table.userId, table.createdAt),
    index('idx_point_tx_type').on(table.type),
  ]
);

export const session = pgTable(
  'session',
  {
    id: text('id').primaryKey(),
    expiresAt: timestamp('expires_at').notNull(),
    token: text('token').notNull().unique(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .$onUpdate(() => new Date())
      .notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
  },
  (table) => [
    index('idx_session_user_id').on(table.userId),
    index('idx_session_token').on(table.token),
    index('idx_session_expires_at').on(table.expiresAt),
  ]
);

export const account = pgTable(
  'account',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at'),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
    scope: text('scope'),
    password: text('password'),
    issuer: text('issuer'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index('idx_account_user_id').on(table.userId),
    index('idx_account_provider_account').on(table.providerId, table.accountId),
  ]
);

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

/**
 * Stream Sessions Table (Each Live Stream has its own unique record)
 */
export const streamSessions = pgTable(
  'stream_sessions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    title: varchar('title', { length: 255 }).notNull().default('Live Stream Session'),
    youtubeBroadcastId: varchar('youtube_broadcast_id', { length: 255 }),
    status: varchar('status', { length: 50 }).notNull().default('live'), // 'live' | 'ended'
    startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
    endedAt: timestamp('ended_at', { withTimezone: true }),
    totalMessages: numeric('total_messages').notNull().default('0'),
    totalChatters: numeric('total_chatters').notNull().default('0'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_stream_sessions_status').on(table.status),
    index('idx_stream_sessions_started_at').on(table.startedAt),
  ]
);

/**
 * Chat Messages Table (Linked to Stream Session & User)
 */
export const chatMessages = pgTable(
  'chat_messages',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    streamId: uuid('stream_id')
      .notNull()
      .references(() => streamSessions.id, { onDelete: 'cascade' }),
    userId: text('user_id').references(() => user.id, { onDelete: 'set null' }),
    youtubeMessageId: varchar('youtube_message_id', { length: 255 }),
    message: text('message').notNull(),
    emotes: text('emotes'), // JSON array string of detected YouTube emotes
    parts: text('parts'), // JSON array string of parsed rich message parts
    isOwner: boolean('is_owner').notNull().default(false),
    isModerator: boolean('is_moderator').notNull().default(false),
    isSponsor: boolean('is_sponsor').notNull().default(false), // YouTube Member
    isVerified: boolean('is_verified').notNull().default(false),
    publishedAt: timestamp('published_at', { withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_chat_messages_stream_published').on(table.streamId, table.publishedAt),
    index('idx_chat_messages_user_id').on(table.userId),
    index('idx_chat_messages_yt_msg_id').on(table.youtubeMessageId),
  ]
);

/**
 * YouTube Custom Emotes & Badges Asset Cache
 */
export const youtubeEmotes = pgTable(
  'youtube_emotes',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull().unique(), // e.g. ":text-green-game-over:"
    imageUrl: text('image_url').notNull(),
    type: text('type').default('youtube').notNull(),
    useCount: integer('use_count').default(1).notNull(),
    firstSeenAt: timestamp('first_seen_at', { withTimezone: true }).defaultNow().notNull(),
    lastSeenAt: timestamp('last_seen_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index('idx_youtube_emotes_name').on(table.name)]
);

/**
 * Stream Settings Table (Singleton Configuration for Streamer identity & alerts)
 */
export const streamSettings = pgTable('stream_settings', {
  id: varchar('id', { length: 50 }).primaryKey().default('default'),
  streamerName: varchar('streamer_name', { length: 255 }).notNull().default('Respati'),
  streamerHandle: varchar('streamer_handle', { length: 255 }).notNull().default('@respati_stream'),
  youtubeChannelUrl: text('youtube_channel_url').default('https://youtube.com/@respati_stream'),
  tiktokHandle: varchar('tiktok_handle', { length: 255 }).default('@respati'),
  overlayTheme: varchar('overlay_theme', { length: 50 }).notNull().default('dark_esports'),
  alertMinAmount: numeric('alert_min_amount', { precision: 12, scale: 2 }).notNull().default('10000'),
  alertSoundEnabled: boolean('alert_sound_enabled').notNull().default(true),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Stream Goals Table (Sub Goals, Follower Goals, Donation Goals)
 */
export const streamGoals = pgTable('stream_goals', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  targetAmount: numeric('target_amount', { precision: 12, scale: 2 }).notNull(),
  currentAmount: numeric('current_amount', { precision: 12, scale: 2 }).notNull().default('0'),
  goalType: varchar('goal_type', { length: 50 }).notNull().default('sub'), // 'sub' | 'donation' | 'follower'
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Donations Table Schema
 */
export const donations = pgTable(
  'donations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id').references(() => user.id, { onDelete: 'set null' }),
    streamId: uuid('stream_id').references(() => streamSessions.id, { onDelete: 'set null' }),
    donorName: varchar('donor_name', { length: 255 }).notNull(),
    donorEmail: varchar('donor_email', { length: 255 }),
    amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
    currency: varchar('currency', { length: 10 }).notNull().default('IDR'),
    message: text('message'),
    status: varchar('status', { length: 50 }).notNull().default('completed'), // 'pending' | 'completed' | 'failed'
    paymentMethod: varchar('payment_method', { length: 50 }).notNull().default('sandbox_qris'), // 'sandbox_qris' | 'qris' | 'manual'
    streamerbotTriggered: boolean('streamerbot_triggered').notNull().default(false),
    streamerbotTriggeredAt: timestamp('streamerbot_triggered_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_donations_stream_id').on(table.streamId),
    index('idx_donations_user_id').on(table.userId),
    index('idx_donations_status_created').on(table.status, table.createdAt),
    index('idx_donations_created_at').on(table.createdAt),
  ]
);

/**
 * Streamer.bot Action Triggers Table (Configurable Deck Buttons)
 */
export const streamerbotActions = pgTable('streamerbot_actions', {
  id: uuid('id').primaryKey().defaultRandom(),
  actionId: varchar('action_id', { length: 255 }).notNull(), // UUID or Action name in Streamer.bot
  name: varchar('name', { length: 255 }).notNull(),
  category: varchar('category', { length: 100 }).notNull().default('alerts'), // 'alerts' | 'sound_effects' | 'obs_control' | 'lights'
  description: text('description'),
  icon: varchar('icon', { length: 50 }).notNull().default('Zap'),
  color: varchar('color', { length: 50 }).notNull().default('#38BDF8'),
  isEnabled: boolean('is_enabled').notNull().default(true),
  sortOrder: numeric('sort_order').notNull().default('0'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Drizzle Relations
 */
export const userStreamRelations = relations(user, ({ many }) => ({
  donations: many(donations),
  chatMessages: many(chatMessages),
  pointTransactions: many(pointTransactions),
}));

export const streamSessionsRelations = relations(streamSessions, ({ many }) => ({
  chatMessages: many(chatMessages),
  donations: many(donations),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  streamSession: one(streamSessions, {
    fields: [chatMessages.streamId],
    references: [streamSessions.id],
  }),
  user: one(user, {
    fields: [chatMessages.userId],
    references: [user.id],
  }),
}));

export const donationsRelations = relations(donations, ({ one }) => ({
  user: one(user, {
    fields: [donations.userId],
    references: [user.id],
  }),
  streamSession: one(streamSessions, {
    fields: [donations.streamId],
    references: [streamSessions.id],
  }),
}));

/**
 * Inferred Types
 */
export type UserTable = typeof user.$inferSelect;
export type NewUserTable = typeof user.$inferInsert;
export type StreamSessionTable = typeof streamSessions.$inferSelect;
export type NewStreamSessionTable = typeof streamSessions.$inferInsert;
export type ChatMessageTable = typeof chatMessages.$inferSelect;
export type NewChatMessageTable = typeof chatMessages.$inferInsert;
export type StreamSettingsTable = typeof streamSettings.$inferSelect;
export type NewStreamSettingsTable = typeof streamSettings.$inferInsert;
export type StreamGoalTable = typeof streamGoals.$inferSelect;
export type NewStreamGoalTable = typeof streamGoals.$inferInsert;
export type DonationTable = typeof donations.$inferSelect;
export type NewDonationTable = typeof donations.$inferInsert;
export type StreamerbotActionTable = typeof streamerbotActions.$inferSelect;
export type NewStreamerbotActionTable = typeof streamerbotActions.$inferInsert;
export type YoutubeEmoteTable = typeof youtubeEmotes.$inferSelect;
export type NewYoutubeEmoteTable = typeof youtubeEmotes.$inferInsert;
