import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { PlanCards } from '../modules/settings/PlanCards';
import { getSession, updateSessionSubscription } from '../shared/auth';
import { changeSubscriptionPlan, getSubscription, getPlans, Plan, PlanCode, Subscription } from '../shared/subscriptionApi';
import { createSubscription, getPaymentStatus, PaymentStatusResponse } from '../shared/paymentApi';
import { SubscriptionDetails } from '../shared/SubscriptionBadge';

export function PlansPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatusResponse | null>(null);
  const [changing, setChanging] = useState<PlanCode>();
  const [loadingPayment, setLoadingPayment] = useState(false);

  useEffect(() => {
    const session = getSession();

    // Cargar planes (siempre funciona con fallback)
    getPlans()
      .then(plansData => setPlans(plansData))
      .catch(() => setPlans([]));

    // Intentar cargar suscripción
    getSubscription()
      .then(sub => setSubscription(sub))
      .catch(error => {
        console.warn('No se pudo cargar suscripción:', error);
        // Crear suscripción por defecto (STARTER)
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
    setLoadingPayment(true);

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

      // Redirigir a Mercado Pago (sandbox para pruebas)
      window.location.href = response.sandboxInitPoint;

    } catch (requestError) {
      toast.error(requestError instanceof Error ? requestError.message : 'No fue posible crear la suscripción.');
      setLoadingPayment(false);
    }
  }

  if (!subscription || plans.length === 0) return <p className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">Consultando tu suscripción...</p>;

  return (
    <>
      <header className="mb-8">
        <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.16em] text-indigo-600">Suscripción</p>
        <h1 className="text-3xl font-bold">Plan y facturación</h1>
        <p className="mt-2 text-sm text-slate-500">Aprovecha tu periodo de prueba gratuito de 14 días. Después, elige el plan que mejor se adapte a tu negocio.</p>
      </header>

      {subscription && plans.length > 0 && (
        <>
          <section className="mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-indigo-700 p-6 text-white shadow-xl sm:p-8">
            <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                  subscription.status === 'TRIAL' ? 'bg-cyan-300/15 text-cyan-200' :
                  subscription.status === 'ACTIVE' ? 'bg-emerald-300/15 text-emerald-200' :
                  'bg-rose-300/15 text-rose-200'
                }`}>
                  {subscription.status === 'TRIAL' ? 'PERIODO DE PRUEBA' :
                   subscription.status === 'ACTIVE' ? 'ACTIVO' :
                   'EXPIRADO'}
                </span>
                <h2 className="mt-4 text-3xl font-bold">
                  {subscription.status === 'TRIAL' || subscription.status === 'ACTIVE'
                    ? `${subscription.trialDaysRemaining} días restantes`
                    : 'Plan expirado - Renueva ahora'}
                </h2>
                <p className="mt-2 text-sm text-indigo-100">Plan {subscription.planCode} · Hasta {subscription.userLimit} usuarios</p>
                {subscription.trialEndsAt && <p className="mt-1 text-xs text-indigo-200">
                  {subscription.status === 'TRIAL' || subscription.status === 'ACTIVE'
                    ? `La suscripción termina el ${new Date(subscription.trialEndsAt).toLocaleDateString('es-MX', { dateStyle: 'long' })}.`
                    : 'Renueva tu plan para continuar usando todas las funciones.'}
                </p>}
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 px-6 py-5 text-center backdrop-blur">
                <span className="text-xs uppercase tracking-wider text-indigo-200">
                  {subscription.status === 'TRIAL' ? 'Periodo de prueba gratuito' :
                   subscription.status === 'ACTIVE' ? 'Cobro mensual recurrente' :
                   'Renovar suscripción'}
                </span>
                <strong className="mt-1 block text-2xl">
                  {subscription.status === 'TRIAL' ? 'GRATIS por 14 días' :
                   subscription.planCode === 'STARTER' ? '$299 MXN/mes' :
                   subscription.planCode === 'PRO' ? '$999 MXN/mes' :
                   '$3,999 MXN/mes'}
                </strong>
              </div>
            </div>
          </section>

          <PlanCards
            plans={plans}
            changing={changing}
            currentPlan={subscription.planCode}
            subscriptionStatus={subscription.status}
            onSelect={selectPlan}
          />

          <section className="mt-6 grid gap-5 lg:grid-cols-[1fr_.8fr]">
            <SubscriptionDetails />

            {paymentStatus && !paymentStatus.hasActiveSubscription && subscription.planCode !== 'STARTER' && (
              <article className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-amber-700">Próximo paso</p>
                <h2 className="mt-2 text-xl font-bold text-amber-950">Suscripción pendiente</h2>
                <p className="mt-3 text-sm leading-6 text-amber-800">
                  {paymentStatus.subscriptionStatus === 'PENDING'
                    ? 'Tu pago está siendo procesado. Te notificaremos cuando se active tu suscripción.'
                    : 'Selecciona un plan PRO o BUSINESS para activar funciones premium.'}
                </p>
              </article>
            )}

            {paymentStatus?.hasActiveSubscription && (
              <article className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-700">Estado</p>
                <h2 className="mt-2 text-xl font-bold text-emerald-950">Suscripción Activa</h2>
                <p className="mt-3 text-sm leading-6 text-emerald-800">
                  Tu plan {paymentStatus.planCode} está activo. El próximo cargo se realizará automáticamente.
                </p>
              </article>
            )}
          </section>
        </>
      )}
    </>
  );
}
