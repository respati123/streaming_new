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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs font-sans text-slate-800 animate-in fade-in duration-150">
      <div className="relative w-full max-w-[480px] rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-600">
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              Kustomisasi Alert Donasi & FX
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-400 hover:text-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5 overflow-y-auto max-h-[80vh]">
          <p className="text-xs text-slate-500">
            Pilih template visual alert box, efek audio chime, dan animasi meme saat donasi Saweria
            masuk di OBS.
          </p>

          <div className="space-y-2.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <span>1. PILIH TEMPLATE EFEK VISUAL</span>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setDraftTemplate('electric-lightning')}
                className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                  draftTemplate === 'electric-lightning'
                    ? 'bg-amber-50/60 border-amber-400 shadow-xs ring-1 ring-amber-400/20'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-amber-100 text-amber-600 border border-amber-200">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">Electric Lightning Frame</h3>
                    <p className="text-[11px] text-slate-500">
                      Border neon petir kuning pendar dengan efek flash
                    </p>
                  </div>
                </div>
                {draftTemplate === 'electric-lightning' && (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-300">
                    Aktif
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setDraftTemplate('fire-flame')}
                className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                  draftTemplate === 'fire-flame'
                    ? 'bg-rose-50/60 border-rose-400 shadow-xs ring-1 ring-rose-400/20'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-rose-100 text-rose-600 border border-rose-200">
                    <Flame className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">Fire Flame Frame</h3>
                    <p className="text-[11px] text-slate-500">
                      Efek partikel api membara merah-oranye tier besar
                    </p>
                  </div>
                </div>
                {draftTemplate === 'fire-flame' && (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 border border-rose-300">
                    Aktif
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setDraftTemplate('cat-jam')}
                className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                  draftTemplate === 'cat-jam'
                    ? 'bg-sky-50/60 border-sky-400 shadow-xs ring-1 ring-sky-400/20'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-sky-100 text-sky-600 border border-sky-200">
                    <Music className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">Cat Jam Meme GIF</h3>
                    <p className="text-[11px] text-slate-500">
                      Animasi kucing bergoyang dengan headphone audio
                    </p>
                  </div>
                </div>
                {draftTemplate === 'cat-jam' && (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 border border-sky-300">
                    Aktif
                  </span>
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              2. AUDIO CHIME & EFEK SUARA
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">
                  Melodic Chime C6-E6-G6 (Native Web Audio)
                </span>
                <button
                  type="button"
                  onClick={onTestSound}
                  className="px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Putar Suara</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                Sintesis nada Web Audio langsung di browser — Zero latency, tanpa perlu file MP3
                eksternal.
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
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
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {sec}.0 Detik
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50/80 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            <span>Simpan & Terapkan</span>
          </button>
        </div>
      </div>
    </div>
  );
}
