import {
  ArrowLeft,
  CheckCircle2,
  Crown,
  Plus,
  Save,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useState } from 'react';
import type {
  AutoModerationRule,
  BlacklistedUser,
  LoyaltyTierConfig,
  PointsRuleConfig,
} from '../types/user-management.types';

export interface LoyaltyRulesViewProps {
  onBack: () => void;
  onSave: () => void;
  tiers: LoyaltyTierConfig[];
  pointsRules: PointsRuleConfig[];
  moderationRules: AutoModerationRule[];
  blacklistedUsers: BlacklistedUser[];
  onToggleRule: (ruleId: string) => void;
  onAddBannedWord: (word: string) => void;
  onRemoveBannedWord: (word: string) => void;
  bannedWords: string[];
  onUnbanUser: (userId: string) => void;
}

export function LoyaltyRulesView({
  onBack,
  onSave,
  tiers,
  pointsRules,
  moderationRules,
  blacklistedUsers,
  onToggleRule,
  onAddBannedWord,
  onRemoveBannedWord,
  bannedWords,
  onUnbanUser,
}: LoyaltyRulesViewProps) {
  const [newWord, setNewWord] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleAddWordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newWord.trim()) {
      onAddBannedWord(newWord.trim());
      setNewWord('');
    }
  };

  const handleSaveClick = () => {
    onSave();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 font-sans text-slate-800">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Tabel</span>
            </button>
            <h1 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-600" />
              <span>Loyalty Tiers, Points System & Auto-Moderation Rules</span>
            </h1>
          </div>
          <p className="text-xs text-slate-500 font-mono">
            Konfigurasi otomatisasi reward penonton, multiplier Saweria, batas spam chat, dan
            blacklist kata terlarang.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {saveSuccess && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 animate-pulse">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Pengaturan Tersimpan!</span>
            </div>
          )}
          <button
            type="button"
            onClick={handleSaveClick}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Konfigurasi</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 space-y-6">
          {/* Tiers Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-600">
                  <Crown className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Hierarki Loyalty Tiers</h2>
                  <p className="text-[11px] text-slate-500">
                    Multiplier points dan hak istimewa badge overlay
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-mono font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200">
                4 Active Tiers
              </span>
            </div>

            <div className="space-y-3">
              {tiers.map((t) => (
                <div
                  key={t.id}
                  className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 hover:border-slate-300 transition-all shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-1.5 rounded-lg border ${t.badgeBg} ${t.color}`}>
                        <Crown className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className={`text-xs font-bold uppercase tracking-wider ${t.color}`}>
                          {t.name}
                        </h3>
                        <p className="text-[11px] text-slate-500 font-mono">
                          Minimal:{' '}
                          <span className="text-slate-900 font-bold">
                            {t.minPoints.toLocaleString('id-ID')} pts
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-800 shadow-xs">
                        {t.multiplier}x Multiplier
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {t.perks.map((p) => (
                      <span
                        key={p}
                        className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white text-slate-600 border border-slate-200"
                      >
                        ✓ {p}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Points Rules Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4 shadow-sm">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Aturan Akumulasi Points</h2>
                <p className="text-[11px] text-slate-500">
                  Trigger penambahan points dari aktivitas interaksi
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              {pointsRules.map((r) => (
                <div
                  key={r.id}
                  className="p-3 rounded-xl bg-slate-50/70 border border-slate-200 flex items-center justify-between shadow-xs"
                >
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{r.title}</h4>
                    <p className="text-[11px] text-slate-500">{r.description}</p>
                    <span className="text-[10px] font-mono text-slate-400 mt-1 inline-block">
                      Cooldown: {r.cooldownText}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700">
                      +{r.pointsAwarded} pts
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 space-y-6">
          {/* Auto Moderation */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Auto-Moderation Engine</h2>
                  <p className="text-[11px] text-slate-500">
                    Filter otomatis spam, flood, dan caps berlebih
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {moderationRules.map((rule) => (
                <div
                  key={rule.id}
                  className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200 flex items-center justify-between gap-3 shadow-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900">{rule.name}</h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white text-slate-600 border border-slate-200">
                        Batas: {rule.threshold} {rule.unit}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">{rule.description}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onToggleRule(rule.id)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      rule.enabled ? 'bg-indigo-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        rule.enabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Banned Words */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-600">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Banned Words Blacklist</h2>
                  <p className="text-[11px] text-slate-500">
                    Kata atau frasa yang otomatis disensor / di-block
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleAddWordSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder="Tambahkan kata terlarang..."
                value={newWord}
                onChange={(e) => setNewWord(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono focus:outline-none focus:bg-white focus:border-rose-500 focus:ring-1 focus:ring-rose-500/20"
              />
              <button
                type="submit"
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah</span>
              </button>
            </form>

            <div className="flex flex-wrap gap-2 pt-2">
              {bannedWords.map((word) => (
                <span
                  key={word}
                  className="px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-mono flex items-center gap-1.5 font-medium"
                >
                  <span>{word}</span>
                  <button
                    type="button"
                    onClick={() => onRemoveBannedWord(word)}
                    className="text-rose-500 hover:text-rose-800 font-bold ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Blacklisted Users */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-rose-700 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                <span>Daftar User Blacklist ({blacklistedUsers.length})</span>
              </h3>
            </div>

            <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
              {blacklistedUsers.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400 font-mono">
                  Belum ada penonton di daftar blacklist.
                </div>
              ) : (
                blacklistedUsers.map((b) => (
                  <div
                    key={b.id}
                    className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-900">{b.username}</span>
                      <p className="text-[11px] text-slate-500">{b.reason}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onUnbanUser(b.id)}
                      className="px-2.5 py-1 rounded-md bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-xs font-semibold text-slate-700 hover:text-emerald-700 transition-colors shadow-xs"
                    >
                      Cabut Ban
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
