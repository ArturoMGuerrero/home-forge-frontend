import { useEffect, useState } from 'react';
import { getSession } from '../modules/auth';
import { formatSubscriptionStatus, getPaymentStatus, PaymentStatusResponse } from '../modules/settings';
import { Alert, Badge, BadgeVariant, Card, Skeleton } from './ui';

const statusVariants: Record<string, BadgeVariant> = {
  TRIAL: 'info',
  ACTIVE: 'success',
  PENDING: 'warning',
  SUSPENDED: 'error',
  CANCELLED: 'neutral',
  EXPIRED: 'error'
};

const shortDate = (value: string) => new Date(value).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' });

/** Tarjeta con el estado de pago de la suscripción de la empresa. */
const PAYMENT_METHODS: Record<string, string> = {
  stripe: 'Tarjeta (Stripe)',
  mercadopago: 'Mercado Pago'
};

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
      .catch(() => setStatus(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Card>
        <Skeleton className="h-4 w-32" />
        <Skeleton className="mt-4 h-3 w-full" />
        <Skeleton className="mt-3 h-3 w-3/4" />
      </Card>
    );
  }

  if (!status) {
    return <Card><p className="text-sm text-fg-subtle">No hay información de suscripción disponible.</p></Card>;
  }

  const rows = [
    { label: 'Plan', value: status.planCode },
    status.nextBillingAt && { label: 'Próximo pago', value: shortDate(status.nextBillingAt) },
    status.lastPaymentAt && { label: 'Último pago', value: shortDate(status.lastPaymentAt) },
    status.paymentMethod && { label: 'Método de pago', value: PAYMENT_METHODS[status.paymentMethod] ?? status.paymentMethod }
  ].filter(Boolean) as Array<{ label: string; value: string }>;

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="font-semibold text-fg">Suscripción actual</h3>
        <Badge dot variant={statusVariants[status.subscriptionStatus] ?? 'neutral'}>{formatSubscriptionStatus(status.subscriptionStatus)}</Badge>
      </div>

      <dl className="space-y-2.5 text-sm">
        {rows.map(row => (
          <div className="flex items-center justify-between gap-3" key={row.label}>
            <dt className="text-fg-subtle">{row.label}</dt>
            <dd className="font-medium capitalize text-fg">{row.value}</dd>
          </div>
        ))}
      </dl>

      {!status.hasActiveSubscription && status.subscriptionStatus === 'PENDING' && (
        <Alert className="mt-4" variant="warning">
          Tu pago está siendo procesado. Te notificaremos cuando se active tu suscripción.
        </Alert>
      )}
    </Card>
  );
}
