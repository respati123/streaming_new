import { env } from '@core/config/env';
import { type ElevenLabs, ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import type { ChatAiMood } from './chat-ai.types';

const voiceSettingsByMood: Record<ChatAiMood, ElevenLabs.VoiceSettings> = {
  neutral: { stability: 0.62, similarityBoost: 0.8, style: 0.1, useSpeakerBoost: true, speed: 1 },
  excited: {
    stability: 0.38,
    similarityBoost: 0.78,
    style: 0.45,
    useSpeakerBoost: true,
    speed: 1.05,
  },
  empathetic: {
    stability: 0.5,
    similarityBoost: 0.8,
    style: 0.25,
    useSpeakerBoost: true,
    speed: 0.94,
  },
  serious: {
    stability: 0.72,
    similarityBoost: 0.82,
    style: 0.12,
    useSpeakerBoost: true,
    speed: 0.96,
  },
  funny: {
    stability: 0.45,
    similarityBoost: 0.78,
    style: 0.35,
    useSpeakerBoost: true,
    speed: 1.02,
  },
};

export class ElevenLabsService {
  private client: ElevenLabsClient | null = null;

  public isConfigured(): boolean {
    return env.ELEVENLABS_ENABLED && Boolean(env.ELEVENLABS_API_KEY && env.ELEVENLABS_VOICE_ID);
  }

  public async streamText(
    text: string,
    voiceId = env.ELEVENLABS_AI_VOICE_ID,
    mood: ChatAiMood = 'neutral'
  ): Promise<ReadableStream<Uint8Array>> {
    const normalizedText = text.trim();
    if (!normalizedText) throw new Error('ElevenLabs text cannot be empty');

    return this.getClient().textToSpeech.stream(voiceId, {
      text: normalizedText,
      modelId: env.ELEVENLABS_MODEL_ID,
      voiceSettings: voiceSettingsByMood[mood],
      outputFormat:
        env.ELEVENLABS_OUTPUT_FORMAT as ElevenLabs.TextToSpeechStreamRequestOutputFormat,
      optimizeStreamingLatency: env.ELEVENLABS_OPTIMIZE_STREAMING_LATENCY,
    });
  }

  private getClient(): ElevenLabsClient {
    if (!this.isConfigured()) {
      throw new Error(
        'ElevenLabs is not configured. Set ELEVENLABS_ENABLED=true and ELEVENLABS_API_KEY.'
      );
    }

    if (!this.client) {
      this.client = new ElevenLabsClient({ apiKey: env.ELEVENLABS_API_KEY });
    }

    return this.client;
  }
}

export const elevenLabsService = new ElevenLabsService();
