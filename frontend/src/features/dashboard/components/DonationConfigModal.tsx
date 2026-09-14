import { Flame, Music, Sparkles, Volume2, X, Zap } from 'lucide-react';
import { useState } from 'react';
import type { AlertVisualTemplate, DonationConfigState } from '../types/overlay-lab.types';

export interface DonationConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: DonationConfigState;
  onSaveConfig: (newConfig: DonationConfigState) => void;
  onTestSound: () => void;
}

export function DonationConfigModal({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  onTestSound,
}: DonationConfigModalProps) {
  const [draftTemplate, setDraftTemplate] = useState<AlertVisualTemplate>(config.template);
  const [draftDuration, setDraftDuration] = useState<number>(config.durationSec);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveConfig({
      ...config,
      template: draftTemplate,
      durationSec: draftDuration,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs font-sans text-[#F4F4F6]">
      <div className="relative w-full max-w-[460px] rounded-2xl bg-[#131318] border border-[#272733] shadow-2xl overflow-hidden flex flex-col">
        <div className="px-5 py-4 border-b border-[#272733] bg-[#16161D] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-950/60 border border-amber-500/40 text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-white tracking-tight">
              Kustomisasi Alert Donasi & FX
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#1A1A22] hover:bg-[#272733] text-[#A0A0AC] hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5 overflow-y-auto max-h-[80vh]">
          <p className="text-xs text-[#A0A0AC]">
            Pilih template visual alert box, efek audio chime, dan animasi meme saat donasi Saweria
            masuk di OBS.
          </p>

          <div className="space-y-2.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#A0A0AC] flex items-center gap-1.5">
              <span>1. PILIH TEMPLATE EFEK VISUAL</span>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setDraftTemplate('electric-lightning')}
                className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                  draftTemplate === 'electric-lightning'
                    ? 'bg-amber-950/20 border-amber-400/60 shadow-lg shadow-amber-950/30'
                    : 'bg-[#16161D] border-[#272733] hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">Electric Lightning Frame</h3>
                    <p className="text-[11px] text-[#A0A0AC]">
                      Border neon petir kuning pendar dengan efek flash
                    </p>
                  </div>
                </div>
                {draftTemplate === 'electric-lightning' && (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-500/40">
                    Aktif
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setDraftTemplate('fire-flame')}
                className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                  draftTemplate === 'fire-flame'
                    ? 'bg-rose-950/20 border-rose-500/60 shadow-lg shadow-rose-950/30'
                    : 'bg-[#16161D] border-[#272733] hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/30">
                    <Flame className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">Fire Flame Frame</h3>
                    <p className="text-[11px] text-[#A0A0AC]">
                      Efek partikel api membara merah-oranye tier besar
                    </p>
                  </div>
                </div>
                {draftTemplate === 'fire-flame' && (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-500/40">
                    Aktif
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setDraftTemplate('cat-jam')}
                className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                  draftTemplate === 'cat-jam'
                    ? 'bg-cyan-950/20 border-cyan-400/60 shadow-lg shadow-cyan-950/30'
                    : 'bg-[#16161D] border-[#272733] hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                    <Music className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">Cat Jam Meme GIF</h3>
                    <p className="text-[11px] text-[#A0A0AC]">
                      Animasi kucing bergoyang dengan headphone audio
                    </p>
                  </div>
                </div>
                {draftTemplate === 'cat-jam' && (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/40">
                    Aktif
                  </span>
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#A0A0AC]">
              2. AUDIO CHIME & EFEK SUARA
            </div>

            <div className="p-3.5 rounded-xl bg-[#16161D] border border-[#272733] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">
                  Melodic Chime C6-E6-G6 (Native Web Audio)
                </span>
                <button
                  type="button"
                  onClick={onTestSound}
                  className="px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Putar Suara</span>
                </button>
              </div>
              <p className="text-[11px] text-[#A0A0AC]">
                Sintesis nada Web Audio langsung di browser — Zero latency, tanpa perlu file MP3
                eksternal.
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#A0A0AC]">
              3. DURASI TAMPIL ALERT DI OBS
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[4, 6, 8, 10].map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => setDraftDuration(sec)}
                  className={`py-2 rounded-xl text-xs font-mono font-bold transition-all border ${
                    draftDuration === sec
                      ? 'bg-cyan-600 border-cyan-400 text-white shadow-md'
                      : 'bg-[#16161D] border-[#272733] text-[#A0A0AC] hover:text-white'
                  }`}
                >
                  {sec}.0 Detik
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="px-5 py-3.5 border-t border-[#272733] bg-[#16161D] flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#1A1A22] hover:bg-[#272733] border border-[#272733] text-xs font-bold text-[#A0A0AC] hover:text-white transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-cyan-950/50 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            <span>Simpan & Terapkan</span>
          </button>
        </div>
      </div>
    </div>
  );
}
