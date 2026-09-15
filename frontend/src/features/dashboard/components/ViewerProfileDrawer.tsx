import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  Crown,
  Gift,
  MessageSquare,
  Shield,
  Star,
  User,
  X,
  Zap,
} from 'lucide-react';
import { useState } from 'react';
import type { UserRole, ViewerActivityLog, ViewerRecord } from '../types/user-management.types';

export interface ViewerProfileDrawerProps {
  viewer: ViewerRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdatePoints: (viewerId: string, deltaPoints: number) => void;
  onUpdateRole: (viewerId: string, role: UserRole) => void;
  onApplyTimeout: (viewerId: string, durationMinutes: number) => void;
  onBanUser: (viewerId: string, reason: string) => void;
}

export function ViewerProfileDrawer({
  viewer,
  isOpen,
  onClose,
  onUpdatePoints,
  onUpdateRole,
  onApplyTimeout,
  onBanUser,
}: ViewerProfileDrawerProps) {
  const [activeTab, setActiveTab] = useState<'chat' | 'donation' | 'points'>('chat');
  const [pointsInput, setPointsInput] = useState('100');
  const [pointsSign, setPointsSign] = useState<'+' | '-'>('+');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen || !viewer) {
    return null;
  }

  const showFeedback = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handlePointsSubmit = () => {
    const val = Number(pointsInput);
    if (!Number.isNaN(val) && val > 0) {
      const delta = pointsSign === '+' ? val : -val;
      onUpdatePoints(viewer.id, delta);
      showFeedback(
        `Points berhasil ${pointsSign === '+' ? 'ditambahkan' : 'dikurangi'} ${val} pts`
      );
    }
  };

  const handleTimeoutClick = (mins: number) => {
    onApplyTimeout(viewer.id, mins);
    showFeedback(`Penonton di-timeout selama ${mins} menit`);
  };

  const handleBanClick = () => {
    if (window.confirm(`Yakin ingin memasukkan ${viewer.name} ke Blacklist permanen?`)) {
      onBanUser(viewer.id, 'Melanggar aturan komunitas stream');
      showFeedback(`${viewer.name} berhasil dimasukkan ke daftar Blacklist`);
    }
  };

  const mockLogs: ViewerActivityLog[] = [
    {
      id: 'log-1',
      viewerId: viewer.id,
      type: 'chat',
      timestamp: '2 menit lalu',
      content: 'GGWP bang match barusan rapi banget timing ulti-nya!',
      platform: 'YouTube',
    },
    {
      id: 'log-2',
      viewerId: viewer.id,
      type: 'donation',
      timestamp: '15 menit lalu',
      content: 'Semangat terus kontennya bang, kopi buat nemenin live ☕🔥',
      amount: 50000,
      platform: 'Saweria',
    },
    {
      id: 'log-3',
      viewerId: viewer.id,
      type: 'points',
      timestamp: '1 jam lalu',
      content: 'Klaim Daily Stream Check-in (+50 pts)',
      amount: 50,
    },
    {
      id: 'log-4',
      viewerId: viewer.id,
      type: 'chat',
      timestamp: '1 jam lalu',
      content: 'Halo mod dan kawan-kawan penonton semua 👋',
      platform: 'YouTube',
    },
    {
      id: 'log-5',
      viewerId: viewer.id,
      type: 'points',
      timestamp: '2 jam lalu',
      content: 'Reward Saweria Tip Multiplier (+250 pts)',
      amount: 250,
    },
  ];

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'diamond':
        return 'text-sky-700 bg-sky-50 border-sky-300';
      case 'gold':
        return 'text-amber-800 bg-amber-50 border-amber-300';
      case 'silver':
        return 'text-slate-700 bg-slate-100 border-slate-300';
      default:
        return 'text-orange-700 bg-orange-50 border-orange-200';
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
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            <User className="w-3 h-3 text-slate-400" /> Viewer
          </span>
        );
    }
  };

  return (
    <>
      <button
        type="button"
        aria-label="Tutup panel profil drawer"
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 transition-opacity cursor-default w-full h-full border-none"
        onClick={onClose}
      />

      <aside className="fixed top-0 right-0 bottom-0 w-full max-w-[500px] z-50 bg-white border-l border-slate-200 shadow-2xl flex flex-col font-sans text-slate-800">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-600">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                Detail Penonton & Moderasi
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">ID: {viewer.id.slice(0, 12)}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-400 hover:text-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {toastMessage && (
          <div className="mx-6 mt-3 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span className="font-semibold">{toastMessage}</span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Main Profile Info */}
          <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 flex items-start justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3.5">
              <div className="w-13 h-13 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center font-bold text-lg text-sky-700 overflow-hidden shadow-xs">
                {viewer.avatarUrl ? (
                  <img
                    src={viewer.avatarUrl}
                    alt={viewer.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  viewer.name.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">{viewer.name}</h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                </div>
                <div className="flex items-center gap-2 mt-1">
                  {getRoleBadge(viewer.role)}
                  <span className="text-[11px] font-mono text-slate-400">
                    {viewer.youtubeHandle || '@viewer'}
                  </span>
                </div>
              </div>
            </div>

            <div
              className={`px-2.5 py-1 rounded-lg border text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${getTierColor(viewer.tier)}`}
            >
              <Crown className="w-3.5 h-3.5" />
              <span>{viewer.tier} Tier</span>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 shadow-xs">
              <div className="text-[11px] text-slate-500 flex items-center gap-1.5 font-medium">
                <MessageSquare className="w-3.5 h-3.5 text-sky-600" />
                <span>Total Chats</span>
              </div>
              <div className="text-lg font-bold text-slate-900 mt-1 font-mono">
                {viewer.totalMessagesSent.toLocaleString('id-ID')}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-50/40 border border-amber-200 shadow-xs">
              <div className="text-[11px] text-amber-700 flex items-center gap-1.5 font-medium">
                <Gift className="w-3.5 h-3.5 text-amber-600" />
                <span>Saweria Donasi</span>
              </div>
              <div className="text-lg font-bold text-amber-600 mt-1 font-mono">
                Rp {viewer.totalDonations.toLocaleString('id-ID')}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50/40 border border-emerald-200 shadow-xs">
              <div className="text-[11px] text-emerald-700 flex items-center gap-1.5 font-medium">
                <Zap className="w-3.5 h-3.5 text-emerald-600" />
                <span>Loyalty Points</span>
              </div>
              <div className="text-lg font-bold text-emerald-600 mt-1 font-mono">
                {viewer.points.toLocaleString('id-ID')} pts
              </div>
            </div>

            <div className="p-3 rounded-xl bg-rose-50/40 border border-rose-200 shadow-xs">
              <div className="text-[11px] text-rose-700 flex items-center gap-1.5 font-medium">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                <span>Timeout / Warn</span>
              </div>
              <div className="text-lg font-bold text-rose-600 mt-1 font-mono">
                {viewer.timeoutCount}x / {viewer.warningCount}x
              </div>
            </div>
          </div>

          {/* Activity Logs Tabs */}
          <div>
            <div className="flex border-b border-slate-200 gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('chat')}
                className={`pb-2 text-xs font-semibold px-2 flex items-center gap-1.5 border-b-2 transition-colors ${
                  activeTab === 'chat'
                    ? 'border-sky-600 text-sky-700 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Riwayat Chat</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('donation')}
                className={`pb-2 text-xs font-semibold px-2 flex items-center gap-1.5 border-b-2 transition-colors ${
                  activeTab === 'donation'
                    ? 'border-amber-500 text-amber-700 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <Gift className="w-3.5 h-3.5" />
                <span>Donasi Saweria</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('points')}
                className={`pb-2 text-xs font-semibold px-2 flex items-center gap-1.5 border-b-2 transition-colors ${
                  activeTab === 'points'
                    ? 'border-emerald-600 text-emerald-700 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Points Ledger</span>
              </button>
            </div>

            <div className="mt-3 space-y-2 max-h-[190px] overflow-y-auto pr-1">
              {activeTab === 'chat' &&
                mockLogs
                  .filter((l) => l.type === 'chat')
                  .map((log) => (
                    <div
                      key={log.id}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs shadow-xs"
                    >
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="font-semibold text-sky-700">{log.platform}</span>
                        <span className="font-mono">{log.timestamp}</span>
                      </div>
                      <p className="mt-1 text-slate-800">{log.content}</p>
                    </div>
                  ))}

              {activeTab === 'donation' &&
                mockLogs
                  .filter((l) => l.type === 'donation')
                  .map((log) => (
                    <div
                      key={log.id}
                      className="p-2.5 rounded-xl bg-amber-50/40 border border-amber-200 text-xs shadow-xs"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-amber-700 font-mono">
                          Rp {log.amount?.toLocaleString('id-ID')}
                        </span>
                        <span className="text-slate-400 font-mono">{log.timestamp}</span>
                      </div>
                      <p className="mt-1 text-slate-700">{log.content}</p>
                    </div>
                  ))}

              {activeTab === 'points' &&
                mockLogs
                  .filter((l) => l.type === 'points')
                  .map((log) => (
                    <div
                      key={log.id}
                      className="p-2.5 rounded-xl bg-emerald-50/40 border border-emerald-200 text-xs flex items-center justify-between shadow-xs"
                    >
                      <span className="text-slate-700">{log.content}</span>
                      <span className="font-mono font-bold text-emerald-700">
                        +{log.amount} pts
                      </span>
                    </div>
                  ))}
            </div>
          </div>

          {/* Action & Moderation Panel */}
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Panel Aksi & Moderasi
            </h4>

            {/* Adjust Points */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 shadow-xs">
              <label htmlFor="pts-input" className="text-[11px] text-slate-600 font-semibold block">
                Atur Points Penonton
              </label>
              <div className="flex items-center gap-2">
                <div className="flex rounded-lg border border-slate-200 overflow-hidden bg-white shadow-xs">
                  <button
                    type="button"
                    onClick={() => setPointsSign('+')}
                    className={`px-3 py-1.5 text-xs font-bold transition-colors ${
                      pointsSign === '+'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => setPointsSign('-')}
                    className={`px-3 py-1.5 text-xs font-bold transition-colors ${
                      pointsSign === '-'
                        ? 'bg-rose-600 text-white'
                        : 'bg-white text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    -
                  </button>
                </div>
                <input
                  id="pts-input"
                  type="number"
                  value={pointsInput}
                  onChange={(e) => setPointsInput(e.target.value)}
                  className="w-24 px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-mono text-slate-900 focus:outline-none focus:border-sky-500"
                />
                <button
                  type="button"
                  onClick={handlePointsSubmit}
                  className="flex-1 py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
                >
                  Terapkan Points
                </button>
              </div>
            </div>

            {/* Change Role */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 shadow-xs">
              <label
                htmlFor="role-viewer-select-btn"
                className="text-[11px] text-slate-600 font-semibold block"
              >
                Ubah Role Penonton
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['viewer', 'member', 'vip', 'moderator'] as UserRole[]).map((r) => (
                  <button
                    id={r === 'viewer' ? 'role-viewer-select-btn' : undefined}
                    key={r}
                    type="button"
                    onClick={() => {
                      onUpdateRole(viewer.id, r);
                      showFeedback(`Role berhasil diubah menjadi ${r.toUpperCase()}`);
                    }}
                    className={`py-1.5 rounded-lg text-[11px] font-bold uppercase transition-colors border shadow-xs ${
                      viewer.role === r
                        ? 'bg-sky-50 border-sky-400 text-sky-700 font-extrabold ring-1 ring-sky-400/20'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Discipline Actions */}
            <div className="p-3 rounded-xl bg-rose-50/50 border border-rose-200 space-y-2 shadow-xs">
              <label htmlFor="timeout-5m-btn" className="text-[11px] text-rose-700 font-bold block">
                Tindakan Disiplin & Timeout
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  id="timeout-5m-btn"
                  type="button"
                  onClick={() => handleTimeoutClick(5)}
                  className="py-1.5 px-2 rounded-lg bg-white hover:bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold transition-colors shadow-xs"
                >
                  Timeout 5m
                </button>
                <button
                  type="button"
                  onClick={() => handleTimeoutClick(60)}
                  className="py-1.5 px-2 rounded-lg bg-white hover:bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold transition-colors shadow-xs"
                >
                  Timeout 1 Jam
                </button>
                <button
                  type="button"
                  onClick={() => handleTimeoutClick(1440)}
                  className="py-1.5 px-2 rounded-lg bg-white hover:bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold transition-colors shadow-xs"
                >
                  Timeout 24 Jam
                </button>
              </div>

              <button
                type="button"
                onClick={handleBanClick}
                className="w-full mt-2 py-2 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                <Ban className="w-3.5 h-3.5" />
                <span>Blacklist / Ban Permanen User</span>
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
