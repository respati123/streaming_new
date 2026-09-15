import { useMemo, useState } from 'react';
import {
  RiCoinLine,
  RiDeleteBinLine,
  RiFilter3Line,
  RiLoader4Line,
  RiPauseCircleFill,
  RiPlayCircleFill,
  RiPlayMiniFill,
  RiSparklingFill,
  RiStarFill,
  RiTimeLine,
} from 'react-icons/ri';
import type { UnifiedStreamEvent } from '../types/dashboard.types';

interface EventQueueAndDonationsPanelProps {
  isAlertPaused: boolean;
  eventsQueue: UnifiedStreamEvent[];
  onPauseAlerts: () => void;
  onResumeAlerts: () => void;
  onClearAlertQueue: () => void;
  onPlayQueueItem: (id: string) => void;
  onRemoveQueueItem: (id: string) => void;
  onTriggerTestAlert: (alert: {
    donorName: string;
    amount: number;
    currency?: string;
    message?: string;
  }) => void;
}

export function EventQueueAndDonationsPanel({
  isAlertPaused,
  eventsQueue = [],
  onPauseAlerts,
  onResumeAlerts,
  onClearAlertQueue,
  onPlayQueueItem,
  onRemoveQueueItem,
  onTriggerTestAlert,
}: EventQueueAndDonationsPanelProps) {
  const [filter, setFilter] = useState<'all' | 'active' | 'donation' | 'chatai'>('all');

  // Count active / pending events
  const activeEventsCount = useMemo(() => {
    return eventsQueue.filter(
      (e) =>
        e.status === 'playing' ||
        e.status === 'processing' ||
        e.status === 'ready' ||
        e.status === 'queued'
    ).length;
  }, [eventsQueue]);

  // Filtered unified events
  const filteredEvents = useMemo(() => {
    return eventsQueue.filter((e) => {
      if (filter === 'active') {
        return (
          e.status === 'playing' ||
          e.status === 'processing' ||
          e.status === 'ready' ||
          e.status === 'queued'
        );
      }
      if (filter === 'donation') return e.type === 'donation';
      if (filter === 'chatai') return e.type === 'chatai';
      return true;
    });
  }, [eventsQueue, filter]);

  // Total donation sum
  const totalDonationSum = useMemo(() => {
    return eventsQueue
      .filter((e) => e.type === 'donation')
      .reduce((acc, curr) => acc + (Number(curr.payload?.amount) || 0), 0);
  }, [eventsQueue]);

  return (
    <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden font-sans">
      {/* ─── 01. PANEL HEADER & OVERLAY PAUSE/RESUME CONTROLLER ────────────────── */}
      <div className="border-b border-slate-200 bg-slate-50/95 p-3 sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 border border-sky-200 text-sky-600 shadow-xs">
              <RiTimeLine className="text-xl" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Antrian Event Real-time</span>
                {activeEventsCount > 0 && (
                  <span className="px-2 py-0.2 rounded-full bg-sky-500 text-white text-[10px] font-black font-mono animate-pulse">
                    {activeEventsCount} Proses
                  </span>
                )}
              </h2>
              <p className="text-[11px] text-slate-500 font-mono">
                Monitoring antrian donasi, saweria, subs & Chat AI dalam satu list
              </p>
            </div>
          </div>

          {/* PAUSE / RESUME OVERLAY ALERT BUTTON */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={isAlertPaused ? onResumeAlerts : onPauseAlerts}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs shadow-sm transition-all cursor-pointer ${
                isAlertPaused
                  ? 'bg-amber-500 text-white hover:bg-amber-600 ring-2 ring-amber-400/40 animate-pulse'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
              title={
                isAlertPaused
                  ? 'Alert overlay sedang di-pause. Klik untuk memutar kembali antrian.'
                  : 'Klik untuk pause alert overlay (misal saat fight/war).'
              }
            >
              {isAlertPaused ? (
                <>
                  <RiPlayCircleFill className="text-base" />
                  <span>Resume Alerts ({activeEventsCount})</span>
                </>
              ) : (
                <>
                  <RiPauseCircleFill className="text-base" />
                  <span>Pause Alerts</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Summary Metrics Strip */}
        <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-200/80 pt-2 text-[11px] font-mono">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-slate-600">
              <span
                className={`h-2 w-2 rounded-full ${
                  isAlertPaused
                    ? 'bg-amber-500 animate-ping'
                    : 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]'
                }`}
              />
              <strong>Status:</strong>{' '}
              <span className={isAlertPaused ? 'text-amber-700 font-bold' : 'text-emerald-700 font-bold'}>
                {isAlertPaused ? 'PAUSED (BUFFERED)' : 'LIVE STREAMING'}
              </span>
            </span>

            <span className="text-slate-300">|</span>

            <span className="text-slate-600">
              Total Event: <strong>{eventsQueue.length}</strong>
            </span>
          </div>

          <div className="flex items-center gap-1 text-slate-700 font-semibold">
            <RiCoinLine className="text-amber-500" />
            <span>Donasi: Rp {totalDonationSum.toLocaleString('id-ID')}</span>
          </div>
        </div>
      </div>

      {/* ─── 02. QUICK FILTER CHIPS & BULK CONTROLS ───────────────────────────── */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-200 bg-slate-100/70 px-3 py-2">
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase mr-0.5 flex items-center gap-1">
            <RiFilter3Line /> Filter:
          </span>

          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            Semua ({eventsQueue.length})
          </button>

          <button
            type="button"
            onClick={() => setFilter('active')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
              filter === 'active'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-pulse" />
            <span>Antrian Aktif ({activeEventsCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setFilter('donation')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
              filter === 'donation'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <RiCoinLine />
            <span>Donasi</span>
          </button>

          <button
            type="button"
            onClick={() => setFilter('chatai')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
              filter === 'chatai'
                ? 'bg-violet-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <RiSparklingFill />
            <span>Chat AI</span>
          </button>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {activeEventsCount > 0 && (
            <button
              type="button"
              onClick={onClearAlertQueue}
              className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
              title="Hapus antrian yang belum diputar"
            >
              <RiDeleteBinLine className="text-xs" />
              <span>Clear</span>
            </button>
          )}

          <button
            type="button"
            onClick={() =>
              onTriggerTestAlert({
                donorName: 'Sultan Tester',
                amount: 50000,
                message: 'Semangat push rank sampai Immortal bro! 🔥⚡',
              })
            }
            className="px-2 py-0.5 rounded-md bg-white border border-slate-200 hover:bg-slate-50 text-[10px] font-mono font-bold text-slate-700 transition-colors shadow-2xs cursor-pointer"
          >
            + Test
          </button>
        </div>
      </div>

      {/* ─── 03. UNIFIED REALTIME EVENT QUEUE LIST ─────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {filteredEvents.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <RiTimeLine className="mx-auto text-3xl mb-2 text-slate-300" />
            <p className="text-xs font-semibold text-slate-600">Belum ada antrian event saat ini.</p>
            <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
              Semua event donasi, saweria QRIS, subs, dan Chat AI (!chatai) akan otomatis masuk ke list ini secara real-time.
            </p>
          </div>
        ) : (
          filteredEvents.map((item, idx) => {
            const isPlaying = item.status === 'playing';
            const isProcessing = item.status === 'processing';
            const isReady = item.status === 'ready';
            const isQueued = item.status === 'queued';
            const isFailed = item.status === 'failed';

            return (
              <div
                key={item.id || idx}
                className={`p-3 rounded-xl border transition-all shadow-2xs ${
                  isPlaying
                    ? 'border-amber-400 bg-amber-50/90 ring-2 ring-amber-400/40 shadow-sm animate-in fade-in'
                    : isProcessing
                      ? 'border-violet-300 bg-violet-50/80 ring-1 ring-violet-300/60'
                      : isReady
                        ? 'border-emerald-300 bg-emerald-50/70'
                        : isQueued
                          ? 'border-sky-200 bg-sky-50/60'
                          : isFailed
                            ? 'border-rose-200 bg-rose-50/60 opacity-80'
                            : 'border-slate-200 bg-white hover:border-slate-300 opacity-90'
                }`}
              >
                {/* Event Header Strip */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {/* Event Type Icon */}
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg shadow-2xs ${
                        item.type === 'donation'
                          ? 'bg-emerald-500 text-white'
                          : item.type === 'chatai'
                            ? 'bg-violet-600 text-white'
                            : 'bg-sky-500 text-white'
                      }`}
                    >
                      {item.type === 'donation' ? (
                        <RiCoinLine className="text-base" />
                      ) : item.type === 'chatai' ? (
                        <RiSparklingFill className="text-base" />
                      ) : (
                        <RiStarFill className="text-base" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Status Badge */}
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-black uppercase tracking-wider flex items-center gap-1 ${
                            isPlaying
                              ? 'bg-amber-200 text-amber-900 animate-pulse'
                              : isProcessing
                                ? 'bg-violet-200 text-violet-900'
                                : isReady
                                  ? 'bg-emerald-200 text-emerald-900'
                                  : isQueued
                                    ? 'bg-sky-200 text-sky-900'
                                    : isFailed
                                      ? 'bg-rose-200 text-rose-900'
                                      : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {isPlaying && <span className="h-1.5 w-1.5 rounded-full bg-red-600 animate-ping" />}
                          {isProcessing && <RiLoader4Line className="animate-spin text-[10px]" />}
                          <span>
                            {isPlaying
                              ? '🔴 LIVE OVERLAY'
                              : isProcessing
                                ? '🟡 PROCESSING'
                                : isReady
                                  ? '🟢 READY'
                                  : isQueued
                                    ? '⏳ QUEUED'
                                    : isFailed
                                      ? '❌ FAILED'
                                      : '✅ COMPLETED'}
                          </span>
                        </span>

                        <span className="text-xs font-bold text-slate-900 truncate">
                          {item.author.name}
                        </span>

                        {item.type === 'donation' && item.payload.amount !== undefined && (
                          <span className="text-[11px] font-extrabold text-emerald-700 font-mono px-1.5 py-0.2 rounded bg-emerald-100">
                            Rp {Number(item.payload.amount).toLocaleString('id-ID')}
                          </span>
                        )}

                        {item.type === 'chatai' && item.payload.mood && (
                          <span className="text-[9px] font-mono px-1 rounded bg-violet-100 text-violet-800 font-semibold">
                            {item.payload.mood}
                          </span>
                        )}
                      </div>

                      {/* Event Subtitle / Category */}
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5 truncate">
                        {item.type === 'donation'
                          ? `Donasi Saweria • Template: ${item.payload.template || 'Default'}`
                          : item.type === 'chatai'
                            ? `Stream Oracle AI Prompt • ${item.progressPhase || 'Queue'}`
                            : 'YouTube Subscriber Event'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] font-mono text-slate-400">
                      {new Date(item.createdAt).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </span>

                    {/* Play Now Button for Queued / Ready items */}
                    {(isQueued || isReady) && (
                      <button
                        type="button"
                        onClick={() => onPlayQueueItem(item.id)}
                        className="flex items-center gap-0.5 px-2 py-1 rounded-md bg-sky-600 hover:bg-sky-700 text-white text-[10px] font-bold transition-colors shadow-2xs cursor-pointer"
                        title="Putar sekarang ke layar overlay"
                      >
                        <RiPlayMiniFill className="text-xs" />
                        <span>Play</span>
                      </button>
                    )}

                    {/* Delete button for non-playing items */}
                    {!isPlaying && (
                      <button
                        type="button"
                        onClick={() => onRemoveQueueItem(item.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Hapus dari antrian"
                      >
                        <RiDeleteBinLine className="text-xs" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Event Message / AI Content Box */}
                {item.type === 'donation' && item.payload.message && (
                  <div className="mt-2 text-xs text-slate-700 bg-white/80 p-2 rounded-lg border border-slate-200/80 italic shadow-2xs">
                    "{item.payload.message}"
                  </div>
                )}

                {item.type === 'chatai' && (
                  <div className="mt-2 space-y-1 text-xs">
                    <div className="text-slate-800 font-medium bg-white/70 p-2 rounded-lg border border-slate-200/80">
                      <span className="font-bold text-violet-700 font-mono">Q: </span>
                      <span>{item.payload.prompt}</span>
                    </div>

                    {item.payload.answer && (
                      <div className="text-violet-950 bg-violet-100/70 p-2 rounded-lg border border-violet-200/70">
                        <span className="font-bold text-violet-800 font-mono">A: </span>
                        <span>{item.payload.answer}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
