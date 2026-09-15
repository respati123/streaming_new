import { useState } from 'react';
import {
  RiBroadcastFill,
  RiCloseLine,
  RiPlugFill,
  RiPlugLine,
  RiRefreshLine,
  RiStopFill,
  RiVideoAddFill,
} from 'react-icons/ri';
import type { StreamerbotStatus, StreamSession } from '../types/dashboard.types';

export interface StreamControlHeaderProps {
  activeStream: StreamSession | null;
  botStatus: StreamerbotStatus | null;
  onStartStream: (title: string) => Promise<void>;
  onEndStream: (streamId: string) => Promise<void>;
  onReconnectBot: () => Promise<void>;
  isSSEActive: boolean;
}

export function StreamControlHeader({
  activeStream,
  botStatus,
  onStartStream,
  onEndStream,
  onReconnectBot,
  isSSEActive,
}: StreamControlHeaderProps) {
  const [newTitle, setNewTitle] = useState('');
  const [showStartModal, setShowStartModal] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const isLive = activeStream?.status === 'live';
  const isBotConnected = botStatus?.status === 'CONNECTED';

  const handleStartSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setIsActionLoading(true);
    try {
      await onStartStream(newTitle.trim());
      setShowStartModal(false);
      setNewTitle('');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleEndClick = async () => {
    if (!activeStream) return;
    if (window.confirm('Yakin ingin mengakhiri sesi live stream saat ini?')) {
      setIsActionLoading(true);
      try {
        await onEndStream(activeStream.id);
      } finally {
        setIsActionLoading(false);
      }
    }
  };

  return (
    <header className="px-5 py-3 border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-30 font-sans text-slate-900 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-4 max-w-[1920px] mx-auto">
        <div className="flex items-center gap-3.5">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-mono font-bold tracking-wider uppercase transition-colors ${
              isLive
                ? 'bg-rose-50 border-rose-200 text-rose-700 shadow-xs'
                : 'bg-slate-100 border-slate-200 text-slate-600'
            }`}
          >
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isLive
                  ? 'bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.7)]'
                  : 'bg-slate-400'
              }`}
            />
            <span>{isLive ? 'ON AIR' : 'STANDBY'}</span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-slate-900 tracking-tight">
                {activeStream ? activeStream.title : 'Tidak Ada Sesi Live Aktif'}
              </h1>
              {activeStream && (
                <span className="text-[11px] font-mono font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  ID: {activeStream.id.slice(0, 8)}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5">
              {activeStream
                ? `Dimulai pukul ${new Date(activeStream.startedAt).toLocaleTimeString('id-ID')} • Live YouTube Gateway Terhubung`
                : 'Inisialisasi sesi siaran untuk mengaktifkan perekaman chat & engagement realtime'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-1.5 rounded-lg border ${
                isBotConnected
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                  : 'bg-amber-50 text-amber-600 border-amber-200'
              }`}
            >
              {isBotConnected ? (
                <RiPlugFill className="text-base" />
              ) : (
                <RiPlugLine className="text-base" />
              )}
            </div>
            <div className="text-xs">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <span>Streamer.bot:</span>
                <span
                  className={`font-mono font-bold tracking-tight ${
                    isBotConnected ? 'text-emerald-700' : 'text-amber-700'
                  }`}
                >
                  {botStatus?.status || 'DISCONNECTED'}
                </span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                {botStatus?.host || '127.0.0.1'}:{botStatus?.port || 8080} • WS Telemetry:{' '}
                <span className={isSSEActive ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                  {isSSEActive ? 'CONNECTED' : 'CONNECTING'}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onReconnectBot}
            title="Reconnect to Streamer.bot"
            className="p-1.5 text-slate-500 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 transition-all shadow-xs"
            aria-label="Reconnect to Streamer.bot"
          >
            <RiRefreshLine className="text-sm" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          {isLive ? (
            <button
              type="button"
              onClick={handleEndClick}
              disabled={isActionLoading}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-300 rounded-xl shadow-xs transition-all"
            >
              <RiStopFill className="text-rose-600 text-sm" />
              <span>Akhiri Sesi Siaran</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowStartModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 border border-indigo-500 rounded-xl shadow-md shadow-indigo-500/20 transition-all active:scale-[0.98]"
            >
              <RiVideoAddFill className="text-base" />
              <span>Mulai Sesi Stream Baru</span>
            </button>
          )}
        </div>
      </div>

      {showStartModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Tutup modal dialog"
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity cursor-default w-full h-full border-none"
            onClick={() => setShowStartModal(false)}
          />
          <div className="relative w-full max-w-md bg-white rounded-2xl p-6 border border-slate-200 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-150 text-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shadow-xs">
                  <RiBroadcastFill className="text-base" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                    Mulai Sesi Siaran Baru
                  </h2>
                  <p className="text-[11px] text-slate-500 font-mono">
                    Catat riwayat penonton dan trigger aksi live
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowStartModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                aria-label="Tutup dialog"
              >
                <RiCloseLine className="text-lg" />
              </button>
            </div>

            <form onSubmit={handleStartSubmit} className="mt-4 space-y-4">
              <div>
                <label
                  htmlFor="stream-title-input"
                  className="block text-xs font-bold text-slate-700 mb-1.5"
                >
                  Judul Siaran / Topik
                </label>
                <input
                  id="stream-title-input"
                  type="text"
                  required
                  placeholder="Contoh: Ranked Mythic Push + Diskusi Live"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white font-sans text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowStartModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isActionLoading || !newTitle.trim()}
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 border border-indigo-500 rounded-xl shadow-md shadow-indigo-500/25 disabled:opacity-50 transition-all"
                >
                  {isActionLoading ? 'Memulai Sesi...' : 'Mulai Siaran Sekarang'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
