import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cardClass } from './Card';
import { cn } from './cn';

export type StatTone = 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';

const toneClasses: Record<StatTone, string> = {
  primary: 'bg-primary-soft text-primary-fg',
  accent: 'bg-accent-soft text-accent-fg',
  success: 'bg-success-soft text-success-fg',
  warning: 'bg-warning-soft text-warning-fg',
  danger: 'bg-danger-soft text-danger-fg',
  info: 'bg-info-soft text-info-fg',
  neutral: 'bg-surface-sunken text-fg-muted',
};

interface StatCardProps {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  tone?: StatTone;
  /** Texto secundario bajo el valor (tendencia, comparación, etc.). */
  hint?: ReactNode;
  to?: string;
  className?: string;
}

/** Tarjeta de indicador (KPI) con etiqueta, valor e icono. */
export function StatCard({ label, value, icon, tone = 'primary', hint, to, className }: StatCardProps) {
  const content = (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-fg-subtle">{label}</p>
        <p className="mt-2 text-2xl font-bold tracking-tight text-fg tabular-nums sm:text-3xl">{value}</p>
        {hint && <div className="mt-1.5 text-xs text-fg-subtle">{hint}</div>}
      </div>
      {icon && (
        <div className={cn('grid size-10 shrink-0 place-items-center rounded-xl [&_svg]:size-5', toneClasses[tone])}>
          {icon}
        </div>
      )}
    </div>
  );

  const classes = cn(cardClass, 'block p-5', to && 'transition hover:border-primary-line hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary', className);

  return to ? <Link className={classes} to={to}>{content}</Link> : <div className={classes}>{content}</div>;
}
