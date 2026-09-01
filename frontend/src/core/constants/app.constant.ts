export const APP_CONFIG = {
  NAME: 'Enterprise React Vite Boilerplate',
  VERSION: '1.0.0',
  DEFAULT_PAGE_SIZE: 8,
  TOAST_DURATION_MS: 4000,
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'app_auth_token',
  USER_PREFERENCES: 'app_user_prefs',
} as const;
