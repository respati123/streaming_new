import { ActionDeckPad } from '../components/ActionDeckPad';
import { ChatAiHistoryPanel } from '../components/ChatAiHistoryPanel';
import { ChattersList } from '../components/ChattersList';
import { LiveChatConsole } from '../components/LiveChatConsole';
import { StreamControlHeader } from '../components/StreamControlHeader';
import { useDashboardViewModel } from '../viewmodels/useDashboardViewModel';

export default function DashboardPage() {
  const { states, handlers } = useDashboardViewModel();

  return (
    <div className="min-h-[100dvh] bg-[#FAFAFA] text-[#18181B] flex flex-col font-sans">
      <StreamControlHeader
        activeStream={states.activeStream}
        botStatus={states.botStatus}
        onStartStream={handlers.handleStartStream}
        onEndStream={handlers.handleEndStream}
        onReconnectBot={handlers.handleReconnectBot}
        isSSEActive={states.isSocketConnected}
      />

      <main className="flex-1 p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-4 max-w-[1920px] w-full mx-auto">
        <section className="lg:col-span-3 h-[540px] lg:h-[calc(100dvh-5.5rem)] min-h-[440px]">
          <ChattersList chatters={states.chatters} isLoading={states.isChattersLoading} />
        </section>

        <section className="lg:col-span-5 h-[620px] lg:h-[calc(100dvh-5.5rem)] min-h-[440px]">
          <LiveChatConsole
            messages={states.liveMessages}
            onSendTestChat={handlers.handleSendTestChat}
            isLoading={states.isChatsLoading}
          />
        </section>

        <section className="lg:col-span-4 flex h-[580px] min-h-[440px] flex-col gap-4 lg:h-[calc(100dvh-5.5rem)]">
          <div className="min-h-0 flex-1">
            <ActionDeckPad
              actions={states.actions}
              onTriggerAction={handlers.handleTriggerAction}
              onTriggerTestAlert={handlers.handleTriggerTestAlert}
              isBotConnected={states.botStatus?.status === 'CONNECTED'}
            />
          </div>
          <ChatAiHistoryPanel
            interactions={states.chatAiInteractions}
            isLoading={states.isChatAiLoading}
          />
        </section>
      </main>
    </div>
  );
}
