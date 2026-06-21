import { getCompanyId, LeadItem, listLeads } from './leads';
import { ApiProperty, listProperties } from './propertyApi';
import { apiUrl, deleteVoid, getJson, postForm, postJson, putJson } from './services/api';

export type Appointment = {
  id: string;
  companyId: string;
  leadId?: string;
  propertyId?: string;
  title: string;
  appointmentType: 'CALL' | 'MEETING' | 'TOUR' | 'FOLLOW_UP' | 'OTHER';
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELED';
  startsAt: string;
  endsAt?: string;
  location?: string;
  notes?: string;
};

export type PropertyMatch = {
  id: string;
  leadId: string;
  leadName: string;
  propertyId: string;
  propertyTitle: string;
  propertyCode: string;
  status: 'SUGGESTED' | 'SENT' | 'INTERESTED' | 'VISIT_SCHEDULED' | 'REJECTED';
  notes?: string;
  createdAt: string;
};

export type StoredDocument = {
  id: string;
  leadId?: string;
  leadName?: string;
  propertyId?: string;
  propertyTitle?: string;
  documentType: string;
  fileName: string;
  status: string;
  contentType?: string;
  fileSize?: number;
  notes?: string;
  createdAt: string;
};

export type AppointmentPayload = Omit<Appointment, 'id' | 'companyId'>;

export function listAppointments() {
  return getJson<Appointment[]>(`/appointments?companyId=${getCompanyId()}`);
}

export function createAppointment(payload: AppointmentPayload) {
  return postJson<Appointment>('/appointments', { companyId: getCompanyId(), ...payload });
}

export function updateAppointment(id: string, payload: AppointmentPayload) {
  return putJson<Appointment>(`/appointments/${id}`, { companyId: getCompanyId(), ...payload });
}

export function deleteAppointment(id: string): Promise<void> {
  const { deleteJson } = require('./services/api');
  return deleteJson(`/appointments/${id}?companyId=${getCompanyId()}`);
}

export function listMatches() {
  return getJson<PropertyMatch[]>(`/property-matches?companyId=${getCompanyId()}`);
}

export function createMatch(payload: { leadId: string; propertyId: string; status?: string; notes?: string }) {
  return postJson<PropertyMatch>('/property-matches', { companyId: getCompanyId(), ...payload });
}

export function updateMatch(match: PropertyMatch) {
  return putJson<PropertyMatch>(`/property-matches/${match.id}`, {
    companyId: getCompanyId(),
    leadId: match.leadId,
    propertyId: match.propertyId,
    status: match.status,
    notes: match.notes
  });
}

export function deleteMatch(id: string) {
  return deleteVoid(`/property-matches/${id}?companyId=${getCompanyId()}`);
}

export function listDocuments() {
  return getJson<StoredDocument[]>(`/documents?companyId=${getCompanyId()}`);
}

export function uploadDocument(data: { leadId?: string; propertyId?: string; documentType: string; status: string; notes?: string; file: File }) {
  const form = new FormData();
  form.append('file', data.file);
  const query = new URLSearchParams({ companyId: getCompanyId(), documentType: data.documentType, status: data.status });
  if (data.leadId) query.set('leadId', data.leadId);
  if (data.propertyId) query.set('propertyId', data.propertyId);
  if (data.notes) query.set('notes', data.notes);
  return postForm<StoredDocument>(`/documents?${query}`, form);
}

export function deleteDocument(id: string) {
  return deleteVoid(`/documents/${id}?companyId=${getCompanyId()}`);
}

export function documentDownloadUrl(id: string) {
  return apiUrl(`/documents/${id}/download?companyId=${getCompanyId()}`);
}

export function loadOperationsContext(): Promise<[LeadItem[], ApiProperty[]]> {
  return Promise.all([listLeads(), listProperties()]);
}
