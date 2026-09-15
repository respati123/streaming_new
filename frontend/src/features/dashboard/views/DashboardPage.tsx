import { ChattersList } from '../components/ChattersList';
import { EventQueueAndDonationsPanel } from '../components/EventQueueAndDonationsPanel';
import { LiveChatConsole } from '../components/LiveChatConsole';
import { StreamControlHeader } from '../components/StreamControlHeader';
import { useDashboardViewModel } from '../viewmodels/useDashboardViewModel';

export default function DashboardPage() {
  const { states, handlers } = useDashboardViewModel();

  return (
    <div className="min-h-[100dvh] bg-[#F8FAFC] text-slate-900 flex flex-col font-sans">
      <StreamControlHeader
        activeStream={states.activeStream}
        botStatus={states.botStatus}
        onStartStream={handlers.handleStartStream}
        onEndStream={handlers.handleEndStream}
        onReconnectBot={handlers.handleReconnectBot}
        isSSEActive={states.isSocketConnected}
      />

      <main className="flex-1 p-3 sm:p-4 lg:p-5 grid grid-cols-1 lg:grid-cols-12 gap-4 max-w-[1920px] w-full mx-auto">
        {/* COLUMN 1: AUDIENCE & VIEWERS MONITOR (3 COLS) */}
        <section className="lg:col-span-3 h-[540px] lg:h-[calc(100dvh-5.5rem)] min-h-[440px]">
          <ChattersList chatters={states.chatters} isLoading={states.isChattersLoading} />
        </section>

        {/* COLUMN 2: LIVE CHAT CONSOLE (4 COLS) */}
        <section className="lg:col-span-4 h-[620px] lg:h-[calc(100dvh-5.5rem)] min-h-[440px]">
          <LiveChatConsole
            messages={states.liveMessages}
            onSendTestChat={handlers.handleSendTestChat}
            isLoading={states.isChatsLoading}
          />
        </section>

        {/* COLUMN 3: REALTIME UNIFIED EVENT QUEUE & OVERLAY CONTROLS (5 COLS) */}
        <section className="lg:col-span-5 h-[620px] lg:h-[calc(100dvh-5.5rem)] min-h-[440px]">
          <EventQueueAndDonationsPanel
            isAlertPaused={states.isAlertPaused}
            eventsQueue={states.eventsQueue}
            onPauseAlerts={handlers.handlePauseAlerts}
            onResumeAlerts={handlers.handleResumeAlerts}
            onClearAlertQueue={handlers.handleClearAlertQueue}
            onPlayQueueItem={handlers.handlePlayQueueItem}
            onRemoveQueueItem={handlers.handleRemoveQueueItem}
            onTriggerTestAlert={handlers.handleTriggerTestAlert}
          />
        </section>
      </main>
    </div>
  );
}
