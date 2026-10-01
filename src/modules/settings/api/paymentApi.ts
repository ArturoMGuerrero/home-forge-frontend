import { getJson, postJson } from '../../../shared/services/api';
import type { PlanCode, SubscriptionStatus } from './subscriptionApi';

export type { PlanCode, SubscriptionStatus };

export type PaymentStatus = 'approved' | 'pending' | 'rejected' | 'cancelled';

export type CreateSubscriptionRequest = {
  companyId: string;
  planCode: PlanCode;
  payerEmail: string;
};

export type CreateSubscriptionResponse = {
  initPoint: string;
  preferenceId: string;
  sandboxInitPoint: string;
};

export type PaymentStatusResponse = {
  companyId: string;
  planCode: PlanCode;
  subscriptionStatus: SubscriptionStatus;
  paymentMethod?: string;
  lastPaymentStatus?: PaymentStatus;
  lastPaymentAt?: string;
  nextBillingAt?: string;
  hasActiveSubscription: boolean;
  mercadoPagoSubscriptionId?: string;
};

export function createSubscription(request: CreateSubscriptionRequest): Promise<CreateSubscriptionResponse> {
  return postJson<CreateSubscriptionResponse>('/payments/subscriptions', request);
}

export function getPaymentStatus(companyId: string): Promise<PaymentStatusResponse> {
  return getJson<PaymentStatusResponse>(`/payments/status?companyId=${companyId}`).catch(error => {
    console.warn('⚠️ Endpoint de payment status no disponible:', error);
    throw error;
  });
}

export type ProcessPaymentResponse = {
  status: string;
  message: string;
};

/**
 * Procesa un pago después de que el usuario complete el checkout de MercadoPago
 * Se llama desde la página de éxito con el payment_id
 */
export function processPayment(paymentId: string): Promise<ProcessPaymentResponse> {
  return postJson<ProcessPaymentResponse>(`/payments/process/${paymentId}`, {});
}

export const planPrices: Record<PlanCode, { mxn: number; usd: number; label: string }> = {
  STARTER: { mxn: 299, usd: 17, label: '$299 MXN/mes' },
  PRO: { mxn: 999, usd: 55, label: '$999 MXN/mes' },
  BUSINESS: { mxn: 3999, usd: 220, label: '$3,999 MXN/mes' }
};

export const planLimits: Record<PlanCode, { users: number; properties: number; leads: number }> = {
  STARTER: { users: 2, properties: 10, leads: 50 },
  PRO: { users: 10, properties: 100, leads: 500 },
  BUSINESS: { users: 50, properties: 1000, leads: 5000 }
};

export function formatSubscriptionStatus(status: SubscriptionStatus): string {
  const labels: Record<SubscriptionStatus, string> = {
    TRIAL: 'Prueba',
    ACTIVE: 'Activo',
    PENDING: 'Pendiente',
    SUSPENDED: 'Suspendido',
    CANCELLED: 'Cancelado',
    EXPIRED: 'Expirado'
  };
  return labels[status];
}
