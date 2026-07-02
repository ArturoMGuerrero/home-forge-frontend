import { ButtonHTMLAttributes, ReactNode, ElementType } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'danger' | 'success' | 'danger-ghost' | 'outline';
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

// Usar exactamente los mismos estilos que buttonStyles de src/shared/styles/buttons.ts
const variantStyles: Record<ButtonVariant, string> = {
  // Idéntico a buttonStyles.primary
  primary: 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg hover:shadow-xl',

  // Idéntico a buttonStyles.secondary
  secondary: 'bg-white border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50',

  // Idéntico a buttonStyles.tertiary
  tertiary: 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300',

  // Idéntico a buttonStyles.danger
  danger: 'bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300',

  // Variante danger-ghost (solo texto rojo)
  'danger-ghost': 'text-red-600 hover:text-red-700 hover:bg-red-50',

  // Variante outline
  outline: 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50',

  // Variante adicional success (verde sólido)
  success: 'bg-emerald-600 text-white hover:bg-emerald-700',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',        // Idéntico a buttonStyles.small
  md: 'px-4 py-2.5',                // Tamaño por defecto (sin text-sm para que sea heredado)
  lg: 'px-6 py-3 text-base',        // Idéntico a buttonStyles.large
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
    inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all
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
