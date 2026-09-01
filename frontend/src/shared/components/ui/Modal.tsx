import { cn } from '@core/utils/cn';
import type { ModalProps } from '@shared/types/modal.types';
import { useEffect, useId } from 'react';
import { RiCloseLine } from 'react-icons/ri';

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'md',
  closeOnEscape = true,
  dataTestId,
}: ModalProps) {
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, closeOnEscape, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      data-testid={dataTestId || 'modal-container'}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-zinc-950/50 backdrop-blur-xs transition-opacity animate-fadeIn"
        onClick={onClose}
        aria-hidden="true"
        data-testid="modal-backdrop"
      />

      {/* Dialog Box */}
      <div
        className={cn(
          'relative w-full rounded-2xl bg-white p-6 shadow-2xl transition-all z-10 animate-scaleUp border border-zinc-200 font-sans',
          maxWidthClasses[maxWidth]
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descriptionId : undefined}
      >
        <div className="flex items-center justify-between pb-3.5 border-b border-zinc-100">
          <div>
            {title && (
              <h3 id={titleId} className="text-base font-extrabold text-zinc-950 tracking-tight">
                {title}
              </h3>
            )}
            {description && (
              <p id={descriptionId} className="text-xs text-zinc-500 font-mono mt-0.5">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
            aria-label="Close dialog"
            data-testid="modal-close-button"
          >
            <RiCloseLine className="text-xl" />
          </button>
        </div>

        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
