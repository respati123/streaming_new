import { EmoteMessageRenderer } from '@shared/components/ui/EmoteMessageRenderer';
import { useEffect, useRef, useState } from 'react';
import {
  RiChat1Line,
  RiSendPlaneFill,
  RiShieldCheckFill,
  RiStarFill,
  RiVipCrownFill,
} from 'react-icons/ri';
import type { ChatMessage } from '../types/dashboard.types';

export interface LiveChatConsoleProps {
  messages: ChatMessage[];
  onSendTestChat: (payload: {
    message: string;
    username: string;
    isModerator?: boolean;
    isSponsor?: boolean;
  }) => Promise<void>;
  isLoading: boolean;
}

export function LiveChatConsole({ messages, onSendTestChat, isLoading }: LiveChatConsoleProps) {
  const [testText, setTestText] = useState('');
  const [testUsername, setTestUsername] = useState('budi_santoso');
  const [testRole, setTestRole] = useState<'viewer' | 'mod' | 'member'>('viewer');
  const [isSending, setIsSending] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && scrollRef.current && messages.length >= 0) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, autoScroll]);

  const handleTestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testText.trim()) return;

    setIsSending(true);
    try {
      await onSendTestChat({
        message: testText.trim(),
        username: testUsername.trim() || 'Anonymous_Viewer',
        isModerator: testRole === 'mod',
        isSponsor: testRole === 'member',
      });
      setTestText('');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#131318] overflow-hidden border border-[#272733] shadow-xl rounded-2xl font-sans text-[#F4F4F6]">
      <div className="p-3.5 border-b border-[#272733] bg-[#16161D] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-950/60 border border-cyan-800/50 text-cyan-400">
            <RiChat1Line className="text-base" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-white tracking-tight uppercase font-mono">
              Live Stream Chat Terminal
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 text-[11px] text-[#A0A0AC] font-mono cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              className="rounded border-[#272733] bg-[#16161D] text-cyan-500 focus:ring-cyan-500 w-3.5 h-3.5 accent-cyan-500"
            />
            <span>Auto-scroll</span>
          </label>
          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#16161D] border border-[#272733] text-cyan-300">
            {messages.length} Chats
          </span>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 space-y-2 bg-[#0A0A0E] m-2 rounded-xl border border-[#1E1E28]"
      >
        {isLoading ? (
          <div className="p-8 text-center text-xs text-[#A0A0AC] font-mono flex flex-col items-center gap-2">
            <div className="w-5 h-5 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
            <span>Memuat pesan live chat...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#A0A0AC] flex flex-col items-center justify-center h-full">
            <div className="w-10 h-10 rounded-xl bg-[#16161D] flex items-center justify-center text-[#A0A0AC] mb-2 border border-[#272733]">
              <RiChat1Line className="text-xl text-cyan-400" />
            </div>
            <p className="font-semibold text-white">Belum ada obrolan dalam sesi siaran ini</p>
            <p className="text-[11px] text-[#A0A0AC] mt-1 max-w-[240px]">
              Chat YouTube live dan simulasi test akan tampil di sini secara real-time
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className="p-3 bg-[#131318] rounded-xl border border-[#272733] shadow-xs flex items-start gap-2.5 hover:border-cyan-500/40 transition-colors"
            >
              {msg.userAvatarUrl ? (
                <img
                  src={msg.userAvatarUrl}
                  alt={msg.username}
                  className="w-7 h-7 rounded-full object-cover border border-[#272733] shrink-0 mt-0.5"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-[#1A1A22] border border-[#272733] flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold text-cyan-400">
                  {msg.username.charAt(0).toUpperCase()}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                    {msg.isOwner && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-950/80 text-rose-300 border border-rose-600/50 font-mono flex items-center gap-0.5">
                        <RiVipCrownFill className="text-[10px] text-rose-400" /> HOST
                      </span>
                    )}
                    {msg.isModerator && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-950/80 text-indigo-300 border border-indigo-600/50 font-mono flex items-center gap-0.5">
                        <RiShieldCheckFill className="text-[10px] text-indigo-400" /> MOD
                      </span>
                    )}
                    {msg.isSponsor && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-600/50 font-mono flex items-center gap-0.5">
                        <RiStarFill className="text-[10px] text-emerald-400" /> MEMBER
                      </span>
                    )}
                    {msg.tier && msg.tier !== 'bronze' && !msg.isOwner && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase font-mono bg-cyan-950/80 text-cyan-300 border border-cyan-600/50">
                        {msg.tier}
                      </span>
                    )}

                    <span className="text-xs font-bold text-white font-sans">{msg.username}</span>
                  </div>

                  <span className="text-[10px] text-zinc-400 font-mono shrink-0">
                    {new Date(msg.publishedAt).toLocaleTimeString('id-ID')}
                  </span>
                </div>

                <EmoteMessageRenderer
                  message={msg.message}
                  emotes={msg.emotes}
                  parts={msg.parts}
                  className="text-[13px] text-zinc-200 leading-snug break-words font-sans"
                  emoteSizeClassName="inline-block h-[22px] w-[22px] mx-0.5 object-contain align-middle -mt-0.5"
                />
              </div>
            </div>
          ))
        )}
      </div>

      <form
        onSubmit={handleTestSubmit}
        className="p-2.5 border-t border-[#272733] bg-[#16161D] flex flex-wrap items-center gap-2"
      >
        <div className="flex items-center gap-1.5">
          <input
            type="text"
            placeholder="Username"
            value={testUsername}
            onChange={(e) => setTestUsername(e.target.value)}
            className="w-28 px-2.5 py-1.5 text-xs bg-[#131318] border border-[#272733] rounded-lg font-mono text-white focus:outline-none focus:border-cyan-400"
          />

          <select
            value={testRole}
            onChange={(e) => setTestRole(e.target.value as 'viewer' | 'mod' | 'member')}
            className="px-2 py-1.5 text-xs bg-[#131318] border border-[#272733] rounded-lg font-mono text-white focus:outline-none focus:border-cyan-400"
          >
            <option value="viewer">Viewer</option>
            <option value="member">Member</option>
            <option value="mod">Mod</option>
          </select>
        </div>

        <input
          type="text"
          placeholder="Ketik pesan obrolan test..."
          value={testText}
          onChange={(e) => setTestText(e.target.value)}
          className="flex-1 min-w-[200px] px-3 py-1.5 text-xs bg-[#131318] border border-[#272733] rounded-lg focus:outline-none focus:border-cyan-400 font-sans text-white"
        />

        <button
          type="submit"
          disabled={isSending || !testText.trim()}
          className="px-3.5 py-1.5 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 border border-cyan-400/40 rounded-lg shadow-md flex items-center gap-1.5 disabled:opacity-50 transition-colors"
        >
          <RiSendPlaneFill className="text-xs" />
          <span>Kirim</span>
        </button>
      </form>
    </div>
  );
}
