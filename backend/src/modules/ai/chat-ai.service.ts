import { env } from '@core/config/env';
import { db } from '@core/database';
import { type AiInteractionTable, aiInteractions } from '@core/database/schema';
import { logger } from '@core/logger/logger';
import { streamerbotService } from '@modules/streamerbot/streamerbot.service';
import type { ChatAiRequestEventData } from '@modules/streamerbot/streamerbot.types';
import { and, asc, desc, eq, isNotNull, ne, sql } from 'drizzle-orm';
import Redis from 'ioredis';
import { getChatAiAudioUrl, saveChatAiAudio } from './chat-ai.audio';
import { enqueueChatAiInteraction } from './chat-ai.queue';
import type {
  ChatAiAudioKeys,
  ChatAiInteractionStatus,
  ChatAiInteractionSummary,
  ChatAiJobFailure,
  ChatAiMood,
  ChatAiPlaybackCompletedEvent,
  ChatAiProgressEvent,
  ChatAiProgressPhase,
  ChatAiReadyEvent,
} from './chat-ai.types';
import { CHAT_AI_MAX_ATTEMPTS } from './chat-ai.types';
import { elevenLabsService } from './elevenlabs.service';
import { piService } from './pi.service';

const PLAYBACK_STALE_AFTER_MS = 120_000;

export class ChatAiService {
  private cooldownClient: Redis | null = null;
  private deliveryChain: Promise<void> = Promise.resolve();

  public async enqueue(request: ChatAiRequestEventData): Promise<void> {
    if (!env.CHATAI_ENABLED) return;
    const interaction = await this.createInteraction(request);
    if (!interaction) return;
    if (env.CHATAI_COOLDOWN_SECONDS > 0 && !(await this.claimCooldown(interaction.userId))) {
      await this.rejectInteraction(interaction.id);
      return;
    }
    try {
      await enqueueChatAiInteraction(interaction.id);
    } catch (error) {
      await this.markFailed(interaction.id, error as Error);
      throw error;
    }
    await this.emitProgress(interaction.id, 'queued');
    logger.info('[ChatAi] Interaction queued', {
      interactionId: interaction.id,
      userId: interaction.userId,
    });
  }

  public async process(interactionId: string): Promise<void> {
    const interaction = await this.getInteraction(interactionId);
    if (!interaction || interaction.status === 'completed') return;
    await this.markProcessing(interactionId);
    await this.emitProgress(interactionId, 'pi');
    const { answer, mood } = await piService.complete(
      interaction.prompt,
      await this.getConversation(interaction.userId, interaction.id)
    );
    await this.emitProgress(interactionId, 'question-audio');
    const audioKeys = await this.createAudio(interaction, answer, mood);
    await this.emitProgress(interactionId, 'answer-audio');
    await this.markReady(interactionId, answer, mood, audioKeys);
    await this.emitProgress(interactionId, 'ready');
    streamerbotService.emit('chatai:interaction-ready', { interactionId });
  }

  public async dispatchNext(): Promise<void> {
    const dispatch = this.deliveryChain.then(() => this.dispatchOne());
    this.deliveryChain = dispatch.catch(() => undefined);
    return dispatch;
  }

  public async completePlayback(interactionId: string): Promise<boolean> {
    const [completed] = await db
      .update(aiInteractions)
      .set({ status: 'completed', completedAt: new Date() })
      .where(and(eq(aiInteractions.id, interactionId), eq(aiInteractions.status, 'playing')));
    if (completed) {
      await this.emitProgress(interactionId, 'completed');
      streamerbotService.emit('chatai:playback-completed', {
        interactionId,
      } satisfies ChatAiPlaybackCompletedEvent);
    }
    await this.dispatchNext();
    return Boolean(completed);
  }

  public async releasePlayback(): Promise<void> {
    const released = await db
      .update(aiInteractions)
      .set({ status: 'ready', playingAt: null })
      .where(eq(aiInteractions.status, 'playing'))
      .returning();
    for (const interaction of released) {
      await this.emitProgress(interaction.id, 'waiting-overlay');
    }
  }

  public async markFailed(interactionId: string, error: Error): Promise<void> {
    const [failed] = await db
      .update(aiInteractions)
      .set({ status: 'failed', error: error.message.slice(0, 500) })
      .where(eq(aiInteractions.id, interactionId))
      .returning();
    if (failed) await this.emitProgress(interactionId, 'failed', { error: failed.error });
  }

  public async reportAttemptFailure(failure: ChatAiJobFailure): Promise<void> {
    const error = failure.error.message.slice(0, 500);
    await db
      .update(aiInteractions)
      .set({ error })
      .where(eq(aiInteractions.id, failure.interactionId));
    await this.emitProgress(failure.interactionId, 'retrying', {
      error,
      attempts: failure.attemptsMade,
    });
    logger.warn('[ChatAi] Third-party attempt failed', {
      interactionId: failure.interactionId,
      attempt: failure.attemptsMade,
      maxAttempts: failure.maxAttempts,
      error,
    });
  }

  public async close(): Promise<void> {
    await this.cooldownClient?.quit();
    this.cooldownClient = null;
  }

  public async listRecent(limit: number): Promise<ChatAiInteractionSummary[]> {
    const interactions = await db.query.aiInteractions.findMany({
      orderBy: [desc(aiInteractions.createdAt)],
      limit,
    });
    return interactions.map((interaction) => this.toSummary(interaction));
  }

  private async createInteraction(
    request: ChatAiRequestEventData
  ): Promise<AiInteractionTable | null> {
    const [interaction] = await db
      .insert(aiInteractions)
      .values({
        chatMessageId: request.id,
        streamId: request.streamId,
        userId: request.userId,
        viewerName: request.user,
        viewerAvatarUrl: request.avatarUrl || null,
        prompt: request.prompt,
      })
      .onConflictDoNothing()
      .returning();
    return interaction || null;
  }

  private async claimCooldown(userId: string): Promise<boolean> {
    const key = `chatai:cooldown:${userId}`;
    const result = await this.getCooldownClient().set(
      key,
      '1',
      'EX',
      env.CHATAI_COOLDOWN_SECONDS,
      'NX'
    );
    return result === 'OK';
  }

  private async rejectInteraction(interactionId: string): Promise<void> {
    const [rejected] = await db
      .update(aiInteractions)
      .set({ status: 'rejected', error: 'Cooldown is active' })
      .where(eq(aiInteractions.id, interactionId))
      .returning();
    if (rejected) await this.emitProgress(interactionId, 'rejected', { error: rejected.error });
  }

  private async getInteraction(interactionId: string): Promise<AiInteractionTable | null> {
    const interaction = await db.query.aiInteractions.findFirst({
      where: eq(aiInteractions.id, interactionId),
    });
    return interaction || null;
  }

  private async markProcessing(interactionId: string): Promise<void> {
    await db
      .update(aiInteractions)
      .set({ status: 'processing', attempts: sql`${aiInteractions.attempts} + 1`, error: null })
      .where(eq(aiInteractions.id, interactionId));
  }

  private async createAudio(
    interaction: AiInteractionTable,
    answer: string,
    mood: ChatAiMood
  ): Promise<ChatAiAudioKeys> {
    const questionAudio = await elevenLabsService.streamText(
      this.questionNarration(interaction),
      env.ELEVENLABS_AI_VOICE_ID,
      'neutral'
    );
    const questionAudioKey = await saveChatAiAudio(interaction.id, 'question', questionAudio);
    const answerAudio = await elevenLabsService.streamText(
      this.answerNarration(answer),
      env.ELEVENLABS_AI_VOICE_ID,
      mood
    );
    const answerAudioKey = await saveChatAiAudio(interaction.id, 'answer', answerAudio);
    return { questionAudioKey, answerAudioKey };
  }

  private async markReady(
    interactionId: string,
    answer: string,
    mood: ChatAiMood,
    audioKeys: ChatAiAudioKeys
  ): Promise<void> {
    await db
      .update(aiInteractions)
      .set({ ...audioKeys, answer, mood, status: 'ready', readyAt: new Date() })
      .where(eq(aiInteractions.id, interactionId));
  }

  private async dispatchOne(): Promise<void> {
    const playing = await this.findPlayingInteraction();
    if (playing) {
      const isStale =
        !playing.playingAt || Date.now() - playing.playingAt.getTime() > PLAYBACK_STALE_AFTER_MS;
      if (!isStale) return;

      const [released] = await db
        .update(aiInteractions)
        .set({
          status: 'failed',
          playingAt: null,
          error: 'Overlay playback timed out; interaction skipped',
        })
        .where(and(eq(aiInteractions.id, playing.id), eq(aiInteractions.status, 'playing')))
        .returning();
      if (released) {
        logger.warn('[ChatAi] Skipped stale playback lock', {
          interactionId: released.id,
          staleAfterMs: PLAYBACK_STALE_AFTER_MS,
        });
        await this.emitProgress(released.id, 'failed');
      }
    }
    const interaction = await this.findReadyInteraction();
    if (!interaction) return;
    const claimed = await this.claimPlayback(interaction.id);
    if (claimed) {
      await this.emitProgress(claimed.id, 'playing');
      streamerbotService.emit('chatai:ready', this.toReadyEvent(claimed));
    }
  }

  private async findPlayingInteraction(): Promise<AiInteractionTable | null> {
    const interaction = await db.query.aiInteractions.findFirst({
      where: eq(aiInteractions.status, 'playing'),
    });
    return interaction || null;
  }

  private async findReadyInteraction(): Promise<AiInteractionTable | null> {
    const interaction = await db.query.aiInteractions.findFirst({
      where: eq(aiInteractions.status, 'ready'),
      orderBy: [asc(aiInteractions.createdAt)],
    });
    return interaction || null;
  }

  private async emitProgress(
    interactionId: string,
    phase: ChatAiProgressPhase,
    overrides: Partial<Pick<ChatAiProgressEvent, 'attempts' | 'error'>> = {}
  ): Promise<void> {
    const interaction = await this.getInteraction(interactionId);
    if (!interaction) return;
    streamerbotService.emit('chatai:progress', {
      ...this.toSummary(interaction),
      ...overrides,
      interactionId,
      phase,
      maxAttempts: CHAT_AI_MAX_ATTEMPTS,
    } satisfies ChatAiProgressEvent);
  }

  private async getConversation(
    userId: string,
    interactionId: string
  ): Promise<Array<{ prompt: string; answer: string }>> {
    const history = await db.query.aiInteractions.findMany({
      where: and(
        eq(aiInteractions.userId, userId),
        ne(aiInteractions.id, interactionId),
        isNotNull(aiInteractions.answer)
      ),
      orderBy: [desc(aiInteractions.createdAt)],
      limit: 10,
    });
    return history
      .reverse()
      .flatMap((entry) => (entry.answer ? [{ prompt: entry.prompt, answer: entry.answer }] : []));
  }

  private async claimPlayback(interactionId: string): Promise<AiInteractionTable | null> {
    const [interaction] = await db
      .update(aiInteractions)
      .set({ status: 'playing', playingAt: new Date() })
      .where(and(eq(aiInteractions.id, interactionId), eq(aiInteractions.status, 'ready')))
      .returning();
    return interaction || null;
  }

  private toReadyEvent(interaction: AiInteractionTable): ChatAiReadyEvent {
    if (!interaction.answer || !interaction.questionAudioKey || !interaction.answerAudioKey) {
      throw new Error('ChatAI interaction is missing generated content');
    }
    return {
      interactionId: interaction.id,
      user: { name: interaction.viewerName, avatarUrl: interaction.viewerAvatarUrl },
      question: interaction.prompt,
      answer: interaction.answer,
      questionAudioUrl: getChatAiAudioUrl(interaction.questionAudioKey),
      answerAudioUrl: getChatAiAudioUrl(interaction.answerAudioKey),
    };
  }

  private toSummary(interaction: AiInteractionTable): ChatAiInteractionSummary {
    return {
      id: interaction.id,
      viewerName: interaction.viewerName,
      viewerAvatarUrl: interaction.viewerAvatarUrl,
      prompt: interaction.prompt,
      answer: interaction.answer,
      mood: interaction.mood as ChatAiMood,
      status: interaction.status as ChatAiInteractionStatus,
      error: interaction.error,
      attempts: interaction.attempts,
      createdAt: interaction.createdAt.toISOString(),
      questionAudioUrl: interaction.questionAudioKey
        ? getChatAiAudioUrl(interaction.questionAudioKey)
        : null,
      answerAudioUrl: interaction.answerAudioKey
        ? getChatAiAudioUrl(interaction.answerAudioKey)
        : null,
    };
  }

  private questionNarration(interaction: AiInteractionTable): string {
    return `Oh, ada pesan masuk nih dari ${interaction.viewerName}. Dia bilang, ${interaction.prompt}`;
  }

  private answerNarration(answer: string): string {
    return answer;
  }

  private getCooldownClient(): Redis {
    if (!this.cooldownClient) {
      this.cooldownClient = new Redis(env.REDIS_URL, { maxRetriesPerRequest: 1 });
    }
    return this.cooldownClient;
  }
}

export const chatAiService = new ChatAiService();
