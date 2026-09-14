import type React from 'react';

export interface ChatEmote {
  type?: string;
  name: string;
  imageUrl?: string;
  url?: string;
  startIndex?: number;
  endIndex?: number;
}

export interface ChatPart {
  emoji?: string;
  image?: string;
  text?: string;
  startIndex?: number;
  endIndex?: number;
}

interface EmoteMessageRendererProps {
  message: string;
  emotes?: ChatEmote[] | string | unknown[] | null;
  parts?: ChatPart[] | string | unknown[] | null;
  className?: string;
  emoteSizeClassName?: string;
}

export const EmoteMessageRenderer: React.FC<EmoteMessageRendererProps> = ({
  message = '',
  emotes,
  parts,
  className = 'text-zinc-100 text-[11px] leading-snug font-sans break-words select-text',
  emoteSizeClassName = 'inline-block h-[20px] w-[20px] mx-0.5 object-contain align-middle -mt-0.5 drop-shadow-sm',
}) => {
  const safeMessage = typeof message === 'string' ? message : String(message ?? '');

  // 1. Safely resolve 'parts' (handles stringified JSON, non-array, null, etc.)
  let safeParts: ChatPart[] = [];
  if (Array.isArray(parts)) {
    safeParts = parts as ChatPart[];
  } else if (typeof parts === 'string' && parts.trim().startsWith('[')) {
    try {
      const parsed = JSON.parse(parts);
      if (Array.isArray(parsed)) safeParts = parsed as ChatPart[];
    } catch {
      safeParts = [];
    }
  }

  // 2. Safely resolve 'emotes' (handles stringified JSON, non-array, null, etc.)
  let safeEmotes: ChatEmote[] = [];
  if (Array.isArray(emotes)) {
    safeEmotes = emotes as ChatEmote[];
  } else if (typeof emotes === 'string' && emotes.trim().startsWith('[')) {
    try {
      const parsed = JSON.parse(emotes);
      if (Array.isArray(parsed)) safeEmotes = parsed as ChatEmote[];
    } catch {
      safeEmotes = [];
    }
  }

  // If Streamer.bot provided rich 'parts', render parts directly
  if (safeParts.length > 0) {
    return (
      <p className={className}>
        {safeParts.map((part, idx) => {
          if (!part || typeof part !== 'object') return null;
          const imgSrc = part.image;
          const keyId = `${part.text || part.emoji || part.image || 'part'}-${part.startIndex ?? idx}`;
          if (imgSrc) {
            return (
              <img
                key={keyId}
                src={imgSrc}
                alt={part.emoji || part.text || 'emote'}
                title={part.emoji || part.text || ''}
                className={emoteSizeClassName}
                loading="lazy"
                crossOrigin="anonymous"
              />
            );
          }
          return <span key={keyId}>{part.text || part.emoji || ''}</span>;
        })}
      </p>
    );
  }

  // If 'emotes' array is provided, parse text and replace emote tokens
  if (safeEmotes.length > 0) {
    const emoteMap = new Map<string, string>();
    for (const em of safeEmotes) {
      if (!em || typeof em !== 'object') continue;
      const img = em.imageUrl || em.url;
      if (em.name && img) {
        emoteMap.set(em.name, img);
      }
    }

    if (emoteMap.size > 0) {
      const regexPattern = new RegExp(
        `(${Array.from(emoteMap.keys())
          .map((k) => k.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'))
          .join('|')})`,
        'g'
      );
      const rawTokens = safeMessage.split(regexPattern);
      const tokenItems = rawTokens.map((tok, i) => ({
        id: `tkn-${tok}-${i}`,
        text: tok,
      }));

      return (
        <p className={className}>
          {tokenItems.map((item) => {
            const emoteImg = emoteMap.get(item.text);
            if (emoteImg) {
              return (
                <img
                  key={item.id}
                  src={emoteImg}
                  alt={item.text}
                  title={item.text}
                  className={emoteSizeClassName}
                  loading="lazy"
                  crossOrigin="anonymous"
                />
              );
            }
            return <span key={item.id}>{item.text}</span>;
          })}
        </p>
      );
    }
  }

  // 3. Plain text fallback
  return <p className={className}>{safeMessage}</p>;
};
