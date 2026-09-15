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
    <section className="studio-card h-64 shrink-0 overflow-hidden rounded-xl border border-zinc-200/90 bg-white shadow-tactile">
      <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50/70 p-3">
        <div className="flex items-center gap-2">
          <RiRobot2Line className="text-zinc-600" />
          <h2 className="text-xs font-bold uppercase tracking-tight text-zinc-950">
            ChatAI history
          </h2>
        </div>
        <RiRefreshLine className={`text-zinc-400 ${isLoading ? 'animate-spin' : ''}`} />
      </div>
      <div className="h-[calc(100%-49px)] space-y-2 overflow-y-auto p-2.5">
        {interactions.length === 0 ? (
          <p className="p-5 text-center text-xs text-zinc-400">Belum ada percakapan ChatAI.</p>
        ) : (
          interactions.map((interaction) => (
            <article
              key={interaction.id}
              className="rounded-lg border border-zinc-200 bg-zinc-50/60 p-2.5"
            >
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="truncate text-[11px] font-bold text-zinc-900">
                  {interaction.viewerName}
                </span>
                <span className="shrink-0 font-mono text-[9px] uppercase text-zinc-400">
                  {phaseLabel[interaction.phase ?? interaction.status]} · {moodLabel[interaction.mood]}
                </span>
              </div>
              <p className="line-clamp-1 text-[11px] text-zinc-600">Q: {interaction.prompt}</p>
              <p className="line-clamp-1 text-[11px] text-zinc-400">
                A: {interaction.answer || 'Belum ada jawaban'}
              </p>
              {interaction.error && (
                <p className="mt-1 break-words text-[10px] leading-snug text-rose-600">
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
                    className="inline-flex items-center gap-1 rounded-md bg-zinc-950 px-2 py-1 text-[10px] font-semibold text-white transition-colors hover:bg-zinc-800"
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
                    className="inline-flex items-center gap-1 rounded-md border border-zinc-300 bg-white px-2 py-1 text-[10px] font-semibold text-zinc-700 transition-colors hover:bg-zinc-100"
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
                    className="inline-flex items-center gap-1 rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 text-[10px] font-semibold text-zinc-700 transition-colors hover:bg-zinc-100"
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
