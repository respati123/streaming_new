import {
  Crown,
  Eye,
  Filter,
  RefreshCw,
  Search,
  Settings,
  Shield,
  Star,
  User,
  Users,
  Zap,
} from 'lucide-react';
import { LoyaltyRulesView } from '../components/LoyaltyRulesView';
import { ViewerProfileDrawer } from '../components/ViewerProfileDrawer';
import type { LoyaltyTier, UserRole } from '../types/user-management.types';
import { useUsersDirectoryViewModel } from '../viewmodels/useUsersDirectoryViewModel';

export default function UsersDirectoryPage() {
  const { states, handlers } = useUsersDirectoryViewModel();

  if (states.activeTab === 'rules') {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto font-sans">
        <LoyaltyRulesView
          onBack={() => handlers.handleTabChange('directory')}
          onSave={handlers.handleSaveRules}
          tiers={states.tiers}
          pointsRules={states.pointsRules}
          moderationRules={states.moderationRules}
          blacklistedUsers={states.blacklistedUsers}
          onToggleRule={handlers.handleToggleRule}
          onAddBannedWord={handlers.handleAddBannedWord}
          onRemoveBannedWord={handlers.handleRemoveBannedWord}
          bannedWords={states.bannedWords}
          onUnbanUser={handlers.handleUnbanUser}
        />
      </div>
    );
  }

  const getTierBadge = (tier: LoyaltyTier) => {
    switch (tier) {
      case 'diamond':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold font-mono uppercase bg-zinc-950/60 text-zinc-300 border border-zinc-500/40">
            <Crown className="w-3.5 h-3.5 text-zinc-400" />
            <span>Diamond</span>
          </span>
        );
      case 'gold':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold font-mono uppercase bg-amber-950/60 text-amber-300 border border-amber-500/40">
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span>Gold</span>
          </span>
        );
      case 'silver':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold font-mono uppercase bg-zinc-800/60 text-zinc-300 border border-zinc-600/40">
            <Crown className="w-3.5 h-3.5 text-zinc-400" />
            <span>Silver</span>
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold font-mono uppercase bg-[#E4E4E7] text-[#52525B] border border-[#D4D4D8]">
            <Crown className="w-3.5 h-3.5 text-zinc-500" />
            <span>Bronze</span>
          </span>
        );
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-950/80 text-rose-300 border border-rose-600/50">
            <Shield className="w-3 h-3 text-rose-400" /> Host
          </span>
        );
      case 'moderator':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-zinc-950/80 text-zinc-300 border border-zinc-600/50">
            <Shield className="w-3 h-3 text-zinc-400" /> MOD
          </span>
        );
      case 'vip':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-950/80 text-amber-300 border border-amber-500/50">
            <Crown className="w-3 h-3 text-amber-400" /> VIP
          </span>
        );
      case 'member':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/50">
            <Star className="w-3 h-3 text-emerald-400" /> Member
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-[#E4E4E7] text-[#52525B] border border-[#D4D4D8]">
            <User className="w-3 h-3 text-zinc-400" /> Viewer
          </span>
        );
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto space-y-6 font-sans text-[#18181B]">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#FFFFFF] p-5 rounded-2xl border border-[#D4D4D8] shadow-lg">
        <div className="space-y-1">
          <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-zinc-950/60 border border-zinc-800/50 text-zinc-400">
              <Users className="w-5 h-5" />
            </div>
            <span>Database Penonton & Chatters Hub</span>
          </h1>
          <p className="text-xs text-[#52525B] font-mono">
            Direktori profil pemirsa aktif, ranking loyalty points, donasi Saweria, dan kontrol
            moderasi stream.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => handlers.handleTabChange('rules')}
            className="px-3.5 py-2 rounded-xl bg-[#F4F4F5] hover:bg-[#E4E4E7] border border-[#D4D4D8] text-xs font-bold text-white flex items-center gap-2 transition-colors"
          >
            <Settings className="w-4 h-4 text-zinc-400" />
            <span>Rules & Tier Config</span>
          </button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-3.5 py-2 rounded-xl bg-zinc-600 hover:bg-zinc-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-zinc-950/50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Sync Streamer.bot</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#D4D4D8] space-y-2">
          <div className="text-xs text-[#52525B] font-mono flex items-center justify-between">
            <span>TOTAL VIEWERS RECORDED</span>
            <span className="text-emerald-400 font-bold">+12%</span>
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {states.summaryStats.totalRecorded.toLocaleString('id-ID')}
          </div>
          <div className="text-[11px] text-zinc-400 font-mono">Terekam di seluruh stream live</div>
        </div>

        <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#D4D4D8] space-y-2">
          <div className="text-xs text-[#52525B] font-mono flex items-center justify-between">
            <span>ACTIVE CHATTERS (RECENT)</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          </div>
          <div className="text-2xl font-bold text-zinc-400 font-mono">
            {states.summaryStats.activeRecent} Penonton
          </div>
          <div className="text-[11px] text-zinc-400 font-mono">Aktif berinteraksi di room</div>
        </div>

        <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#D4D4D8] space-y-2">
          <div className="text-xs text-[#52525B] font-mono flex items-center justify-between">
            <span>LOYAL MEMBERS & VIPS</span>
            <Crown className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 font-mono">
            {states.summaryStats.loyalMembers} Akun
          </div>
          <div className="text-[11px] text-zinc-400 font-mono">
            Status tier Gold / Diamond / VIP
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#D4D4D8] space-y-2">
          <div className="text-xs text-[#52525B] font-mono flex items-center justify-between">
            <span>CIRCULATING LOYALTY POINTS</span>
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">
            {states.summaryStats.totalPoints.toLocaleString('id-ID')}
          </div>
          <div className="text-[11px] text-zinc-400 font-mono">Total poin komunitas beredar</div>
        </div>
      </div>

      <div className="bg-[#FFFFFF] p-4 rounded-xl border border-[#D4D4D8] flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#52525B] w-4 h-4" />
          <input
            type="text"
            placeholder="Cari penonton via nama, @handle, channel ID..."
            value={states.search}
            onChange={(e) => handlers.handleSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-[#F4F4F5] border border-[#D4D4D8] rounded-lg focus:outline-none focus:border-zinc-400 font-mono text-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-1 bg-[#F4F4F5] border border-[#D4D4D8] rounded-lg">
            <Filter className="w-3.5 h-3.5 text-[#52525B]" />
            <span className="text-[11px] text-[#52525B] font-semibold">Role:</span>
            {(['all', 'admin', 'moderator', 'vip', 'member', 'viewer'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => handlers.handleRoleFilterChange(r)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono uppercase transition-colors ${
                  states.roleFilter === r
                    ? 'bg-zinc-600 text-white font-bold'
                    : 'text-[#52525B] hover:text-white'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <select
            value={states.tierFilter}
            onChange={(e) => handlers.handleTierFilterChange(e.target.value)}
            className="px-3 py-2 text-xs bg-[#F4F4F5] border border-[#D4D4D8] rounded-lg font-mono text-white focus:outline-none focus:border-zinc-400"
          >
            <option value="all">Semua Tier</option>
            <option value="diamond">Diamond Tier</option>
            <option value="gold">Gold Tier</option>
            <option value="silver">Silver Tier</option>
            <option value="bronze">Bronze Tier</option>
          </select>
        </div>
      </div>

      <div className="bg-[#FFFFFF] rounded-2xl border border-[#D4D4D8] overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-sans">
            <thead>
              <tr className="border-b border-[#D4D4D8] bg-[#F4F4F5] text-[11px] font-mono font-bold text-[#52525B] uppercase tracking-wider">
                <th className="py-3 px-4">PENONTON</th>
                <th className="py-3 px-4">ROLE</th>
                <th className="py-3 px-4">LOYALTY TIER</th>
                <th className="py-3 px-4 text-right">TOTAL CHAT</th>
                <th className="py-3 px-4 text-right">TOTAL DONASI</th>
                <th className="py-3 px-4 text-right">POINTS</th>
                <th className="py-3 px-4">LAST SEEN</th>
                <th className="py-3 px-4 text-center">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D4D4D8] text-xs">
              {states.viewers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#52525B] font-mono">
                    Tidak ada penonton yang cocok dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                states.viewers.map((viewer) => (
                  <tr
                    key={viewer.id}
                    className="hover:bg-[#F4F4F5]/70 transition-colors group cursor-pointer"
                    onClick={() => handlers.handleSelectViewer(viewer.id)}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#E4E4E7] border border-[#D4D4D8] flex items-center justify-center font-bold text-xs text-zinc-400">
                          {viewer.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <span>{viewer.name}</span>
                            {viewer.isOnline && (
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            )}
                          </div>
                          <span className="text-[11px] text-[#52525B] font-mono">
                            {viewer.youtubeHandle || '@viewer'}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">{getRoleBadge(viewer.role)}</td>
                    <td className="py-3 px-4">{getTierBadge(viewer.tier)}</td>
                    <td className="py-3 px-4 text-right font-mono text-zinc-300">
                      {viewer.totalMessagesSent.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-amber-400">
                      Rp {viewer.totalDonations.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                      {viewer.points.toLocaleString('id-ID')} pts
                    </td>
                    <td className="py-3 px-4 font-mono text-zinc-400 text-[11px]">
                      {viewer.lastSeenAt}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlers.handleSelectViewer(viewer.id);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[#F4F4F5] group-hover:bg-zinc-600 group-hover:text-white border border-[#D4D4D8] text-xs font-semibold text-[#52525B] flex items-center gap-1.5 mx-auto transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Profil</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3.5 border-t border-[#D4D4D8] bg-[#F4F4F5] flex items-center justify-between text-xs font-mono text-[#52525B]">
          <div>
            Menampilkan <span className="text-white font-bold">{states.viewers.length}</span> dari{' '}
            <span className="text-white font-bold">{states.allViewersCount}</span> penonton
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled
              className="px-3 py-1 rounded bg-[#E4E4E7] border border-[#D4D4D8] text-zinc-500 cursor-not-allowed"
            >
              Sebelumnya
            </button>
            <span className="px-2 font-bold text-zinc-400">1</span>
            <button
              type="button"
              disabled
              className="px-3 py-1 rounded bg-[#E4E4E7] border border-[#D4D4D8] text-zinc-500 cursor-not-allowed"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      </div>

      <ViewerProfileDrawer
        viewer={states.selectedViewer}
        isOpen={states.isDrawerOpen}
        onClose={handlers.handleCloseDrawer}
        onUpdatePoints={handlers.handleUpdatePoints}
        onUpdateRole={handlers.handleUpdateRole}
        onApplyTimeout={handlers.handleApplyTimeout}
        onBanUser={handlers.handleBanUser}
      />
    </div>
  );
}
