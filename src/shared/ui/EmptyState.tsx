import { ReactNode } from 'react';
import { Button } from './Button';
import { cn } from './cn';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  /** Acciones personalizadas (sustituye a actionLabel/onAction). */
  actions?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, actionLabel, onAction, actions, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center px-4 py-14 text-center', className)}>
      <div className="mb-4 grid size-14 place-items-center rounded-2xl bg-surface-sunken text-fg-subtle [&_svg]:size-7">
        {icon ?? (
          <svg aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        )}
      </div>

      <h3 className="text-base font-semibold text-fg">{title}</h3>

      {description && <p className="mt-1.5 max-w-md text-sm text-fg-subtle">{description}</p>}

      {(actions || (actionLabel && onAction)) && (
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {actions ?? <Button onClick={onAction}>{actionLabel}</Button>}
        </div>
      )}
    </div>
  );
}
