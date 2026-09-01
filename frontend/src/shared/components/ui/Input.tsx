import { cn } from '@core/utils/cn';
import type { InputProps } from '@shared/types/input.types';
import { forwardRef } from 'react';

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, leftIcon, rightIcon, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5 font-sans">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-bold text-zinc-800 tracking-tight">
            {label}
          </label>
        )}
        <div className="relative rounded-xl shadow-xs">
          {leftIcon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              'block w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2 text-xs sm:text-sm text-zinc-900 placeholder-zinc-400 transition-colors focus:border-zinc-950 focus:outline-none focus:ring-2 focus:ring-zinc-950/20 disabled:bg-zinc-50 disabled:text-zinc-400 font-sans',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error && 'border-rose-500 text-rose-900 focus:border-rose-500 focus:ring-rose-500/20',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-zinc-400">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="text-xs font-semibold text-rose-600 animate-fadeIn">{error}</p>}
        {!error && helperText && <p className="text-xs text-zinc-500">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
