import { expect, test } from 'bun:test';
import { parseChatAiPrompt } from './chat-ai.command';

test('parses a !chatai prompt case-insensitively', () => {
  expect(parseChatAiPrompt('  !ChatAI  Halo AI  ')).toBe('Halo AI');
});

test('ignores normal chats and empty !chatai commands', () => {
  expect(parseChatAiPrompt('halo ai')).toBeNull();
  expect(parseChatAiPrompt('!chatai')).toBeNull();
});
