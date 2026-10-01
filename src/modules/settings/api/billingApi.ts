import { postJson } from '../../../shared/services/api';
import type { PlanCode } from './subscriptionApi';

type RedirectResponse = { url: string };

/** `url`: a dónde llevar al usuario; o `planChanged`: el plan ya cambió sin salir de HomeForge. */
export type CheckoutResult = { url: string | null; planChanged: boolean };

/**
 * Página de pago del proveedor para contratar un plan. Si la empresa ya tiene una suscripción,
 * el backend devuelve el portal para cambiarla en lugar de crear otra; si sigue en prueba,
 * cambia el plan directamente sin cobrar.
 */
export async function startCheckout(planCode: PlanCode): Promise<CheckoutResult> {
  return postJson<CheckoutResult>('/billing/checkout', { planCode });
}

/** Portal del proveedor donde se cambia la tarjeta, el plan o se cancela la suscripción. */
export async function openBillingPortal(): Promise<string> {
  return (await postJson<RedirectResponse>('/billing/portal', {})).url;
}
