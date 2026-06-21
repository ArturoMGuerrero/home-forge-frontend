import { getCompanyId } from './leads';
import { getJson, putJson } from './services/api';

export type PlanCode = 'STARTER' | 'PRO' | 'BUSINESS';

export type Subscription = {
  companyId: string;
  planCode: PlanCode;
  userLimit: number;
  status: 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED';
  trialStartedAt?: string;
  trialEndsAt?: string;
  trialDaysRemaining: number;
  nextBillingAt?: string;
  paymentConfigured: boolean;
};

export function getSubscription(): Promise<Subscription> {
  return getJson<Subscription>(`/companies/${getCompanyId()}/subscription`);
}

export function changeSubscriptionPlan(planCode: PlanCode): Promise<Subscription> {
  return putJson<Subscription>(`/companies/${getCompanyId()}/subscription`, { planCode });
}
