import { useEffect, useRef, useState } from 'react';
import {
  RiPauseCircleLine,
  RiPlayCircleLine,
  RiPlayFill,
  RiRefreshLine,
  RiRobot2Line,
} from 'react-icons/ri';
import type { ChatAiInteractionSummary } from '../types/dashboard.types';

interface ChatAiHistoryPanelProps {
  interactions: ChatAiInteractionSummary[];
  isLoading: boolean;
}

const moodLabel: Record<ChatAiInteractionSummary['mood'], string> = {
  neutral: 'neutral',
  excited: 'excited',
  empathetic: 'empathetic',
  serious: 'serious',
  funny: 'funny',
};

const phaseLabel: Record<
  ChatAiInteractionSummary['status'] | NonNullable<ChatAiInteractionSummary['phase']>,
  string
> = {
  queued: 'queue',
  processing: 'processing',
  pi: 'Pi',
  'question-audio': 'question audio',
  'answer-audio': 'answer audio',
  ready: 'ready',
  'waiting-overlay': 'waiting overlay',
  playing: 'playing',
  completed: 'completed',
  retrying: 'retrying',
  failed: 'failed',
  rejected: 'rejected',
};

export function ChatAiHistoryPanel({ interactions, isLoading }: ChatAiHistoryPanelProps) {
  const [playingKey, setPlayingKey] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => () => audioRef.current?.pause(), []);

  const stopAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.onended = null;
    audio.onerror = null;
    audio.pause();
    audio.src = '';
    audioRef.current = null;
  };

  const playAudio = (urls: string[], key: string) => {
    if (playingKey === key) {
      stopAudio();
      setPlayingKey(null);
      return;
    }

    stopAudio();
    const audio = new Audio();
    audioRef.current = audio;
    setPlayingKey(key);
    let index = 0;
    const playNext = () => {
      const url = urls[index++];
      if (!url) {
        stopAudio();
        setPlayingKey(null);
        return;
      }
      audio.src = url;
      void audio.play().catch(playNext);
    };
    audio.onended = playNext;
    audio.onerror = playNext;
    playNext();
  };

  return (
    <section className="bg-white h-64 shrink-0 overflow-hidden rounded-2xl border border-slate-200 shadow-xs font-sans text-slate-900">
      <div className="flex items-center justify-between border-b border-violet-100 bg-violet-50/60 p-3">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-violet-100 text-violet-700">
            <RiRobot2Line className="text-sm" />
          </div>
          <h2 className="text-xs font-bold uppercase tracking-tight text-violet-950 font-mono">
            ChatAI History
          </h2>
        </div>
        <RiRefreshLine className={`text-violet-400 ${isLoading ? 'animate-spin' : ''}`} />
      </div>
      <div className="h-[calc(100%-49px)] space-y-2 overflow-y-auto p-2.5 bg-slate-50/40">
        {interactions.length === 0 ? (
          <p className="p-6 text-center text-xs text-slate-400 font-mono">Belum ada percakapan ChatAI.</p>
        ) : (
          interactions.map((interaction) => (
            <article
              key={interaction.id}
              className="rounded-xl border border-slate-200/90 bg-white p-2.5 shadow-2xs hover:border-violet-300 transition-colors"
            >
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="truncate text-[11px] font-bold text-slate-900">
                  {interaction.viewerName}
                </span>
                <span className="shrink-0 font-mono text-[9px] uppercase px-1.5 py-0.5 rounded bg-violet-50 text-violet-700 border border-violet-200 font-semibold">
                  {phaseLabel[interaction.phase ?? interaction.status]} · {moodLabel[interaction.mood]}
                </span>
              </div>
              <p className="line-clamp-1 text-[11px] text-slate-700 font-medium">Q: {interaction.prompt}</p>
              <p className="line-clamp-1 text-[11px] text-slate-500">
                A: {interaction.answer || 'Belum ada jawaban'}
              </p>
              {interaction.error && (
                <p className="mt-1 break-words text-[10px] leading-snug text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                  Error: {interaction.error}
                </p>
              )}
              <div className="mt-2 flex gap-1.5">
                {interaction.questionAudioUrl && interaction.answerAudioUrl && (
                  <button
                    type="button"
                    onClick={() =>
                      playAudio(
                        [interaction.questionAudioUrl ?? '', interaction.answerAudioUrl ?? ''],
                        `${interaction.id}:flow`
                      )
                    }
                    className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-2.5 py-1 text-[10px] font-semibold text-white transition-colors hover:bg-indigo-500 shadow-xs"
                  >
                    {playingKey === `${interaction.id}:flow` ? (
                      <RiPauseCircleLine />
                    ) : (
                      <RiPlayFill />
                    )}
                    Replay flow
                  </button>
                )}
                {interaction.questionAudioUrl && (
                  <button
                    type="button"
                    onClick={() =>
                      playAudio([interaction.questionAudioUrl ?? ''], `${interaction.id}:q`)
                    }
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10px] font-semibold text-slate-700 transition-colors hover:bg-slate-50 shadow-2xs"
                  >
                    {playingKey === `${interaction.id}:q` ? (
                      <RiPauseCircleLine />
                    ) : (
                      <RiPlayCircleLine />
                    )}
                    Pertanyaan
                  </button>
                )}
                {interaction.answerAudioUrl && (
                  <button
                    type="button"
                    onClick={() =>
                      playAudio([interaction.answerAudioUrl ?? ''], `${interaction.id}:a`)
                    }
                    className="inline-flex items-center gap-1 rounded-lg border border-violet-200 bg-violet-50 px-2 py-1 text-[10px] font-semibold text-violet-700 transition-colors hover:bg-violet-100 shadow-2xs"
                  >
                    {playingKey === `${interaction.id}:a` ? (
                      <RiPauseCircleLine />
                    ) : (
                      <RiPlayCircleLine />
                    )}
                    Jawaban
                  </button>
                )}
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
