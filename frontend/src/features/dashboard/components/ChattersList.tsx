import { useMemo, useState } from 'react';
import {
  RiGroupLine,
  RiSearchLine,
  RiShieldCheckFill,
  RiStarFill,
  RiUserLine,
  RiVipCrownFill,
} from 'react-icons/ri';
import type { Chatter } from '../types/dashboard.types';

export interface ChattersListProps {
  chatters: Chatter[];
  isLoading: boolean;
}

export function ChattersList({ chatters, isLoading }: ChattersListProps) {
  const [search, setSearch] = useState('');

  const filteredChatters = useMemo(() => {
    if (!search.trim()) return chatters;
    const q = search.toLowerCase();
    return chatters.filter(
      (c) =>
        c.username.toLowerCase().includes(q) ||
        Boolean(c.youtubeChannelId?.toLowerCase().includes(q))
    );
  }, [chatters, search]);

  return (
    <div className="flex flex-col h-full bg-[#131318] overflow-hidden border border-[#272733] shadow-xl rounded-2xl font-sans text-[#F4F4F6]">
      <div className="p-3.5 border-b border-[#272733] bg-[#16161D] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-950/60 border border-cyan-800/50 text-cyan-400">
            <RiGroupLine className="text-base" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-white tracking-tight uppercase font-mono">
              Audience & Chatters Roster
            </h2>
          </div>
        </div>
        <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#16161D] border border-[#272733] text-cyan-300">
          {chatters.length} Live
        </span>
      </div>

      <div className="p-2.5 border-b border-[#272733] bg-[#131318]">
        <div className="relative">
          <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A0A0AC] text-xs" />
          <input
            type="text"
            placeholder="Cari nama atau handle..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#16161D] border border-[#272733] rounded-lg focus:outline-none focus:border-cyan-400 font-sans text-white placeholder:text-[#A0A0AC]"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-[#1E1E28] p-1">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-[#A0A0AC] font-mono flex flex-col items-center gap-2">
            <div className="w-5 h-5 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
            <span>Memuat data penonton...</span>
          </div>
        ) : filteredChatters.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#A0A0AC] flex flex-col items-center justify-center h-full">
            <div className="w-10 h-10 rounded-xl bg-[#16161D] flex items-center justify-center text-[#A0A0AC] mb-2 border border-[#272733]">
              <RiUserLine className="text-xl text-cyan-400" />
            </div>
            <p className="font-semibold text-white">Belum ada penonton terdata</p>
            <p className="text-[11px] text-[#A0A0AC] mt-1 max-w-[200px]">
              Chatters dari YouTube live akan muncul di sini secara otomatis
            </p>
          </div>
        ) : (
          filteredChatters.map((chatter) => (
            <div
              key={chatter.userId ? `${chatter.userId}-${chatter.username}` : chatter.username}
              className="p-2.5 hover:bg-[#16161D]/70 rounded-xl transition-colors flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {chatter.userAvatarUrl ? (
                  <img
                    src={chatter.userAvatarUrl}
                    alt={chatter.username}
                    className="w-7 h-7 rounded-full object-cover border border-[#272733] shrink-0"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[#1A1A22] border border-[#272733] flex items-center justify-center font-bold text-[11px] text-cyan-400 shrink-0 font-mono">
                    {chatter.username.charAt(0).toUpperCase()}
                  </div>
                )}

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-white truncate">
                      {chatter.username}
                    </span>

                    {chatter.isOwner && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-950/80 text-rose-300 border border-rose-600/50 font-mono flex items-center gap-0.5">
                        <RiVipCrownFill className="text-[10px] text-rose-400" /> HOST
                      </span>
                    )}
                    {chatter.isModerator && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-950/80 text-indigo-300 border border-indigo-600/50 font-mono flex items-center gap-0.5">
                        <RiShieldCheckFill className="text-[10px] text-indigo-400" /> MOD
                      </span>
                    )}
                    {chatter.isSponsor && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-600/50 font-mono flex items-center gap-0.5">
                        <RiStarFill className="text-[10px] text-emerald-400" /> MEMBER
                      </span>
                    )}
                  </div>

                  <p className="text-[10px] text-[#A0A0AC] font-mono">
                    Aktif: {new Date(chatter.lastMessageAt).toLocaleTimeString('id-ID')}
                  </p>
                </div>
              </div>

              <div className="shrink-0 text-right">
                <span className="font-mono text-[11px] font-bold text-cyan-400 bg-[#16161D] px-2 py-0.5 rounded-md border border-[#272733]">
                  {chatter.messageCount} msg
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
