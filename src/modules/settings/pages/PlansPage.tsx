import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { PlanCards } from '../components/PlanCards';
import { getSession, updateSessionSubscription } from '../../auth';
import { changeSubscriptionPlan, getSubscription, getPlans, Plan, PlanCode, Subscription } from '../api/subscriptionApi';
import { createSubscription, getPaymentStatus, PaymentStatusResponse } from '../api/paymentApi';
import { SubscriptionDetails } from '../../../shared/SubscriptionBadge';
import { Alert, Badge, Card, LoadingState, PageHeader } from '../../../shared/ui';

export function PlansPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatusResponse | null>(null);
  const [changing, setChanging] = useState<PlanCode>();

  useEffect(() => {
    const session = getSession();

    // Cargar planes (siempre funciona con fallback)
    getPlans()
      .then(plansData => setPlans(plansData))
      .catch(() => setPlans([]));

    // Intentar cargar suscripción
    getSubscription()
      .then(sub => setSubscription(sub))
      .catch(() => {
        // Sin respuesta del servidor: mostrar una suscripción STARTER en prueba por defecto
        setSubscription({
          companyId: session?.companyId || '',
          planCode: 'STARTER',
          userLimit: 2,
          status: 'TRIAL',
          trialDaysRemaining: 30,
          paymentConfigured: false
        });
      });

    // Intentar cargar estado de pago
    if (session?.companyId) {
      getPaymentStatus(session.companyId)
        .then(payment => setPaymentStatus(payment))
        .catch(() => setPaymentStatus(null));
    }
  }, []);

  async function selectPlan(planCode: PlanCode) {
    // Todos los planes (STARTER, PRO, BUSINESS) requieren pago vía Mercado Pago
    setChanging(planCode);

    try {
      const session = getSession();
      if (!session?.companyId || !session?.email) {
        throw new Error('No se encontró información de la sesión');
      }

      const response = await createSubscription({
        companyId: session.companyId,
        planCode: planCode,
        payerEmail: session.email
      });

      // VITE_MERCADOPAGO_SANDBOX=false usa el checkout real; por defecto se conserva el sandbox.
      const useSandbox = import.meta.env.VITE_MERCADOPAGO_SANDBOX !== 'false';
      window.location.href = useSandbox ? response.sandboxInitPoint : response.initPoint;
    } catch (requestError) {
      toast.error(requestError instanceof Error ? requestError.message : 'No fue posible crear la suscripción.');
      setChanging(undefined);
    }
  }

  if (!subscription || plans.length === 0) return <Card><LoadingState message="Consultando tu suscripción..." /></Card>;

  const isTrial = subscription.status === 'TRIAL';
  const isActive = subscription.status === 'ACTIVE';
  const monthlyPrice = subscription.planCode === 'STARTER' ? '$299 MXN/mes' : subscription.planCode === 'PRO' ? '$999 MXN/mes' : '$3,999 MXN/mes';

  return (
    <>
      <PageHeader
        eyebrow="Suscripción"
        subtitle="Aprovecha tu periodo de prueba gratuito. Después, elige el plan que mejor se adapte a tu negocio."
        title="Plan y facturación"
      />

      <Card className="mb-6 sm:p-7">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <Badge dot size="md" variant={isTrial ? 'info' : isActive ? 'success' : 'error'}>
              {isTrial ? 'Periodo de prueba' : isActive ? 'Activo' : 'Expirado'}
            </Badge>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-fg sm:text-3xl">
              {isTrial || isActive ? `${subscription.trialDaysRemaining} días restantes` : 'Plan expirado — renueva ahora'}
            </h2>
            <p className="mt-1.5 text-sm text-fg-subtle">Plan {subscription.planCode} · Hasta {subscription.userLimit} usuarios</p>
            {subscription.trialEndsAt && (
              <p className="mt-1 text-xs text-fg-subtle">
                {isTrial || isActive
                  ? `La suscripción termina el ${new Date(subscription.trialEndsAt).toLocaleDateString('es-MX', { dateStyle: 'long' })}.`
                  : 'Renueva tu plan para continuar usando todas las funciones.'}
              </p>
            )}
          </div>
          <div className="rounded-xl bg-surface-muted px-6 py-4 text-center">
            <span className="text-xs text-fg-subtle">
              {isTrial ? 'Periodo de prueba gratuito' : isActive ? 'Cobro mensual recurrente' : 'Renovar suscripción'}
            </span>
            <strong className="mt-1 block text-2xl font-bold tracking-tight text-fg">{isTrial ? 'Gratis' : monthlyPrice}</strong>
          </div>
        </div>
      </Card>

      <PlanCards
        changing={changing}
        currentPlan={subscription.planCode}
        onSelect={selectPlan}
        plans={plans}
        subscriptionStatus={subscription.status}
      />

      <section className="mt-6 grid gap-5 lg:grid-cols-[1fr_.8fr]">
        <SubscriptionDetails />

        {paymentStatus && !paymentStatus.hasActiveSubscription && subscription.planCode !== 'STARTER' && (
          <Alert title="Suscripción pendiente" variant="warning">
            {paymentStatus.subscriptionStatus === 'PENDING'
              ? 'Tu pago está siendo procesado. Te notificaremos cuando se active tu suscripción.'
              : 'Selecciona un plan PRO o BUSINESS para activar funciones premium.'}
          </Alert>
        )}

        {paymentStatus?.hasActiveSubscription && (
          <Alert title="Suscripción activa" variant="success">
            Tu plan {paymentStatus.planCode} está activo. El próximo cargo se realizará automáticamente.
          </Alert>
        )}
      </section>
    </>
  );
}
