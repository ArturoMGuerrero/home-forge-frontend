import { Badge, Button, cn } from '../../../shared/ui';
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
          <article
            className={cn(
              'relative flex flex-col rounded-2xl border bg-surface p-6 shadow-card',
              plan.featured ? 'border-primary ring-1 ring-primary' : 'border-border',
            )}
            key={plan.code}
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-lg font-semibold text-fg">{plan.name}</h3>
              {current && !canRenew && <Badge variant="success">Plan actual</Badge>}
              {canRenew && <Badge variant="error">Vencido</Badge>}
              {!current && plan.featured && <Badge variant="primary">Recomendado</Badge>}
            </div>
            <strong className="mt-3 block text-3xl font-bold tracking-tight text-fg">{plan.price}</strong>
            <p className="mt-2 text-sm text-fg-subtle">{plan.description}</p>
            <ul className="mt-5 flex-1 space-y-2.5 text-sm text-fg-muted">
              {plan.features.map(feature => (
                <li className="flex gap-2" key={feature}>
                  <svg aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
            <Button
              className="mt-7"
              disabled={(current && !canRenew) || Boolean(changing)}
              fullWidth
              loading={changing === plan.code}
              onClick={() => onSelect(plan.code)}
              variant={canRenew ? 'success' : plan.featured ? 'primary' : 'tertiary'}
            >
              {current && !canRenew ? 'Plan seleccionado' :
               canRenew ? 'Renovar plan' :
               changing === plan.code ? 'Procesando...' :
               `Cambiar a ${plan.name}`}
            </Button>
          </article>
        );
      })}
    </div>
  );
}
