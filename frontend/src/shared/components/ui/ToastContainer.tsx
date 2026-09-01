import { cn } from '@core/utils/cn';
import { useUIStore } from '@shared/stores/ui.store';
import type { ToastType } from '@shared/types/ui-store.types';
import type { ReactNode } from 'react';
import {
  RiAlertFill,
  RiCheckboxCircleFill,
  RiCloseLine,
  RiErrorWarningFill,
  RiInformationFill,
} from 'react-icons/ri';

export function ToastContainer() {
  const toasts = useUIStore((state) => state.toasts);
  const removeToast = useUIStore((state) => state.removeToast);

  if (toasts.length === 0) return null;

  const icons: Record<ToastType, ReactNode> = {
    success: <RiCheckboxCircleFill className="text-xl text-emerald-600 shrink-0" />,
    error: <RiErrorWarningFill className="text-xl text-rose-600 shrink-0" />,
    warning: <RiAlertFill className="text-xl text-amber-600 shrink-0" />,
    info: <RiInformationFill className="text-xl text-zinc-900 shrink-0" />,
  };

  const borderStyles: Record<ToastType, string> = {
    success: 'border-l-4 border-l-emerald-500 bg-white shadow-2xl',
    error: 'border-l-4 border-l-rose-500 bg-white shadow-2xl',
    warning: 'border-l-4 border-l-amber-500 bg-white shadow-2xl',
    info: 'border-l-4 border-l-zinc-950 bg-white shadow-2xl',
  };

  return (
    <aside
      data-testid="toast-container"
      aria-label="Notifications"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none font-sans"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          data-testid={`toast-item-${toast.type}`}
          className={cn(
            'pointer-events-auto flex items-start gap-3 rounded-xl p-4 shadow-xl border border-zinc-200 transition-all transform duration-300 animate-slideInRight',
            borderStyles[toast.type]
          )}
        >
          {icons[toast.type]}
          <div className="flex-1">
            {toast.title && <h4 className="text-xs font-bold text-zinc-950">{toast.title}</h4>}
            <p className="text-xs text-zinc-600 mt-0.5 leading-relaxed">{toast.message}</p>
          </div>
          <button
            type="button"
            onClick={() => removeToast(toast.id)}
            className="text-zinc-400 hover:text-zinc-700 transition-colors p-1"
            aria-label="Close notification"
          >
            <RiCloseLine className="text-base" />
          </button>
        </div>
      ))}
    </aside>
  );
}
