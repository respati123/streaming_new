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

  const getActionColorTheme = (iconName: string, category: string) => {
    const key = (iconName + ' ' + category).toLowerCase();
    if (key.includes('sound') || key.includes('volume') || key.includes('speaker')) {
      return {
        bg: 'bg-amber-50/70 hover:bg-amber-100/80 border-amber-200/90 text-amber-950',
        badgeBg: 'bg-amber-100 text-amber-700',
        icon: <RiVolumeUpLine className="text-amber-600 text-sm" />,
        categoryText: 'text-amber-700 font-bold',
      };
    }
    if (key.includes('flame') || key.includes('fire')) {
      return {
        bg: 'bg-rose-50/70 hover:bg-rose-100/80 border-rose-200/90 text-rose-950',
        badgeBg: 'bg-rose-100 text-rose-700',
        icon: <RiFireLine className="text-rose-600 text-sm" />,
        categoryText: 'text-rose-700 font-bold',
      };
    }
    if (key.includes('game') || key.includes('gamepad')) {
      return {
        bg: 'bg-sky-50/70 hover:bg-sky-100/80 border-sky-200/90 text-sky-950',
        badgeBg: 'bg-sky-100 text-sky-700',
        icon: <RiGamepadLine className="text-sky-600 text-sm" />,
        categoryText: 'text-sky-700 font-bold',
      };
    }
    if (key.includes('sparkle') || key.includes('loyalty') || key.includes('reward')) {
      return {
        bg: 'bg-emerald-50/70 hover:bg-emerald-100/80 border-emerald-200/90 text-emerald-950',
        badgeBg: 'bg-emerald-100 text-emerald-700',
        icon: <RiSparklingLine className="text-emerald-600 text-sm" />,
        categoryText: 'text-emerald-700 font-bold',
      };
    }
    return {
      bg: 'bg-indigo-50/60 hover:bg-indigo-100/70 border-indigo-200/90 text-indigo-950',
      badgeBg: 'bg-indigo-100 text-indigo-700',
      icon: <RiFlashlightLine className="text-indigo-600 text-sm" />,
      categoryText: 'text-indigo-700 font-bold',
    };
  };

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden border border-slate-200 rounded-2xl shadow-xs font-sans text-slate-900">
      <div className="p-3.5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-600 shadow-xs">
            <RiFlashlightLine className="text-base" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-900 tracking-tight uppercase font-mono">
              Action Deck & Macros Pad
            </h2>
          </div>
        </div>
        <span
          className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${
            isBotConnected
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-slate-100 text-slate-500 border border-slate-200'
          }`}
        >
          {isBotConnected ? 'GATEWAY READY' : 'BOT OFFLINE'}
        </span>
      </div>

      <div className="p-3.5 flex-1 overflow-y-auto space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[11px] font-bold text-slate-500 uppercase font-mono tracking-wider">
              Streamer.bot Key Deck
            </h3>
            <span className="text-[10px] text-slate-500 font-mono font-semibold">{actions.length} Keys Configured</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {actions.length === 0 ? (
              <div className="col-span-2 p-6 text-center text-xs text-slate-400 font-mono bg-slate-50 rounded-xl border border-slate-200">
                Belum ada preset action termuat.
              </div>
            ) : (
              actions.map((act) => {
                const isTriggered = activeTrigger === act.actionId;
                const theme = getActionColorTheme(act.icon, act.category);
                return (
                  <button
                    key={act.id || act.actionId}
                    type="button"
                    onClick={() => handleActionClick(act)}
                    className={`p-3 text-left flex flex-col justify-between h-20 group relative rounded-xl transition-all border shadow-2xs ${theme.bg} ${
                      isTriggered
                        ? 'ring-2 ring-indigo-500 shadow-md scale-[0.98]'
                        : 'hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className={`p-1 rounded-lg ${theme.badgeBg}`}>
                        {theme.icon}
                      </div>
                      <span className={`text-[9px] font-mono uppercase ${theme.categoryText}`}>
                        {act.category}
                      </span>
                    </div>

                    <div>
                      <div className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                        {act.name}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono truncate">
                        ID: {act.actionId}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="pt-3 border-t border-slate-200">
          <h3 className="text-[11px] font-bold text-slate-900 uppercase font-mono mb-2.5 flex items-center gap-1.5">
            <RiNotification3Line className="text-amber-500 text-sm" />
            <span>Simulasi Alert Saweria Cepat</span>
          </h3>

          <form
            onSubmit={handleAlertSubmit}
            className="space-y-2.5 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200"
          >
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label
                  htmlFor="deck-donor-input"
                  className="block text-[10px] font-bold text-slate-600 mb-1 font-sans"
                >
                  Nama Donatur
                </label>
                <input
                  id="deck-donor-input"
                  type="text"
                  value={testDonor}
                  onChange={(e) => setTestDonor(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-mono focus:outline-none focus:border-indigo-500 font-medium text-slate-900"
                />
              </div>

              <div>
                <label
                  htmlFor="deck-amount-input"
                  className="block text-[10px] font-bold text-slate-600 mb-1 font-sans"
                >
                  Nominal (Rp)
                </label>
                <input
                  id="deck-amount-input"
                  type="number"
                  step="5000"
                  value={testAmount}
                  onChange={(e) => setTestAmount(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-mono font-bold text-amber-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="deck-message-input"
                className="block text-[10px] font-bold text-slate-600 mb-1 font-sans"
              >
                Pesan Donasi
              </label>
              <textarea
                id="deck-message-input"
                rows={2}
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 font-sans text-slate-900"
              />
            </div>

            <button
              type="submit"
              disabled={isAlertSending}
              className="w-full py-2 px-3 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 disabled:opacity-50 font-sans transition-colors"
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
