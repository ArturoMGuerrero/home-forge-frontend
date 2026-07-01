import { getJson, postJson, putJson, deleteVoid, patchJson } from './services/api';

export enum AppointmentType {
  PROPERTY_TOUR = 'PROPERTY_TOUR',
  MEETING = 'MEETING',
  CALL = 'CALL',
  VIDEO_CALL = 'VIDEO_CALL',
  SIGNING = 'SIGNING',
  OTHER = 'OTHER'
}

export enum AppointmentStatus {
  SCHEDULED = 'SCHEDULED',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
  RESCHEDULED = 'RESCHEDULED'
}

export enum LocationType {
  IN_PERSON = 'IN_PERSON',
  VIRTUAL = 'VIRTUAL',
  PHONE = 'PHONE',
  PROPERTY_SITE = 'PROPERTY_SITE'
}

export enum AppointmentOutcome {
  SUCCESSFUL = 'SUCCESSFUL',
  RESCHEDULED = 'RESCHEDULED',
  NO_SHOW = 'NO_SHOW',
  CANCELLED = 'CANCELLED'
}

export interface Appointment {
  id: string;
  companyId: string;
  title: string;
  description?: string;
  appointmentType: AppointmentType;
  status: AppointmentStatus;
  startTime: string;
  endTime: string;
  timezone: string;
  allDay: boolean;
  assignedUserId?: string;
  leadId?: string;
  propertyId?: string;
  locationType?: LocationType;
  locationAddress?: string;
  virtualMeetingUrl?: string;
  reminderMinutes?: number;
  reminderSent: boolean;
  reminderSentAt?: string;
  googleCalendarEventId?: string;
  googleCalendarSyncEnabled: boolean;
  lastSyncedAt?: string;
  notes?: string;
  outcome?: AppointmentOutcome;
  followUpRequired: boolean;
  metadata?: string;
  createdByUserId?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface AppointmentCreateRequest {
  companyId: string;
  title: string;
  description?: string;
  appointmentType: AppointmentType;
  startTime: string;
  endTime: string;
  timezone?: string;
  allDay?: boolean;
  assignedUserId?: string;
  leadId?: string;
  propertyId?: string;
  locationType?: LocationType;
  locationAddress?: string;
  virtualMeetingUrl?: string;
  reminderMinutes?: number;
  googleCalendarSyncEnabled?: boolean;
  notes?: string;
  createdByUserId?: string;
}

export const appointmentTypeLabels: Record<AppointmentType, string> = {
  [AppointmentType.PROPERTY_TOUR]: 'Visita a Propiedad',
  [AppointmentType.MEETING]: 'Reunión',
  [AppointmentType.CALL]: 'Llamada',
  [AppointmentType.VIDEO_CALL]: 'Videollamada',
  [AppointmentType.SIGNING]: 'Firma de Contrato',
  [AppointmentType.OTHER]: 'Otro'
};

export const appointmentStatusLabels: Record<AppointmentStatus, string> = {
  [AppointmentStatus.SCHEDULED]: 'Programada',
  [AppointmentStatus.CONFIRMED]: 'Confirmada',
  [AppointmentStatus.COMPLETED]: 'Completada',
  [AppointmentStatus.CANCELLED]: 'Cancelada',
  [AppointmentStatus.NO_SHOW]: 'No Asistió',
  [AppointmentStatus.RESCHEDULED]: 'Reprogramada'
};

export const locationTypeLabels: Record<LocationType, string> = {
  [LocationType.IN_PERSON]: 'Presencial',
  [LocationType.VIRTUAL]: 'Virtual',
  [LocationType.PHONE]: 'Telefónica',
  [LocationType.PROPERTY_SITE]: 'En Propiedad'
};

export const appointmentOutcomeLabels: Record<AppointmentOutcome, string> = {
  [AppointmentOutcome.SUCCESSFUL]: 'Exitosa',
  [AppointmentOutcome.RESCHEDULED]: 'Reprogramada',
  [AppointmentOutcome.NO_SHOW]: 'No Asistió',
  [AppointmentOutcome.CANCELLED]: 'Cancelada'
};

export async function createAppointment(data: AppointmentCreateRequest): Promise<Appointment> {
  return postJson('/api/appointments', data);
}

export async function listAppointments(params: {
  companyId: string;
  startTimestamp?: number;
  endTimestamp?: number;
  userId?: string;
  leadId?: string;
  status?: AppointmentStatus;
}): Promise<Appointment[]> {
  const queryParams = new URLSearchParams();
  queryParams.append('companyId', params.companyId);
  if (params.startTimestamp) queryParams.append('startTimestamp', params.startTimestamp.toString());
  if (params.endTimestamp) queryParams.append('endTimestamp', params.endTimestamp.toString());
  if (params.userId) queryParams.append('userId', params.userId);
  if (params.leadId) queryParams.append('leadId', params.leadId);
  if (params.status) queryParams.append('status', params.status);
  return getJson(`/api/appointments?${queryParams.toString()}`);
}

export async function getAppointment(id: string): Promise<Appointment> {
  return getJson(`/api/appointments/${id}`);
}

export async function updateAppointment(id: string, data: Partial<AppointmentCreateRequest>): Promise<Appointment> {
  return putJson(`/api/appointments/${id}`, data);
}

export async function deleteAppointment(id: string): Promise<void> {
  return deleteVoid(`/api/appointments/${id}`);
}

export async function updateAppointmentStatus(id: string, status: AppointmentStatus): Promise<Appointment> {
  return patchJson(`/api/appointments/${id}/status`, { status });
}

export async function markReminderSent(id: string): Promise<Appointment> {
  return postJson(`/api/appointments/${id}/reminder-sent`, {});
}

export async function syncWithGoogleCalendar(id: string, eventId: string): Promise<Appointment> {
  return postJson(`/api/appointments/${id}/sync-google`, { eventId });
}
