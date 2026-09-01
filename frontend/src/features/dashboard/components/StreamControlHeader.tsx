import React, { useState } from 'react';
import {
  RiBroadcastFill,
  RiCloseLine,
  RiPlugFill,
  RiPlugLine,
  RiRefreshLine,
  RiStopFill,
  RiVideoAddFill,
} from 'react-icons/ri';
import type { StreamSession, StreamerbotStatus } from '../types/dashboard.types';

interface StreamControlHeaderProps {
  activeStream: StreamSession | null;
  botStatus: StreamerbotStatus | null;
  onStartStream: (title: string) => Promise<void>;
  onEndStream: (streamId: string) => Promise<void>;
  onReconnectBot: () => Promise<void>;
  isSSEActive: boolean;
}

export const StreamControlHeader: React.FC<StreamControlHeaderProps> = ({
  activeStream,
  botStatus,
  onStartStream,
  onEndStream,
  onReconnectBot,
  isSSEActive,
}) => {
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
    if (window.confirm('Are you sure you want to end the current live stream session?')) {
      setIsActionLoading(true);
      try {
        await onEndStream(activeStream.id);
      } finally {
        setIsActionLoading(false);
      }
    }
  };

  return (
    <header className="px-5 py-3.5 border-b border-zinc-200 bg-white/95 backdrop-blur-md sticky top-0 z-30 shadow-xs font-sans">
      <div className="flex flex-wrap items-center justify-between gap-4 max-w-[1920px] mx-auto">
        
        {/* Left: Stream Identity & Status */}
        <div className="flex items-center gap-3.5">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-mono font-bold tracking-wider uppercase transition-colors ${
              isLive
                ? 'bg-rose-50 border-rose-200 text-rose-700 shadow-sm'
                : 'bg-zinc-100 border-zinc-200 text-zinc-600'
            }`}
          >
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isLive
                  ? 'bg-rose-600 animate-pulse shadow-[0_0_8px_rgba(225,29,72,0.7)]'
                  : 'bg-zinc-400'
              }`}
            />
            <span>{isLive ? 'ON AIR' : 'STANDBY'}</span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-extrabold text-zinc-950 tracking-tight">
                {activeStream ? activeStream.title : 'No Active Stream Session'}
              </h1>
              {activeStream && (
                <span className="text-[11px] font-mono font-semibold text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
                  ID: {activeStream.id.slice(0, 8)}
                </span>
              )}
            </div>
            <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
              {activeStream
                ? `Started at ${new Date(activeStream.startedAt).toLocaleTimeString('id-ID')} • Live YouTube Telemetry Active`
                : 'Initialize a stream session to enable real-time chat archiving and engagement tracking'}
            </p>
          </div>
        </div>

        {/* Center: Streamer.bot WebSocket Status Badge */}
        <div className="flex items-center gap-3 bg-zinc-50 px-3.5 py-1.5 rounded-xl border border-zinc-200">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-1.5 rounded-lg border ${
                isBotConnected
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              {isBotConnected ? (
                <RiPlugFill className="text-base" />
              ) : (
                <RiPlugLine className="text-base" />
              )}
            </div>
            <div className="text-xs">
              <div className="font-bold text-zinc-900 flex items-center gap-1.5">
                <span>Streamer.bot:</span>
                <span
                  className={`font-mono font-bold tracking-tight ${
                    isBotConnected ? 'text-emerald-700' : 'text-amber-700'
                  }`}
                >
                  {botStatus?.status || 'DISCONNECTED'}
                </span>
              </div>
              <div className="text-[10px] text-zinc-500 font-mono">
                {botStatus?.host || '127.0.0.1'}:{botStatus?.port || 8080} • WS Real-time:{' '}
                <span className={isSSEActive ? 'text-emerald-700 font-bold' : 'text-zinc-400'}>
                  {isSSEActive ? 'CONNECTED' : 'CONNECTING'}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onReconnectBot}
            title="Reconnect to Streamer.bot"
            className="p-1.5 text-zinc-600 hover:text-zinc-950 bg-white hover:bg-zinc-100 rounded-lg border border-zinc-200/80 shadow-xs transition-all active:scale-95"
            aria-label="Reconnect to Streamer.bot"
          >
            <RiRefreshLine className="text-sm" />
          </button>
        </div>

        {/* Right: Session Control Buttons */}
        <div className="flex items-center gap-2">
          {isLive ? (
            <button
              type="button"
              onClick={handleEndClick}
              disabled={isActionLoading}
              className="studio-btn flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 shadow-xs active:scale-[0.98]"
            >
              <RiStopFill className="text-rose-600 text-sm" />
              <span>End Broadcast Session</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowStartModal(true)}
              className="studio-btn flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 shadow-tactile active:scale-[0.98]"
            >
              <RiVideoAddFill className="text-base" />
              <span>Start New Stream</span>
            </button>
          )}
        </div>
      </div>

      {/* Start Stream Modal Dialog */}
      {showStartModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-zinc-950/50 backdrop-blur-xs transition-opacity"
            onClick={() => setShowStartModal(false)}
            aria-hidden="true"
          />
          <div className="relative w-full max-w-md bg-white rounded-2xl p-6 border border-zinc-200 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-zinc-950 flex items-center justify-center text-white">
                  <RiBroadcastFill className="text-rose-500 text-base" />
                </div>
                <div>
                  <h2 className="text-sm font-extrabold text-zinc-950 tracking-tight">
                    Start Broadcast Session
                  </h2>
                  <p className="text-[11px] text-zinc-500 font-mono">
                    Track YouTube live chat and viewer activity
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowStartModal(false)}
                className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-lg hover:bg-zinc-100"
                aria-label="Close dialog"
              >
                <RiCloseLine className="text-lg" />
              </button>
            </div>

            <form onSubmit={handleStartSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1.5">
                  Stream Title / Topic
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Competitive Ranked Match + Live Q&A Discussion"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-zinc-50 border border-zinc-300 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-zinc-950 focus:border-zinc-950 font-sans"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowStartModal(false)}
                  className="studio-btn px-4 py-2 text-xs font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isActionLoading || !newTitle.trim()}
                  className="studio-btn px-5 py-2 text-xs font-bold text-white bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 shadow-tactile disabled:opacity-50"
                >
                  {isActionLoading ? 'Starting Session...' : 'Go Live Now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
