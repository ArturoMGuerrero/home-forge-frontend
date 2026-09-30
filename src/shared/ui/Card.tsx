import { ReactNode, HTMLAttributes } from 'react';
import { cn } from './cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  noPadding?: boolean;
  truncate?: boolean;
  children: ReactNode;
}

export const cardClass = 'min-w-0 rounded-2xl border border-border bg-surface text-fg shadow-card';

export function Card({ interactive = false, noPadding = false, truncate = false, children, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        cardClass,
        interactive && 'cursor-pointer transition-[border-color,box-shadow] hover:border-primary-line hover:shadow-md',
        !noPadding && 'p-5 sm:p-6',
        truncate && 'overflow-hidden',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface CardWithHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  icon?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}

export function CardWithHeader({ title, subtitle, icon, actions, children, className, bodyClassName }: CardWithHeaderProps) {
  return (
    <Card noPadding className={className}>
      <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          {icon && (
            <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary-fg [&_svg]:size-5">
              {icon}
            </div>
          )}
          <div className="min-w-0">
            <h3 className="break-words text-base font-semibold text-fg">{title}</h3>
            {subtitle && <p className="mt-0.5 text-sm text-fg-subtle">{subtitle}</p>}
          </div>
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2 sm:justify-end">{actions}</div>}
      </div>
      <div className={cn('p-5 sm:p-6', bodyClassName)}>{children}</div>
    </Card>
  );
}
