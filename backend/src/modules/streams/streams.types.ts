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
  emotes: z
    .array(
      z.object({
        type: z.string().optional(),
        name: z.string(),
        imageUrl: z.string().optional(),
        url: z.string().optional(),
        startIndex: z.number().optional(),
        endIndex: z.number().optional(),
      })
    )
    .optional(),
  parts: z
    .array(
      z.object({
        emoji: z.string().optional(),
        image: z.string().optional(),
        text: z.string().optional(),
        startIndex: z.number().optional(),
        endIndex: z.number().optional(),
      })
    )
    .optional(),
  isOwner: z.boolean().optional().default(false),
  isModerator: z.boolean().optional().default(false),
  isSponsor: z.boolean().optional().default(false),
  isVerified: z.boolean().optional().default(false),
  publishedAt: z.string().optional(),
});

export type StartStreamDTO = z.infer<typeof startStreamSchema>;
export type IncomingChatMessageDTO = z.infer<typeof incomingChatMessageSchema>;
