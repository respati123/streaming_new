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
    <div className="flex flex-col h-full bg-[#FFFFFF] overflow-hidden border border-[#D4D4D8] shadow-xl rounded-2xl font-sans text-[#18181B]">
      <div className="p-3.5 border-b border-[#D4D4D8] bg-[#F4F4F5] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-zinc-950/60 border border-zinc-800/50 text-zinc-400">
            <RiGroupLine className="text-base" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-white tracking-tight uppercase font-mono">
              Audience & Chatters Roster
            </h2>
          </div>
        </div>
        <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#F4F4F5] border border-[#D4D4D8] text-zinc-300">
          {chatters.length} Live
        </span>
      </div>

      <div className="p-2.5 border-b border-[#D4D4D8] bg-[#FFFFFF]">
        <div className="relative">
          <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-[#52525B] text-xs" />
          <input
            type="text"
            placeholder="Cari nama atau handle..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#F4F4F5] border border-[#D4D4D8] rounded-lg focus:outline-none focus:border-zinc-400 font-sans text-white placeholder:text-[#52525B]"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-[#E4E4E7] p-1">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-[#52525B] font-mono flex flex-col items-center gap-2">
            <div className="w-5 h-5 border-2 border-zinc-500/30 border-t-zinc-400 rounded-full animate-spin" />
            <span>Memuat data penonton...</span>
          </div>
        ) : filteredChatters.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#52525B] flex flex-col items-center justify-center h-full">
            <div className="w-10 h-10 rounded-xl bg-[#F4F4F5] flex items-center justify-center text-[#52525B] mb-2 border border-[#D4D4D8]">
              <RiUserLine className="text-xl text-zinc-400" />
            </div>
            <p className="font-semibold text-white">Belum ada penonton terdata</p>
            <p className="text-[11px] text-[#52525B] mt-1 max-w-[200px]">
              Chatters dari YouTube live akan muncul di sini secara otomatis
            </p>
          </div>
        ) : (
          filteredChatters.map((chatter) => (
            <div
              key={chatter.userId ? `${chatter.userId}-${chatter.username}` : chatter.username}
              className="p-2.5 hover:bg-[#F4F4F5]/70 rounded-xl transition-colors flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {chatter.userAvatarUrl ? (
                  <img
                    src={chatter.userAvatarUrl}
                    alt={chatter.username}
                    className="w-7 h-7 rounded-full object-cover border border-[#D4D4D8] shrink-0"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[#E4E4E7] border border-[#D4D4D8] flex items-center justify-center font-bold text-[11px] text-zinc-400 shrink-0 font-mono">
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
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-zinc-950/80 text-zinc-300 border border-zinc-600/50 font-mono flex items-center gap-0.5">
                        <RiShieldCheckFill className="text-[10px] text-zinc-400" /> MOD
                      </span>
                    )}
                    {chatter.isSponsor && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-600/50 font-mono flex items-center gap-0.5">
                        <RiStarFill className="text-[10px] text-emerald-400" /> MEMBER
                      </span>
                    )}
                  </div>

                  <p className="text-[10px] text-[#52525B] font-mono">
                    Aktif: {new Date(chatter.lastMessageAt).toLocaleTimeString('id-ID')}
                  </p>
                </div>
              </div>

              <div className="shrink-0 text-right">
                <span className="font-mono text-[11px] font-bold text-zinc-400 bg-[#F4F4F5] px-2 py-0.5 rounded-md border border-[#D4D4D8]">
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
