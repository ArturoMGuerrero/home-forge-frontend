import { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface PageHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  /** Texto corto sobre el título, p. ej. el nombre del módulo. */
  eyebrow?: string;
  backLink?: {
    to: string;
    label?: string;
  };
  badge?: {
    value: string | number;
    label: string;
  };
  actions?: ReactNode;
  children?: ReactNode;
}

export function PageHeader({ title, subtitle, eyebrow, backLink, badge, actions, children }: PageHeaderProps) {
  return (
    <header className="mb-6 sm:mb-8">
      {backLink && (
        <Link
          className="mb-3 inline-flex items-center gap-1.5 rounded-lg text-sm font-medium text-fg-subtle transition hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          to={backLink.to}
        >
          <svg aria-hidden="true" className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {backLink.label || 'Volver'}
        </Link>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          {eyebrow && <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-primary-fg">{eyebrow}</p>}
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-fg sm:text-3xl">{title}</h1>
            {badge && (
              <span className="inline-flex items-baseline gap-1 rounded-full bg-surface-sunken px-2.5 py-0.5 text-sm">
                <span className="font-semibold text-fg">{badge.value}</span>
                <span className="text-fg-subtle">{badge.label}</span>
              </span>
            )}
          </div>
          {subtitle && <p className="mt-1.5 max-w-2xl text-sm text-fg-subtle">{subtitle}</p>}
        </div>

        {actions && <div className="flex min-w-0 flex-wrap items-center gap-2 sm:shrink-0 sm:justify-end">{actions}</div>}
      </div>

      {children && <div className="mt-5">{children}</div>}
    </header>
  );
}
