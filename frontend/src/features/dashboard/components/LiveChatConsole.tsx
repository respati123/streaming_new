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
    <div className="flex flex-col h-full bg-white overflow-hidden border border-slate-200 rounded-2xl shadow-xs font-sans text-slate-900">
      <div className="p-3.5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-600 shadow-xs">
            <RiChat1Line className="text-base" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-900 tracking-tight uppercase font-mono">
              Live Stream Chat Terminal
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 text-[11px] text-slate-600 font-mono cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 accent-indigo-600"
            />
            <span>Auto-scroll</span>
          </label>
          <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700">
            {messages.length} Chats
          </span>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-slate-50/60 m-2 rounded-xl border border-slate-200/80"
      >
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-500 font-mono flex flex-col items-center gap-2">
            <div className="w-5 h-5 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
            <span>Memuat pesan live chat...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 flex flex-col items-center justify-center h-full">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-indigo-600 mb-2 border border-slate-200 shadow-xs">
              <RiChat1Line className="text-xl" />
            </div>
            <p className="font-semibold text-slate-800">Belum ada obrolan dalam sesi siaran ini</p>
            <p className="text-[11px] text-slate-500 mt-1 max-w-[240px]">
              Chat YouTube live dan simulasi test akan tampil di sini secara real-time
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isAiCommand =
              msg.message?.trim().startsWith('!ai') ||
              Boolean((msg as unknown as Record<string, unknown>).isChatAiCommand);
            return (
              <div
                key={msg.id}
                className={`p-3 rounded-xl border shadow-2xs flex items-start gap-2.5 transition-colors ${
                  isAiCommand
                    ? 'bg-violet-50/70 border-violet-200 hover:border-violet-300'
                    : msg.isOwner
                      ? 'bg-rose-50/40 border-rose-200/90'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                {msg.userAvatarUrl ? (
                  <img
                    src={msg.userAvatarUrl}
                    alt={msg.username}
                    className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0 mt-0.5"
                  />
                ) : (
                  <div
                    className={`w-7 h-7 rounded-full border flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold font-mono ${
                      isAiCommand
                        ? 'bg-violet-100 border-violet-300 text-violet-700'
                        : msg.isOwner
                          ? 'bg-rose-100 border-rose-300 text-rose-700'
                          : msg.isModerator
                            ? 'bg-blue-100 border-blue-300 text-blue-700'
                            : msg.isSponsor
                              ? 'bg-emerald-100 border-emerald-300 text-emerald-700'
                              : 'bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    {msg.username.charAt(0).toUpperCase()}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                      {msg.isOwner && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-100 text-rose-700 border border-rose-200 font-mono flex items-center gap-0.5">
                          <RiVipCrownFill className="text-[10px]" /> HOST
                        </span>
                      )}
                      {msg.isModerator && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-100 text-blue-700 border border-blue-200 font-mono flex items-center gap-0.5">
                          <RiShieldCheckFill className="text-[10px]" /> MOD
                        </span>
                      )}
                      {msg.isSponsor && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 font-mono flex items-center gap-0.5">
                          <RiStarFill className="text-[10px]" /> MEMBER
                        </span>
                      )}
                      {msg.tier && msg.tier !== 'bronze' && !msg.isOwner && (
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase font-mono border ${
                            msg.tier === 'diamond'
                              ? 'bg-cyan-100 text-cyan-800 border-cyan-200'
                              : msg.tier === 'gold'
                                ? 'bg-amber-100 text-amber-800 border-amber-200'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {msg.tier}
                        </span>
                      )}
                      {isAiCommand && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-violet-100 text-violet-700 border border-violet-200 font-mono">
                          AI COMMAND
                        </span>
                      )}

                      <span className="text-xs font-bold text-slate-900 font-sans">
                        {msg.username}
                      </span>
                    </div>

                    <span className="text-[10px] text-slate-400 font-mono shrink-0">
                      {new Date(msg.publishedAt).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <EmoteMessageRenderer
                    message={msg.message}
                    emotes={msg.emotes}
                    parts={msg.parts}
                    className={`text-[13px] leading-snug break-words font-sans ${
                      isAiCommand ? 'text-violet-950 font-medium' : 'text-slate-800 font-normal'
                    }`}
                    emoteSizeClassName="inline-block h-[22px] w-[22px] mx-0.5 object-contain align-middle -mt-0.5"
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

      <form
        onSubmit={handleTestSubmit}
        className="p-2.5 border-t border-slate-200 bg-slate-50/80 flex flex-wrap items-center gap-2"
      >
        <div className="flex items-center gap-1.5">
          <input
            type="text"
            placeholder="Username"
            value={testUsername}
            onChange={(e) => setTestUsername(e.target.value)}
            className="w-28 px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-mono text-slate-900 focus:outline-none focus:border-indigo-500 shadow-2xs"
          />

          <select
            value={testRole}
            onChange={(e) => setTestRole(e.target.value as 'viewer' | 'mod' | 'member')}
            className="px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-mono text-slate-900 focus:outline-none focus:border-indigo-500 shadow-2xs"
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
          className="flex-1 min-w-[200px] px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 font-sans text-slate-900 shadow-2xs"
        />

        <button
          type="submit"
          disabled={isSending || !testText.trim()}
          className="px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 border border-indigo-500 rounded-lg shadow-sm flex items-center gap-1.5 disabled:opacity-50 transition-all"
        >
          <RiSendPlaneFill className="text-xs" />
          <span>Kirim</span>
        </button>
      </form>
    </div>
  );
}
