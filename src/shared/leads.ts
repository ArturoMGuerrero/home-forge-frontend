import { getSession } from './auth';
import { getJson, postJson, putJson } from './services/api';

const STORAGE_KEY = 'casaflow_leads';

const DEMO_COMPANY_ID = '00000000-0000-0000-0000-000000000001';

export function getCompanyId(): string {
  return getSession()?.companyId ?? DEMO_COMPANY_ID;
}

export type LeadItem = {
  id: string;
  companyId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phoneE164?: string;
  source?: string;
  status: LeadStatus;
  listingType?: string;
  budgetMin?: number;
  budgetMax?: number;
  currencyCode?: string;
  countryCode?: string;
  stateCode?: string;
  city?: string;
  propertyType?: string;
  bedroomsMin?: number;
  bathroomsMin?: number;
  financingType?: string;
  priority: LeadPriority;
  assignedTo?: string;
  nextFollowUpAt?: string;
  notes?: string;
};

export type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'TOUR_SCHEDULED' | 'TOUR_COMPLETED' | 'OFFER_MADE' | 'UNDER_CONTRACT' | 'CLOSED' | 'LOST';
export type LeadPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type LeadActivityType = 'CALL' | 'WHATSAPP' | 'EMAIL' | 'NOTE' | 'TOUR' | 'MEETING' | 'STATUS_CHANGE';

export type LeadActivity = {
  id: string;
  companyId: string;
  leadId: string;
  activityType: LeadActivityType;
  notes: string;
  occurredAt: string;
  nextFollowUpAt?: string;
  createdAt: string;
};

export type LeadPayload = Omit<LeadItem, 'id' | 'companyId'>;

export function listLeads(): Promise<LeadItem[]> {
  return getJson<LeadItem[]>(`/leads?companyId=${getCompanyId()}`);
}

export function getLead(leadId: string): Promise<LeadItem> {
  return getJson<LeadItem>(`/leads/${leadId}?companyId=${getCompanyId()}`);
}

export function updateLead(leadId: string, lead: LeadPayload): Promise<LeadItem> {
  return putJson<LeadItem>(`/leads/${leadId}`, { companyId: getCompanyId(), ...lead });
}

export function deleteLead(leadId: string): Promise<void> {
  const { deleteJson } = require('./services/api');
  return deleteJson(`/leads/${leadId}?companyId=${getCompanyId()}`);
}

export function listLeadActivities(leadId: string): Promise<LeadActivity[]> {
  return getJson<LeadActivity[]>(`/leads/${leadId}/activities?companyId=${getCompanyId()}`);
}

export function addLeadActivity(
  leadId: string,
  activity: { activityType: LeadActivityType; notes: string; occurredAt?: string; nextFollowUpAt?: string }
): Promise<LeadActivity> {
  return postJson<LeadActivity>(`/leads/${leadId}/activities`, { companyId: getCompanyId(), ...activity });
}

export const leadStatusLabels: Record<LeadStatus, string> = {
  NEW: 'Nuevo',
  CONTACTED: 'Contactado',
  QUALIFIED: 'Calificado',
  TOUR_SCHEDULED: 'Visita agendada',
  TOUR_COMPLETED: 'Visita realizada',
  OFFER_MADE: 'Oferta realizada',
  UNDER_CONTRACT: 'Bajo contrato',
  CLOSED: 'Cerrado',
  LOST: 'Perdido'
};

export const demoLeads: LeadItem[] = [
  { id: 'demo-1', companyId: DEMO_COMPANY_ID, firstName: 'Mariana', lastName: 'Torres', email: 'mariana@example.com', phoneE164: '+524421112233', status: 'QUALIFIED', priority: 'HIGH' },
  { id: 'demo-2', companyId: DEMO_COMPANY_ID, firstName: 'Carlos', lastName: 'Mendoza', email: 'carlos@example.com', phoneE164: '+528112223344', status: 'CONTACTED', priority: 'MEDIUM' },
  { id: 'demo-3', companyId: DEMO_COMPANY_ID, firstName: 'Sofía', lastName: 'Ramírez', email: 'sofia@example.com', phoneE164: '+529991234567', status: 'NEW', priority: 'LOW' }
];

export function getLocalLeads(): LeadItem[] {
  const value = localStorage.getItem(STORAGE_KEY);
  if (!value) return demoLeads;
  try {
    return JSON.parse(value) as LeadItem[];
  } catch {
    return demoLeads;
  }
}

export function addLocalLead(lead: Omit<LeadItem, 'id' | 'status'>): LeadItem {
  const item = { ...lead, id: crypto.randomUUID(), status: 'NEW' as LeadStatus };
  localStorage.setItem(STORAGE_KEY, JSON.stringify([item, ...getLocalLeads()]));
  window.dispatchEvent(new Event('casaflow:leads'));
  return item;
}
