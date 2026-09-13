import { env } from '@core/config/env';
import { logger } from '@core/logger/logger';
import { Queue, Worker } from 'bullmq';
import { CHAT_AI_MAX_ATTEMPTS, type ChatAiJobFailure, type ChatAiQueueJob } from './chat-ai.types';

const queueName = 'chatai';
const connection = { url: env.REDIS_URL, maxRetriesPerRequest: null };
let queue: Queue<ChatAiQueueJob> | null = null;
let worker: Worker<ChatAiQueueJob> | null = null;

export async function enqueueChatAiInteraction(interactionId: string): Promise<void> {
  await getQueue().add(
    'generate-dialogue',
    { interactionId },
    {
      jobId: interactionId,
      attempts: CHAT_AI_MAX_ATTEMPTS,
      backoff: { type: 'exponential', delay: 1000 },
      removeOnComplete: { age: 86400 },
      removeOnFail: { count: 100 },
    }
  );
}

export async function startChatAiWorker(
  processJob: (interactionId: string) => Promise<void>,
  onFinalFailure: (interactionId: string, error: Error) => Promise<void>,
  onAttemptFailure: (failure: ChatAiJobFailure) => Promise<void>
): Promise<void> {
  if (worker) return;
  worker = new Worker(queueName, (job) => processJob(job.data.interactionId), {
    connection,
    concurrency: 1,
  });
  worker.on('failed', (job, error) => handleFailure(job, error, onFinalFailure, onAttemptFailure));
  await worker.waitUntilReady();
}

export async function stopChatAiWorker(): Promise<void> {
  await worker?.close();
  await queue?.close();
  worker = null;
  queue = null;
}

function getQueue(): Queue<ChatAiQueueJob> {
  if (!queue) queue = new Queue<ChatAiQueueJob>(queueName, { connection });
  return queue;
}

function handleFailure(
  job: { attemptsMade: number; data: ChatAiQueueJob; opts: { attempts?: number } } | undefined,
  error: Error,
  onFinalFailure: (interactionId: string, error: Error) => Promise<void>,
  onAttemptFailure: (failure: ChatAiJobFailure) => Promise<void>
): void {
  if (!job) return;
  const maxAttempts = job.opts.attempts ?? 1;
  void (async () => {
    try {
      await onAttemptFailure({
        interactionId: job.data.interactionId,
        error,
        attemptsMade: job.attemptsMade,
        maxAttempts,
      });
    } catch (failure) {
      logger.error('[ChatAi] Failed to publish attempt failure', {}, failure as Error);
    }
    if (job.attemptsMade >= maxAttempts) {
      await onFinalFailure(job.data.interactionId, error);
    }
  })().catch((failure) => {
    logger.error('[ChatAi] Failed to persist job failure', {}, failure as Error);
  });
}
