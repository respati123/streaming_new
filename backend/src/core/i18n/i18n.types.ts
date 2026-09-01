import type { TranslationSchema } from './locales/en';

export type SupportedLanguage = 'en' | 'id';

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = ['en', 'id'];
export const DEFAULT_LANGUAGE: SupportedLanguage = 'en';

type DeepString<T> = T extends string
  ? string
  : {
      readonly [K in keyof T]: DeepString<T[K]>;
    };

export type TranslationDictionary = DeepString<TranslationSchema>;

/**
 * Extracts leaf dot-paths from translation schema for exact autocomplete:
 * e.g. 'errors.unauthorized' | 'success.loginSuccessful'
 */
export type Leaves<T> = T extends object
  ? {
      [K in keyof T & string]: T[K] extends object ? `${K}.${Leaves<T[K]>}` : `${K}`;
    }[keyof T & string]
  : never;

export type TranslationKey = Leaves<TranslationSchema>;

/**
 * Autocomplete-friendly MessageKey type.
 * Uses TypeScript literal union trick `(string & {})` so IntelliSense suggests all TranslationKeys
 * while still permitting custom strings without type widening.
 */
export type MessageKey = TranslationKey | (string & {});

export interface TranslationParams {
  [key: string]: string | number;
}
