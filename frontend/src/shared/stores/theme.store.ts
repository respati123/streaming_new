import type { ThemeMode, ThemeState } from '@shared/types/theme.types';
import { create } from 'zustand';

const THEME_STORAGE_KEY = 'app_theme_preference';

const getInitialTheme = (): ThemeMode => {
  if (typeof window === 'undefined') return 'light';
  const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
  return saved || 'light';
};

const resolveTheme = (theme: ThemeMode): 'light' | 'dark' => {
  if (theme === 'system') {
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)')?.matches) {
      return 'dark';
    }
    return 'light';
  }
  return theme;
};

const applyThemeToDOM = (resolved: 'light' | 'dark') => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(resolved);
};

const initialTheme = getInitialTheme();
const initialResolved = resolveTheme(initialTheme);
applyThemeToDOM(initialResolved);

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: initialTheme,
  resolvedTheme: initialResolved,

  setTheme: (theme: ThemeMode) => {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    const resolvedTheme = resolveTheme(theme);
    applyThemeToDOM(resolvedTheme);
    set({ theme, resolvedTheme });
  },

  toggleTheme: () => {
    const nextTheme = get().resolvedTheme === 'dark' ? 'light' : 'dark';
    get().setTheme(nextTheme);
  },
}));
