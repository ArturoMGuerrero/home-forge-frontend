import { ReactNode } from 'react';
import { cn } from './cn';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'primary' | 'purple';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: ReactNode;
  /** Muestra un punto de color antes del texto. */
  dot?: boolean;
  children: ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, { badge: string; dot: string }> = {
  success: { badge: 'bg-success-soft text-success-fg ring-success-line', dot: 'bg-success' },
  warning: { badge: 'bg-warning-soft text-warning-fg ring-warning-line', dot: 'bg-warning' },
  error: { badge: 'bg-danger-soft text-danger-fg ring-danger-line', dot: 'bg-danger' },
  info: { badge: 'bg-info-soft text-info-fg ring-info-line', dot: 'bg-info' },
  primary: { badge: 'bg-primary-soft text-primary-fg ring-primary-line', dot: 'bg-primary' },
  purple: { badge: 'bg-accent-soft text-accent-fg ring-accent-line', dot: 'bg-accent' },
  neutral: { badge: 'bg-surface-sunken text-fg-muted ring-border', dot: 'bg-fg-subtle' },
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs gap-1',
  md: 'px-2.5 py-1 text-sm gap-1.5',
};

export function Badge({ variant = 'neutral', size = 'sm', icon, dot = false, children, className }: BadgeProps) {
  const styles = variantStyles[variant];
  return (
    <span
      className={cn(
        'inline-flex items-center whitespace-nowrap rounded-full font-medium ring-1 ring-inset [&_svg]:size-3.5',
        styles.badge,
        sizeStyles[size],
        className,
      )}
    >
      {dot && <span aria-hidden="true" className={cn('size-1.5 rounded-full', styles.dot)} />}
      {icon}
      {children}
    </span>
  );
}

interface CounterBadgeProps {
  count: number;
  label?: string;
  max?: number;
}

export function CounterBadge({ count, label, max = 99 }: CounterBadgeProps) {
  const displayCount = count > max ? `${max}+` : count;

  return (
    <span className="inline-flex items-baseline gap-1.5 rounded-full bg-surface-sunken px-3 py-1 text-sm text-fg-subtle">
      <span className="font-semibold text-fg">{displayCount}</span>
      {label && <span>{label}</span>}
    </span>
  );
}
