import { beforeEach, describe, expect, it } from 'vitest';
import { useThemeStore } from './theme.store';

describe('Theme Store (Zustand)', () => {
  beforeEach(() => {
    localStorage.clear();
    useThemeStore.getState().setTheme('light');
  });

  it('should initialize with light theme and update state', () => {
    expect(useThemeStore.getState().theme).toBe('light');
    expect(useThemeStore.getState().resolvedTheme).toBe('light');
  });

  it('should switch theme to dark and toggle properly', () => {
    useThemeStore.getState().setTheme('dark');
    expect(useThemeStore.getState().theme).toBe('dark');
    expect(useThemeStore.getState().resolvedTheme).toBe('dark');
    expect(localStorage.getItem('app_theme_preference')).toBe('dark');

    useThemeStore.getState().toggleTheme();
    expect(useThemeStore.getState().theme).toBe('light');
    expect(useThemeStore.getState().resolvedTheme).toBe('light');
  });
});
