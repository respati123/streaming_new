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
    <header className="px-5 py-3 border-b border-[#272733] bg-[#131318]/95 backdrop-blur-md sticky top-0 z-30 font-sans text-[#F4F4F6]">
      <div className="flex flex-wrap items-center justify-between gap-4 max-w-[1920px] mx-auto">
        <div className="flex items-center gap-3.5">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-mono font-bold tracking-wider uppercase transition-colors ${
              isLive
                ? 'bg-rose-950/80 border-rose-600/50 text-rose-300 shadow-sm'
                : 'bg-[#16161D] border-[#272733] text-[#A0A0AC]'
            }`}
          >
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isLive
                  ? 'bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.8)]'
                  : 'bg-zinc-600'
              }`}
            />
            <span>{isLive ? 'ON AIR' : 'STANDBY'}</span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-white tracking-tight">
                {activeStream ? activeStream.title : 'Tidak Ada Sesi Live Aktif'}
              </h1>
              {activeStream && (
                <span className="text-[11px] font-mono font-semibold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
                  ID: {activeStream.id.slice(0, 8)}
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#A0A0AC] font-mono mt-0.5">
              {activeStream
                ? `Dimulai pukul ${new Date(activeStream.startedAt).toLocaleTimeString('id-ID')} • Live YouTube Gateway Terhubung`
                : 'Inisialisasi sesi siaran untuk mengaktifkan perekaman chat & engagement realtime'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-[#16161D] px-3.5 py-1.5 rounded-xl border border-[#272733]">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-1.5 rounded-lg border ${
                isBotConnected
                  ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40'
                  : 'bg-amber-950/80 text-amber-400 border-amber-500/40'
              }`}
            >
              {isBotConnected ? (
                <RiPlugFill className="text-base" />
              ) : (
                <RiPlugLine className="text-base" />
              )}
            </div>
            <div className="text-xs">
              <div className="font-bold text-white flex items-center gap-1.5">
                <span>Streamer.bot:</span>
                <span
                  className={`font-mono font-bold tracking-tight ${
                    isBotConnected ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {botStatus?.status || 'DISCONNECTED'}
                </span>
              </div>
              <div className="text-[10px] text-[#A0A0AC] font-mono">
                {botStatus?.host || '127.0.0.1'}:{botStatus?.port || 8080} • WS Telemetry:{' '}
                <span className={isSSEActive ? 'text-emerald-400 font-bold' : 'text-zinc-500'}>
                  {isSSEActive ? 'CONNECTED' : 'CONNECTING'}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onReconnectBot}
            title="Reconnect to Streamer.bot"
            className="p-1.5 text-[#A0A0AC] hover:text-white bg-[#1A1A22] hover:bg-[#272733] rounded-lg border border-[#272733] transition-all"
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
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-rose-200 bg-rose-950 hover:bg-rose-900 border border-rose-700/60 rounded-xl transition-all"
            >
              <RiStopFill className="text-rose-400 text-sm" />
              <span>Akhiri Sesi Siaran</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowStartModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 border border-cyan-400/40 rounded-xl shadow-lg shadow-cyan-950/50 transition-all"
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
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity cursor-default w-full h-full border-none"
            onClick={() => setShowStartModal(false)}
          />
          <div className="relative w-full max-w-md bg-[#131318] rounded-2xl p-6 border border-[#272733] shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-150 text-[#F4F4F6]">
            <div className="flex items-center justify-between pb-3 border-b border-[#272733]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
                  <RiBroadcastFill className="text-base" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white tracking-tight">
                    Mulai Sesi Siaran Baru
                  </h2>
                  <p className="text-[11px] text-[#A0A0AC] font-mono">
                    Catat riwayat penonton dan trigger aksi live
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowStartModal(false)}
                className="p-1.5 text-[#A0A0AC] hover:text-white rounded-lg hover:bg-[#1A1A22]"
                aria-label="Tutup dialog"
              >
                <RiCloseLine className="text-lg" />
              </button>
            </div>

            <form onSubmit={handleStartSubmit} className="mt-4 space-y-4">
              <div>
                <label
                  htmlFor="stream-title-input"
                  className="block text-xs font-bold text-zinc-300 mb-1.5"
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
                  className="w-full px-3.5 py-2.5 text-xs bg-[#16161D] border border-[#272733] rounded-xl focus:outline-none focus:border-cyan-400 font-sans text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowStartModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#A0A0AC] hover:text-white bg-[#1A1A22] hover:bg-[#272733] border border-[#272733] rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isActionLoading || !newTitle.trim()}
                  className="px-5 py-2 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 border border-cyan-400/40 rounded-xl shadow-lg shadow-cyan-950/50 disabled:opacity-50"
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
