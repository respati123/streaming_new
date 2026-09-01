import type { ThemeMode, ThemeState } from '@shared/types/theme.types';
import { create } from 'zustand';

const THEME_STORAGE_KEY = 'app_theme_preference';

const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const getInitialTheme = (): ThemeMode => {
  if (typeof window === 'undefined') return 'system';
  const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
  return saved || 'system';
};

const applyThemeToDOM = (resolved: 'light' | 'dark') => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (resolved === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
};

const initialTheme = getInitialTheme();
const initialResolved = initialTheme === 'system' ? getSystemTheme() : initialTheme;
applyThemeToDOM(initialResolved);

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: initialTheme,
  resolvedTheme: initialResolved,

  setTheme: (theme: ThemeMode) => {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    const resolved = theme === 'system' ? getSystemTheme() : theme;
    applyThemeToDOM(resolved);
    set({ theme, resolvedTheme: resolved });
  },

  toggleTheme: () => {
    const currentResolved = get().resolvedTheme;
    const nextTheme: ThemeMode = currentResolved === 'dark' ? 'light' : 'dark';
    get().setTheme(nextTheme);
  },
}));

if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    const state = useThemeStore.getState();
    if (state.theme === 'system') {
      const resolved = e.matches ? 'dark' : 'light';
      applyThemeToDOM(resolved);
      useThemeStore.setState({ resolvedTheme: resolved });
    }
  });
}
