import { type ConnectionState, dashboardSocket } from '@core/ws/socketClient';
import { useCallback, useEffect, useState } from 'react';
import type {
  ChatAiProgressEvent,
  ChatMessage,
  StreamerbotStatus,
} from '../types/dashboard.types';

export function useDashboardRealtime(
  onNewChat?: (msg: ChatMessage) => void,
  onChatAiProgress?: (progress: ChatAiProgressEvent) => void,
  onStreamStarted?: (stream: any) => void,
  onStreamEnded?: (stream: any) => void
) {
  const [connectionState, setConnectionState] = useState<ConnectionState>('DISCONNECTED');
  const [botStatus, setBotStatus] = useState<StreamerbotStatus | null>(null);
  const [lastAlert, setLastAlert] = useState<Record<string, unknown> | null>(null);
  const [lastActionResult, setLastActionResult] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    dashboardSocket.connect();
    setConnectionState(dashboardSocket.getState());

    const unsubState = dashboardSocket.on<ConnectionState>('connection:state', (state) => {
      setConnectionState(state);
    });

    const unsubWelcome = dashboardSocket.on('system:welcome', (data) => {
      if (data.streamerbotStatus) {
        setBotStatus(data.streamerbotStatus);
      }
    });

    const unsubStatus = dashboardSocket.on('status:changed', (data) => {
      setBotStatus((prev) => (prev ? { ...prev, status: data.status } : null));
    });

    const unsubStreamStarted = dashboardSocket.on('stream:started', (stream) => {
      onStreamStarted?.(stream);
    });

    const unsubStreamEnded = dashboardSocket.on('stream:ended', (stream) => {
      onStreamEnded?.(stream);
    });

    const unsubChat = dashboardSocket.on('chat:message', (data) => {
      if (onNewChat) {
        onNewChat({
          id: data.id || Math.random().toString(),
          streamId: data.streamId || 'active',
          username: data.user || 'Viewer',
          userId: data.userId,
          userAvatarUrl: data.avatarUrl,
          message: data.message,
          emotes: data.emotes || [],
          parts: data.parts || [],
          tier: data.tier,
          points: data.points,
          isOwner: data.isOwner,
          isModerator: data.isModerator,
          isSponsor: data.isSponsor,
          isVerified: data.isVerified,
          publishedAt: data.timestamp || new Date().toISOString(),
        });
      }
    });

    const unsubChatAiProgress = dashboardSocket.on<ChatAiProgressEvent>(
      'chatai:progress',
      (progress) => onChatAiProgress?.(progress)
    );

    const unsubAlert = dashboardSocket.on('donation:alert', (data) => {
      setLastAlert(data as Record<string, unknown>);
    });

    const unsubActionResult = dashboardSocket.on('action:result', (data) => {
      setLastActionResult(data as Record<string, unknown>);
    });

    return () => {
      unsubState();
      unsubWelcome();
      unsubStatus();
      unsubStreamStarted();
      unsubStreamEnded();
      unsubChat();
      unsubChatAiProgress();
      unsubAlert();
      unsubActionResult();
    };
  }, [onChatAiProgress, onNewChat, onStreamStarted, onStreamEnded]);

  const sendChatMessage = useCallback((message: string, username = 'Streamer Host') => {
    return dashboardSocket.send('chat:send', {
      message,
      username,
      isOwner: true,
      isModerator: true,
    });
  }, []);

  const triggerAction = useCallback((action: string, args: Record<string, unknown> = {}) => {
    return dashboardSocket.send('action:trigger', { action, args });
  }, []);

  const triggerTestAlert = useCallback(
    (alert: { donorName: string; amount: number; currency?: string; message?: string }) => {
      return dashboardSocket.send('alert:test', {
        ...alert,
        currency: alert.currency || 'IDR',
        source: 'dashboard_ws',
      });
    },
    []
  );

  return {
    connectionState,
    isSocketConnected: connectionState === 'CONNECTED',
    botStatus,
    lastAlert,
    lastActionResult,
    sendChatMessage,
    triggerAction,
    triggerTestAlert,
  };
}
