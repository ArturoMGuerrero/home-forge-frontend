import { useEffect, useState } from 'react';
import { PlanCards } from '../modules/settings/PlanCards';
import { updateSessionSubscription } from '../shared/auth';
import { changeSubscriptionPlan, getSubscription, PlanCode, Subscription } from '../shared/subscriptionApi';

export function PlansPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [changing, setChanging] = useState<PlanCode>();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    getSubscription()
      .then(setSubscription)
      .catch(requestError => setError(requestError instanceof Error ? requestError.message : 'No fue posible cargar la suscripción.'));
  }, []);

  async function selectPlan(planCode: PlanCode) {
    setChanging(planCode);
    setError('');
    setMessage('');
    try {
      const updated = await changeSubscriptionPlan(planCode);
      setSubscription(updated);
      updateSessionSubscription(updated.planCode, updated.userLimit, updated.status, updated.trialEndsAt);
      setMessage('Plan actualizado. No se realizó ningún cobro porque la pasarela de pago aún no está configurada.');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'No fue posible cambiar el plan.');
    } finally {
      setChanging(undefined);
    }
  }

  if (!subscription && !error) return <p className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">Consultando tu suscripción...</p>;

  return (
    <>
      <header className="mb-8">
        <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.16em] text-indigo-600">Suscripción</p>
        <h1 className="text-3xl font-bold">Plan y facturación</h1>
        <p className="mt-2 text-sm text-slate-500">Consulta tu periodo de prueba, cambia de paquete y prepara la configuración de cobro.</p>
      </header>

      {error && <p className="mb-5 rounded-xl bg-rose-50 p-4 text-sm font-medium text-rose-700">{error}</p>}
      {message && <p className="mb-5 rounded-xl bg-emerald-50 p-4 text-sm font-medium text-emerald-700">{message}</p>}

      {subscription && (
        <>
          <section className="mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-indigo-700 p-6 text-white shadow-xl sm:p-8">
            <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <span className="rounded-full bg-cyan-300/15 px-3 py-1 text-xs font-bold text-cyan-200">{subscription.status === 'TRIAL' ? 'PERIODO DE PRUEBA' : subscription.status}</span>
                <h2 className="mt-4 text-3xl font-bold">{subscription.trialDaysRemaining} días de prueba restantes</h2>
                <p className="mt-2 text-sm text-indigo-100">Plan {subscription.planCode} · Hasta {subscription.userLimit} usuarios</p>
                {subscription.trialEndsAt && <p className="mt-1 text-xs text-indigo-200">La prueba termina el {new Date(subscription.trialEndsAt).toLocaleDateString('es-MX', { dateStyle: 'long' })}.</p>}
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 px-6 py-5 text-center backdrop-blur">
                <span className="text-xs uppercase tracking-wider text-indigo-200">Cobro durante prueba</span>
                <strong className="mt-1 block text-2xl">$0 MXN</strong>
              </div>
            </div>
          </section>

          <PlanCards changing={changing} currentPlan={subscription.planCode} onSelect={selectPlan} />

          <section className="mt-6 grid gap-5 lg:grid-cols-[1fr_.8fr]">
            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-indigo-600">Método de pago</p>
              <h2 className="mt-2 text-xl font-bold">Configurar cobro</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">Aquí se conectará posteriormente Stripe, Mercado Pago u otro proveedor. Por seguridad, HomeForge todavía no solicita ni almacena datos de tarjeta.</p>
              <button className="mt-5 cursor-not-allowed rounded-xl bg-slate-200 px-4 py-3 text-sm font-bold text-slate-500" disabled type="button">Agregar método de pago · Próximamente</button>
            </article>
            <article className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-amber-700">Próximo paso</p>
              <h2 className="mt-2 text-xl font-bold text-amber-950">Facturación pendiente</h2>
              <p className="mt-3 text-sm leading-6 text-amber-800">Antes de finalizar la prueba deberás agregar un método de pago. Mientras la pasarela no esté configurada, no se generará ningún cargo automático.</p>
            </article>
          </section>
        </>
      )}
    </>
  );
}
