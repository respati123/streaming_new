import { Terminal, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { TraceLogItem } from '../types/overlay-lab.types';

export interface EventTracePanelProps {
  logs: TraceLogItem[];
  onClearLogs: () => void;
}

export function EventTracePanel({ logs, onClearLogs }: EventTracePanelProps) {
  const [filter, setFilter] = useState<'all' | 'ws_send' | 'audio' | 'tts' | 'burst'>('all');

  const filteredLogs = logs.filter((log) => {
    if (filter === 'all') return true;
    return log.type === filter;
  });

  const getTagBadge = (type: TraceLogItem['type']) => {
    switch (type) {
      case 'ws_send':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-500/40">
            [WS SEND]
          </span>
        );
      case 'audio':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950/80 text-amber-300 border border-amber-500/40">
            [WEB AUDIO API]
          </span>
        );
      case 'tts':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-950/80 text-indigo-300 border border-indigo-500/40">
            [TTS SYNTHESIS]
          </span>
        );
      case 'burst':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-950/80 text-purple-300 border border-purple-500/40">
            [BURST QUEUE]
          </span>
        );
      default:
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-300">
            [EVENT]
          </span>
        );
    }
  };

  return (
    <div className="bg-[#131318] rounded-2xl border border-[#272733] overflow-hidden shadow-lg flex flex-col font-sans text-[#F4F4F6]">
      <div className="px-4 py-3 border-b border-[#272733] bg-[#16161D] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold text-white tracking-tight">
            Event & WebSocket Dispatch Trace
          </h3>
          <span className="text-[10px] font-mono text-zinc-400 bg-[#1A1A22] px-2 py-0.5 rounded border border-[#272733]">
            {logs.length} events
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-[#1A1A22] p-0.5 rounded-lg border border-[#272733]">
            {(['all', 'ws_send', 'audio', 'tts'] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                  filter === f
                    ? 'bg-cyan-600 text-white font-bold'
                    : 'text-[#A0A0AC] hover:text-white'
                }`}
              >
                {f.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onClearLogs}
            className="p-1 rounded-lg bg-[#1A1A22] hover:bg-[#272733] text-[#A0A0AC] hover:text-white transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="p-3 bg-[#0D0D12] min-h-[160px] max-h-[220px] overflow-y-auto space-y-1.5 font-mono text-xs select-text">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-6 text-[#70707E] text-xs">
            Belum ada trace event tercatat. Picu chat atau donasi test untuk melihat payload
            dispatch.
          </div>
        ) : (
          filteredLogs.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-2.5 p-1.5 rounded hover:bg-[#16161D]/80 transition-colors border border-transparent hover:border-[#272733]"
            >
              <span className="text-[11px] text-zinc-400 shrink-0">{item.timestamp}</span>
              {getTagBadge(item.type)}
              <span className="text-zinc-200 text-[11px] break-all flex-1">{item.content}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
