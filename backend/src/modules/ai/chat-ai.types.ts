export type ChatAiInteractionStatus =
  | 'queued'
  | 'processing'
  | 'ready'
  | 'playing'
  | 'completed'
  | 'rejected'
  | 'failed';

export type ChatAiProgressPhase =
  | 'queued'
  | 'pi'
  | 'question-audio'
  | 'answer-audio'
  | 'ready'
  | 'waiting-overlay'
  | 'playing'
  | 'completed'
  | 'retrying'
  | 'failed'
  | 'rejected';

export const CHAT_AI_MAX_ATTEMPTS = 3;

export type ChatAiMood = 'neutral' | 'excited' | 'empathetic' | 'serious' | 'funny';

export interface ChatAiAnswer {
  mood: ChatAiMood;
  answer: string;
}

export interface ChatAiQueueJob {
  interactionId: string;
}

export interface ChatAiAudioKeys {
  questionAudioKey: string;
  answerAudioKey: string;
}

export interface ChatAiReadyEvent {
  interactionId: string;
  user: {
    name: string;
    avatarUrl: string | null;
  };
  question: string;
  answer: string;
  questionAudioUrl: string;
  answerAudioUrl: string;
}

export interface ChatAiPlaybackCompletedEvent {
  interactionId: string;
}

export interface ChatAiInteractionSummary {
  id: string;
  viewerName: string;
  viewerAvatarUrl: string | null;
  prompt: string;
  answer: string | null;
  mood: ChatAiMood;
  status: ChatAiInteractionStatus;
  error: string | null;
  attempts: number;
  createdAt: string;
  questionAudioUrl: string | null;
  answerAudioUrl: string | null;
}

export interface ChatAiProgressEvent extends ChatAiInteractionSummary {
  interactionId: string;
  phase: ChatAiProgressPhase;
  maxAttempts: number;
}

export interface ChatAiJobFailure {
  interactionId: string;
  error: Error;
  attemptsMade: number;
  maxAttempts: number;
}
