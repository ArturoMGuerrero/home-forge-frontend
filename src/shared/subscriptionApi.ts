import { getCompanyId } from './leads';
import { getJson, putJson } from './services/api';

export type PlanCode = 'STARTER' | 'PRO' | 'BUSINESS';

export type Plan = {
  code: PlanCode;
  name: string;
  price: string;
  description: string;
  features: string[];
  featured?: boolean;
};

export type SubscriptionStatus = 'TRIAL' | 'ACTIVE' | 'EXPIRED' | 'SUSPENDED' | 'CANCELLED' | 'PENDING';

export type Subscription = {
  companyId: string;
  planCode: PlanCode;
  userLimit: number;
  status: SubscriptionStatus;
  trialStartedAt?: string;
  trialEndsAt?: string;
  trialDaysRemaining: number;
  nextBillingAt?: string;
  paymentConfigured: boolean;
};

export function getSubscription(): Promise<Subscription> {
  return getJson<Subscription>(`/companies/${getCompanyId()}/subscription`).catch(error => {
    console.warn('⚠️ Endpoint de suscripción no disponible:', error);
    throw error;
  });
}

export function changeSubscriptionPlan(planCode: PlanCode): Promise<Subscription> {
  return putJson<Subscription>(`/companies/${getCompanyId()}/subscription`, { planCode });
}

// Planes de pago disponibles después del periodo de prueba gratuito (14 días)
// Todos los planes requieren pago mensual vía Mercado Pago
const PLANS: Plan[] = [
  {
    code: 'STARTER',
    name: 'Starter',
    price: '$299 MXN/mes',
    description: 'Plan básico para comenzar a organizar tu inmobiliaria.',
    features: ['Hasta 2 usuarios', 'Hasta 10 propiedades', 'Hasta 50 prospectos', '1 imagen por propiedad', 'Funciones básicas de CRM']
  },
  {
    code: 'PRO',
    name: 'Pro',
    price: '$999 MXN/mes',
    description: 'Para equipos que necesitan más control y funciones avanzadas.',
    features: ['Hasta 10 usuarios', 'Hasta 100 propiedades', 'Hasta 500 prospectos', 'Hasta 12 imágenes por propiedad', 'Dashboard completo', 'Exportar a Excel', 'Reportes avanzados'],
    featured: true
  },
  {
    code: 'BUSINESS',
    name: 'Business',
    price: '$3,999 MXN/mes',
    description: 'Para operaciones inmobiliarias en crecimiento con necesidades empresariales.',
    features: ['Hasta 50 usuarios', 'Hasta 1,000 propiedades', 'Hasta 5,000 prospectos', 'Hasta 12 imágenes por propiedad', 'Todas las funciones PRO', 'Soporte prioritario', 'API personalizada']
  }
];

export function getPlans(): Promise<Plan[]> {
  // Intentar obtener del backend, si falla usar los planes hardcodeados
  return getJson<Plan[]>('/plans').catch(() => {
    console.log('⚠️ Endpoint /plans no disponible, usando planes locales');
    return Promise.resolve(PLANS);
  });
}
