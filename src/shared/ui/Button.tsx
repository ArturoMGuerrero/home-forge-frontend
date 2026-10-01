import { ButtonHTMLAttributes, ReactNode, ElementType } from 'react';
import { cn } from './cn';
import { Spinner } from './Spinner';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'danger' | 'danger-solid' | 'danger-ghost' | 'success';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  iconRight?: ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
  as?: ElementType;
  to?: string;
  href?: string;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-white shadow-sm hover:bg-primary-hover',
  secondary: 'border border-primary-line bg-primary-soft text-primary-fg hover:bg-primary-muted',
  tertiary: 'border border-border bg-surface text-fg-muted shadow-sm hover:border-border-strong hover:bg-surface-muted hover:text-fg',
  ghost: 'text-fg-muted hover:bg-surface-sunken hover:text-fg',
  danger: 'border border-danger-line bg-surface text-danger-fg shadow-sm hover:bg-danger-soft',
  'danger-solid': 'bg-danger text-white shadow-sm hover:bg-danger-hover',
  'danger-ghost': 'text-danger-fg hover:bg-danger-soft',
  success: 'bg-success text-white shadow-sm hover:bg-success-hover',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'min-h-8 gap-1.5 rounded-lg px-3 text-xs',
  md: 'min-h-10 gap-2 rounded-xl px-4 text-sm',
  lg: 'min-h-12 gap-2 rounded-xl px-6 text-base',
  icon: 'size-10 rounded-xl',
};

export function buttonClasses({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
}: { variant?: ButtonVariant; size?: ButtonSize; fullWidth?: boolean; className?: string } = {}) {
  return cn(
    'inline-flex max-w-full shrink-0 items-center justify-center font-semibold whitespace-nowrap transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
    'disabled:pointer-events-none disabled:opacity-50',
    variantStyles[variant],
    sizeStyles[size],
    fullWidth && 'w-full',
    className,
  );
}

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  loading = false,
  fullWidth = false,
  children,
  className,
  disabled,
  as,
  to,
  href,
  ...props
}: ButtonProps) {
  const Component = as || 'button';
  const classes = buttonClasses({ variant, size, fullWidth, className });

  const content = (
    <>
      {loading ? <Spinner size="sm" /> : icon}
      {children}
      {iconRight}
    </>
  );

  if (Component === 'button') {
    return (
      <button
        aria-busy={loading || undefined}
        className={classes}
        disabled={disabled || loading}
        {...props}
        type={props.type ?? 'button'}
      >
        {content}
      </button>
    );
  }

  return (
    <Component className={classes} to={to} href={href} {...props}>
      {content}
    </Component>
  );
}
