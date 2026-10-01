import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { PlanCards } from '../components/PlanCards';
import { updateSessionSubscription } from '../../auth';
import { getSubscription, getPlans, Plan, PlanCode, Subscription } from '../api/subscriptionApi';
import { openBillingPortal, startCheckout } from '../api/billingApi';
import { SubscriptionDetails } from '../../../shared/SubscriptionDetails';
import { Alert, Badge, BadgeVariant, Button, Card, LoadingState, PageHeader } from '../../../shared/ui';

const PRICES: Record<PlanCode, string> = {
  STARTER: '$299 MXN/mes',
  PRO: '$999 MXN/mes',
  BUSINESS: '$3,999 MXN/mes'
};

const formatDate = (value?: string) =>
  value ? new Date(value).toLocaleDateString('es-MX', { dateStyle: 'long' }) : '';

/** Tras volver del pago, la confirmación llega por webhook unos segundos después. */
async function waitForPaidSubscription(attempts = 8): Promise<Subscription | null> {
  for (let i = 0; i < attempts; i++) {
    const subscription = await getSubscription().catch(() => null);
    if (subscription?.paymentConfigured && subscription.status === 'ACTIVE') return subscription;
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
  return null;
}

export function PlansPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [changing, setChanging] = useState<PlanCode>();
  const [openingPortal, setOpeningPortal] = useState(false);
  const [confirming, setConfirming] = useState(false);

  function applySubscription(next: Subscription) {
    setSubscription(next);
    updateSessionSubscription(next.planCode, next.userLimit, next.status, next.trialEndsAt);
  }

  useEffect(() => {
    getPlans().then(setPlans).catch(() => setPlans([]));

    const checkout = searchParams.get('checkout');
    if (checkout) setSearchParams({}, { replace: true });

    if (checkout === 'success') {
      setConfirming(true);
      waitForPaidSubscription()
        .then(paid => {
          if (paid) {
            applySubscription(paid);
            toast.success(`¡Listo! Tu plan ${paid.planCode} está activo.`);
          } else {
            toast('Recibimos tu pago. La activación puede tardar unos minutos.', { icon: '⏳' });
            return getSubscription().then(applySubscription);
          }
        })
        .catch(() => toast.error('No fue posible consultar tu suscripción.'))
        .finally(() => setConfirming(false));
      return;
    }

    if (checkout === 'cancel') toast('No se realizó ningún cargo.', { icon: 'ℹ️' });
    getSubscription()
      .then(applySubscription)
      .catch(() => toast.error('No fue posible consultar tu suscripción.'));
    // Solo al montar: los parámetros de regreso del pago se procesan una vez.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function selectPlan(planCode: PlanCode) {
    setChanging(planCode);
    try {
      window.location.assign(await startCheckout(planCode));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No fue posible iniciar el pago.');
      setChanging(undefined);
    }
  }

  async function manageSubscription() {
    setOpeningPortal(true);
    try {
      window.location.assign(await openBillingPortal());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No fue posible abrir el portal de pagos.');
      setOpeningPortal(false);
    }
  }

  if (confirming) return <Card><LoadingState message="Confirmando tu pago..." /></Card>;
  if (!subscription || plans.length === 0) return <Card><LoadingState message="Consultando tu suscripción..." /></Card>;

  const subscribed = subscription.paymentConfigured && ['ACTIVE', 'PENDING'].includes(subscription.status);
  const isTrial = subscription.status === 'TRIAL';
  const statusBadge: { label: string; variant: BadgeVariant } =
    isTrial ? { label: 'Periodo de prueba', variant: 'info' } :
    subscription.status === 'ACTIVE' && subscription.cancelAtPeriodEnd ? { label: 'Se cancelará', variant: 'warning' } :
    subscription.status === 'ACTIVE' ? { label: 'Activo', variant: 'success' } :
    subscription.status === 'PENDING' ? { label: 'Pago pendiente', variant: 'warning' } :
    { label: 'Sin suscripción activa', variant: 'error' };

  let headline: string;
  let detail: string;
  if (isTrial) {
    headline = `${subscription.trialDaysRemaining} días de prueba restantes`;
    detail = `Tu prueba gratuita termina el ${formatDate(subscription.trialEndsAt)}. Contrata un plan para no perder el acceso.`;
  } else if (subscription.status === 'ACTIVE') {
    headline = `Plan ${subscription.planCode}`;
    detail = subscription.cancelAtPeriodEnd
      ? `Tu suscripción terminará el ${formatDate(subscription.nextBillingAt)}. Puedes reactivarla desde el portal de pagos.`
      : `Próximo cobro el ${formatDate(subscription.nextBillingAt)}.`;
  } else if (subscription.status === 'PENDING') {
    headline = 'No pudimos cobrar tu suscripción';
    detail = 'Actualiza tu tarjeta en el portal de pagos para evitar que se suspenda el servicio.';
  } else {
    headline = 'Tu suscripción no está activa';
    detail = 'Contrata un plan para seguir usando todas las funciones.';
  }

  return (
    <>
      <PageHeader
        actions={subscription.paymentConfigured && (
          <Button loading={openingPortal} onClick={manageSubscription} variant="secondary">
            Administrar suscripción
          </Button>
        )}
        eyebrow="Suscripción"
        subtitle="Elige el plan que mejor se adapte a tu negocio. Puedes cambiarlo o cancelarlo cuando quieras."
        title="Plan y facturación"
      />

      <Card className="mb-6 sm:p-7">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <Badge dot size="md" variant={statusBadge.variant}>{statusBadge.label}</Badge>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-fg sm:text-3xl">{headline}</h2>
            <p className="mt-1.5 text-sm text-fg-subtle">Plan {subscription.planCode} · Hasta {subscription.userLimit} usuarios</p>
            <p className="mt-1 text-xs text-fg-subtle">{detail}</p>
          </div>
          <div className="rounded-xl bg-surface-muted px-6 py-4 text-center">
            <span className="text-xs text-fg-subtle">{isTrial ? 'Periodo de prueba gratuito' : 'Cobro mensual recurrente'}</span>
            <strong className="mt-1 block text-2xl font-bold tracking-tight text-fg">{isTrial ? 'Gratis' : PRICES[subscription.planCode]}</strong>
          </div>
        </div>
      </Card>

      {subscription.status === 'PENDING' && (
        <Alert className="mb-6" title="Pago pendiente" variant="warning">
          El último cobro no se pudo completar. Actualiza tu método de pago en <strong>Administrar suscripción</strong>.
        </Alert>
      )}

      <PlanCards
        changing={changing}
        currentPlan={subscription.planCode}
        onSelect={selectPlan}
        plans={plans}
        subscribed={subscribed}
        subscriptionStatus={subscription.status}
      />

      <p className="mt-4 text-center text-xs text-fg-subtle">
        Pagos procesados de forma segura por Stripe. HomeForge no guarda los datos de tu tarjeta.
      </p>

      <section className="mt-6">
        <SubscriptionDetails />
      </section>
    </>
  );
}
