import { postJson } from '../../../shared/services/api';
import type { PlanCode } from './subscriptionApi';

type RedirectResponse = { url: string };

/**
 * Página de pago del proveedor para contratar un plan. Si la empresa ya tiene una suscripción,
 * el backend devuelve el portal para cambiarla en lugar de crear otra.
 */
export async function startCheckout(planCode: PlanCode): Promise<string> {
  return (await postJson<RedirectResponse>('/billing/checkout', { planCode })).url;
}

/** Portal del proveedor donde se cambia la tarjeta, el plan o se cancela la suscripción. */
export async function openBillingPortal(): Promise<string> {
  return (await postJson<RedirectResponse>('/billing/portal', {})).url;
}
