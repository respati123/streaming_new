import type { ThemeMode, ThemeState } from '@shared/types/theme.types';
import { create } from 'zustand';

const THEME_STORAGE_KEY = 'app_theme_preference';

const applyThemeToDOM = () => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.classList.remove('dark');
  root.classList.add('light');
};

applyThemeToDOM();

export const useThemeStore = create<ThemeState>((set) => ({
  theme: 'light',
  resolvedTheme: 'light',

  setTheme: (_theme: ThemeMode) => {
    localStorage.setItem(THEME_STORAGE_KEY, 'light');
    applyThemeToDOM();
    set({ theme: 'light', resolvedTheme: 'light' });
  },

  toggleTheme: () => {
    applyThemeToDOM();
    set({ theme: 'light', resolvedTheme: 'light' });
  },
}));
