import { ButtonHTMLAttributes, ReactNode, ElementType } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'danger' | 'success' | 'danger-ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

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
  primary: 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg hover:shadow-xl',
  secondary: 'bg-white border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50',
  tertiary: 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300',
  ghost: 'text-slate-700 hover:bg-slate-100',
  danger: 'bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300',
  'danger-ghost': 'text-rose-600 hover:text-rose-700 hover:bg-rose-50',
  success: 'bg-emerald-600 text-white hover:bg-emerald-700',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'min-h-9 px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5',
  lg: 'px-6 py-3 text-base',
};

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  loading = false,
  fullWidth = false,
  children,
  className = '',
  disabled,
  as,
  to,
  href,
  ...props
}: ButtonProps) {
  const Component = as || 'button';

  const buttonClasses = `
    inline-flex min-h-10 max-w-full items-center justify-center gap-2 rounded-xl font-semibold transition-colors transition-shadow
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--main-bg))]
    disabled:opacity-50 disabled:cursor-not-allowed
    ${variantStyles[variant]}
    ${sizeStyles[size]}
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `;

  const content = (
    <>
      {loading ? (
        <svg className="size-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : icon}
      {children}
      {iconRight}
    </>
  );

  if (Component === 'button') {
    return (
      <button
        className={buttonClasses}
        disabled={disabled || loading}
        {...props}
        type={props.type ?? 'button'}
      >
        {content}
      </button>
    );
  }

  return (
    <Component
      className={buttonClasses}
      to={to}
      href={href}
      {...props}
    >
      {content}
    </Component>
  );
}
