import React, { useMemo, useState } from 'react';
import {
  RiGroupLine,
  RiSearchLine,
  RiShieldCheckFill,
  RiStarFill,
  RiUserLine,
  RiVipCrownFill,
} from 'react-icons/ri';
import type { Chatter } from '../types/dashboard.types';

interface ChattersListProps {
  chatters: Chatter[];
  isLoading: boolean;
}

export const ChattersList: React.FC<ChattersListProps> = ({ chatters, isLoading }) => {
  const [search, setSearch] = useState('');

  const filteredChatters = useMemo(() => {
    if (!search.trim()) return chatters;
    const q = search.toLowerCase();
    return chatters.filter(
      (c) =>
        c.username.toLowerCase().includes(q) ||
        (c.youtubeChannelId && c.youtubeChannelId.toLowerCase().includes(q))
    );
  }, [chatters, search]);

  return (
    <div className="studio-card flex flex-col h-full bg-white overflow-hidden border border-zinc-200/90 shadow-tactile rounded-xl font-sans">
      {/* Panel Header */}
      <div className="p-3.5 border-b border-zinc-200 bg-zinc-50/70 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1 rounded-lg bg-zinc-100 border border-zinc-200 text-zinc-700">
            <RiGroupLine className="text-base" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-zinc-950 tracking-tight uppercase font-mono">
              Audience & Chatters
            </h2>
          </div>
        </div>
        <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-white border border-zinc-200 text-zinc-800 shadow-xs">
          {chatters.length} Live
        </span>
      </div>

      {/* Search Filter */}
      <div className="p-2.5 border-b border-zinc-200/70 bg-white">
        <div className="relative">
          <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-xs" />
          <input
            type="text"
            placeholder="Search handle or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:bg-white focus:ring-1 focus:ring-zinc-950 font-sans placeholder:text-zinc-400"
          />
        </div>
      </div>

      {/* Chatters List Container */}
      <div className="flex-1 overflow-y-auto divide-y divide-zinc-100 p-1">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-zinc-400 font-mono flex flex-col items-center gap-2">
            <div className="w-5 h-5 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin" />
            <span>Loading stream chatters...</span>
          </div>
        ) : filteredChatters.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-400 flex flex-col items-center justify-center h-full">
            <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 mb-2 border border-zinc-200">
              <RiUserLine className="text-xl" />
            </div>
            <p className="font-semibold text-zinc-700">No chatters recorded</p>
            <p className="text-[11px] text-zinc-400 mt-1 max-w-[200px]">
              Chatters from YouTube stream will appear here in real-time
            </p>
          </div>
        ) : (
          filteredChatters.map((chatter, idx) => (
            <div
              key={`${chatter.username}-${idx}`}
              className="p-2.5 hover:bg-zinc-50/80 rounded-lg transition-colors flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {chatter.userAvatarUrl ? (
                  <img
                    src={chatter.userAvatarUrl}
                    alt={chatter.username}
                    className="w-7 h-7 rounded-full object-cover border border-zinc-200 shrink-0"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center font-bold text-[11px] text-zinc-700 shrink-0 font-mono">
                    {chatter.username.charAt(0).toUpperCase()}
                  </div>
                )}

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-zinc-950 truncate">
                      {chatter.username}
                    </span>

                    {/* Role Badges */}
                    {chatter.isOwner && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-50 text-amber-800 border border-amber-200 font-mono flex items-center gap-0.5">
                        <RiVipCrownFill className="text-[10px]" /> HOST
                      </span>
                    )}
                    {chatter.isModerator && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono flex items-center gap-0.5">
                        <RiShieldCheckFill className="text-[10px]" /> MOD
                      </span>
                    )}
                    {chatter.isSponsor && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-50 text-rose-800 border border-rose-200 font-mono flex items-center gap-0.5">
                        <RiStarFill className="text-[10px]" /> MEMBER
                      </span>
                    )}
                  </div>

                  <p className="text-[10px] text-zinc-400 font-mono">
                    Active: {new Date(chatter.lastMessageAt).toLocaleTimeString('id-ID')}
                  </p>
                </div>
              </div>

              {/* Message Count Metric */}
              <div className="shrink-0 text-right">
                <span className="font-mono text-[11px] font-bold text-zinc-700 bg-zinc-100/80 px-2 py-0.5 rounded-md border border-zinc-200">
                  {chatter.messageCount} msg
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
