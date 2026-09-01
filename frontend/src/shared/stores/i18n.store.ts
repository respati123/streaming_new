import { DEFAULT_LANGUAGE, LANGUAGE_STORAGE_KEY, translate } from '@core/i18n/i18n';
import type { SupportedLanguage, TranslationKey, TranslationParams } from '@core/i18n/i18n.types';
import type { I18nState } from '@shared/types/i18n-store.types';
import { create } from 'zustand';

function getInitialLanguage(): SupportedLanguage {
  try {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (saved === 'en' || saved === 'id') {
      return saved;
    }
    const browserLang = navigator.language.slice(0, 2);
    if (browserLang === 'id') return 'id';
  } catch {}
  return DEFAULT_LANGUAGE;
}

export const useI18nStore = create<I18nState>((set, get) => ({
  language: getInitialLanguage(),

  setLanguage: (language: SupportedLanguage) => {
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch {}
    set({ language });
  },

  t: (key: TranslationKey | string, params?: TranslationParams) => {
    const { language } = get();
    return translate(language, key, params);
  },
}));

export type { I18nState };
