import { ReactNode } from 'react';
import { Alert, AlertVariant } from './Alert';

interface InfoBannerProps {
  title: string;
  description?: string;
  variant?: 'info' | 'warning' | 'success' | 'danger';
  icon?: ReactNode;
  children?: ReactNode;
}

/** Variante compacta de Alert, conservada por compatibilidad. */
export function InfoBanner({ title, description, variant = 'info', icon, children }: InfoBannerProps) {
  const alertVariant: AlertVariant = variant === 'danger' ? 'error' : variant;
  return (
    <Alert icon={icon} title={title} variant={alertVariant}>
      {(description || children) && (
        <>
          {description && <p className="text-xs">{description}</p>}
          {children}
        </>
      )}
    </Alert>
  );
}
