import { Plan, PlanCode } from '../../shared/subscriptionApi';

type PlanCardsProps = {
  plans: Plan[];
  currentPlan: PlanCode;
  changing?: PlanCode;
  onSelect: (plan: PlanCode) => void;
  subscriptionStatus?: 'TRIAL' | 'ACTIVE' | 'EXPIRED' | 'SUSPENDED' | 'CANCELLED' | 'PENDING';
};

export function PlanCards({ plans, currentPlan, changing, onSelect, subscriptionStatus }: PlanCardsProps) {
  const isExpiredOrSuspended = subscriptionStatus === 'EXPIRED' || subscriptionStatus === 'SUSPENDED' || subscriptionStatus === 'CANCELLED';

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {plans.map(plan => {
        const current = currentPlan === plan.code;
        const canRenew = current && isExpiredOrSuspended;

        return (
          <article className={`relative overflow-hidden rounded-2xl border p-6 shadow-sm ${plan.featured ? 'border-indigo-500 bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-200' : 'border-slate-200 bg-white'}`} key={plan.code}>
            {current && !canRenew && <span className={`absolute right-5 top-5 rounded-full px-2.5 py-1 text-[10px] font-bold ${plan.featured ? 'bg-white/15 text-white' : 'bg-emerald-100 text-emerald-800'}`}>PLAN ACTUAL</span>}
            {canRenew && <span className={`absolute right-5 top-5 rounded-full px-2.5 py-1 text-[10px] font-bold ${plan.featured ? 'bg-rose-200/20 text-rose-100' : 'bg-rose-100 text-rose-800'}`}>VENCIDO</span>}
            <h3 className="text-xl font-bold">{plan.name}</h3>
            <strong className={`mt-3 block text-2xl ${plan.featured ? 'text-cyan-200' : 'text-indigo-700'}`}>{plan.price}</strong>
            <p className={`mt-3 text-sm ${plan.featured ? 'text-indigo-100' : 'text-slate-500'}`}>{plan.description}</p>
            <ul className={`mt-5 space-y-2 text-sm ${plan.featured ? 'text-indigo-50' : 'text-slate-600'}`}>
              {plan.features.map(feature => <li key={feature}>✓ {feature}</li>)}
            </ul>
            <button
              className={`mt-7 w-full rounded-xl px-3 py-3 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-60 ${
                plan.featured
                  ? 'bg-white text-indigo-700 hover:bg-indigo-50'
                  : canRenew
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'bg-slate-100 text-slate-700 hover:bg-indigo-50'
              }`}
              disabled={(current && !canRenew) || Boolean(changing)}
              onClick={() => onSelect(plan.code)}
              type="button"
            >
              {current && !canRenew ? 'Plan seleccionado' :
               canRenew ? '🔄 Renovar plan' :
               changing === plan.code ? 'Procesando...' :
               `Cambiar a ${plan.name}`}
            </button>
          </article>
        );
      })}
    </div>
  );
}
