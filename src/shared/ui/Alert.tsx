import { ReactNode } from 'react';
import { cn } from './cn';

export type AlertVariant = 'info' | 'success' | 'warning' | 'error';

interface AlertProps {
  variant?: AlertVariant;
  title?: ReactNode;
  children?: ReactNode;
  icon?: ReactNode;
  /** Acciones (botones o enlaces) alineadas a la derecha. */
  actions?: ReactNode;
  onClose?: () => void;
  className?: string;
}

const variantStyles: Record<AlertVariant, { container: string; icon: string }> = {
  info: { container: 'border-info-line bg-info-soft', icon: 'text-info' },
  success: { container: 'border-success-line bg-success-soft', icon: 'text-success' },
  warning: { container: 'border-warning-line bg-warning-soft', icon: 'text-warning' },
  error: { container: 'border-danger-line bg-danger-soft', icon: 'text-danger' },
};

const iconPaths: Record<AlertVariant, string> = {
  info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  success: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  warning: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
  error: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
};

export function AlertIcon({ variant, className }: { variant: AlertVariant; className?: string }) {
  return (
    <svg aria-hidden="true" className={cn('size-5 shrink-0', className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPaths[variant]} />
    </svg>
  );
}

export function Alert({ variant = 'info', title, children, icon, actions, onClose, className }: AlertProps) {
  const styles = variantStyles[variant];

  return (
    <div className={cn('rounded-xl border p-4', styles.container, className)} role={variant === 'error' ? 'alert' : 'status'}>
      <div className="flex gap-3">
        <div className={cn('mt-px', styles.icon)}>{icon || <AlertIcon variant={variant} />}</div>

        <div className="min-w-0 flex-1">
          {title && <p className="text-sm font-semibold text-fg">{title}</p>}
          {children && <div className={cn('text-sm text-fg-muted', title && 'mt-1')}>{children}</div>}
          {actions && <div className="mt-3 flex flex-wrap gap-2">{actions}</div>}
        </div>

        {onClose && (
          <button
            aria-label="Cerrar aviso"
            className="-m-1 grid size-7 shrink-0 place-items-center rounded-lg text-fg-subtle transition hover:bg-surface/60 hover:text-fg"
            onClick={onClose}
            type="button"
          >
            <svg aria-hidden="true" className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
