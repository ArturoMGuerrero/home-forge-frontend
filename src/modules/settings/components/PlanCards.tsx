import { Plan, PlanCode, SubscriptionStatus } from '../api/subscriptionApi';

type PlanCardsProps = {
  plans: Plan[];
  currentPlan: PlanCode;
  changing?: PlanCode;
  onSelect: (plan: PlanCode) => void;
  subscriptionStatus?: SubscriptionStatus;
};

export function PlanCards({ plans, currentPlan, changing, onSelect, subscriptionStatus }: PlanCardsProps) {
  const isExpiredOrSuspended = subscriptionStatus === 'EXPIRED' || subscriptionStatus === 'SUSPENDED' || subscriptionStatus === 'CANCELLED';

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {plans.map(plan => {
        const current = currentPlan === plan.code;
        const canRenew = current && isExpiredOrSuspended;

        return (
          <article className={`relative overflow-hidden rounded-2xl border p-6 shadow-sm ${plan.featured ? 'border-primary bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-200' : 'border-border bg-surface'}`} key={plan.code}>
            {current && !canRenew && <span className={`absolute right-5 top-5 rounded-full px-2.5 py-1 text-xs font-bold ${plan.featured ? 'bg-white/15 text-white' : 'bg-success-muted text-success-fg'}`}>PLAN ACTUAL</span>}
            {canRenew && <span className={`absolute right-5 top-5 rounded-full px-2.5 py-1 text-xs font-bold ${plan.featured ? 'bg-danger-muted/20 text-rose-100' : 'bg-danger-muted text-danger-fg'}`}>VENCIDO</span>}
            <h3 className="text-xl font-bold">{plan.name}</h3>
            <strong className={`mt-3 block text-2xl ${plan.featured ? 'text-cyan-200' : 'text-primary-fg'}`}>{plan.price}</strong>
            <p className={`mt-3 text-sm ${plan.featured ? 'text-indigo-100' : 'text-fg-subtle'}`}>{plan.description}</p>
            <ul className={`mt-5 space-y-2 text-sm ${plan.featured ? 'text-indigo-50' : 'text-fg-muted'}`}>
              {plan.features.map(feature => <li key={feature}>✓ {feature}</li>)}
            </ul>
            <button
              className={`mt-7 w-full rounded-xl px-3 py-3 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-60 ${
                plan.featured
                  ? 'bg-surface text-primary-fg hover:bg-primary-soft'
                  : canRenew
                    ? 'bg-success text-white hover:bg-success-hover'
                    : 'bg-surface-sunken text-fg-muted hover:bg-primary-soft'
              }`}
              disabled={(current && !canRenew) || Boolean(changing)}
              onClick={() => onSelect(plan.code)}
              type="button"
            >
              {current && !canRenew ? 'Plan seleccionado' :
               canRenew ? 'Renovar plan' :
               changing === plan.code ? 'Procesando...' :
               `Cambiar a ${plan.name}`}
            </button>
          </article>
        );
      })}
    </div>
  );
}
