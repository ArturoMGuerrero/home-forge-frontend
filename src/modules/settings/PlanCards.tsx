import { PlanCode } from '../../shared/subscriptionApi';

type Plan = {
  code: PlanCode;
  name: string;
  price: string;
  description: string;
  features: string[];
  featured?: boolean;
};

export const plans: Plan[] = [
  { code: 'STARTER', name: 'Starter', price: '$299 MXN/mes', description: 'Para comenzar a organizar tu inmobiliaria.', features: ['2 usuarios', 'CRM básico', 'Propiedades y sitio público'] },
  { code: 'PRO', name: 'Pro', price: '$999 MXN/mes', description: 'Para equipos que necesitan más control.', features: ['10 usuarios', 'Dashboard completo', 'Catálogos configurables'], featured: true },
  { code: 'BUSINESS', name: 'Business', price: '$1,999 MXN/mes', description: 'Para operaciones inmobiliarias en crecimiento.', features: ['50 usuarios', 'Todas las funciones Pro', 'Preparado para integraciones'] }
];

export function PlanCards({ currentPlan, changing, onSelect }: { currentPlan: PlanCode; changing?: PlanCode; onSelect: (plan: PlanCode) => void }) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {plans.map(plan => {
        const current = currentPlan === plan.code;
        return (
          <article className={`relative overflow-hidden rounded-2xl border p-6 shadow-sm ${plan.featured ? 'border-indigo-500 bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-200' : 'border-slate-200 bg-white'}`} key={plan.code}>
            {current && <span className={`absolute right-5 top-5 rounded-full px-2.5 py-1 text-[10px] font-bold ${plan.featured ? 'bg-white/15 text-white' : 'bg-emerald-100 text-emerald-800'}`}>PLAN ACTUAL</span>}
            <h3 className="text-xl font-bold">{plan.name}</h3>
            <strong className={`mt-3 block text-2xl ${plan.featured ? 'text-cyan-200' : 'text-indigo-700'}`}>{plan.price}</strong>
            <p className={`mt-3 text-sm ${plan.featured ? 'text-indigo-100' : 'text-slate-500'}`}>{plan.description}</p>
            <ul className={`mt-5 space-y-2 text-sm ${plan.featured ? 'text-indigo-50' : 'text-slate-600'}`}>
              {plan.features.map(feature => <li key={feature}>✓ {feature}</li>)}
            </ul>
            <button className={`mt-7 w-full rounded-xl px-3 py-3 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-60 ${plan.featured ? 'bg-white text-indigo-700' : 'bg-slate-100 text-slate-700 hover:bg-indigo-50'}`} disabled={current || Boolean(changing)} onClick={() => onSelect(plan.code)} type="button">
              {current ? 'Plan seleccionado' : changing === plan.code ? 'Actualizando...' : `Cambiar a ${plan.name}`}
            </button>
          </article>
        );
      })}
    </div>
  );
}
