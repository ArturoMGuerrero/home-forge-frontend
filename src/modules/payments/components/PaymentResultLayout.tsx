import { ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, cn, Spinner } from '../../../shared/ui';

type ResultTone = 'processing' | 'success' | 'warning' | 'error';

const toneStyles: Record<ResultTone, string> = {
  processing: 'bg-primary-soft text-primary',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  error: 'bg-danger-soft text-danger',
};

const tonePaths: Record<Exclude<ResultTone, 'processing'>, string> = {
  success: 'M5 13l4 4L19 7',
  warning: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  error: 'M6 18L18 6M6 6l12 12',
};

interface PaymentResultLayoutProps {
  tone: ResultTone;
  title: string;
  children?: ReactNode;
  actions: ReactNode;
  footer?: ReactNode;
}

/** Pantalla centrada para los resultados del checkout de Mercado Pago. */
export function PaymentResultLayout({ tone, title, children, actions, footer }: PaymentResultLayoutProps) {
  const [searchParams] = useSearchParams();

  return (
    <div className="flex min-h-screen items-center justify-center bg-app px-4 py-10">
      <div className="w-full max-w-md">
        <Card className="text-center" noPadding>
          <div className="px-6 pb-6 pt-8 sm:px-8">
            <div className={cn('mx-auto mb-5 grid size-16 place-items-center rounded-full', toneStyles[tone])}>
              {tone === 'processing' ? (
                <Spinner size="lg" />
              ) : (
                <svg aria-hidden="true" className="size-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tonePaths[tone]} />
                </svg>
              )}
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-fg">{title}</h1>
            {children && <div className="mt-3 space-y-4 text-sm text-fg-muted">{children}</div>}
            <div className="mt-7 flex flex-col gap-2">{actions}</div>
          </div>
          {footer && <div className="border-t border-border bg-surface-muted px-6 py-4 text-xs text-fg-subtle">{footer}</div>}
        </Card>

        {import.meta.env.DEV && searchParams.size > 0 && (
          <details className="mt-4 rounded-xl border border-border bg-surface p-4 text-left text-xs text-fg-muted">
            <summary className="cursor-pointer font-semibold">Parámetros recibidos (solo desarrollo)</summary>
            <pre className="mt-2 whitespace-pre-wrap">{JSON.stringify(Object.fromEntries(searchParams), null, 2)}</pre>
          </details>
        )}
      </div>
    </div>
  );
}
