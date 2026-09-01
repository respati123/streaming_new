import type { SupportedLanguage, TranslationKey, TranslationParams } from '@core/i18n/i18n.types';

export interface I18nState {
  language: SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => void;
  t: (key: TranslationKey | string, params?: TranslationParams) => string;
}

export interface UseTranslationReturn {
  language: SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => void;
  t: (key: TranslationKey | string, params?: TranslationParams) => string;
  isIndonesian: boolean;
  isEnglish: boolean;
}
