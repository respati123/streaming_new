import type { TranslationSchema } from './locales/en';

export type SupportedLanguage = 'en' | 'id';

type DeepString<T> = T extends string
  ? string
  : {
      readonly [K in keyof T]: DeepString<T[K]>;
    };

export type TranslationDictionary = DeepString<TranslationSchema>;

type Join<K, P> = K extends string | number
  ? P extends string | number
    ? `${K}${'' extends P ? '' : '.'}${P}`
    : never
  : never;

type Prev = [never, 0, 1, 2, 3, 4, 5, ...0[]];

export type Leaves<T, D extends number = 4> = [D] extends [never]
  ? never
  : T extends object
    ? { [K in keyof T]-?: Join<K, Leaves<T[K], Prev[D]>> }[keyof T]
    : '';

export type TranslationKey = Leaves<TranslationSchema>;

export interface TranslationParams {
  [key: string]: string | number;
}
