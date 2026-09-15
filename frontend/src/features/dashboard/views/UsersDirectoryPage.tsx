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
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold font-mono uppercase bg-sky-50 text-sky-700 border border-sky-300">
            <Crown className="w-3.5 h-3.5 text-sky-600" />
            <span>Diamond</span>
          </span>
        );
      case 'gold':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold font-mono uppercase bg-amber-50 text-amber-800 border border-amber-300">
            <Crown className="w-3.5 h-3.5 text-amber-500" />
            <span>Gold</span>
          </span>
        );
      case 'silver':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold font-mono uppercase bg-slate-100 text-slate-700 border border-slate-300">
            <Crown className="w-3.5 h-3.5 text-slate-500" />
            <span>Silver</span>
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold font-mono uppercase bg-orange-50 text-orange-700 border border-orange-200">
            <Crown className="w-3.5 h-3.5 text-orange-400" />
            <span>Bronze</span>
          </span>
        );
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <Shield className="w-3 h-3 text-rose-500" /> Host
          </span>
        );
      case 'moderator':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Shield className="w-3 h-3 text-indigo-500" /> MOD
          </span>
        );
      case 'vip':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Crown className="w-3 h-3 text-amber-500" /> VIP
          </span>
        );
      case 'member':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Star className="w-3 h-3 text-emerald-500" /> Member
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
            <User className="w-3 h-3 text-slate-400" /> Viewer
          </span>
        );
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto space-y-6 font-sans text-slate-800">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-50 border border-sky-200 text-sky-600">
              <Users className="w-5 h-5" />
            </div>
            <span>Database Penonton & Chatters Hub</span>
          </h1>
          <p className="text-xs text-slate-500 font-mono">
            Direktori profil pemirsa aktif, ranking loyalty points, donasi Saweria, dan kontrol
            moderasi stream.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => handlers.handleTabChange('rules')}
            className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 flex items-center gap-2 transition-colors"
          >
            <Settings className="w-4 h-4 text-sky-600" />
            <span>Rules & Tier Config</span>
          </button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Sync Streamer.bot</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="text-xs text-slate-500 font-mono flex items-center justify-between">
            <span>TOTAL VIEWERS RECORDED</span>
            <span className="text-emerald-600 font-bold">+12%</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">
            {states.summaryStats.totalRecorded.toLocaleString('id-ID')}
          </div>
          <div className="text-[11px] text-slate-400 font-mono">Terekam di seluruh stream live</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="text-xs text-slate-500 font-mono flex items-center justify-between">
            <span>ACTIVE CHATTERS (RECENT)</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          </div>
          <div className="text-2xl font-bold text-sky-600 font-mono">
            {states.summaryStats.activeRecent} Penonton
          </div>
          <div className="text-[11px] text-slate-400 font-mono">Aktif berinteraksi di room</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="text-xs text-slate-500 font-mono flex items-center justify-between">
            <span>LOYAL MEMBERS & VIPS</span>
            <Crown className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600 font-mono">
            {states.summaryStats.loyalMembers} Akun
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            Status tier Gold / Diamond / VIP
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="text-xs text-slate-500 font-mono flex items-center justify-between">
            <span>CIRCULATING LOYALTY POINTS</span>
            <Zap className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 font-mono">
            {states.summaryStats.totalPoints.toLocaleString('id-ID')}
          </div>
          <div className="text-[11px] text-slate-400 font-mono">Total poin komunitas beredar</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Cari penonton via nama, @handle, channel ID..."
            value={states.search}
            onChange={(e) => handlers.handleSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-sky-500 font-mono text-slate-900"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px] text-slate-500 font-semibold">Role:</span>
            {(['all', 'admin', 'moderator', 'vip', 'member', 'viewer'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => handlers.handleRoleFilterChange(r)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono uppercase transition-colors ${
                  states.roleFilter === r
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <select
            value={states.tierFilter}
            onChange={(e) => handlers.handleTierFilterChange(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-800 focus:outline-none focus:border-sky-500"
          >
            <option value="all">Semua Tier</option>
            <option value="diamond">Diamond Tier</option>
            <option value="gold">Gold Tier</option>
            <option value="silver">Silver Tier</option>
            <option value="bronze">Bronze Tier</option>
          </select>
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-sans">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider">
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
            <tbody className="divide-y divide-slate-100 text-xs">
              {states.viewers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 font-mono">
                    Tidak ada penonton yang cocok dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                states.viewers.map((viewer) => (
                  <tr
                    key={viewer.id}
                    className="hover:bg-slate-50 transition-colors group cursor-pointer"
                    onClick={() => handlers.handleSelectViewer(viewer.id)}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center font-bold text-xs text-sky-700">
                          {viewer.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{viewer.name}</span>
                            {viewer.isOnline && (
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {viewer.youtubeHandle || '@viewer'}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">{getRoleBadge(viewer.role)}</td>
                    <td className="py-3 px-4">{getTierBadge(viewer.tier)}</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-700">
                      {viewer.totalMessagesSent.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-amber-600">
                      Rp {viewer.totalDonations.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600">
                      {viewer.points.toLocaleString('id-ID')} pts
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                      {viewer.lastSeenAt}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlers.handleSelectViewer(viewer.id);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-50 group-hover:bg-indigo-600 group-hover:text-white border border-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-1.5 mx-auto transition-colors shadow-xs"
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

        <div className="p-3.5 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between text-xs font-mono text-slate-500">
          <div>
            Menampilkan <span className="text-slate-900 font-bold">{states.viewers.length}</span> dari{' '}
            <span className="text-slate-900 font-bold">{states.allViewersCount}</span> penonton
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled
              className="px-3 py-1 rounded-lg bg-white border border-slate-200 text-slate-400 cursor-not-allowed"
            >
              Sebelumnya
            </button>
            <span className="px-2 font-bold text-indigo-600">1</span>
            <button
              type="button"
              disabled
              className="px-3 py-1 rounded-lg bg-white border border-slate-200 text-slate-400 cursor-not-allowed"
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
