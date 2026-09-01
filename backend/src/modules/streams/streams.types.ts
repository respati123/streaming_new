import { z } from 'zod';

export const startStreamSchema = z.object({
  title: z.string().min(1, 'Stream title is required').default('Live Stream Session'),
  youtubeBroadcastId: z.string().optional(),
});

export const incomingChatMessageSchema = z.object({
  message: z.string().min(1),
  username: z.string().min(1),
  youtubeChannelId: z.string().optional(),
  youtubeMessageId: z.string().optional(),
  userAvatarUrl: z.string().optional(),
  isOwner: z.boolean().optional().default(false),
  isModerator: z.boolean().optional().default(false),
  isSponsor: z.boolean().optional().default(false),
  isVerified: z.boolean().optional().default(false),
  publishedAt: z.string().optional(),
});

export type StartStreamDTO = z.infer<typeof startStreamSchema>;
export type IncomingChatMessageDTO = z.infer<typeof incomingChatMessageSchema>;
