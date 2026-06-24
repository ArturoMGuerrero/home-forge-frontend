import { getJson, postJson } from './services/api';

export type PlanCode = 'STARTER' | 'PRO' | 'BUSINESS';

export type SubscriptionStatus = 'TRIAL' | 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'CANCELLED' | 'EXPIRED';

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

export function getSubscriptionStatusColor(status: SubscriptionStatus): string {
  const colors: Record<SubscriptionStatus, string> = {
    TRIAL: 'bg-blue-100 text-blue-800',
    ACTIVE: 'bg-emerald-100 text-emerald-800',
    PENDING: 'bg-amber-100 text-amber-800',
    SUSPENDED: 'bg-rose-100 text-rose-800',
    CANCELLED: 'bg-slate-100 text-slate-600',
    EXPIRED: 'bg-rose-100 text-rose-800'
  };
  return colors[status];
}
