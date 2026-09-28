import { ReactNode, HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  noPadding?: boolean;
  truncate?: boolean;
  children: ReactNode;
}

export function Card({ interactive = false, noPadding = false, truncate = false, children, className = '', ...props }: CardProps) {
  return (
    <div
      className={`
        min-w-0 rounded-2xl border border-[rgb(var(--border-color))] bg-[rgb(var(--card-bg))] text-[rgb(var(--text-primary))] shadow-sm
        ${interactive ? 'cursor-pointer transition-[border-color,box-shadow,transform] hover:border-indigo-300 hover:shadow-lg active:scale-[0.995]' : ''}
        ${noPadding ? '' : 'p-4 sm:p-6'}
        ${truncate ? 'overflow-hidden' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

// Card con header
interface CardWithHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function CardWithHeader({ title, subtitle, icon, actions, children, className = '' }: CardWithHeaderProps) {
  return (
    <Card noPadding className={className}>
      <div className="flex flex-col gap-3 border-b border-[rgb(var(--border-color))] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          {icon && (
            <div className="rounded-lg bg-indigo-100 p-2">
              {icon}
            </div>
          )}
          <div className="min-w-0">
            <h3 className="break-words text-lg font-bold text-[rgb(var(--text-primary))]">{title}</h3>
            {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2 sm:justify-end">{actions}</div>}
      </div>
      <div className="p-4 sm:p-6">{children}</div>
    </Card>
  );
}
