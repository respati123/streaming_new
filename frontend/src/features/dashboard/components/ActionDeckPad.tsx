import { useState } from 'react';
import {
  RiFireLine,
  RiFlashlightLine,
  RiGamepadLine,
  RiNotification3Line,
  RiPlayFill,
  RiSparklingLine,
  RiVolumeUpLine,
} from 'react-icons/ri';
import type { ActionItem } from '../types/dashboard.types';

export interface ActionDeckPadProps {
  actions: ActionItem[];
  onTriggerAction: (actionIdOrName: string) => Promise<void>;
  onTriggerTestAlert: (payload: {
    donorName: string;
    amount: number;
    currency: string;
    message?: string;
  }) => Promise<void>;
  isBotConnected: boolean;
}

export function ActionDeckPad({
  actions,
  onTriggerAction,
  onTriggerTestAlert,
  isBotConnected,
}: ActionDeckPadProps) {
  const [activeTrigger, setActiveTrigger] = useState<string | null>(null);
  const [testDonor, setTestDonor] = useState('Budi_Santoso');
  const [testAmount, setTestAmount] = useState('50000');
  const [testMessage, setTestMessage] = useState(
    'Semangat live streamnya bang! Tetap konsisten gass'
  );
  const [isAlertSending, setIsAlertSending] = useState(false);

  const handleActionClick = async (action: ActionItem) => {
    setActiveTrigger(action.actionId);
    try {
      await onTriggerAction(action.actionId);
    } finally {
      setTimeout(() => setActiveTrigger(null), 300);
    }
  };

  const handleAlertSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAlertSending(true);
    try {
      await onTriggerTestAlert({
        donorName: testDonor.trim() || 'Anonymous',
        amount: Number.parseFloat(testAmount) || 10000,
        currency: 'Rp',
        message: testMessage.trim(),
      });
    } finally {
      setIsAlertSending(false);
    }
  };

  const getIcon = (iconName: string) => {
    switch (iconName.toLowerCase()) {
      case 'sparkles':
      case 'sparkle':
        return <RiSparklingLine className="text-emerald-400 text-sm" />;
      case 'volume2':
      case 'sound':
      case 'speaker':
        return <RiVolumeUpLine className="text-amber-400 text-sm" />;
      case 'gamepad2':
      case 'game':
        return <RiGamepadLine className="text-zinc-400 text-sm" />;
      case 'flame':
      case 'fire':
        return <RiFireLine className="text-rose-400 text-sm" />;
      default:
        return <RiFlashlightLine className="text-zinc-400 text-sm" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#FFFFFF] overflow-hidden border border-[#D4D4D8] shadow-xl rounded-2xl font-sans text-[#18181B]">
      <div className="p-3.5 border-b border-[#D4D4D8] bg-[#F4F4F5] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-zinc-950/60 border border-zinc-800/50 text-zinc-400">
            <RiFlashlightLine className="text-base" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-white tracking-tight uppercase font-mono">
              Action Deck & Macros Pad
            </h2>
          </div>
        </div>
        <span
          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
            isBotConnected
              ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40'
              : 'bg-[#E4E4E7] text-[#52525B] border border-[#D4D4D8]'
          }`}
        >
          {isBotConnected ? 'GATEWAY READY' : 'BOT OFFLINE'}
        </span>
      </div>

      <div className="p-3.5 flex-1 overflow-y-auto space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[11px] font-bold text-[#52525B] uppercase font-mono tracking-wider">
              Streamer.bot Key Deck
            </h3>
            <span className="text-[10px] text-zinc-400 font-mono">{actions.length} Keys</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {actions.length === 0 ? (
              <div className="col-span-2 p-6 text-center text-xs text-[#52525B] font-mono bg-[#F4F4F5] rounded-xl border border-[#D4D4D8]">
                Belum ada preset action termuat.
              </div>
            ) : (
              actions.map((act) => {
                const isTriggered = activeTrigger === act.actionId;
                return (
                  <button
                    key={act.id || act.actionId}
                    type="button"
                    onClick={() => handleActionClick(act)}
                    className={`p-3 text-left flex flex-col justify-between h-20 group relative rounded-xl transition-all border ${
                      isTriggered
                        ? 'bg-zinc-950/60 border-zinc-400 shadow-md ring-1 ring-zinc-400/50'
                        : 'bg-[#F4F4F5] hover:bg-[#E4E4E7] border-[#D4D4D8]'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="p-1 rounded-lg bg-[#E4E4E7] border border-[#D4D4D8]">
                        {getIcon(act.icon)}
                      </div>
                      <span className="text-[9px] font-mono font-semibold text-[#52525B] uppercase">
                        {act.category}
                      </span>
                    </div>

                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-zinc-300 transition-colors truncate">
                        {act.name}
                      </div>
                      <div className="text-[10px] text-[#52525B] font-mono truncate">
                        ID: {act.actionId}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="pt-3 border-t border-[#D4D4D8]">
          <h3 className="text-[11px] font-bold text-white uppercase font-mono mb-2.5 flex items-center gap-1.5">
            <RiNotification3Line className="text-amber-400 text-sm" />
            <span>Simulasi Alert Saweria Cepat</span>
          </h3>

          <form
            onSubmit={handleAlertSubmit}
            className="space-y-2.5 bg-[#F4F4F5] p-3 rounded-xl border border-[#D4D4D8]"
          >
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label
                  htmlFor="deck-donor-input"
                  className="block text-[10px] font-bold text-[#52525B] mb-1 font-sans"
                >
                  Nama Donatur
                </label>
                <input
                  id="deck-donor-input"
                  type="text"
                  value={testDonor}
                  onChange={(e) => setTestDonor(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-[#FFFFFF] border border-[#D4D4D8] rounded-lg font-mono focus:outline-none focus:border-zinc-400 font-medium text-white"
                />
              </div>

              <div>
                <label
                  htmlFor="deck-amount-input"
                  className="block text-[10px] font-bold text-[#52525B] mb-1 font-sans"
                >
                  Nominal (Rp)
                </label>
                <input
                  id="deck-amount-input"
                  type="number"
                  step="5000"
                  value={testAmount}
                  onChange={(e) => setTestAmount(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-[#FFFFFF] border border-[#D4D4D8] rounded-lg font-mono font-bold text-amber-400 focus:outline-none focus:border-zinc-400"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="deck-message-input"
                className="block text-[10px] font-bold text-[#52525B] mb-1 font-sans"
              >
                Pesan Donasi
              </label>
              <textarea
                id="deck-message-input"
                rows={2}
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-[#FFFFFF] border border-[#D4D4D8] rounded-lg focus:outline-none focus:border-zinc-400 font-sans text-white"
              />
            </div>

            <button
              type="submit"
              disabled={isAlertSending}
              className="w-full py-2 px-3 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-xl shadow-md flex items-center justify-center gap-2 disabled:opacity-50 font-sans transition-colors"
            >
              <RiPlayFill className="text-sm" />
              <span>{isAlertSending ? 'Memancarkan Alert...' : 'Tembakkan Alert Donasi'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
