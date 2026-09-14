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
        return 'text-cyan-400 bg-cyan-950/50 border-cyan-500/40';
      case 'gold':
        return 'text-amber-400 bg-amber-950/50 border-amber-500/40';
      case 'silver':
        return 'text-slate-300 bg-slate-800/60 border-slate-600/40';
      default:
        return 'text-amber-600 bg-amber-950/30 border-amber-700/40';
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
          <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-950/80 text-indigo-300 border border-indigo-600/50">
            <Shield className="w-3 h-3 text-indigo-400" /> MOD
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
          <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-zinc-800/80 text-zinc-300 border border-zinc-700/50">
            <User className="w-3 h-3 text-zinc-400" /> Viewer
          </span>
        );
    }
  };

  return (
    <>
      <button
        type="button"
        aria-label="Tutup panel profil drawer"
        className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 transition-opacity cursor-default w-full h-full border-none"
        onClick={onClose}
      />

      <aside className="fixed top-0 right-0 bottom-0 w-full max-w-[500px] z-50 bg-[#131318] border-l border-[#272733] shadow-2xl flex flex-col font-sans text-[#F4F4F6]">
        <div className="px-6 py-4 border-b border-[#272733] flex items-center justify-between bg-[#16161D]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-cyan-950/60 border border-cyan-800/50 text-cyan-400">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#F4F4F6] tracking-tight">
                Detail Penonton & Moderasi
              </h2>
              <p className="text-[11px] text-[#A0A0AC] font-mono">ID: {viewer.id.slice(0, 12)}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#1A1A22] hover:bg-[#272733] text-[#A0A0AC] hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {toastMessage && (
          <div className="mx-6 mt-3 px-3 py-2 rounded-lg bg-emerald-950/80 border border-emerald-600/50 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <div className="p-4 rounded-xl bg-[#16161D] border border-[#272733] flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-13 h-13 rounded-xl bg-[#1A1A22] border border-[#272733] flex items-center justify-center font-bold text-lg text-cyan-400 overflow-hidden">
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
                  <h3 className="text-base font-bold text-white">{viewer.name}</h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                </div>
                <div className="flex items-center gap-2 mt-1">
                  {getRoleBadge(viewer.role)}
                  <span className="text-[11px] font-mono text-[#A0A0AC]">
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

          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 rounded-lg bg-[#16161D] border border-[#272733]">
              <div className="text-[11px] text-[#A0A0AC] flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                <span>Total Chats</span>
              </div>
              <div className="text-lg font-bold text-white mt-1 font-mono">
                {viewer.totalMessagesSent.toLocaleString('id-ID')}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#16161D] border border-[#272733]">
              <div className="text-[11px] text-[#A0A0AC] flex items-center gap-1.5">
                <Gift className="w-3.5 h-3.5 text-amber-400" />
                <span>Saweria Donasi</span>
              </div>
              <div className="text-lg font-bold text-amber-400 mt-1 font-mono">
                Rp {viewer.totalDonations.toLocaleString('id-ID')}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#16161D] border border-[#272733]">
              <div className="text-[11px] text-[#A0A0AC] flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                <span>Loyalty Points</span>
              </div>
              <div className="text-lg font-bold text-emerald-400 mt-1 font-mono">
                {viewer.points.toLocaleString('id-ID')} pts
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#16161D] border border-[#272733]">
              <div className="text-[11px] text-[#A0A0AC] flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span>Timeout / Warn</span>
              </div>
              <div className="text-lg font-bold text-rose-400 mt-1 font-mono">
                {viewer.timeoutCount}x / {viewer.warningCount}x
              </div>
            </div>
          </div>

          <div>
            <div className="flex border-b border-[#272733] gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('chat')}
                className={`pb-2 text-xs font-semibold px-2 flex items-center gap-1.5 border-b-2 transition-colors ${
                  activeTab === 'chat'
                    ? 'border-cyan-400 text-cyan-400'
                    : 'border-transparent text-[#A0A0AC] hover:text-white'
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
                    ? 'border-amber-400 text-amber-400'
                    : 'border-transparent text-[#A0A0AC] hover:text-white'
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
                    ? 'border-emerald-400 text-emerald-400'
                    : 'border-transparent text-[#A0A0AC] hover:text-white'
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
                      className="p-2.5 rounded-lg bg-[#16161D] border border-[#272733] text-xs"
                    >
                      <div className="flex items-center justify-between text-[11px] text-[#A0A0AC]">
                        <span className="font-medium text-cyan-400">{log.platform}</span>
                        <span className="font-mono">{log.timestamp}</span>
                      </div>
                      <p className="mt-1 text-white">{log.content}</p>
                    </div>
                  ))}

              {activeTab === 'donation' &&
                mockLogs
                  .filter((l) => l.type === 'donation')
                  .map((log) => (
                    <div
                      key={log.id}
                      className="p-2.5 rounded-lg bg-[#16161D] border border-amber-500/30 text-xs"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-amber-400 font-mono">
                          Rp {log.amount?.toLocaleString('id-ID')}
                        </span>
                        <span className="text-[#A0A0AC] font-mono">{log.timestamp}</span>
                      </div>
                      <p className="mt-1 text-zinc-200">{log.content}</p>
                    </div>
                  ))}

              {activeTab === 'points' &&
                mockLogs
                  .filter((l) => l.type === 'points')
                  .map((log) => (
                    <div
                      key={log.id}
                      className="p-2.5 rounded-lg bg-[#16161D] border border-[#272733] text-xs flex items-center justify-between"
                    >
                      <span className="text-zinc-200">{log.content}</span>
                      <span className="font-mono font-bold text-emerald-400">
                        +{log.amount} pts
                      </span>
                    </div>
                  ))}
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t border-[#272733]">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#A0A0AC]">
              Panel Aksi & Moderasi
            </h4>

            <div className="p-3 rounded-lg bg-[#16161D] border border-[#272733] space-y-2">
              <label htmlFor="pts-input" className="text-[11px] text-[#A0A0AC] font-medium block">
                Atur Points Penonton
              </label>
              <div className="flex items-center gap-2">
                <div className="flex rounded-md border border-[#272733] overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setPointsSign('+')}
                    className={`px-3 py-1.5 text-xs font-bold transition-colors ${
                      pointsSign === '+'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-[#1A1A22] text-[#A0A0AC]'
                    }`}
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => setPointsSign('-')}
                    className={`px-3 py-1.5 text-xs font-bold transition-colors ${
                      pointsSign === '-' ? 'bg-rose-600 text-white' : 'bg-[#1A1A22] text-[#A0A0AC]'
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
                  className="w-24 px-2.5 py-1.5 text-xs bg-[#1A1A22] border border-[#272733] rounded-md font-mono text-white focus:outline-none focus:border-cyan-400"
                />
                <button
                  type="button"
                  onClick={handlePointsSubmit}
                  className="flex-1 py-1.5 px-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-md text-xs font-bold transition-colors"
                >
                  Terapkan Points
                </button>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#16161D] border border-[#272733] space-y-2">
              <label
                htmlFor="role-viewer-select-btn"
                className="text-[11px] text-[#A0A0AC] font-medium block"
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
                    className={`py-1.5 rounded text-[11px] font-bold uppercase transition-colors border ${
                      viewer.role === r
                        ? 'bg-cyan-950 border-cyan-500 text-cyan-300'
                        : 'bg-[#1A1A22] border-[#272733] text-[#A0A0AC] hover:text-white'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-900/40 space-y-2">
              <label htmlFor="timeout-5m-btn" className="text-[11px] text-rose-300 font-bold block">
                Tindakan Disiplin & Timeout
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  id="timeout-5m-btn"
                  type="button"
                  onClick={() => handleTimeoutClick(5)}
                  className="py-1.5 px-2 rounded bg-[#1A1A22] hover:bg-rose-900/30 border border-rose-800/40 text-rose-300 text-xs font-medium transition-colors"
                >
                  Timeout 5m
                </button>
                <button
                  type="button"
                  onClick={() => handleTimeoutClick(60)}
                  className="py-1.5 px-2 rounded bg-[#1A1A22] hover:bg-rose-900/30 border border-rose-800/40 text-rose-300 text-xs font-medium transition-colors"
                >
                  Timeout 1 Jam
                </button>
                <button
                  type="button"
                  onClick={() => handleTimeoutClick(1440)}
                  className="py-1.5 px-2 rounded bg-[#1A1A22] hover:bg-rose-900/30 border border-rose-800/40 text-rose-300 text-xs font-medium transition-colors"
                >
                  Timeout 24 Jam
                </button>
              </div>

              <button
                type="button"
                onClick={handleBanClick}
                className="w-full mt-2 py-2 px-3 rounded bg-rose-950 hover:bg-rose-900 border border-rose-600 text-rose-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
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
