import { apiClient } from '@core/http/api-client';
import type {
  ActionItem,
  ChatMessage,
  Chatter,
  OverlaySummary,
  StreamSession,
  StreamerbotStatus,
} from '../types/dashboard.types';

export const dashboardService = {
  // Streams
  async getActiveStream(): Promise<StreamSession> {
    const res = await apiClient.get<{ data: StreamSession }>('/streams/active');
    return res.data.data;
  },

  async startStream(title: string, youtubeBroadcastId?: string): Promise<StreamSession> {
    const res = await apiClient.post<{ data: StreamSession }>('/streams/start', {
      title,
      youtubeBroadcastId,
    });
    return res.data.data;
  },

  async endStream(streamId: string): Promise<StreamSession> {
    const res = await apiClient.post<{ data: StreamSession }>(`/streams/${streamId}/end`);
    return res.data.data;
  },

  async getStreamChatters(streamId: string): Promise<Chatter[]> {
    const res = await apiClient.get<{ data: Chatter[] }>(`/streams/${streamId}/chatters`);
    return res.data.data;
  },

  async getStreamChats(streamId: string = 'active', limit: number = 20): Promise<ChatMessage[]> {
    const res = await apiClient.get<{ data: ChatMessage[] }>(`/streams/${streamId}/chats?limit=${limit}`);
    return res.data.data;
  },

  async getAllStreams(): Promise<StreamSession[]> {
    const res = await apiClient.get<{ data: StreamSession[] }>('/streams');
    return res.data.data;
  },

  async getOverlaySummary(): Promise<OverlaySummary> {
    const res = await apiClient.get<{ data: OverlaySummary }>('/streams/overlay-summary');
    return res.data.data;
  },

  async sendTestChat(payload: {
    message: string;
    username: string;
    isModerator?: boolean;
    isSponsor?: boolean;
  }) {
    const res = await apiClient.post('/streams/test-chat', payload);
    return res.data;
  },

  // Streamer.bot
  async getStreamerbotStatus(): Promise<StreamerbotStatus> {
    const res = await apiClient.get<{ data: StreamerbotStatus }>('/streamerbot/status');
    return res.data.data;
  },

  async reconnectStreamerbot(): Promise<StreamerbotStatus> {
    const res = await apiClient.post<{ data: StreamerbotStatus }>('/streamerbot/connect');
    return res.data.data;
  },

  async getActions(): Promise<{ liveActions: any[]; savedDeckActions: ActionItem[] }> {
    const res = await apiClient.get<{ data: { liveActions: any[]; savedDeckActions: ActionItem[] } }>(
      '/streamerbot/actions'
    );
    return res.data.data;
  },

  async triggerAction(action: string, args: Record<string, any> = {}) {
    const res = await apiClient.post('/streamerbot/actions/trigger', { action, args });
    return res.data;
  },

  async triggerTestAlert(payload: {
    donorName: string;
    amount: number;
    currency?: string;
    message?: string;
  }) {
    const res = await apiClient.post('/streamerbot/test-alert', payload);
    return res.data;
  },
};
