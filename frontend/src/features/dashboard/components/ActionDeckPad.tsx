import React, { useState } from 'react';
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

interface ActionDeckPadProps {
  actions: ActionItem[];
  onTriggerAction: (actionIdOrName: string) => Promise<void>;
  onTriggerTestAlert: (payload: {
    donorName: string;
    amount: number;
    message?: string;
  }) => Promise<void>;
  isBotConnected: boolean;
}

export const ActionDeckPad: React.FC<ActionDeckPadProps> = ({
  actions,
  onTriggerAction,
  onTriggerTestAlert,
  isBotConnected,
}) => {
  const [activeTrigger, setActiveTrigger] = useState<string | null>(null);
  const [testDonor, setTestDonor] = useState('Budi_Santoso');
  const [testAmount, setTestAmount] = useState('50000');
  const [testMessage, setTestMessage] = useState('Semangat live streamnya bang! Tetap konsisten gass');
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
        amount: parseFloat(testAmount) || 10000,
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
        return <RiSparklingLine className="text-emerald-600 text-sm" />;
      case 'volume2':
      case 'sound':
      case 'speaker':
        return <RiVolumeUpLine className="text-amber-600 text-sm" />;
      case 'gamepad2':
      case 'game':
        return <RiGamepadLine className="text-blue-600 text-sm" />;
      case 'flame':
      case 'fire':
        return <RiFireLine className="text-rose-600 text-sm" />;
      default:
        return <RiFlashlightLine className="text-zinc-700 text-sm" />;
    }
  };

  return (
    <div className="studio-card flex flex-col h-full bg-white overflow-hidden border border-zinc-200/90 shadow-tactile rounded-xl font-sans">
      {/* Header */}
      <div className="p-3.5 border-b border-zinc-200 bg-zinc-50/70 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1 rounded-lg bg-zinc-100 border border-zinc-200 text-zinc-700">
            <RiFlashlightLine className="text-base" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-zinc-950 tracking-tight uppercase font-mono">
              Action Deck & Macros
            </h2>
          </div>
        </div>
        <span
          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
            isBotConnected
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
              : 'bg-zinc-100 text-zinc-500 border border-zinc-200'
          }`}
        >
          {isBotConnected ? 'GATEWAY READY' : 'BOT OFFLINE'}
        </span>
      </div>

      <div className="p-3 flex-1 overflow-y-auto space-y-4">
        {/* 1. Quick Actions Grid */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[11px] font-bold text-zinc-600 uppercase font-mono tracking-wider">
              Streamer.bot Key Deck
            </h3>
            <span className="text-[10px] text-zinc-400 font-mono">
              {actions.length} Keys
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {actions.length === 0 ? (
              <div className="col-span-2 p-6 text-center text-xs text-zinc-400 font-mono bg-zinc-50/50 rounded-xl border border-zinc-200">
                No preset actions loaded.
              </div>
            ) : (
              actions.map((act) => {
                const isTriggered = activeTrigger === act.actionId;
                return (
                  <button
                    key={act.id || act.actionId}
                    type="button"
                    onClick={() => handleActionClick(act)}
                    className={`studio-deck-btn p-3 text-left flex flex-col justify-between h-20 group relative rounded-xl transition-all ${
                      isTriggered
                        ? 'bg-zinc-100 border-zinc-400 ring-2 ring-zinc-900/10'
                        : 'bg-white hover:bg-zinc-50'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="p-1 rounded-lg bg-zinc-100 border border-zinc-200">
                        {getIcon(act.icon)}
                      </div>
                      <span className="text-[9px] font-mono font-semibold text-zinc-400 uppercase">
                        {act.category}
                      </span>
                    </div>

                    <div>
                      <div className="text-xs font-bold text-zinc-950 group-hover:text-zinc-900 transition-colors truncate">
                        {act.name}
                      </div>
                      <div className="text-[10px] text-zinc-400 font-mono truncate">
                        ID: {act.actionId}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* 2. Test Donation Alert Trigger Box */}
        <div className="pt-3 border-t border-zinc-200">
          <h3 className="text-[11px] font-bold text-zinc-800 uppercase font-mono mb-2.5 flex items-center gap-1.5">
            <RiNotification3Line className="text-rose-600 text-sm" />
            <span>Simulate Donation Alert</span>
          </h3>

          <form onSubmit={handleAlertSubmit} className="space-y-2.5 bg-zinc-50/70 p-3 rounded-xl border border-zinc-200/90">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-zinc-700 mb-1 font-sans">
                  Donor Name
                </label>
                <input
                  type="text"
                  value={testDonor}
                  onChange={(e) => setTestDonor(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-zinc-300 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-zinc-950 font-medium text-zinc-900"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-700 mb-1 font-sans">
                  Amount (IDR)
                </label>
                <input
                  type="number"
                  step="5000"
                  value={testAmount}
                  onChange={(e) => setTestAmount(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-zinc-300 rounded-lg font-mono font-bold text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-950"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-700 mb-1 font-sans">
                Donation Message
              </label>
              <textarea
                rows={2}
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-950 font-sans text-zinc-800"
              />
            </div>

            <button
              type="submit"
              disabled={isAlertSending}
              className="studio-btn w-full py-2 px-3 text-xs font-bold text-white bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 shadow-tactile flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 font-sans"
            >
              <RiPlayFill className="text-sm" />
              <span>{isAlertSending ? 'Broadcasting Alert...' : 'Fire Donation Alert'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
