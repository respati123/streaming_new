export type UserRole = 'admin' | 'moderator' | 'vip' | 'member' | 'viewer';
export type LoyaltyTier = 'diamond' | 'gold' | 'silver' | 'bronze';

export interface ViewerRecord {
  id: string;
  name: string;
  role: UserRole;
  tier: LoyaltyTier;
  points: number;
  totalMessagesSent: number;
  totalDonations: number;
  firstSeenAt: string;
  lastSeenAt: string;
  avatarUrl?: string | null;
  youtubeChannelId?: string | null;
  youtubeHandle?: string | null;
  isOnline: boolean;
  timeoutUntil?: string | null;
  warningCount: number;
  timeoutCount: number;
}

export interface ViewerActivityLog {
  id: string;
  viewerId: string;
  type: 'chat' | 'donation' | 'points';
  timestamp: string;
  content: string;
  amount?: number;
  platform?: 'YouTube' | 'Twitch' | 'Saweria';
}

export interface LoyaltyTierConfig {
  id: LoyaltyTier;
  name: string;
  minPoints: number;
  multiplier: number;
  perks: string[];
  color: string;
  badgeBg: string;
  borderColor: string;
}

export interface PointsRuleConfig {
  id: string;
  title: string;
  description: string;
  pointsAwarded: number;
  cooldownText: string;
}

export interface AutoModerationRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  threshold: number;
  unit: string;
}

export interface BlacklistedUser {
  id: string;
  username: string;
  reason: string;
  bannedAt: string;
  bannedBy: string;
}
