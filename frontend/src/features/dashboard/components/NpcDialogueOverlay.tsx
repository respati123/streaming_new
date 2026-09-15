import { getOverlayPlaybackMode, overlaySocket } from '@core/ws/socketClient';
import { useCallback, useEffect, useRef, useState } from 'react';
import { RiChat3Line, RiVolumeUpLine } from 'react-icons/ri';

interface ChatAiReadyEvent {
  interactionId: string;
  user: { name: string; avatarUrl?: string | null };
  question: string;
  answer: string;
  questionAudioUrl: string;
  answerAudioUrl: string;
}

interface ChatAiPlaybackCompletedEvent {
  interactionId: string;
}

type DialogueStage = 'question' | 'answer' | 'closing';

const MIN_AUDIO_FALLBACK_MS = 3000;
const SPEECH_CHARS_PER_SECOND = 12;

function getFallbackDuration(text: string): number {
  return Math.max(MIN_AUDIO_FALLBACK_MS, Math.ceil(text.length / SPEECH_CHARS_PER_SECOND) * 1000);
}

export function NpcDialogueOverlay() {
  const isController = getOverlayPlaybackMode() === 'controller';
  const [dialogue, setDialogue] = useState<ChatAiReadyEvent | null>(null);
  const [stage, setStage] = useState<DialogueStage>('question');
  const [questionChars, setQuestionChars] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const dialogueRef = useRef<ChatAiReadyEvent | null>(null);
  const fallbackTimerRef = useRef<number | null>(null);
  const closeTimerRef = useRef<number | null>(null);

  const clearFallbackTimer = useCallback(() => {
    if (fallbackTimerRef.current !== null) {
      window.clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }
  }, []);

  const finishDialogue = useCallback(() => {
    const activeDialogue = dialogueRef.current;
    if (!activeDialogue) return;

    clearFallbackTimer();
    setStage('closing');
    if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = window.setTimeout(() => {
      overlaySocket.send('chatai:finished', { interactionId: activeDialogue.interactionId });
      overlaySocket.send('overlay:event:completed', { id: activeDialogue.interactionId });
      dialogueRef.current = null;
      setDialogue(null);
      closeTimerRef.current = null;
    }, 150);
  }, [clearFallbackTimer, isController]);

  useEffect(() => {
    const unsubscribe = overlaySocket.on<ChatAiReadyEvent>('chatai:ready', (incoming) => {
      if (!incoming?.interactionId) return;
      if (dialogueRef.current?.interactionId === incoming.interactionId) return;
      if (isController && dialogueRef.current) return;
      dialogueRef.current = incoming;
      setQuestionChars(0);
      setStage(isController ? 'question' : 'answer');
      setDialogue(incoming);
    });
    const unsubscribeCompleted = overlaySocket.on<ChatAiPlaybackCompletedEvent>(
      'chatai:playback-completed',
      (incoming) => {
        if (isController || incoming?.interactionId !== dialogueRef.current?.interactionId) return;
        dialogueRef.current = null;
        setDialogue(null);
      }
    );
    return () => {
      unsubscribe();
      unsubscribeCompleted();
    };
  }, [isController]);

  useEffect(() => {
    if (!dialogue) return;
    if (stage !== 'question') {
      setQuestionChars(dialogue.question.length);
      return;
    }

    const typingTimer = window.setInterval(() => {
      setQuestionChars((current) => {
        if (current >= dialogue.question.length) {
          window.clearInterval(typingTimer);
          return current;
        }
        return current + 1;
      });
    }, 24);

    return () => window.clearInterval(typingTimer);
  }, [dialogue, stage]);

  useEffect(() => {
    if (!isController || !dialogue || stage === 'closing') return;

    const audio = new Audio(
      stage === 'question' ? dialogue.questionAudioUrl : dialogue.answerAudioUrl
    );
    audioRef.current = audio;
    audio.preload = 'auto';
    const fallbackDuration = getFallbackDuration(
      stage === 'question' ? dialogue.question : dialogue.answer
    );
    const moveToNextStage = () => {
      clearFallbackTimer();
      if (stage === 'question') setStage('answer');
      else finishDialogue();
    };
    const scheduleFallback = (durationMs: number) => {
      clearFallbackTimer();
      fallbackTimerRef.current = window.setTimeout(moveToNextStage, durationMs);
    };
    const handleEnded = () => {
      moveToNextStage();
    };
    audio.onended = handleEnded;
    audio.onloadedmetadata = () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        scheduleFallback(Math.ceil(audio.duration * 1000) + 500);
      }
    };
    audio.onerror = () => scheduleFallback(fallbackDuration);
    void audio.play().catch(() => scheduleFallback(fallbackDuration));

    return () => {
      clearFallbackTimer();
      audio.pause();
      audio.src = '';
      if (audioRef.current === audio) audioRef.current = null;
    };
  }, [clearFallbackTimer, dialogue, finishDialogue, isController, stage]);

  useEffect(
    () => () => {
      audioRef.current?.pause();
      clearFallbackTimer();
      if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current);
    },
    [clearFallbackTimer]
  );

  if (!dialogue) return null;

  const isQuestion = stage === 'question';
  const showAnswer = stage !== 'question';
  const questionText = isQuestion ? dialogue.question.slice(0, questionChars) : dialogue.question;

  return (
    <section
      aria-live="polite"
      className="pointer-events-none absolute bottom-[18vh] left-1/2 z-30 w-[680px] max-w-[calc(100vw-2rem)] -translate-x-1/2"
    >
      <div
        className={`w-full space-y-2 ${
          stage === 'closing' ? 'npc-dialogue-exit' : 'npc-dialogue-enter'
        }`}
      >
        <article className="rounded-2xl border border-violet-300/35 bg-zinc-950/90 p-3 shadow-[0_10px_28px_rgba(0,0,0,0.35)] backdrop-blur-sm">
          <div className="flex items-start gap-3">
            {dialogue.user.avatarUrl ? (
              <img
                src={dialogue.user.avatarUrl}
                alt=""
                className="h-10 w-10 shrink-0 rounded-full border border-white/20 object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-violet-300/40 bg-violet-500/15 text-violet-200">
                <RiChat3Line className="text-lg" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-violet-200">
                  {dialogue.user.name}
                </span>
                {isQuestion && (
                  <RiVolumeUpLine className="text-sm text-violet-300" aria-hidden="true" />
                )}
              </div>
              <p className="break-words text-sm font-medium leading-relaxed text-zinc-100">
                {questionText}
                {isQuestion && questionChars < dialogue.question.length && (
                  <span className="npc-dialogue-caret" aria-hidden="true" />
                )}
              </p>
            </div>
          </div>
        </article>

        {showAnswer && (
          <article className="npc-dialogue-ai-enter ml-10 mr-2 rounded-2xl border border-violet-200/30 bg-violet-950/65 p-3 shadow-[0_10px_28px_rgba(46,16,101,0.28)] backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-violet-200/40 bg-violet-400/15 text-violet-100">
                <RiChat3Line className="text-lg" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-violet-100">
                    Stream Oracle
                  </span>
                  <RiVolumeUpLine className="text-sm text-violet-200" aria-hidden="true" />
                </div>
                <p className="break-words text-sm font-medium leading-relaxed text-violet-50">
                  {dialogue.answer}
                </p>
              </div>
            </div>
          </article>
        )}
      </div>
    </section>
  );
}
