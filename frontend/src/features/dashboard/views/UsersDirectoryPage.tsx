import { apiClient } from '@core/http/api-client';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import {
  RiFilterLine,
  RiGroupLine,
  RiSearchLine,
  RiShieldCheckFill,
  RiStarFill,
  RiUserLine,
  RiVipCrownFill,
} from 'react-icons/ri';

interface UserRecord {
  id: string;
  name: string;
  email?: string | null;
  role: string;
  avatarUrl?: string | null;
  youtubeChannelId?: string | null;
  youtubeHandle?: string | null;
  totalMessagesSent: string | number;
  firstSeenAt: string;
  lastSeenAt: string;
}

export default function UsersDirectoryPage() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const { data: usersList = [], isLoading } = useQuery<UserRecord[]>({
    queryKey: ['all-chatters'],
    queryFn: async () => {
      const res = await apiClient.get<{ data: UserRecord[] }>('/streams/chatters/all');
      return res.data.data;
    },
  });

  const filteredUsers = useMemo(() => {
    return usersList.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        (u.youtubeHandle && u.youtubeHandle.toLowerCase().includes(search.toLowerCase())) ||
        (u.youtubeChannelId && u.youtubeChannelId.toLowerCase().includes(search.toLowerCase()));

      const matchesRole = roleFilter === 'all' || u.role.toLowerCase() === roleFilter.toLowerCase();

      return matchesSearch && matchesRole;
    });
  }, [usersList, search, roleFilter]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-zinc-950 tracking-tight flex items-center gap-2.5">
            <div className="p-1.5 rounded-xl bg-zinc-950 text-white">
              <RiGroupLine className="text-xl" />
            </div>
            <span>Audience & Discovered Users Directory</span>
          </h1>
          <p className="text-xs text-zinc-500 font-mono mt-1">
            Registered viewers and chatters captured from YouTube live streams via Streamer.bot
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold px-3.5 py-1.5 rounded-xl bg-white border border-zinc-200 text-zinc-800 shadow-xs">
            Total Recorded: {usersList.length}
          </span>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="studio-card p-3.5 bg-white border border-zinc-200/90 shadow-tactile rounded-xl flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm" />
          <input
            type="text"
            placeholder="Search by name, @handle, or YouTube channel ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:bg-white focus:ring-1 focus:ring-zinc-950 font-sans"
          />
        </div>

        <div className="flex items-center gap-2">
          <RiFilterLine className="text-zinc-500 text-sm" />
          <span className="text-xs font-semibold text-zinc-700">Role:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-lg font-mono focus:outline-none focus:bg-white focus:ring-1 focus:ring-zinc-950 text-zinc-800"
          >
            <option value="all">All Roles</option>
            <option value="admin">Host / Admin</option>
            <option value="moderator">Moderator</option>
            <option value="member">YouTube Member</option>
            <option value="viewer">Viewer</option>
          </select>
        </div>
      </div>

      {/* Users Data Table */}
      <div className="studio-card bg-white border border-zinc-200/90 shadow-tactile rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50/80 font-mono text-[11px] text-zinc-500 uppercase tracking-wider">
                <th className="py-3 px-4 font-bold">User / Handle</th>
                <th className="py-3 px-4 font-bold">Role</th>
                <th className="py-3 px-4 font-bold text-right">Messages Sent</th>
                <th className="py-3 px-4 font-bold">First Discovered</th>
                <th className="py-3 px-4 font-bold">Last Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-zinc-400 font-mono">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-5 h-5 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin" />
                      <span>Loading audience database...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-zinc-400">
                    <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 mx-auto mb-2 border border-zinc-200">
                      <RiUserLine className="text-xl" />
                    </div>
                    <p className="font-semibold text-zinc-700">No users found</p>
                    <p className="text-[11px] text-zinc-400 mt-1">
                      No discovered viewers match the current filter criteria
                    </p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-zinc-50/80 transition-colors group">
                    {/* User Identity */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {user.avatarUrl ? (
                          <img
                            src={user.avatarUrl}
                            alt={user.name}
                            className="w-8 h-8 rounded-full object-cover border border-zinc-200 shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center font-bold text-xs text-zinc-700 shrink-0 font-mono">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-zinc-950">{user.name}</div>
                          <div className="text-[11px] text-zinc-400 font-mono">
                            {user.youtubeHandle || `@${user.name.toLowerCase().replace(/\s+/g, '')}`}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Role Badge */}
                    <td className="py-3 px-4">
                      {user.role === 'admin' && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200 font-mono inline-flex items-center gap-1">
                          <RiVipCrownFill className="text-xs" /> HOST / ADMIN
                        </span>
                      )}
                      {user.role === 'moderator' && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono inline-flex items-center gap-1">
                          <RiShieldCheckFill className="text-xs" /> MODERATOR
                        </span>
                      )}
                      {user.role === 'member' && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200 font-mono inline-flex items-center gap-1">
                          <RiStarFill className="text-xs" /> MEMBER
                        </span>
                      )}
                      {user.role === 'viewer' && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-zinc-100 text-zinc-600 border border-zinc-200 font-mono">
                          VIEWER
                        </span>
                      )}
                    </td>

                    {/* Message Count */}
                    <td className="py-3 px-4 text-right font-mono font-bold text-zinc-900">
                      <span className="px-2 py-0.5 rounded-md bg-zinc-100 border border-zinc-200 text-[11px]">
                        {user.totalMessagesSent}
                      </span>
                    </td>

                    {/* First Discovered */}
                    <td className="py-3 px-4 font-mono text-zinc-500 text-[11px]">
                      {new Date(user.firstSeenAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>

                    {/* Last Active */}
                    <td className="py-3 px-4 font-mono text-zinc-500 text-[11px]">
                      {new Date(user.lastSeenAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
