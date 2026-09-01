import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import {
  RiEqualizerLine,
  RiFlashlightLine,
  RiPlayFill,
  RiPulseLine,
  RiRefreshLine,
  RiTerminalBoxLine,
} from 'react-icons/ri';
import { useDashboardRealtime } from '../hooks/useDashboardRealtime';
import { dashboardService } from '../services/dashboardService';

export default function StreamerbotPage() {
  const queryClient = useQueryClient();
  const [customActionName, setCustomActionName] = useState('Alert_Donation');
  const [customArgs, setCustomArgs] = useState('{\n  "donorName": "Budi_Santoso",\n  "amount": 50000,\n  "message": "Testing Streamer.bot Action"\n}');
  const [executionResult, setExecutionResult] = useState<any | null>(null);

  // Real-time WebSocket connection state from backend
  const { botStatus: status } = useDashboardRealtime();

  const { data: actionsData } = useQuery({
    queryKey: ['streamerbot', 'actions'],
    queryFn: () => dashboardService.getActions(),
    enabled: status?.status === 'CONNECTED',
  });

  const reconnectMutation = useMutation({
    mutationFn: () => dashboardService.reconnectStreamerbot(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['streamerbot'] });
    },
  });

  const triggerActionMutation = useMutation({
    mutationFn: (variables: { action: string; args?: Record<string, any> }) =>
      dashboardService.triggerAction(variables.action, variables.args),
    onSuccess: (data) => {
      setExecutionResult({
        success: true,
        timestamp: new Date().toISOString(),
        data,
      });
    },
    onError: (err: any) => {
      setExecutionResult({
        success: false,
        timestamp: new Date().toISOString(),
        error: err.message || 'Execution failed',
      });
    },
  });

  const handleCustomTrigger = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parsedArgs = customArgs.trim() ? JSON.parse(customArgs) : undefined;
      triggerActionMutation.mutate({
        action: customActionName,
        args: parsedArgs,
      });
    } catch (err) {
      alert('Invalid JSON in Arguments field!');
    }
  };

  const isConnected = status?.status === 'CONNECTED';

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-zinc-950 tracking-tight flex items-center gap-2.5">
            <div className="p-1.5 rounded-xl bg-zinc-950 text-white">
              <RiFlashlightLine className="text-xl" />
            </div>
            <span>Streamer.bot Hardware & WebSocket Gateway</span>
          </h1>
          <p className="text-xs text-zinc-500 font-mono mt-1">
            Manage local Windows desktop automation connection at {status?.host || '127.0.0.1'}:{status?.port || 8080}
          </p>
        </div>

        <button
          type="button"
          onClick={() => reconnectMutation.mutate()}
          disabled={reconnectMutation.isPending}
          className="studio-btn px-4 py-2 text-xs font-bold text-zinc-900 bg-white hover:bg-zinc-50 border border-zinc-300 shadow-xs flex items-center gap-2 active:scale-95 disabled:opacity-50 font-sans"
        >
          <RiRefreshLine className={`text-sm ${reconnectMutation.isPending ? 'animate-spin' : ''}`} />
          <span>{reconnectMutation.isPending ? 'Reconnecting Gateway...' : 'Reconnect WebSocket'}</span>
        </button>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="studio-card p-4 bg-white border border-zinc-200/90 shadow-tactile rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono font-bold text-zinc-500 uppercase tracking-wider">
              Connection Status
            </span>
            <div
              className={`p-1 rounded-md ${
                isConnected ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
              }`}
            >
              <RiPulseLine className="text-base" />
            </div>
          </div>
          <div className="text-lg font-extrabold font-mono text-zinc-950 flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isConnected ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-amber-500'
              }`}
            />
            {status?.status || 'DISCONNECTED'}
          </div>
          <div className="text-[11px] text-zinc-400 font-mono mt-1">
            Last connected: {status?.lastConnectedAt ? new Date(status.lastConnectedAt).toLocaleTimeString('id-ID') : 'Never in current run'}
          </div>
        </div>

        <div className="studio-card p-4 bg-white border border-zinc-200/90 shadow-tactile rounded-xl">
          <div className="text-[11px] font-mono font-bold text-zinc-500 uppercase tracking-wider mb-2">
            Host & Endpoint
          </div>
          <div className="text-sm font-bold font-mono text-zinc-950">
            ws://{status?.host || '127.0.0.1'}:{status?.port || 8080}/
          </div>
          <div className="text-[11px] text-zinc-400 font-mono mt-1">
            Subscribed: YouTube SuperChat, Message, Sponsor, Twitch Cheer
          </div>
        </div>

        <div className="studio-card p-4 bg-white border border-zinc-200/90 shadow-tactile rounded-xl">
          <div className="text-[11px] font-mono font-bold text-zinc-500 uppercase tracking-wider mb-2">
            Configured Deck Actions
          </div>
          <div className="text-lg font-extrabold font-mono text-zinc-950">
            {actionsData?.savedDeckActions?.length || 0} Actions Ready
          </div>
          <div className="text-[11px] text-zinc-400 font-mono mt-1">
            Hotkeys and macros synchronized for broadcast console
          </div>
        </div>
      </div>

      {/* Action Trigger Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 studio-card p-5 bg-white border border-zinc-200/90 shadow-tactile rounded-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-zinc-100">
            <RiEqualizerLine className="text-zinc-800 text-base" />
            <h2 className="text-xs font-bold text-zinc-950 uppercase font-mono tracking-wider">
              Manual Action Execution Inspector
            </h2>
          </div>

          <form onSubmit={handleCustomTrigger} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-zinc-800 mb-1.5 font-sans">
                Action Name or UUID
              </label>
              <input
                type="text"
                required
                value={customActionName}
                onChange={(e) => setCustomActionName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-zinc-50 border border-zinc-300 rounded-lg font-mono focus:outline-none focus:bg-white focus:ring-1 focus:ring-zinc-950 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-800 mb-1.5 font-sans">
                Arguments Payload (JSON)
              </label>
              <textarea
                rows={6}
                value={customArgs}
                onChange={(e) => setCustomArgs(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-zinc-50 border border-zinc-300 rounded-lg font-mono focus:outline-none focus:bg-white focus:ring-1 focus:ring-zinc-950 leading-relaxed text-zinc-800"
              />
            </div>

            <button
              type="submit"
              disabled={triggerActionMutation.isPending}
              className="studio-btn w-full py-2.5 px-4 text-xs font-bold text-white bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 shadow-tactile flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 font-sans"
            >
              <RiPlayFill className="text-sm" />
              <span>{triggerActionMutation.isPending ? 'Executing Action...' : 'Trigger Action Now'}</span>
            </button>
          </form>
        </div>

        {/* Execution Response Log */}
        <div className="lg:col-span-6 studio-card p-5 bg-white border border-zinc-200/90 shadow-tactile rounded-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-zinc-100 mb-3">
              <RiTerminalBoxLine className="text-zinc-800 text-base" />
              <h2 className="text-xs font-bold text-zinc-950 uppercase font-mono tracking-wider">
                Action Execution Output Terminal
              </h2>
            </div>

            {executionResult ? (
              <pre className="p-3.5 bg-zinc-900 text-zinc-100 border border-zinc-800 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed max-h-[280px]">
                {JSON.stringify(executionResult, null, 2)}
              </pre>
            ) : (
              <div className="p-12 text-center text-xs text-zinc-400 font-mono bg-zinc-50/70 rounded-xl border border-zinc-200">
                No action executed yet. Enter an action and press Trigger Action Now.
              </div>
            )}
          </div>

          <div className="text-[11px] text-zinc-400 font-mono pt-4 border-t border-zinc-100">
            Tip: In Streamer.bot, configure actions in the Actions tab with sub-actions like Sound Player, OBS Scene Switch, or Chat Broadcast.
          </div>
        </div>
      </div>
    </div>
  );
}
