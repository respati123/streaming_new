import { Crown, Shield, Sparkles, Trash2, Volume2 } from 'lucide-react';
import type { StageAlert, StageChat } from '../types/overlay-lab.types';

export interface ObsVirtualCanvasProps {
  activeAlert: StageAlert | null;
  stageChats: StageChat[];
  onClearStage: () => void;
}

export function ObsVirtualCanvas({ activeAlert, stageChats, onClearStage }: ObsVirtualCanvasProps) {
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'mod':
        return (
          <span className="flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-bold bg-zinc-950/90 text-zinc-300 border border-zinc-500/50">
            <Shield className="w-2.5 h-2.5" /> MOD
          </span>
        );
      case 'vip':
        return (
          <span className="flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-950/90 text-amber-300 border border-amber-500/50">
            <Crown className="w-2.5 h-2.5" /> VIP
          </span>
        );
      case 'member':
        return (
          <span className="flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-950/90 text-emerald-300 border border-emerald-500/50">
            <Sparkles className="w-2.5 h-2.5" /> Member
          </span>
        );
      default:
        return (
          <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-zinc-800/80 text-zinc-400 border border-zinc-700/50">
            Viewer
          </span>
        );
    }
  };

  const getAlertStyle = () => {
    if (!activeAlert) return '';
    switch (activeAlert.template) {
      case 'electric-lightning':
        return 'border-amber-400 bg-[#F4F4F5]/95 shadow-[0_0_25px_rgba(245,158,11,0.4)] ring-1 ring-amber-400/50';
      case 'fire-flame':
        return 'border-rose-500 bg-[#F4F4F5]/95 shadow-[0_0_25px_rgba(244,63,94,0.4)] ring-1 ring-rose-500/50';
      case 'cat-jam':
        return 'border-zinc-400 bg-[#F4F4F5]/95 shadow-[0_0_25px_rgba(34,211,238,0.4)] ring-1 ring-zinc-400/50';
      default:
        return 'border-zinc-500 bg-[#F4F4F5]/95';
    }
  };

  return (
    <div className="bg-[#FFFFFF] rounded-2xl border border-[#D4D4D8] overflow-hidden shadow-xl flex flex-col font-sans text-[#18181B]">
      <div className="px-4 py-3 border-b border-[#D4D4D8] bg-[#F4F4F5] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-[11px] font-mono font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
            <span>LIVE RENDER 1080p (OBS Stage)</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onClearStage}
          className="px-2.5 py-1 rounded-lg bg-[#E4E4E7] hover:bg-rose-950/50 border border-[#D4D4D8] hover:border-rose-700/50 text-xs font-semibold text-[#52525B] hover:text-rose-300 flex items-center gap-1.5 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Stage</span>
        </button>
      </div>

      <div className="relative w-full aspect-video bg-[#FAFAFA] flex flex-col justify-between p-4 overflow-hidden select-none">
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#D4D4D8_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="relative z-10 flex justify-between items-center">
          <div className="px-3 py-1 rounded-full bg-[#FFFFFF]/90 backdrop-blur-md border border-[#D4D4D8] text-[11px] font-mono flex items-center gap-2 text-zinc-300">
            <span className="text-amber-400 font-bold">🎯 Saweria Goal:</span>
            <span>Rp 1.500.000 / Rp 2.000.000 (75%)</span>
          </div>

          <div className="px-2.5 py-0.5 rounded-full bg-[#FFFFFF]/80 backdrop-blur-md border border-[#D4D4D8] text-[10px] font-mono text-zinc-400">
            OBS Canvas: 1920x1080
          </div>
        </div>

        <div className="relative z-10 flex-1 flex items-center justify-center my-2">
          {activeAlert ? (
            <div
              className={`relative max-w-[480px] w-full p-4 rounded-2xl border-2 transition-all transform animate-in fade-in zoom-in-95 duration-200 ${getAlertStyle()}`}
            >
              <div className="absolute -top-2.5 right-4 px-2 py-0.5 rounded bg-[#E4E4E7] border border-[#D4D4D8] text-[10px] font-mono text-zinc-400 flex items-center gap-1">
                <span>⏱</span>
                <span>{activeAlert.remainingSec.toFixed(1)}s</span>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-14 h-14 rounded-xl bg-[#E4E4E7] border border-[#D4D4D8] flex items-center justify-center shrink-0 overflow-hidden shadow-md">
                  <div className="text-2xl animate-bounce">🐱</div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-white tracking-tight truncate">
                      {activeAlert.donorName}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold font-mono bg-amber-950/80 text-amber-300 border border-amber-500/50">
                      {activeAlert.currency} {activeAlert.amount.toLocaleString('id-ID')}
                    </span>
                  </div>

                  <p className="mt-1.5 text-xs text-zinc-200 line-clamp-2 leading-relaxed font-medium">
                    "{activeAlert.message}"
                  </p>

                  <div className="mt-2 flex items-center gap-2 text-[10px] font-mono text-zinc-400">
                    <Volume2 className="w-3 h-3 text-zinc-400 shrink-0" />
                    <span>Melodic Chime C6-E6-G6 • Saweria Webhook</span>
                    <div className="flex items-center gap-0.5 ml-auto">
                      <span className="w-1 h-2 bg-zinc-400 rounded-full animate-pulse" />
                      <span className="w-1 h-3 bg-zinc-400 rounded-full animate-pulse delay-75" />
                      <span className="w-1 h-4 bg-zinc-400 rounded-full animate-pulse delay-150" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-[#71717A] font-mono text-xs flex flex-col items-center gap-1">
              <Sparkles className="w-5 h-5 opacity-40" />
              <span>Menunggu pemicu alert donasi Saweria...</span>
            </div>
          )}
        </div>

        <div className="relative z-10 flex items-end justify-between gap-4">
          <div className="w-full max-w-[340px] space-y-1.5">
            <div className="text-[10px] font-mono text-zinc-400 px-1">Stream Chat Stage Box</div>
            <div className="space-y-1 max-h-[140px] overflow-y-auto flex flex-col-reverse pr-1">
              {stageChats.length === 0 ? (
                <div className="text-[11px] text-[#71717A] font-mono italic px-2 py-1">
                  Chat overlay kosong
                </div>
              ) : (
                stageChats.map((c) => (
                  <div
                    key={c.id}
                    className="p-1.5 px-2.5 rounded-lg bg-[#FFFFFF]/90 backdrop-blur-md border border-[#D4D4D8] text-xs flex items-center gap-2 shadow-xs animate-in slide-in-from-bottom-2 duration-150"
                  >
                    {getRoleBadge(c.role)}
                    <span className="font-bold text-white text-[11px] shrink-0">{c.username}:</span>
                    <span className="text-zinc-200 text-[11px] truncate">{c.message}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="px-2.5 py-1 rounded bg-[#FFFFFF]/80 backdrop-blur-md border border-[#D4D4D8] text-[10px] font-mono text-emerald-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>OBS Source Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
