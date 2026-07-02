import { ReactNode } from 'react';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'purple';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  success: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-700',
  error: 'bg-rose-100 text-rose-700',
  info: 'bg-indigo-100 text-indigo-700',
  neutral: 'bg-slate-100 text-slate-700',
  purple: 'bg-purple-100 text-purple-700',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs gap-1',
  md: 'px-2.5 py-1 text-sm gap-1.5',
};

export function Badge({ variant = 'neutral', size = 'sm', icon, children, className = '' }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center font-semibold rounded-full
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {icon}
      {children}
    </span>
  );
}

// Badge de contador (para números)
interface CounterBadgeProps {
  count: number;
  label?: string;
  max?: number;
}

export function CounterBadge({ count, label, max = 99 }: CounterBadgeProps) {
  const displayCount = count > max ? `${max}+` : count;

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-semibold">
      <span className="text-lg font-bold text-slate-900">{displayCount}</span>
      {label && <span>{label}</span>}
    </div>
  );
}
