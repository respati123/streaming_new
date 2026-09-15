import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useReducer } from 'react';
import { useDashboardRealtime } from '../hooks/useDashboardRealtime';
import { dashboardService } from '../services/dashboardService';
import type {
  ActionItem,
  ChatAiInteractionSummary,
  ChatAiProgressEvent,
  ChatMessage,
  Chatter,
  StreamerbotStatus,
  StreamSession,
} from '../types/dashboard.types';

interface State {
  liveMessages: ChatMessage[];
}

type Action =
  | { type: 'SET_MESSAGES'; payload: ChatMessage[] }
  | { type: 'APPEND_MESSAGE'; payload: ChatMessage }
  | { type: 'CLEAR_MESSAGES' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_MESSAGES':
      return { ...state, liveMessages: action.payload };
    case 'APPEND_MESSAGE':
      return { ...state, liveMessages: [...state.liveMessages, action.payload].slice(-40) };
    case 'CLEAR_MESSAGES':
      return { ...state, liveMessages: [] };
    default:
      return state;
  }
}

export function useDashboardViewModel() {
  const queryClient = useQueryClient();
  const [state, dispatch] = useReducer(reducer, { liveMessages: [] });

  const { data: activeStream } = useQuery<StreamSession | null>({
    queryKey: ['active-stream'],
    queryFn: dashboardService.getActiveStream,
  });

  const isLive = Boolean(activeStream?.id && activeStream?.status === 'live');

  const { data: chatters = [], isLoading: isChattersLoading } = useQuery<Chatter[]>({
    queryKey: ['stream-chatters', activeStream?.id],
    queryFn: () => (activeStream?.id ? dashboardService.getStreamChatters(activeStream.id) : []),
    enabled: isLive,
  });

  const { data: initialChats = [], isLoading: isChatsLoading } = useQuery<ChatMessage[]>({
    queryKey: ['stream-chats', activeStream?.id],
    queryFn: () => (activeStream?.id ? dashboardService.getStreamChats(activeStream.id, 20) : []),
    enabled: isLive,
    staleTime: Number.POSITIVE_INFINITY,
  });

  const { data: initialEventsQueue } = useQuery({
    queryKey: ['events-queue'],
    queryFn: dashboardService.getEventsQueue,
    staleTime: 10000,
  });

  useEffect(() => {
    if (!isLive) {
      if (state.liveMessages.length > 0) {
        dispatch({ type: 'CLEAR_MESSAGES' });
      }
      return;
    }

    if (initialChats.length > 0 && state.liveMessages.length === 0) {
      const mapped: ChatMessage[] = [...initialChats].reverse().map((msg) => {
        let parsedParts = msg.parts;
        if (typeof parsedParts === 'string') {
          try {
            parsedParts = JSON.parse(parsedParts);
          } catch {
            parsedParts = [];
          }
        }
        let parsedEmotes = msg.emotes;
        if (typeof parsedEmotes === 'string') {
          try {
            parsedEmotes = JSON.parse(parsedEmotes);
          } catch {
            parsedEmotes = [];
          }
        }
        const userObj = (msg as unknown as { user?: Record<string, unknown> }).user;
        return {
          id: msg.id,
          streamId: msg.streamId,
          userId: msg.userId,
          username: msg.username || (userObj?.name as string) || 'Anonymous',
          youtubeChannelId: msg.youtubeChannelId || (userObj?.youtubeChannelId as string) || null,
          userAvatarUrl: msg.userAvatarUrl || (userObj?.image as string) || null,
          message: msg.message,
          emotes: Array.isArray(parsedEmotes) ? parsedEmotes : [],
          parts: Array.isArray(parsedParts) ? parsedParts : [],
          tier: msg.tier || (userObj?.tier as string) || 'bronze',
          points: msg.points || (Number(userObj?.points) || 0),
          isOwner: msg.isOwner || false,
          isModerator: msg.isModerator || false,
          isSponsor: msg.isSponsor || false,
          isVerified: msg.isVerified || false,
          publishedAt: msg.publishedAt,
        };
      });
      dispatch({ type: 'SET_MESSAGES', payload: mapped.slice(-20) });
    }
  }, [isLive, initialChats, state.liveMessages.length]);

  const { data: actionsData } = useQuery<{
    liveActions: unknown[];
    savedDeckActions: ActionItem[];
  }>({
    queryKey: ['streamerbot-actions'],
    queryFn: dashboardService.getActions,
  });

  const { data: chatAiInteractions = [], isLoading: isChatAiLoading } = useQuery<
    ChatAiInteractionSummary[]
  >({
    queryKey: ['chat-ai-interactions'],
    queryFn: () => dashboardService.getChatAiInteractions(10),
  });

  const handleNewLiveChat = useCallback(
    (msg: ChatMessage) => {
      dispatch({ type: 'APPEND_MESSAGE', payload: msg });
      queryClient.invalidateQueries({ queryKey: ['stream-chatters'] });
    },
    [queryClient]
  );

  const handleChatAiProgress = useCallback(
    (progress: ChatAiProgressEvent) => {
      queryClient.setQueryData<ChatAiInteractionSummary[]>(
        ['chat-ai-interactions'],
        (current = []) => {
          const updated: ChatAiInteractionSummary = {
            id: progress.interactionId,
            viewerName: progress.viewerName,
            viewerAvatarUrl: progress.viewerAvatarUrl,
            prompt: progress.prompt,
            answer: progress.answer,
            mood: progress.mood,
            status: progress.status,
            phase: progress.phase,
            error: progress.error,
            attempts: progress.attempts,
            createdAt: progress.createdAt,
            questionAudioUrl: progress.questionAudioUrl,
            answerAudioUrl: progress.answerAudioUrl,
          };
          return [updated, ...current.filter((interaction) => interaction.id !== updated.id)].slice(
            0,
            10
          );
        }
      );
    },
    [queryClient]
  );

  const handleStreamStarted = useCallback(
    (newStream: StreamSession) => {
      queryClient.setQueryData(['active-stream'], newStream);
      dispatch({ type: 'CLEAR_MESSAGES' });
      queryClient.invalidateQueries({ queryKey: ['stream-chatters', newStream?.id] });
      queryClient.invalidateQueries({ queryKey: ['stream-chats', newStream?.id] });
      queryClient.invalidateQueries({ queryKey: ['overlay-summary'] });
    },
    [queryClient]
  );

  const handleStreamEnded = useCallback(() => {
    queryClient.setQueryData(['active-stream'], null);
    queryClient.invalidateQueries({ queryKey: ['active-stream'] });
    queryClient.invalidateQueries({ queryKey: ['overlay-summary'] });
  }, [queryClient]);

  const {
    isSocketConnected,
    botStatus: liveBotStatus,
    activeLiveAlert,
    isAlertPaused,
    alertQueue,
    eventsQueue,
    sendChatMessage,
    triggerAction,
    triggerTestAlert,
    pauseOverlayAlerts,
    resumeOverlayAlerts,
    clearAlertQueue,
    playQueueItem,
    removeQueueItem,
  } = useDashboardRealtime(
    handleNewLiveChat,
    handleChatAiProgress,
    handleStreamStarted,
    handleStreamEnded,
    initialEventsQueue?.events || []
  );

  const startStreamMutation = useMutation({
    mutationFn: (title: string) => dashboardService.startStream(title),
    onSuccess: (newStream) => {
      queryClient.setQueryData(['active-stream'], newStream);
      dispatch({ type: 'CLEAR_MESSAGES' });
      queryClient.invalidateQueries({ queryKey: ['stream-chatters'] });
    },
  });

  const endStreamMutation = useMutation({
    mutationFn: (streamId: string) => dashboardService.endStream(streamId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-stream'] });
    },
  });

  const reconnectBotMutation = useMutation({
    mutationFn: dashboardService.reconnectStreamerbot,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['streamerbot-status'] });
    },
  });

  const triggerActionMutation = useMutation({
    mutationFn: (actionId: string) => dashboardService.triggerAction(actionId),
  });

  const triggerAlertMutation = useMutation({
    mutationFn: dashboardService.triggerTestAlert,
  });

  const sendTestChatMutation = useMutation({
    mutationFn: dashboardService.sendTestChat,
  });

  const handleStartStream = async (title: string) => {
    await startStreamMutation.mutateAsync(title);
  };

  const handleEndStream = async (streamId: string) => {
    await endStreamMutation.mutateAsync(streamId);
  };

  const handleReconnectBot = async () => {
    await reconnectBotMutation.mutateAsync();
  };

  const handleSendTestChat = async (payload: {
    message: string;
    username: string;
    isModerator?: boolean;
    isSponsor?: boolean;
  }) => {
    const sent = sendChatMessage(payload.message, payload.username);
    if (!sent) {
      await sendTestChatMutation.mutateAsync(payload);
    }
  };

  const handleTriggerAction = async (actionId: string) => {
    const sent = triggerAction(actionId);
    if (!sent) {
      await triggerActionMutation.mutateAsync(actionId);
    }
  };

  const handleTriggerTestAlert = async (payload: {
    donorName: string;
    amount: number;
    currency?: string;
    message?: string;
  }) => {
    const sent = triggerTestAlert(payload);
    if (!sent) {
      await triggerAlertMutation.mutateAsync({
        donorName: payload.donorName,
        amount: payload.amount,
        currency: payload.currency,
        message: payload.message,
      });
    }
  };

  return {
    states: {
      activeStream: activeStream || null,
      chatters,
      isChattersLoading,
      liveMessages: state.liveMessages,
      isChatsLoading,
      actions: actionsData?.savedDeckActions || [],
      chatAiInteractions,
      isChatAiLoading,
      botStatus: (liveBotStatus as StreamerbotStatus) || null,
      isSocketConnected,
      isAlertPaused,
      alertQueue,
      eventsQueue,
      activeLiveAlert,
    },
    handlers: {
      handleStartStream,
      handleEndStream,
      handleReconnectBot,
      handleSendTestChat,
      handleTriggerAction,
      handleTriggerTestAlert,
      handlePauseAlerts: pauseOverlayAlerts,
      handleResumeAlerts: resumeOverlayAlerts,
      handleClearAlertQueue: clearAlertQueue,
      handlePlayQueueItem: playQueueItem,
      handleRemoveQueueItem: removeQueueItem,
    },
  };
}
