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
  emotes?: ChatEmote[] | null;
  parts?: ChatPart[] | null;
  className?: string;
  emoteSizeClassName?: string;
}

export const EmoteMessageRenderer: React.FC<EmoteMessageRendererProps> = ({
  message,
  emotes,
  parts,
  className = 'text-zinc-100 text-[11px] leading-snug font-sans break-words select-text',
  emoteSizeClassName = 'inline-block h-[20px] w-[20px] mx-0.5 object-contain align-middle -mt-0.5 drop-shadow-sm',
}) => {
  // 1. If Streamer.bot provided rich 'parts', render parts directly
  if (parts && parts.length > 0) {
    return (
      <p className={className}>
        {parts.map((part) => {
          const imgSrc = part.image;
          if (imgSrc) {
            return (
              <img
                key={`part-${part.image || part.text || part.emoji || 'empty'}`}
                src={imgSrc}
                alt={part.emoji || part.text || 'emote'}
                title={part.emoji || part.text || ''}
                className={emoteSizeClassName}
                loading="lazy"
                crossOrigin="anonymous"
              />
            );
          }
          return (
            <span key={`part-txt-${part.text || part.emoji || 'empty'}`}>
              {part.text || part.emoji || ''}
            </span>
          );
        })}
      </p>
    );
  }

  // 2. If 'emotes' array is provided, parse text and replace emote tokens
  if (emotes && emotes.length > 0) {
    const emoteMap = new Map<string, string>();
    for (const em of emotes) {
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
      const tokens = message.split(regexPattern);

      return (
        <p className={className}>
          {tokens.map((token) => {
            const emoteImg = emoteMap.get(token);
            if (emoteImg) {
              return (
                <img
                  key={`token-${token}`}
                  src={emoteImg}
                  alt={token}
                  title={token}
                  className={emoteSizeClassName}
                  loading="lazy"
                  crossOrigin="anonymous"
                />
              );
            }
            return <span key={`txt-${token}`}>{token}</span>;
          })}
        </p>
      );
    }
  }

  // 3. Plain text fallback
  return <p className={className}>{message}</p>;
};
