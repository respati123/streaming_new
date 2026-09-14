export function parseChatAiPrompt(message: string): string | null {
  const match = message.trim().match(/^!chatai(?:\s+(.+))?$/i);
  const prompt = match?.[1]?.trim();

  return prompt || null;
}
