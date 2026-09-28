import { getCompanyId } from '../../leads';
import { deleteJson, getJson, postJson, putJson } from '../../../shared/services/api';

export type AgendaAppointment = {
  id: string;
  companyId: string;
  leadId?: string;
  propertyId?: string;
  title: string;
  appointmentType: 'PROPERTY_TOUR' | 'MEETING' | 'CALL' | 'VIDEO_CALL' | 'SIGNING' | 'OTHER';
  status: 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW' | 'RESCHEDULED';
  startsAt: string;
  endsAt: string;
  location?: string;
  notes?: string;
};

export type AgendaAppointmentPayload = Omit<AgendaAppointment, 'id' | 'companyId'>;

export function listAgendaAppointments() {
  return getJson<AgendaAppointment[]>(`/appointments?companyId=${getCompanyId()}`);
}

export function createAgendaAppointment(payload: AgendaAppointmentPayload) {
  return postJson<AgendaAppointment>('/appointments', { companyId: getCompanyId(), ...payload });
}

export function updateAgendaAppointment(id: string, payload: AgendaAppointmentPayload) {
  return putJson<AgendaAppointment>(`/appointments/${id}`, { companyId: getCompanyId(), ...payload });
}

export function deleteAgendaAppointment(id: string): Promise<void> {
  return deleteJson(`/appointments/${id}?companyId=${getCompanyId()}`);
}
