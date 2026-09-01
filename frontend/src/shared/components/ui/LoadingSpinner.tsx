import { cn } from '@core/utils/cn';
import type { LoadingSpinnerProps, SpinnerSize } from '@shared/types/spinner.types';
import { RiLoader4Line } from 'react-icons/ri';

export function LoadingSpinner({ size = 'md', className, label }: LoadingSpinnerProps) {
  const sizeClasses: Record<SpinnerSize, string> = {
    sm: 'w-4 h-4 text-base',
    md: 'w-6 h-6 text-xl',
    lg: 'w-8 h-8 text-2xl',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center gap-2 font-sans', className)}>
      <RiLoader4Line className={cn('animate-spin text-zinc-900', sizeClasses[size])} />
      {label && <p className="text-xs font-mono font-medium text-zinc-500">{label}</p>}
    </div>
  );
}
