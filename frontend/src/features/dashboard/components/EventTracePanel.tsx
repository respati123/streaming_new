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
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-100 text-cyan-800 border border-cyan-200">
            [WS SEND]
          </span>
        );
      case 'audio':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-200">
            [WEB AUDIO API]
          </span>
        );
      case 'tts':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
            [TTS SYNTHESIS]
          </span>
        );
      case 'burst':
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-100 text-purple-800 border border-purple-200">
            [BURST QUEUE]
          </span>
        );
      default:
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-700 border border-slate-200">
            [EVENT]
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex flex-col font-sans text-slate-900">
      <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-indigo-600" />
          <h3 className="text-xs font-bold text-slate-900 tracking-tight">
            Event & WebSocket Dispatch Trace
          </h3>
          <span className="text-[10px] font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 font-semibold">
            {logs.length} events
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200 shadow-2xs">
            {(['all', 'ws_send', 'audio', 'tts'] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                  filter === f
                    ? 'bg-indigo-600 text-white font-bold shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {f.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onClearLogs}
            className="p-1 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-500 hover:text-rose-600 transition-colors shadow-2xs"
            title="Clear Event Logs"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="p-3 bg-slate-950 min-h-[160px] max-h-[220px] overflow-y-auto space-y-1.5 font-mono text-xs select-text">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-xs">
            Belum ada trace event tercatat. Picu chat atau donasi test untuk melihat payload
            dispatch.
          </div>
        ) : (
          filteredLogs.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-2.5 p-1.5 rounded hover:bg-slate-900 transition-colors border border-transparent hover:border-slate-800"
            >
              <span className="text-[11px] text-slate-400 shrink-0">{item.timestamp}</span>
              {getTagBadge(item.type)}
              <span className="text-slate-200 text-[11px] break-all flex-1">{item.content}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
