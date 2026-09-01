import type {
  SupportedLanguage,
  TranslationDictionary,
  TranslationKey,
  TranslationParams,
} from './i18n.types';
import { en } from './locales/en';
import { id } from './locales/id';

export const dictionaries: Record<SupportedLanguage, TranslationDictionary> = {
  en,
  id,
};

export const DEFAULT_LANGUAGE: SupportedLanguage = 'en';
export const LANGUAGE_STORAGE_KEY = 'app_language';

export function getNestedValue(obj: Record<string, unknown>, path: string): string | undefined {
  const keys = path.split('.');
  let current: unknown = obj;

  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }

  return typeof current === 'string' ? current : undefined;
}

export function translate(
  language: SupportedLanguage,
  key: TranslationKey | string,
  params?: TranslationParams
): string {
  const dict = dictionaries[language] || dictionaries[DEFAULT_LANGUAGE];
  let text = getNestedValue(dict as unknown as Record<string, unknown>, key);

  if (text === undefined) {
    text = getNestedValue(
      dictionaries[DEFAULT_LANGUAGE] as unknown as Record<string, unknown>,
      key
    );
  }

  if (text === undefined) {
    return key;
  }

  if (params) {
    Object.entries(params).forEach(([paramKey, paramValue]) => {
      text = text?.replace(new RegExp(`{{${paramKey}}}`, 'g'), String(paramValue));
    });
  }

  return text;
}
