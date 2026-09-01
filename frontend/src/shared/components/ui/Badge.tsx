import { cn } from '@core/utils/cn';
import type { BadgeProps, BadgeSize, BadgeVariant } from '@shared/types/badge.types';

export function Badge({
  className,
  variant = 'neutral',
  size = 'md',
  children,
  ...props
}: BadgeProps) {
  const variantStyles: Record<BadgeVariant, string> = {
    primary: 'bg-zinc-950 text-white border-zinc-800',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
    warning: 'bg-amber-50 text-amber-800 border-amber-200/80',
    danger: 'bg-rose-50 text-rose-800 border-rose-200/80',
    neutral: 'bg-zinc-100 text-zinc-700 border-zinc-200',
  };

  const sizeStyles: Record<BadgeSize, string> = {
    sm: 'text-[10px] px-2 py-0.5 font-mono font-bold tracking-wider uppercase',
    md: 'text-xs px-2.5 py-1 font-semibold',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-lg border font-sans',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
