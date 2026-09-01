import type { AppEnvironment } from '@core/types/context.types';
import type { Context } from 'hono';
import {
  DEFAULT_LANGUAGE,
  type MessageKey,
  type SupportedLanguage,
  type TranslationDictionary,
  type TranslationParams,
} from './i18n.types';
import { en } from './locales/en';
import { id } from './locales/id';

const dictionaries: Record<SupportedLanguage, TranslationDictionary> = {
  en: en as unknown as TranslationDictionary,
  id,
};

/**
 * Type-safe translation function for backend error/success messages.
 * Uses MessageKey to provide full IDE autocompletion for all dictionary paths.
 */
export function t(
  lang: SupportedLanguage = DEFAULT_LANGUAGE,
  key: MessageKey,
  params?: TranslationParams
): string {
  const dictionary = dictionaries[lang] || dictionaries[DEFAULT_LANGUAGE];
  const keys = key.split('.');

  let current: unknown = dictionary;
  for (const k of keys) {
    if (current && typeof current === 'object' && k in current) {
      current = (current as Record<string, unknown>)[k];
    } else {
      // Fallback to English dictionary if key missing
      let fallbackCurrent: unknown = dictionaries[DEFAULT_LANGUAGE];
      for (const fallbackK of keys) {
        if (
          fallbackCurrent &&
          typeof fallbackCurrent === 'object' &&
          fallbackK in fallbackCurrent
        ) {
          fallbackCurrent = (fallbackCurrent as Record<string, unknown>)[fallbackK];
        } else {
          return key;
        }
      }
      current = fallbackCurrent;
      break;
    }
  }

  if (typeof current !== 'string') {
    return key;
  }

  if (!params) {
    return current;
  }

  let result = current;
  for (const [paramKey, value] of Object.entries(params)) {
    result = result.replace(new RegExp(`{{${paramKey}}}`, 'g'), String(value));
  }

  return result;
}

/**
 * Extracts and returns the active language from Hono Context
 */
export function getLocale(c: Context<AppEnvironment>): SupportedLanguage {
  return c.get('language') || DEFAULT_LANGUAGE;
}

/**
 * Scoped translator helper bound to the active request context.
 * Enables effortless switching and retrieval of localized response messages with full IDE autocomplete.
 */
export function getTranslator(c: Context<AppEnvironment>) {
  const language = getLocale(c);

  return {
    language,
    t: (key: MessageKey, params?: TranslationParams) => t(language, key, params),
    setLanguage: (lang: SupportedLanguage) => {
      c.set('language', lang);
      c.res.headers.set('Content-Language', lang);
    },
  };
}
