import { APP_CONFIG } from '@core/constants/app.constant';
import type { ToastItem, ToastPayload, ToastType, UIState } from '@shared/types/ui-store.types';
import { create } from 'zustand';

export const useUIStore = create<UIState>((set) => ({
  toasts: [],

  addToast: ({ title, message, type }: ToastPayload) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({
      toasts: [...state.toasts, { id, title, message, type }],
    }));

    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, APP_CONFIG.TOAST_DURATION_MS);
  },

  removeToast: (id: string) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  clearToasts: () => set({ toasts: [] }),
}));

export type { ToastItem, ToastPayload, ToastType, UIState };
