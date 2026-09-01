import React, { useEffect, useRef, useState } from 'react';
import {
  RiChat1Line,
  RiSendPlaneFill,
  RiShieldCheckFill,
  RiStarFill,
  RiVipCrownFill,
} from 'react-icons/ri';
import type { ChatMessage } from '../types/dashboard.types';
import { EmoteMessageRenderer } from '@shared/components/ui/EmoteMessageRenderer';

interface LiveChatConsoleProps {
  messages: ChatMessage[];
  onSendTestChat: (payload: {
    message: string;
    username: string;
    isModerator?: boolean;
    isSponsor?: boolean;
  }) => Promise<void>;
  isLoading: boolean;
}

export const LiveChatConsole: React.FC<LiveChatConsoleProps> = ({
  messages,
  onSendTestChat,
  isLoading,
}) => {
  const [testText, setTestText] = useState('');
  const [testUsername, setTestUsername] = useState('budi_santoso');
  const [testRole, setTestRole] = useState<'viewer' | 'mod' | 'member'>('viewer');
  const [isSending, setIsSending] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
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
    <div className="studio-card flex flex-col h-full bg-white overflow-hidden border border-zinc-200/90 shadow-tactile rounded-xl font-sans">
      {/* Console Header */}
      <div className="p-3.5 border-b border-zinc-200 bg-zinc-50/70 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1 rounded-lg bg-zinc-100 border border-zinc-200 text-zinc-700">
            <RiChat1Line className="text-base" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-zinc-950 tracking-tight uppercase font-mono">
              Live Stream Chat Terminal
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 text-[11px] text-zinc-500 font-mono cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-950 w-3.5 h-3.5 accent-zinc-950"
            />
            <span>Auto-scroll</span>
          </label>
          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-white border border-zinc-200 text-zinc-800 shadow-xs">
            {messages.length} Chats
          </span>
        </div>
      </div>

      {/* Messages Feed */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 space-y-2 bg-zinc-50/60 studio-panel-inset m-2.5"
      >
        {isLoading ? (
          <div className="p-8 text-center text-xs text-zinc-400 font-mono flex flex-col items-center gap-2">
            <div className="w-5 h-5 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin" />
            <span>Loading live chat messages...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="p-12 text-center text-xs text-zinc-400 flex flex-col items-center justify-center h-full">
            <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 mb-2 border border-zinc-200">
              <RiChat1Line className="text-xl" />
            </div>
            <p className="font-semibold text-zinc-700">No chat messages in this session</p>
            <p className="text-[11px] text-zinc-400 mt-1 max-w-[240px]">
              Live YouTube chats and test messages will stream here in real-time
            </p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={msg.id || idx}
              className="chat-bubble-enter p-3 bg-white rounded-xl border border-zinc-200/90 shadow-xs flex items-start gap-2.5 hover:border-zinc-300 transition-colors"
            >
              {/* Chatter Avatar */}
              {msg.userAvatarUrl ? (
                <img
                  src={msg.userAvatarUrl}
                  alt={msg.username}
                  className="w-7 h-7 rounded-full object-cover border border-zinc-200 shrink-0 mt-0.5"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold text-zinc-600">
                  {msg.username.charAt(0).toUpperCase()}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                    {msg.isOwner && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-900 border border-amber-200 font-mono flex items-center gap-0.5">
                        <RiVipCrownFill className="text-[10px]" /> HOST
                      </span>
                    )}
                    {msg.isModerator && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono flex items-center gap-0.5">
                        <RiShieldCheckFill className="text-[10px]" /> MOD
                      </span>
                    )}
                    {msg.isSponsor && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-50 text-rose-800 border border-rose-200 font-mono flex items-center gap-0.5">
                        <RiStarFill className="text-[10px]" /> MEMBER
                      </span>
                    )}
                    {msg.tier && msg.tier !== 'bronze' && !msg.isOwner && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase font-mono bg-cyan-50 text-cyan-800 border border-cyan-200">
                        {msg.tier}
                      </span>
                    )}

                    <span className="text-xs font-black text-zinc-950 font-sans">
                      {msg.username}
                    </span>
                  </div>

                  <span className="text-[10px] text-zinc-400 font-mono shrink-0">
                    {new Date(msg.publishedAt).toLocaleTimeString('id-ID')}
                  </span>
                </div>

                <EmoteMessageRenderer
                  message={msg.message}
                  emotes={msg.emotes}
                  parts={msg.parts}
                  className="text-[13px] text-zinc-800 leading-snug break-words font-sans"
                  emoteSizeClassName="inline-block h-[22px] w-[22px] mx-0.5 object-contain align-middle -mt-0.5"
                />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Test Message Injector Bar */}
      <form
        onSubmit={handleTestSubmit}
        className="p-2.5 border-t border-zinc-200/80 bg-white flex flex-wrap items-center gap-2"
      >
        <div className="flex items-center gap-1.5">
          <input
            type="text"
            placeholder="Username"
            value={testUsername}
            onChange={(e) => setTestUsername(e.target.value)}
            className="w-28 px-2.5 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-lg font-mono focus:outline-none focus:bg-white focus:ring-1 focus:ring-zinc-950"
          />

          <select
            value={testRole}
            onChange={(e) => setTestRole(e.target.value as any)}
            className="px-2 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-lg font-mono focus:outline-none focus:bg-white focus:ring-1 focus:ring-zinc-950 text-zinc-700"
          >
            <option value="viewer">Viewer</option>
            <option value="member">Member</option>
            <option value="mod">Mod</option>
          </select>
        </div>

        <input
          type="text"
          placeholder="Send a test broadcast chat message..."
          value={testText}
          onChange={(e) => setTestText(e.target.value)}
          className="flex-1 min-w-[200px] px-3 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:bg-white focus:ring-1 focus:ring-zinc-950 font-sans"
        />

        <button
          type="submit"
          disabled={isSending || !testText.trim()}
          className="studio-btn px-3.5 py-1.5 text-xs font-bold text-white bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 shadow-tactile flex items-center gap-1.5 disabled:opacity-50 active:scale-[0.98]"
        >
          <RiSendPlaneFill className="text-xs" />
          <span>Send</span>
        </button>
      </form>
    </div>
  );
};
