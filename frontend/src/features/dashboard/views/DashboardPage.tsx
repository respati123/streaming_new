import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import { ActionDeckPad } from '../components/ActionDeckPad';
import { ChattersList } from '../components/ChattersList';
import { LiveChatConsole } from '../components/LiveChatConsole';
import { StreamControlHeader } from '../components/StreamControlHeader';
import { useDashboardRealtime } from '../hooks/useDashboardRealtime';
import { dashboardService } from '../services/dashboardService';
import type { ChatMessage } from '../types/dashboard.types';

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const [liveMessages, setLiveMessages] = useState<ChatMessage[]>([]);

  // 1. Fetch Active Stream
  const { data: activeStream } = useQuery({
    queryKey: ['active-stream'],
    queryFn: dashboardService.getActiveStream,
  });

  // 2. Fetch Chatters for the active stream
  const { data: chatters = [], isLoading: isChattersLoading } = useQuery({
    queryKey: ['stream-chatters', activeStream?.id],
    queryFn: () => (activeStream ? dashboardService.getStreamChatters(activeStream.id) : []),
    enabled: !!activeStream?.id,
  });

  // 3. Fetch Historical Chats for active stream
  const { data: initialChats = [], isLoading: isChatsLoading } = useQuery({
    queryKey: ['stream-chats', activeStream?.id],
    queryFn: () => (activeStream ? dashboardService.getStreamChats(activeStream.id) : []),
    enabled: !!activeStream?.id,
  });

  // Sync historical chats when loaded
  useEffect(() => {
    if (initialChats.length > 0 && liveMessages.length === 0) {
      setLiveMessages([...initialChats].reverse());
    }
  }, [initialChats]);

  // 4. Fetch Actions Catalog
  const { data: actionsData } = useQuery({
    queryKey: ['streamerbot-actions'],
    queryFn: dashboardService.getActions,
  });

  // 5. Real-time WebSocket Handler (Zero HTTP Polling)
  const handleNewLiveChat = useCallback((msg: ChatMessage) => {
    setLiveMessages((prev) => [...prev, msg]);
    // Invalidate chatters list to update counters
    queryClient.invalidateQueries({ queryKey: ['stream-chatters'] });
  }, [queryClient]);

  const {
    isSocketConnected,
    botStatus: liveBotStatus,
    sendChatMessage,
    triggerAction,
    triggerTestAlert,
  } = useDashboardRealtime(handleNewLiveChat);

  const effectiveBotStatus = liveBotStatus || null;

  // Mutations
  const startStreamMutation = useMutation({
    mutationFn: (title: string) => dashboardService.startStream(title),
    onSuccess: (newStream) => {
      queryClient.setQueryData(['active-stream'], newStream);
      setLiveMessages([]);
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

  return (
    <div className="min-h-[100dvh] bg-[#fafafa] text-zinc-900 flex flex-col">
      {/* Top Console Bar */}
      <StreamControlHeader
        activeStream={activeStream || null}
        botStatus={effectiveBotStatus}
        onStartStream={async (title) => {
          await startStreamMutation.mutateAsync(title);
        }}
        onEndStream={async (id) => {
          await endStreamMutation.mutateAsync(id);
        }}
        onReconnectBot={async () => {
          await reconnectBotMutation.mutateAsync();
        }}
        isSSEActive={isSocketConnected}
      />

      {/* Main Asymmetric Broadcast Grid */}
      <main className="flex-1 p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-4 max-w-[1920px] w-full mx-auto">
        {/* Column 1: Stream Chatters & Audience (Width: 3/12) */}
        <section className="lg:col-span-3 h-[520px] lg:h-[calc(100dvh-5.5rem)] min-h-[420px]">
          <ChattersList chatters={chatters} isLoading={isChattersLoading} />
        </section>

        {/* Column 2: Live Chat Terminal Feed (Width: 5/12) */}
        <section className="lg:col-span-5 h-[600px] lg:h-[calc(100dvh-5.5rem)] min-h-[420px]">
          <LiveChatConsole
            messages={liveMessages}
            onSendTestChat={async (payload) => {
              const sent = sendChatMessage(payload.message, payload.username);
              if (!sent) {
                await sendTestChatMutation.mutateAsync(payload);
              }
            }}
            isLoading={isChatsLoading}
          />
        </section>

        {/* Column 3: Action Deck & Alert Trigger Pad (Width: 4/12) */}
        <section className="lg:col-span-4 h-[560px] lg:h-[calc(100dvh-5.5rem)] min-h-[420px]">
          <ActionDeckPad
            actions={actionsData?.savedDeckActions || []}
            onTriggerAction={async (actionId) => {
              const sent = triggerAction(actionId);
              if (!sent) {
                await triggerActionMutation.mutateAsync(actionId);
              }
            }}
            onTriggerTestAlert={async (payload) => {
              const sent = triggerTestAlert(payload);
              if (!sent) {
                await triggerAlertMutation.mutateAsync(payload);
              }
            }}
            isBotConnected={effectiveBotStatus?.status === 'CONNECTED'}
          />
        </section>
      </main>
    </div>
  );
}
