import type { ThemeMode, ThemeState } from '@shared/types/theme.types';
import { create } from 'zustand';

const THEME_STORAGE_KEY = 'app_theme_preference';

const getInitialTheme = (): ThemeMode => 'light';

const applyLightThemeToDOM = () => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.classList.remove('dark');
  root.classList.add('light');
};

const initialTheme = getInitialTheme();
applyLightThemeToDOM();

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: initialTheme,
  resolvedTheme: 'light',

  setTheme: () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'light');
    applyLightThemeToDOM();
    set({ theme: 'light', resolvedTheme: 'light' });
  },

  toggleTheme: () => {
    get().setTheme('light');
  },
}));
