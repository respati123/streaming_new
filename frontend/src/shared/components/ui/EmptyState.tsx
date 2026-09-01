import { cn } from '@core/utils/cn';
import { useTranslation } from '@shared/hooks/useTranslation';
import type { EmptyStateProps } from '@shared/types/empty-state.types';
import { RiInboxLine } from 'react-icons/ri';

export function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
  const { t } = useTranslation();

  const displayTitle = title || t('common.emptyStateDefaultTitle');
  const displayDescription = description || t('common.emptyStateDefaultDesc');

  return (
    <div
      data-testid="empty-state-container"
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-white py-16 px-6 text-center shadow-xs font-sans',
        className
      )}
    >
      <div className="rounded-2xl bg-zinc-50 p-4 text-zinc-400 mb-3.5 border border-zinc-200">
        {icon || <RiInboxLine className="text-3xl" />}
      </div>

      <h3
        data-testid="empty-state-title"
        className="text-sm font-extrabold text-zinc-950 tracking-tight"
      >
        {displayTitle}
      </h3>

      <p
        data-testid="empty-state-desc"
        className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto leading-relaxed"
      >
        {displayDescription}
      </p>

      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
