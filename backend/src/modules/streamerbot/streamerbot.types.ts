import { z } from 'zod';

export type StreamerbotConnectionStatus =
  | 'DISCONNECTED'
  | 'CONNECTING'
  | 'CONNECTED'
  | 'RECONNECTING'
  | 'ERROR';

export interface DonationAlertEventData {
  id?: string;
  donorName: string;
  amount: number;
  currency: string;
  message?: string;
  template?: 'electric-lightning' | 'fire-glass';
  source: 'portal_donation' | 'youtube_superchat' | 'twitch_cheer' | 'manual_test';
  timestamp: string;
}

export interface LiveChatEventData {
  id: string;
  streamId: string;
  user: string;
  userId: string;
  youtubeHandle?: string | null;
  avatarUrl?: string | null;
  role: string;
  tier?: string;
  points?: number | null;
  message: string;
  isChatAiCommand?: boolean;
  chatAiPrompt?: string;
  emotes?: unknown[];
  parts?: unknown[];
  isOwner: boolean;
  isModerator: boolean;
  isSponsor: boolean;
  isVerified: boolean;
  timestamp: Date | string;
}

export interface ChatAiRequestEventData extends LiveChatEventData {
  prompt: string;
}

export interface StreamerbotLiveEvent {
  source: string;
  type: string;
  data: Record<string, unknown>;
  timestamp: string;
}

export const triggerActionSchema = z.object({
  action: z.string().min(1, 'Action ID or Name is required'),
  args: z.record(z.any()).optional().default({}),
});

export const testAlertSchema = z.object({
  donorName: z.string().min(1).default('Budi_Santoso'),
  amount: z.number().positive().default(50000),
  currency: z.string().default('IDR'),
  message: z.string().optional().default('Semangat live streamnya bang! 🔥'),
});

export type TriggerActionDTO = z.infer<typeof triggerActionSchema>;
export type TestAlertDTO = z.infer<typeof testAlertSchema>;
