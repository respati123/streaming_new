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
    <div className="space-y-6 font-sans text-[#18181B]">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#FFFFFF] p-5 rounded-2xl border border-[#D4D4D8] shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="px-3 py-1.5 rounded-lg bg-[#F4F4F5] hover:bg-[#E4E4E7] border border-[#D4D4D8] text-xs font-semibold text-[#52525B] hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Tabel</span>
            </button>
            <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-zinc-400" />
              <span>Loyalty Tiers, Points System & Auto-Moderation Rules</span>
            </h1>
          </div>
          <p className="text-xs text-[#52525B] font-mono">
            Konfigurasi otomatisasi reward penonton, multiplier Saweria, batas spam chat, dan
            blacklist kata terlarang.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {saveSuccess && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold bg-emerald-950/60 px-3 py-1.5 rounded-lg border border-emerald-500/40 animate-pulse">
              <CheckCircle2 className="w-4 h-4" />
              <span>Pengaturan Tersimpan!</span>
            </div>
          )}
          <button
            type="button"
            onClick={handleSaveClick}
            className="px-4 py-2 rounded-xl bg-zinc-600 hover:bg-zinc-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-zinc-950/50 transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Konfigurasi</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#D4D4D8] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-amber-950/60 border border-amber-500/30 text-amber-400">
                  <Crown className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">Hierarki Loyalty Tiers</h2>
                  <p className="text-[11px] text-[#52525B]">
                    Multiplier points dan hak istimewa badge overlay
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-mono font-bold text-zinc-400 bg-zinc-950/40 px-2.5 py-1 rounded-md border border-zinc-800/40">
                4 Active Tiers
              </span>
            </div>

            <div className="space-y-3">
              {tiers.map((t) => (
                <div
                  key={t.id}
                  className={`p-4 rounded-xl bg-[#F4F4F5] border transition-all ${t.borderColor}`}
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
                        <p className="text-[11px] text-[#52525B] font-mono">
                          Minimal:{' '}
                          <span className="text-white font-bold">
                            {t.minPoints.toLocaleString('id-ID')} pts
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#E4E4E7] border border-[#D4D4D8] text-white">
                        {t.multiplier}x Multiplier
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {t.perks.map((p) => (
                      <span
                        key={p}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#E4E4E7] text-[#52525B] border border-[#D4D4D8]"
                      >
                        ✓ {p}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#D4D4D8] space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Aturan Akumulasi Points</h2>
                <p className="text-[11px] text-[#52525B]">
                  Trigger penambahan points dari aktivitas interaksi
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              {pointsRules.map((r) => (
                <div
                  key={r.id}
                  className="p-3 rounded-xl bg-[#F4F4F5] border border-[#D4D4D8] flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-xs font-bold text-white">{r.title}</h4>
                    <p className="text-[11px] text-[#52525B]">{r.description}</p>
                    <span className="text-[10px] font-mono text-zinc-400 mt-1 inline-block">
                      Cooldown: {r.cooldownText}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-400">
                      +{r.pointsAwarded} pts
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 space-y-6">
          <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#D4D4D8] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-zinc-950/60 border border-zinc-500/30 text-zinc-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">Auto-Moderation Engine</h2>
                  <p className="text-[11px] text-[#52525B]">
                    Filter otomatis spam, flood, dan caps berlebih
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {moderationRules.map((rule) => (
                <div
                  key={rule.id}
                  className="p-3.5 rounded-xl bg-[#F4F4F5] border border-[#D4D4D8] flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-white">{rule.name}</h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#E4E4E7] text-[#52525B] border border-[#D4D4D8]">
                        Batas: {rule.threshold} {rule.unit}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#52525B] mt-1">{rule.description}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onToggleRule(rule.id)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      rule.enabled ? 'bg-zinc-600' : 'bg-[#D4D4D8]'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        rule.enabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#D4D4D8] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-rose-950/60 border border-rose-500/30 text-rose-400">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">Banned Words Blacklist</h2>
                  <p className="text-[11px] text-[#52525B]">
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
                className="flex-1 px-3 py-1.5 text-xs bg-[#F4F4F5] border border-[#D4D4D8] rounded-lg text-white font-mono focus:outline-none focus:border-zinc-400"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah</span>
              </button>
            </form>

            <div className="flex flex-wrap gap-2 pt-2">
              {bannedWords.map((word) => (
                <span
                  key={word}
                  className="px-2.5 py-1 rounded-lg bg-[#F4F4F5] border border-rose-900/40 text-rose-300 text-xs font-mono flex items-center gap-1.5"
                >
                  <span>{word}</span>
                  <button
                    type="button"
                    onClick={() => onRemoveBannedWord(word)}
                    className="text-rose-400 hover:text-white"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#D4D4D8] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-rose-300 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" />
                <span>Daftar User Blacklist ({blacklistedUsers.length})</span>
              </h3>
            </div>

            <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
              {blacklistedUsers.length === 0 ? (
                <div className="p-4 text-center text-xs text-[#52525B] font-mono">
                  Belum ada penonton di daftar blacklist.
                </div>
              ) : (
                blacklistedUsers.map((b) => (
                  <div
                    key={b.id}
                    className="p-2.5 rounded-lg bg-[#F4F4F5] border border-[#D4D4D8] flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-white">{b.username}</span>
                      <p className="text-[11px] text-[#52525B]">{b.reason}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onUnbanUser(b.id)}
                      className="px-2.5 py-1 rounded bg-[#E4E4E7] hover:bg-emerald-950/60 border border-[#D4D4D8] hover:border-emerald-500/40 text-xs font-semibold text-[#52525B] hover:text-emerald-300 transition-colors"
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
