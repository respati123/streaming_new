export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  title?: string;
  message: string;
  type: ToastType;
}

export type ToastPayload = Omit<ToastItem, 'id'>;

export interface UIState {
  toasts: ToastItem[];
  addToast: (toast: ToastPayload) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}
