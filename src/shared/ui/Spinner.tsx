import { cn } from './cn';

type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface SpinnerProps {
  size?: SpinnerSize;
  className?: string;
}

const sizeClasses: Record<SpinnerSize, string> = {
  xs: 'size-3',
  sm: 'size-4',
  md: 'size-6',
  lg: 'size-8',
  xl: 'size-12',
};

export function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <svg aria-hidden="true" className={cn('animate-spin', sizeClasses[size], className)} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

interface LoadingOverlayProps {
  message?: string;
}

/** Bloquea la pantalla completa mientras se procesa algo. */
export function LoadingOverlay({ message = 'Cargando...' }: LoadingOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4 backdrop-blur-[2px]" role="status">
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-surface px-8 py-7 shadow-pop">
        <Spinner size="xl" className="text-primary" />
        <p className="text-sm font-medium text-fg-muted">{message}</p>
      </div>
    </div>
  );
}

interface LoadingStateProps {
  message?: string;
  size?: SpinnerSize;
  className?: string;
}

/** Estado de carga para una sección o página. */
export function LoadingState({ message = 'Cargando...', size = 'lg', className }: LoadingStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 py-16', className)} role="status">
      <Spinner size={size} className="text-primary" />
      <p className="text-sm text-fg-subtle">{message}</p>
    </div>
  );
}

/** Bloque gris animado para esqueletos de carga. */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn('animate-pulse rounded-lg bg-surface-sunken', className)} />;
}
