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

  it('should keep the application on the light theme', () => {
    useThemeStore.getState().setTheme('dark');
    expect(useThemeStore.getState().theme).toBe('light');
    expect(useThemeStore.getState().resolvedTheme).toBe('light');
    expect(localStorage.getItem('app_theme_preference')).toBe('light');

    useThemeStore.getState().toggleTheme();
    expect(useThemeStore.getState().theme).toBe('light');
    expect(useThemeStore.getState().resolvedTheme).toBe('light');
  });
});
