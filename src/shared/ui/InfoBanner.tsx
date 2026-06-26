import { ReactNode } from 'react';

interface InfoBannerProps {
  title: string;
  description?: string;
  variant?: 'info' | 'warning' | 'success' | 'danger';
  icon?: ReactNode;
  children?: ReactNode;
}

export function InfoBanner({ title, description, variant = 'info', icon, children }: InfoBannerProps) {
  const variants = {
    info: {
      container: 'border-indigo-200 bg-indigo-50',
      icon: 'text-indigo-600',
      title: 'text-indigo-900',
      description: 'text-indigo-700'
    },
    warning: {
      container: 'border-yellow-200 bg-yellow-50',
      icon: 'text-yellow-600',
      title: 'text-yellow-900',
      description: 'text-yellow-700'
    },
    success: {
      container: 'border-green-200 bg-green-50',
      icon: 'text-green-600',
      title: 'text-green-900',
      description: 'text-green-700'
    },
    danger: {
      container: 'border-red-200 bg-red-50',
      icon: 'text-red-600',
      title: 'text-red-900',
      description: 'text-red-700'
    }
  };

  const colors = variants[variant];

  const defaultIcon = (
    <svg className={`size-5 shrink-0 ${colors.icon} mt-0.5`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  return (
    <div className={`rounded-xl border ${colors.container} px-4 py-3`}>
      <div className="flex items-start gap-3">
        {icon || defaultIcon}
        <div className="flex-1">
          <p className={`text-sm font-medium ${colors.title}`}>{title}</p>
          {description && <p className={`text-xs ${colors.description} mt-1`}>{description}</p>}
          {children}
        </div>
      </div>
    </div>
  );
}
