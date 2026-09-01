import { dashboardSocket, type ConnectionState } from '@core/ws/socketClient';
import { useCallback, useEffect, useState } from 'react';
import type { ChatMessage, StreamerbotStatus } from '../types/dashboard.types';

export function useDashboardRealtime(onNewChat?: (msg: ChatMessage) => void) {
  const [connectionState, setConnectionState] = useState<ConnectionState>('DISCONNECTED');
  const [botStatus, setBotStatus] = useState<StreamerbotStatus | null>(null);
  const [lastAlert, setLastAlert] = useState<any | null>(null);
  const [lastActionResult, setLastActionResult] = useState<any | null>(null);

  useEffect(() => {
    // 1. Initiate WebSocket Connection
    dashboardSocket.connect();
    setConnectionState(dashboardSocket.getState());

    // 2. Event Listeners
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

    const unsubChat = dashboardSocket.on('chat:message', (data) => {
      if (onNewChat) {
        onNewChat({
          id: data.id || Math.random().toString(),
          streamId: data.streamId || 'active',
          username: data.user || 'Viewer',
          userId: data.userId,
          userAvatarUrl: data.avatarUrl,
          message: data.message,
          isOwner: data.isOwner,
          isModerator: data.isModerator,
          isSponsor: data.isSponsor,
          publishedAt: data.timestamp || new Date().toISOString(),
        });
      }
    });

    const unsubAlert = dashboardSocket.on('donation:alert', (data) => {
      setLastAlert(data);
    });

    const unsubActionResult = dashboardSocket.on('action:result', (data) => {
      setLastActionResult(data);
    });

    return () => {
      unsubState();
      unsubWelcome();
      unsubStatus();
      unsubChat();
      unsubAlert();
      unsubActionResult();
    };
  }, [onNewChat]);

  // Direct Sender Helpers
  const sendChatMessage = useCallback((message: string, username = 'Streamer Host') => {
    return dashboardSocket.send('chat:send', {
      message,
      username,
      isOwner: true,
      isModerator: true,
    });
  }, []);

  const triggerAction = useCallback((action: string, args: Record<string, any> = {}) => {
    return dashboardSocket.send('action:trigger', { action, args });
  }, []);

  const triggerTestAlert = useCallback(
    (alert: { donorName: string; amount: number; currency?: string; message?: string }) => {
      return dashboardSocket.send('alert:test', {
        ...alert,
        currency: alert.currency || 'IDR',
        source: 'dashboard_ws',
        timestamp: new Date().toISOString(),
      });
    },
    []
  );

  return {
    isSocketConnected: connectionState === 'CONNECTED',
    isSSEConnected: connectionState === 'CONNECTED', // backward compatibility
    connectionState,
    botStatus,
    lastAlert,
    lastActionResult,
    sendChatMessage,
    triggerAction,
    triggerTestAlert,
  };
}
