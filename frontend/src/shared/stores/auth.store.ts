import { STORAGE_KEYS } from '@core/constants/app.constant';
import type { AuthState, User } from '@shared/types/auth.types';
import { create } from 'zustand';

export const useAuthStore = create<AuthState>((set) => {
  const initialToken = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);

  return {
    user: initialToken
      ? {
          id: 'usr_1',
          name: 'Developer Mode',
          email: 'dev@company.com',
          role: 'admin',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
        }
      : null,
    token: initialToken,
    isAuthenticated: Boolean(initialToken),

    login: (user: User, token: string) => {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      set({ user, token, isAuthenticated: true });
    },

    logout: () => {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      set({ user: null, token: null, isAuthenticated: false });
    },
  };
});

export type { AuthState, User };
