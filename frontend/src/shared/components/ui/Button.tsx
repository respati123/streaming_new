import { cn } from '@core/utils/cn';
import type { ButtonProps } from '@shared/types/button.types';
import { forwardRef } from 'react';
import { RiLoader4Line } from 'react-icons/ri';

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-semibold rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98] active:translate-y-[0.5px] font-sans';

    const variantStyles = {
      primary:
        'bg-zinc-950 text-white hover:bg-zinc-900 focus-visible:ring-zinc-950 shadow-tactile border border-zinc-800',
      secondary:
        'bg-zinc-100 text-zinc-900 hover:bg-zinc-200 focus-visible:ring-zinc-400 border border-zinc-200',
      outline:
        'border border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-50 focus-visible:ring-zinc-950 shadow-xs',
      ghost:
        'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 focus-visible:ring-zinc-400',
      danger:
        'bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-500 shadow-tactile border border-rose-700',
    };

    const sizeStyles = {
      sm: 'text-xs px-3 py-1.5 gap-1.5',
      md: 'text-xs sm:text-sm px-4 py-2 gap-2',
      lg: 'text-sm sm:text-base px-5 py-2.5 gap-2.5',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {isLoading && <RiLoader4Line className="animate-spin text-sm shrink-0" />}
        {!isLoading && leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
