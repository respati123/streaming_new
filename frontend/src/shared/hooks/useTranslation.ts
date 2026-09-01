import type { TranslationKey, TranslationParams } from '@core/i18n/i18n.types';
import { useI18nStore } from '@shared/stores/i18n.store';
import type { UseTranslationReturn } from '@shared/types/i18n-store.types';
import { useCallback } from 'react';

export function useTranslation(): UseTranslationReturn {
  const language = useI18nStore((state) => state.language);
  const setLanguage = useI18nStore((state) => state.setLanguage);
  const rawT = useI18nStore((state) => state.t);

  const t = useCallback(
    (key: TranslationKey | string, params?: TranslationParams) => {
      return rawT(key, params);
    },
    [rawT]
  );

  return {
    language,
    setLanguage,
    t,
    isIndonesian: language === 'id',
    isEnglish: language === 'en',
  };
}

export type { UseTranslationReturn };
