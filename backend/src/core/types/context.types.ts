import type { SupportedLanguage } from '../i18n/i18n.types';

export interface AuthUser {
  id: string;
  email: string | null;
  name: string;
  role: string;
  youtubeHandle?: string | null;
}

export type AppVariables = {
  requestId: string;
  language: SupportedLanguage;
  user?: AuthUser;
};

export type AppEnvironment = {
  Variables: AppVariables;
};
