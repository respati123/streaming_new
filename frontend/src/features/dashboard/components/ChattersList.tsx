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
    <div className="flex flex-col h-full bg-white overflow-hidden border border-slate-200 rounded-2xl shadow-xs font-sans text-slate-900">
      <div className="p-3.5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-600 shadow-xs">
            <RiGroupLine className="text-base" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-900 tracking-tight uppercase font-mono">
              Audience & Chatters Roster
            </h2>
          </div>
        </div>
        <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700">
          {chatters.length} Live
        </span>
      </div>

      <div className="p-2.5 border-b border-slate-200 bg-white">
        <div className="relative">
          <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
          <input
            type="text"
            placeholder="Cari nama atau handle..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 font-sans text-slate-900 placeholder:text-slate-400"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-1">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-500 font-mono flex flex-col items-center gap-2">
            <div className="w-5 h-5 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
            <span>Memuat data penonton...</span>
          </div>
        ) : filteredChatters.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 flex flex-col items-center justify-center h-full">
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-indigo-600 mb-2 border border-slate-200 shadow-xs">
              <RiUserLine className="text-xl" />
            </div>
            <p className="font-semibold text-slate-800">Belum ada penonton terdata</p>
            <p className="text-[11px] text-slate-500 mt-1 max-w-[200px]">
              Chatters dari YouTube live akan muncul di sini secara otomatis
            </p>
          </div>
        ) : (
          filteredChatters.map((chatter) => (
            <div
              key={chatter.userId ? `${chatter.userId}-${chatter.username}` : chatter.username}
              className="p-2.5 hover:bg-slate-50/90 rounded-xl transition-colors flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {chatter.userAvatarUrl ? (
                  <img
                    src={chatter.userAvatarUrl}
                    alt={chatter.username}
                    className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-[11px] text-indigo-600 shrink-0 font-mono">
                    {chatter.username.charAt(0).toUpperCase()}
                  </div>
                )}

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-semibold text-slate-900 truncate">
                      {chatter.username}
                    </span>

                    {chatter.isOwner && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-100 text-rose-700 border border-rose-200 font-mono flex items-center gap-0.5">
                        <RiVipCrownFill className="text-[10px]" /> HOST
                      </span>
                    )}
                    {chatter.isModerator && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-100 text-blue-700 border border-blue-200 font-mono flex items-center gap-0.5">
                        <RiShieldCheckFill className="text-[10px]" /> MOD
                      </span>
                    )}
                    {chatter.isSponsor && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 font-mono flex items-center gap-0.5">
                        <RiStarFill className="text-[10px]" /> MEMBER
                      </span>
                    )}
                  </div>

                  <p className="text-[10px] text-slate-500 font-mono">
                    Aktif: {new Date(chatter.lastMessageAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              <div className="shrink-0 text-right">
                <span className="font-mono text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
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
