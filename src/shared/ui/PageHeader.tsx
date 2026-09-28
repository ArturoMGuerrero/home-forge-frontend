import { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
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

export function PageHeader({ title, subtitle, backLink, badge, actions, children }: PageHeaderProps) {
  return (
    <div className="sticky top-0 z-10 border-b border-[rgb(var(--border-color))] bg-[rgb(var(--card-bg))]/95 shadow-sm backdrop-blur">
      <div className="px-4 py-4 lg:px-6">
        {/* Top bar */}
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {backLink && (
              <>
                <Link
                  to={backLink.to}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition shrink-0"
                >
                  <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="hidden sm:inline">{backLink.label || 'Volver'}</span>
                </Link>
                <div className="h-6 w-px bg-slate-200 shrink-0" />
              </>
            )}
            <div className="min-w-0">
              <h1 className="text-xl lg:text-2xl font-bold text-slate-900 truncate">{title}</h1>
              {subtitle && <p className="text-xs text-slate-500 mt-0.5 truncate">{subtitle}</p>}
            </div>
          </div>

          <div className="flex min-w-0 flex-wrap items-center gap-2 sm:shrink-0 sm:justify-end sm:gap-3">
            {badge && (
              <div className="rounded-xl border border-[rgb(var(--border-color))] bg-[rgb(var(--input-bg))] px-3 py-2 sm:px-4">
                <span className="text-lg font-bold text-slate-900">{badge.value}</span>
                <span className="text-xs text-slate-500 ml-1.5">{badge.label}</span>
              </div>
            )}
            {actions}
          </div>
        </div>

        {/* Custom content (like tabs) */}
        {children}
      </div>
    </div>
  );
}
