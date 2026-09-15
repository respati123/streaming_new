import { type ConnectionState, dashboardSocket } from '@core/ws/socketClient';
import { useCallback, useEffect, useState } from 'react';
import type {
  ChatAiProgressEvent,
  ChatMessage,
  StreamerbotStatus,
  UnifiedStreamEvent,
} from '../types/dashboard.types';

export function useDashboardRealtime(
  onNewChat?: (msg: ChatMessage) => void,
  onChatAiProgress?: (progress: ChatAiProgressEvent) => void,
  onStreamStarted?: (stream: any) => void,
  onStreamEnded?: (stream: any) => void,
  initialEvents: UnifiedStreamEvent[] = []
) {
  const [connectionState, setConnectionState] = useState<ConnectionState>('DISCONNECTED');
  const [botStatus, setBotStatus] = useState<StreamerbotStatus | null>(null);
  const [lastAlert, setLastAlert] = useState<Record<string, unknown> | null>(null);
  const [lastActionResult, setLastActionResult] = useState<Record<string, unknown> | null>(null);

  const [isAlertPaused, setIsAlertPaused] = useState(false);
  const [alertQueue, setAlertQueue] = useState<any[]>([]);
  const [eventsQueue, setEventsQueue] = useState<UnifiedStreamEvent[]>(initialEvents);
  const [activeLiveAlert, setActiveLiveAlert] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    if (initialEvents.length > 0 && eventsQueue.length === 0) {
      setEventsQueue(initialEvents);
    }
  }, [initialEvents, eventsQueue.length]);

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
      if (typeof data.isDonationAlertPaused === 'boolean') {
        setIsAlertPaused(data.isDonationAlertPaused);
      }
      if (Array.isArray(data.donationAlertQueue)) {
        setAlertQueue(data.donationAlertQueue);
      }
      if (Array.isArray(data.eventsQueue?.events)) {
        setEventsQueue(data.eventsQueue.events);
      }
    });

    const unsubEventsQueue = dashboardSocket.on('events:queue:update', (data) => {
      if (typeof data?.isPaused === 'boolean') setIsAlertPaused(data.isPaused);
      if (Array.isArray(data?.events)) setEventsQueue(data.events);
    });

    const unsubStatus = dashboardSocket.on('status:changed', (data) => {
      setBotStatus((prev) => (prev ? { ...prev, status: data.status } : null));
    });

    const unsubQueueStatus = dashboardSocket.on('overlay:alert:queue-status', (data) => {
      if (typeof data?.isPaused === 'boolean') setIsAlertPaused(data.isPaused);
      if (Array.isArray(data?.queue)) setAlertQueue(data.queue);
    });

    const unsubAlertTriggered = dashboardSocket.on('overlay:alert:triggered', (data) => {
      setActiveLiveAlert(data as Record<string, unknown>);
      setTimeout(() => {
        setActiveLiveAlert(null);
      }, 8500);
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
      setActiveLiveAlert(data as Record<string, unknown>);
      setTimeout(() => {
        setActiveLiveAlert(null);
      }, 8500);
    });

    const unsubActionResult = dashboardSocket.on('action:result', (data) => {
      setLastActionResult(data as Record<string, unknown>);
    });

    return () => {
      unsubState();
      unsubWelcome();
      unsubStatus();
      unsubEventsQueue();
      unsubQueueStatus();
      unsubAlertTriggered();
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

  const pauseOverlayAlerts = useCallback(() => {
    dashboardSocket.send('overlay:alert:pause', {});
    setIsAlertPaused(true);
  }, []);

  const resumeOverlayAlerts = useCallback(() => {
    dashboardSocket.send('overlay:alert:resume', {});
    setIsAlertPaused(false);
  }, []);

  const clearAlertQueue = useCallback(() => {
    dashboardSocket.send('overlay:alert:clear-queue', {});
    setAlertQueue([]);
    setEventsQueue((prev) => prev.filter((e) => e.status === 'completed' || e.status === 'failed'));
  }, []);

  const playQueueItem = useCallback((id: string) => {
    dashboardSocket.send('overlay:alert:play-item', { id });
  }, []);

  const removeQueueItem = useCallback((id: string) => {
    dashboardSocket.send('overlay:alert:remove-item', { id });
    setAlertQueue((prev) => prev.filter((item) => item.id !== id));
    setEventsQueue((prev) => prev.filter((item) => item.id !== id));
  }, []);

  return {
    connectionState,
    isSocketConnected: connectionState === 'CONNECTED',
    botStatus,
    lastAlert,
    activeLiveAlert,
    isAlertPaused,
    alertQueue,
    eventsQueue,
    lastActionResult,
    sendChatMessage,
    triggerAction,
    triggerTestAlert,
    pauseOverlayAlerts,
    resumeOverlayAlerts,
    clearAlertQueue,
    playQueueItem,
    removeQueueItem,
  };
}
