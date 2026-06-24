import { useEffect, useState } from 'react';
import { getSession } from './auth';
import {
  formatSubscriptionStatus,
  getPaymentStatus,
  getSubscriptionStatusColor,
  PaymentStatusResponse
} from './paymentApi';

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
      <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
        <div className="size-2 animate-pulse rounded-full bg-slate-400" />
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
            ? 'bg-rose-100 text-rose-700'
            : 'bg-amber-100 text-amber-700'
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
      <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6">
        <div className="h-4 w-32 rounded bg-slate-200" />
        <div className="mt-4 space-y-3">
          <div className="h-3 w-full rounded bg-slate-100" />
          <div className="h-3 w-3/4 rounded bg-slate-100" />
        </div>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <p className="text-sm text-slate-500">No hay información de suscripción disponible.</p>
      </div>
    );
  }

  const statusColor = getSubscriptionStatusColor(status.subscriptionStatus);
  const statusLabel = formatSubscriptionStatus(status.subscriptionStatus);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">Suscripción Actual</h3>
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusColor}`}>
          {statusLabel}
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-600">Plan</span>
          <span className="text-sm font-semibold text-slate-900">{status.planCode}</span>
        </div>

        {status.nextBillingAt && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Próximo pago</span>
            <span className="text-sm font-semibold text-slate-900">
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
            <span className="text-sm text-slate-600">Último pago</span>
            <span className="text-sm font-semibold text-slate-900">
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
            <span className="text-sm text-slate-600">Método de pago</span>
            <span className="text-sm font-semibold capitalize text-slate-900">
              {status.paymentMethod}
            </span>
          </div>
        )}
      </div>

      {!status.hasActiveSubscription && status.subscriptionStatus === 'PENDING' && (
        <div className="mt-4 rounded-xl bg-amber-50 p-3">
          <p className="text-xs text-amber-800">
            Tu pago está siendo procesado. Te notificaremos cuando se active tu suscripción.
          </p>
        </div>
      )}
    </div>
  );
}
