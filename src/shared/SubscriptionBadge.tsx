import { useEffect, useState } from 'react';
import { getSession } from '../modules/auth';
import {
  formatSubscriptionStatus,
  getPaymentStatus,
  getSubscriptionStatusColor,
  PaymentStatusResponse
} from '../modules/settings';

export function SubscriptionBadge() {
  const [status, setStatus] = useState<PaymentStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getSession();
    if (!session?.companyId) {
      setLoading(false);
      return;
    }

    getPaymentStatus(session.companyId)
      .then(setStatus)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="inline-flex items-center gap-2 rounded-full bg-surface-sunken px-3 py-1 text-xs font-semibold text-fg-subtle">
        <div className="size-2 animate-pulse rounded-full bg-fg-subtle" />
        Cargando...
      </div>
    );
  }

  if (!status) return null;

  const statusColor = getSubscriptionStatusColor(status.subscriptionStatus);
  const statusLabel = formatSubscriptionStatus(status.subscriptionStatus);

  return (
    <div className="inline-flex items-center gap-2">
      <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusColor}`}>
        Plan {status.planCode}
      </span>
      {status.subscriptionStatus !== 'ACTIVE' && (
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
          status.subscriptionStatus === 'EXPIRED' || status.subscriptionStatus === 'SUSPENDED' || status.subscriptionStatus === 'CANCELLED'
            ? 'bg-danger-muted text-danger-fg'
            : 'bg-warning-muted text-warning-fg'
        }`}>
          {statusLabel}
        </span>
      )}
    </div>
  );
}

export function SubscriptionDetails() {
  const [status, setStatus] = useState<PaymentStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getSession();
    if (!session?.companyId) {
      setLoading(false);
      return;
    }

    getPaymentStatus(session.companyId)
      .then(setStatus)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse rounded-2xl border border-border bg-surface p-6">
        <div className="h-4 w-32 rounded bg-surface-strong" />
        <div className="mt-4 space-y-3">
          <div className="h-3 w-full rounded bg-surface-sunken" />
          <div className="h-3 w-3/4 rounded bg-surface-sunken" />
        </div>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-6">
        <p className="text-sm text-fg-subtle">No hay información de suscripción disponible.</p>
      </div>
    );
  }

  const statusColor = getSubscriptionStatusColor(status.subscriptionStatus);
  const statusLabel = formatSubscriptionStatus(status.subscriptionStatus);

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-fg">Suscripción Actual</h3>
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusColor}`}>
          {statusLabel}
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-fg-muted">Plan</span>
          <span className="text-sm font-semibold text-fg">{status.planCode}</span>
        </div>

        {status.nextBillingAt && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-fg-muted">Próximo pago</span>
            <span className="text-sm font-semibold text-fg">
              {new Date(status.nextBillingAt).toLocaleDateString('es-MX', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </span>
          </div>
        )}

        {status.lastPaymentAt && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-fg-muted">Último pago</span>
            <span className="text-sm font-semibold text-fg">
              {new Date(status.lastPaymentAt).toLocaleDateString('es-MX', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </span>
          </div>
        )}

        {status.paymentMethod && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-fg-muted">Método de pago</span>
            <span className="text-sm font-semibold capitalize text-fg">
              {status.paymentMethod}
            </span>
          </div>
        )}
      </div>

      {!status.hasActiveSubscription && status.subscriptionStatus === 'PENDING' && (
        <div className="mt-4 rounded-xl bg-warning-soft p-3">
          <p className="text-xs text-warning-fg">
            Tu pago está siendo procesado. Te notificaremos cuando se active tu suscripción.
          </p>
        </div>
      )}
    </div>
  );
}
