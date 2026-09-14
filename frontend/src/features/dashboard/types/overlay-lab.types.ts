export type TestingTab = 'chat' | 'donation';

export type AlertVisualTemplate = 'electric-lightning' | 'fire-flame' | 'cat-jam';

export interface BurstPreset {
  id: string;
  name: string;
  count: number;
  delayMs: number;
  subtitle: string;
}

export interface TraceLogItem {
  id: string;
  timestamp: string;
  tag: string;
  type: 'ws_send' | 'ws_recv' | 'audio' | 'tts' | 'burst';
  content: string;
}

export interface StageChat {
  id: string;
  username: string;
  role: 'mod' | 'vip' | 'member' | 'viewer';
  message: string;
  timestamp: string;
}

export interface StageAlert {
  id: string;
  donorName: string;
  amount: number;
  currency: string;
  message: string;
  template: AlertVisualTemplate;
  durationSec: number;
  remainingSec: number;
}

export interface DonationConfigState {
  template: AlertVisualTemplate;
  soundType: string;
  durationSec: number;
}
