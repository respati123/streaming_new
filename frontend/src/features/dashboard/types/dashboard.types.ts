export interface StreamSession {
  id: string;
  title: string;
  youtubeBroadcastId?: string | null;
  status: 'live' | 'ended';
  startedAt: string;
  endedAt?: string | null;
  totalMessages: number | string;
  totalChatters: number | string;
  createdAt: string;
}

export interface Chatter {
  userId?: string | null;
  username: string;
  youtubeChannelId?: string | null;
  userAvatarUrl?: string | null;
  isOwner?: boolean;
  isModerator?: boolean;
  isSponsor?: boolean;
  messageCount: number;
  lastMessageAt: string;
}

export interface ChatMessage {
  id: string;
  streamId: string;
  userId?: string | null;
  username: string;
  youtubeChannelId?: string | null;
  userAvatarUrl?: string | null;
  message: string;
  emotes?: Array<{ name: string; imageUrl?: string; url?: string }>;
  parts?: Array<{ emoji?: string; image?: string; text?: string }>;
  tier?: string;
  points?: number;
  isOwner?: boolean;
  isModerator?: boolean;
  isSponsor?: boolean;
  isVerified?: boolean;
  publishedAt: string;
}

export interface StreamerbotStatus {
  status: 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'RECONNECTING' | 'ERROR';
  host: string;
  port: number;
  lastConnectedAt: string | null;
}

export interface StreamGoal {
  id: string;
  title: string;
  targetAmount: string | number;
  currentAmount: string | number;
  goalType: 'sub' | 'donation' | 'follower';
  isActive: boolean;
}

export interface StreamSetting {
  id: string;
  streamerName: string;
  streamerHandle: string;
  youtubeChannelUrl?: string | null;
  tiktokHandle?: string | null;
  overlayTheme: string;
  alertMinAmount: string | number;
  alertSoundEnabled: boolean;
}

export interface OverlaySummary {
  settings: StreamSetting;
  activeStream: StreamSession | null;
  goals: StreamGoal[];
  latestDonation: {
    donorName: string;
    amount: number;
    currency: string;
  } | null;
  topDonation: {
    donorName: string;
    amount: number;
    currency: string;
  } | null;
}

export interface ActionItem {
  id: string;
  actionId: string;
  name: string;
  category: string;
  description?: string | null;
  icon: string;
  color: string;
  isEnabled: boolean;
}

