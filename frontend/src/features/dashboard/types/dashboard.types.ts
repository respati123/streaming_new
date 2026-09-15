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
export interface ChatAiInteractionSummary {
  id: string;
  viewerName: string;
  viewerAvatarUrl?: string | null;
  prompt: string;
  answer?: string | null;
  mood: 'neutral' | 'excited' | 'empathetic' | 'serious' | 'funny';
  status: 'queued' | 'processing' | 'ready' | 'playing' | 'completed' | 'rejected' | 'failed';
  phase?:
    | 'queued'
    | 'pi'
    | 'question-audio'
    | 'answer-audio'
    | 'ready'
    | 'waiting-overlay'
    | 'playing'
    | 'completed'
    | 'retrying'
    | 'failed'
    | 'rejected';
  error?: string | null;
  attempts: number;
  createdAt: string;
  questionAudioUrl?: string | null;
  answerAudioUrl?: string | null;
}

export interface ChatAiProgressEvent extends ChatAiInteractionSummary {
  interactionId: string;
  phase: NonNullable<ChatAiInteractionSummary['phase']>;
  maxAttempts: number;
}

export interface DonationItem {
  id: string;
  userId?: string | null;
  streamId?: string | null;
  donorName: string;
  donorEmail?: string | null;
  amount: number | string;
  currency: string;
  message?: string | null;
  status: 'pending' | 'completed' | 'failed' | 'canceled' | 'expired';
  paymentMethod: string;
  paymentOrderId?: string | null;
  alertTemplate?: string | null;
  streamerbotTriggered: boolean;
  createdAt: string;
}

export interface AlertQueueStatus {
  isPaused: boolean;
  queue: any[];
  queueCount: number;
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

export interface EventsQueueSnapshot {
  isPaused: boolean;
  activeCount: number;
  events: UnifiedStreamEvent[];
}

