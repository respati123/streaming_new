import { apiClient } from '@core/http/api-client';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import {
  RiArrowRightSLine,
  RiBroadcastFill,
  RiChat1Line,
  RiCheckLine,
  RiCloseLine,
  RiFileCopyLine,
  RiFilter3Line,
  RiHistoryLine,
  RiSearchLine,
  RiShieldUserLine,
  RiTimeLine,
  RiVipCrownLine,
} from 'react-icons/ri';
import { dashboardService } from '../services/dashboardService';
import type { ChatMessage, Chatter, StreamSession } from '../types/dashboard.types';

export default function StreamsHistoryPage() {
  const [selectedStream, setSelectedStream] = useState<StreamSession | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'owner' | 'moderator' | 'sponsor'>('all');
  const [copiedTranscript, setCopiedTranscript] = useState(false);

  // 1. Fetch All Stream Sessions
  const { data: streams = [], isLoading } = useQuery<StreamSession[]>({
    queryKey: ['all-streams'],
    queryFn: async () => {
      const res = await apiClient.get<{ data: StreamSession[] }>('/streams');
      return res.data.data;
    },
  });

  // 2. Fetch Selected Stream Messages
  const { data: streamChats = [], isLoading: isChatsLoading } = useQuery<ChatMessage[]>({
    queryKey: ['stream-archive-chats', selectedStream?.id],
    queryFn: () => (selectedStream ? dashboardService.getStreamChats(selectedStream.id) : []),
    enabled: !!selectedStream?.id,
  });

  // 3. Fetch Selected Stream Chatters
  const { data: streamChatters = [] } = useQuery<Chatter[]>({
    queryKey: ['stream-archive-chatters', selectedStream?.id],
    queryFn: () => (selectedStream ? dashboardService.getStreamChatters(selectedStream.id) : []),
    enabled: !!selectedStream?.id,
  });

  // Filter messages based on search & role
  const filteredMessages = useMemo(() => {
    return streamChats.filter((msg) => {
      const matchSearch =
        searchQuery.trim() === '' ||
        msg.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.message.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchSearch) return false;

      if (roleFilter === 'owner') return msg.isOwner;
      if (roleFilter === 'moderator') return msg.isModerator;
      if (roleFilter === 'sponsor') return msg.isSponsor;

      return true;
    });
  }, [streamChats, searchQuery, roleFilter]);

  // Copy transcript to clipboard
  const handleCopyTranscript = () => {
    if (!selectedStream || streamChats.length === 0) return;

    const header = `=== Stream Chat Transcript: ${selectedStream.title} ===\nSession ID: ${selectedStream.id}\nStarted: ${new Date(selectedStream.startedAt).toLocaleString('id-ID')}\nTotal Messages: ${streamChats.length}\n\n`;
    const body = streamChats
      .map((msg) => {
        const time = new Date(msg.publishedAt).toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
        const role = msg.isOwner ? '[STREAMER]' : msg.isModerator ? '[MOD]' : msg.isSponsor ? '[MEMBER]' : '';
        return `[${time}] ${role} ${msg.username}: ${msg.message}`;
      })
      .join('\n');

    navigator.clipboard.writeText(header + body);
    setCopiedTranscript(true);
    setTimeout(() => setCopiedTranscript(false), 2000);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-zinc-950 tracking-tight flex items-center gap-2.5">
            <div className="p-1.5 rounded-xl bg-zinc-950 text-white">
              <RiHistoryLine className="text-xl" />
            </div>
            <span>Live Stream Sessions Archive</span>
          </h1>
          <p className="text-xs text-zinc-500 font-mono mt-1">
            Klik pada baris sesi siaran untuk melihat seluruh arsip riwayat pesan chat dan engagement
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-bold px-3.5 py-1.5 rounded-xl bg-white border border-zinc-200 text-zinc-800 shadow-xs">
            Total Sessions: {streams.length}
          </span>
        </div>
      </div>

      {/* Streams Table */}
      <div className="studio-card bg-white border border-zinc-200/90 shadow-tactile rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50/80 font-mono text-[11px] text-zinc-500 uppercase tracking-wider">
                <th className="py-3 px-4 font-bold">Status</th>
                <th className="py-3 px-4 font-bold">Stream Title / UUID</th>
                <th className="py-3 px-4 font-bold">Started At</th>
                <th className="py-3 px-4 font-bold">Ended At</th>
                <th className="py-3 px-4 font-bold text-right">Messages</th>
                <th className="py-3 px-4 font-bold text-right">Unique Chatters</th>
                <th className="py-3 px-4 font-bold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-400 font-mono">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-5 h-5 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin" />
                      <span>Loading stream sessions archive...</span>
                    </div>
                  </td>
                </tr>
              ) : streams.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-400">
                    <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 mx-auto mb-2 border border-zinc-200">
                      <RiBroadcastFill className="text-xl text-rose-500" />
                    </div>
                    <p className="font-semibold text-zinc-700">No stream sessions recorded</p>
                    <p className="text-[11px] text-zinc-400 mt-1">
                      Start your first live broadcast session to begin tracking history
                    </p>
                  </td>
                </tr>
              ) : (
                streams.map((s) => {
                  const isLive = s.status === 'live';
                  const isSelected = selectedStream?.id === s.id;
                  return (
                    <tr
                      key={s.id}
                      onClick={() => setSelectedStream(s)}
                      className={`hover:bg-zinc-50/90 transition-all cursor-pointer group select-none ${
                        isSelected ? 'bg-zinc-100/80 ring-1 ring-inset ring-zinc-900/10' : ''
                      }`}
                    >
                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-md text-[10px] font-bold font-mono inline-flex items-center gap-1.5 ${
                            isLive
                              ? 'bg-rose-50 text-rose-700 border border-rose-200 shadow-xs'
                              : 'bg-zinc-100 text-zinc-600 border border-zinc-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isLive
                                ? 'bg-rose-600 animate-pulse shadow-[0_0_6px_rgba(225,29,72,0.8)]'
                                : 'bg-zinc-400'
                            }`}
                          />
                          {s.status.toUpperCase()}
                        </span>
                      </td>

                      {/* Title & ID */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-zinc-950 group-hover:text-black flex items-center gap-1.5">
                          <span>{s.title}</span>
                          <span className="opacity-0 group-hover:opacity-100 text-[10px] text-zinc-500 font-mono transition-opacity">
                            (Klik untuk lihat pesan)
                          </span>
                        </div>
                        <div className="text-[11px] text-zinc-400 font-mono">
                          ID: {s.id}
                        </div>
                      </td>

                      {/* Started At */}
                      <td className="py-3.5 px-4 font-mono text-zinc-600 text-[11px]">
                        {new Date(s.startedAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>

                      {/* Ended At */}
                      <td className="py-3.5 px-4 font-mono text-zinc-500 text-[11px]">
                        {s.endedAt
                          ? new Date(s.endedAt).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '— (Active Broadcast)'}
                      </td>

                      {/* Total Messages */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-zinc-900">
                        <span className="px-2 py-0.5 rounded-md bg-zinc-100 group-hover:bg-white border border-zinc-200 text-[11px]">
                          {s.totalMessages}
                        </span>
                      </td>

                      {/* Total Chatters */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-zinc-900">
                        <span className="px-2 py-0.5 rounded-md bg-zinc-100 group-hover:bg-white border border-zinc-200 text-[11px]">
                          {s.totalChatters || '—'}
                        </span>
                      </td>

                      {/* Action Button */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedStream(s);
                          }}
                          className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-white group-hover:bg-zinc-950 group-hover:text-white text-zinc-700 border border-zinc-200 shadow-xs transition-all flex items-center gap-1 mx-auto"
                        >
                          <RiChat1Line className="text-xs" />
                          <span>Lihat Pesan</span>
                          <RiArrowRightSLine className="text-xs" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── STREAM MESSAGES DRAWER / MODAL ────────────────────────────────────── */}
      {selectedStream && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-zinc-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => setSelectedStream(null)}
            aria-hidden="true"
          />

          {/* Modal Card */}
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-zinc-200 z-10 flex flex-col overflow-hidden font-sans animate-scaleUp">
            {/* Modal Header */}
            <div className="p-5 border-b border-zinc-200 bg-zinc-50/80 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-zinc-950 text-white shadow-sm">
                  <RiChat1Line className="text-xl" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-extrabold text-zinc-950 tracking-tight">
                      {selectedStream.title}
                    </h2>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        selectedStream.status === 'live'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-zinc-200/80 text-zinc-700 border border-zinc-300'
                      }`}
                    >
                      {selectedStream.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 font-mono mt-0.5 flex items-center gap-2">
                    <span>ID: {selectedStream.id}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <RiTimeLine className="text-xs" />
                      {new Date(selectedStream.startedAt).toLocaleTimeString('id-ID')}
                    </span>
                  </p>
                </div>
              </div>

              {/* Action Buttons & Close */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyTranscript}
                  disabled={streamChats.length === 0}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white hover:bg-zinc-100 text-zinc-800 border border-zinc-200 shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50"
                  title="Copy full chat transcript"
                >
                  {copiedTranscript ? (
                    <>
                      <RiCheckLine className="text-emerald-600 text-sm" />
                      <span className="text-emerald-700">Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <RiFileCopyLine className="text-zinc-600 text-sm" />
                      <span>Salin Transkrip</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedStream(null)}
                  className="p-1.5 text-zinc-400 hover:text-zinc-900 rounded-lg hover:bg-zinc-200/80 transition-colors"
                  aria-label="Close dialog"
                >
                  <RiCloseLine className="text-xl" />
                </button>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="px-5 py-3 bg-zinc-100/50 border-b border-zinc-200 flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 font-mono">
                  <span className="text-zinc-500 font-medium">Total Pesan:</span>
                  <span className="font-bold text-zinc-950 bg-white px-2 py-0.5 rounded border border-zinc-200">
                    {streamChats.length}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 font-mono">
                  <span className="text-zinc-500 font-medium">Chatters Unik:</span>
                  <span className="font-bold text-zinc-950 bg-white px-2 py-0.5 rounded border border-zinc-200">
                    {streamChatters.length}
                  </span>
                </div>
              </div>

              {/* Search & Filter Controls */}
              <div className="flex items-center gap-2 flex-1 max-w-md justify-end">
                {/* Search Input */}
                <div className="relative w-full max-w-xs">
                  <RiSearchLine className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 text-sm" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari pesan atau username..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-zinc-200 bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900 font-sans"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
                    >
                      <RiCloseLine className="text-sm" />
                    </button>
                  )}
                </div>

                {/* Role Filter Pills */}
                <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-zinc-200 text-[11px] font-medium">
                  <button
                    type="button"
                    onClick={() => setRoleFilter('all')}
                    className={`px-2 py-0.5 rounded ${
                      roleFilter === 'all'
                        ? 'bg-zinc-900 text-white font-bold'
                        : 'text-zinc-600 hover:bg-zinc-100'
                    }`}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    onClick={() => setRoleFilter('owner')}
                    className={`px-2 py-0.5 rounded ${
                      roleFilter === 'owner'
                        ? 'bg-amber-500 text-white font-bold'
                        : 'text-zinc-600 hover:bg-zinc-100'
                    }`}
                  >
                    Host
                  </button>
                  <button
                    type="button"
                    onClick={() => setRoleFilter('moderator')}
                    className={`px-2 py-0.5 rounded ${
                      roleFilter === 'moderator'
                        ? 'bg-blue-600 text-white font-bold'
                        : 'text-zinc-600 hover:bg-zinc-100'
                    }`}
                  >
                    Mod
                  </button>
                  <button
                    type="button"
                    onClick={() => setRoleFilter('sponsor')}
                    className={`px-2 py-0.5 rounded ${
                      roleFilter === 'sponsor'
                        ? 'bg-emerald-600 text-white font-bold'
                        : 'text-zinc-600 hover:bg-zinc-100'
                    }`}
                  >
                    Member
                  </button>
                </div>
              </div>
            </div>

            {/* Chat Messages List */}
            <div className="flex-1 p-5 overflow-y-auto max-h-[55vh] space-y-3 bg-[#fafafa]">
              {isChatsLoading ? (
                <div className="py-16 text-center text-zinc-400 font-mono">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-6 h-6 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin" />
                    <span>Mengambil seluruh pesan arsip...</span>
                  </div>
                </div>
              ) : filteredMessages.length === 0 ? (
                <div className="py-16 text-center text-zinc-400">
                  <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 mx-auto mb-2 border border-zinc-200">
                    <RiFilter3Line className="text-2xl" />
                  </div>
                  <p className="font-semibold text-zinc-700">
                    {searchQuery || roleFilter !== 'all'
                      ? 'Tidak ada pesan yang sesuai filter'
                      : 'Belum ada pesan tercatat di sesi ini'}
                  </p>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    {searchQuery
                      ? 'Coba gunakan kata kunci pencarian yang berbeda'
                      : 'Semua pesan chat dari siaran ini akan tersimpan otomatis di database'}
                  </p>
                </div>
              ) : (
                filteredMessages.map((msg, index) => {
                  const isHost = msg.isOwner;
                  const isMod = msg.isModerator;
                  const isMember = msg.isSponsor;

                  return (
                    <div
                      key={msg.id || index}
                      className={`p-3.5 rounded-xl border transition-all flex items-start gap-3 bg-white ${
                        isHost
                          ? 'border-amber-200 bg-amber-50/20 shadow-xs'
                          : isMod
                            ? 'border-blue-200 bg-blue-50/20'
                            : isMember
                              ? 'border-emerald-200 bg-emerald-50/20'
                              : 'border-zinc-200/90 shadow-2xs hover:border-zinc-300'
                      }`}
                    >
                      {/* Avatar / Badge */}
                      <div className="shrink-0">
                        {msg.userAvatarUrl ? (
                          <img
                            src={msg.userAvatarUrl}
                            alt={msg.username}
                            className="w-8 h-8 rounded-full object-cover ring-1 ring-zinc-200"
                          />
                        ) : (
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                              isHost
                                ? 'bg-amber-500 text-white'
                                : isMod
                                  ? 'bg-blue-600 text-white'
                                  : isMember
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-zinc-200 text-zinc-700'
                            }`}
                          >
                            {msg.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-zinc-950 text-xs">
                              {msg.username}
                            </span>

                            {isHost && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-0.5">
                                <RiVipCrownLine className="text-[10px]" />
                                HOST
                              </span>
                            )}
                            {isMod && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-blue-100 text-blue-800 border border-blue-300 flex items-center gap-0.5">
                                <RiShieldUserLine className="text-[10px]" />
                                MOD
                              </span>
                            )}
                            {isMember && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                MEMBER
                              </span>
                            )}
                          </div>

                          {/* Timestamp */}
                          <span className="text-[10px] font-mono text-zinc-400">
                            {new Date(msg.publishedAt).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                            })}
                          </span>
                        </div>

                        {/* Message Text */}
                        <div className="mt-1 text-xs text-zinc-800 leading-relaxed font-sans break-words select-text">
                          {msg.message}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between text-xs text-zinc-500">
              <span className="font-mono text-[11px]">
                Menampilkan {filteredMessages.length} dari {streamChats.length} pesan
              </span>
              <button
                type="button"
                onClick={() => setSelectedStream(null)}
                className="px-4 py-1.5 rounded-lg bg-zinc-950 text-white font-semibold hover:bg-zinc-800 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
