import { access, mkdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { env } from '@core/config/env';

const fileNamePattern = /^[0-9a-f-]{36}-(question|answer)\.mp3$/i;

export async function saveChatAiAudio(
  interactionId: string,
  speaker: 'question' | 'answer',
  audio: ReadableStream<Uint8Array>
): Promise<string> {
  const key = `${interactionId}-${speaker}.mp3`;
  await mkdir(getAudioDirectory(), { recursive: true });
  await Bun.write(getAudioPath(key), await new Response(audio).arrayBuffer());
  return key;
}

export async function getChatAiAudioFile(key: string): Promise<Bun.BunFile | null> {
  if (!fileNamePattern.test(key)) return null;
  const path = getAudioPath(key);
  try {
    await access(path);
    return Bun.file(path);
  } catch {
    return null;
  }
}

export function getChatAiAudioUrl(key: string): string {
  return new URL(`/media/chatai/${key}`, env.CHATAI_MEDIA_BASE_URL).toString();
}

function getAudioDirectory(): string {
  return resolve(process.cwd(), env.CHATAI_AUDIO_DIR);
}

function getAudioPath(key: string): string {
  return join(getAudioDirectory(), key);
}
