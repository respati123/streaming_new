import { relations } from 'drizzle-orm';
import {
  boolean,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

/**
 * Users Table Schema (Supporting both Standard Auth & Google / YouTube OAuth)
 */
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).unique(), // Nullable for chat-only discovered users
  name: varchar('name', { length: 255 }).notNull(),
  passwordHash: varchar('password_hash', { length: 255 }), // Nullable for OAuth-only or chat users
  role: varchar('role', { length: 50 }).notNull().default('viewer'), // 'admin' | 'moderator' | 'member' | 'viewer'
  avatarUrl: text('avatar_url'),
  googleId: varchar('google_id', { length: 255 }).unique(),
  youtubeChannelId: varchar('youtube_channel_id', { length: 255 }).unique(),
  youtubeHandle: varchar('youtube_handle', { length: 255 }), // e.g. "@respati_stream"
  youtubeTitle: varchar('youtube_title', { length: 255 }), // e.g. "Respati Gaming"
  totalMessagesSent: numeric('total_messages_sent').notNull().default('0'),
  firstSeenAt: timestamp('first_seen_at', { withTimezone: true }).notNull().defaultNow(),
  lastSeenAt: timestamp('last_seen_at', { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Refresh Tokens Table Schema
 */
export const refreshTokens = pgTable('refresh_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: varchar('token_hash', { length: 255 }).notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  isRevoked: boolean('is_revoked').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Stream Sessions Table (Each Live Stream has its own unique record)
 */
export const streamSessions = pgTable('stream_sessions', {
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
});

/**
 * Chat Messages Table (Linked to Stream Session & User)
 */
export const chatMessages = pgTable('chat_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  streamId: uuid('stream_id')
    .notNull()
    .references(() => streamSessions.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  youtubeMessageId: varchar('youtube_message_id', { length: 255 }),
  username: varchar('username', { length: 255 }).notNull(), // The user's displayed name on YouTube/Google
  youtubeChannelId: varchar('youtube_channel_id', { length: 255 }),
  userAvatarUrl: text('user_avatar_url'),
  message: text('message').notNull(),
  isOwner: boolean('is_owner').notNull().default(false),
  isModerator: boolean('is_moderator').notNull().default(false),
  isSponsor: boolean('is_sponsor').notNull().default(false), // YouTube Member
  isVerified: boolean('is_verified').notNull().default(false),
  publishedAt: timestamp('published_at', { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

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
export const donations = pgTable('donations', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
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
});

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
export const usersRelations = relations(users, ({ many }) => ({
  refreshTokens: many(refreshTokens),
  donations: many(donations),
  chatMessages: many(chatMessages),
}));

export const refreshTokensRelations = relations(refreshTokens, ({ one }) => ({
  user: one(users, {
    fields: [refreshTokens.userId],
    references: [users.id],
  }),
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
  user: one(users, {
    fields: [chatMessages.userId],
    references: [users.id],
  }),
}));

export const donationsRelations = relations(donations, ({ one }) => ({
  user: one(users, {
    fields: [donations.userId],
    references: [users.id],
  }),
  streamSession: one(streamSessions, {
    fields: [donations.streamId],
    references: [streamSessions.id],
  }),
}));

/**
 * Inferred Types
 */
export type UserTable = typeof users.$inferSelect;
export type NewUserTable = typeof users.$inferInsert;
export type RefreshTokenTable = typeof refreshTokens.$inferSelect;
export type NewRefreshTokenTable = typeof refreshTokens.$inferInsert;
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
