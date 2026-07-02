import { ReactNode, HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  noPadding?: boolean;
  children: ReactNode;
}

export function Card({ interactive = false, noPadding = false, children, className = '', ...props }: CardProps) {
  return (
    <div
      className={`
        bg-white rounded-2xl border border-slate-200 shadow-sm
        ${interactive ? 'hover:shadow-lg hover:border-indigo-200 transition-all cursor-pointer' : ''}
        ${noPadding ? '' : 'p-6'}
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
      <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="rounded-lg bg-indigo-100 p-2">
              {icon}
            </div>
          )}
          <div>
            <h3 className="text-lg font-bold text-slate-900">{title}</h3>
            {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {actions && <div>{actions}</div>}
      </div>
      <div className="p-6">{children}</div>
    </Card>
  );
}
