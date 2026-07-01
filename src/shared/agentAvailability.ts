import { getJson, postJson, putJson, deleteVoid } from './services/api';

export interface AgentAvailability {
  id: string;
  companyId: string;
  userId: string;
  dayOfWeek: number; // 0 = Sunday, 6 = Saturday
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  timezone: string;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface AgentAvailabilityCreateRequest {
  companyId: string;
  userId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  timezone?: string;
  isAvailable?: boolean;
}

export const dayLabels: Record<number, string> = {
  0: 'Domingo',
  1: 'Lunes',
  2: 'Martes',
  3: 'Miércoles',
  4: 'Jueves',
  5: 'Viernes',
  6: 'Sábado'
};

export async function createAvailability(data: AgentAvailabilityCreateRequest): Promise<AgentAvailability> {
  return postJson('/api/agent-availability', data);
}

export async function listAvailability(params: {
  userId?: string;
  companyId?: string;
  dayOfWeek?: number;
}): Promise<AgentAvailability[]> {
  const queryParams = new URLSearchParams();
  if (params.userId) queryParams.append('userId', params.userId);
  if (params.companyId) queryParams.append('companyId', params.companyId);
  if (params.dayOfWeek !== undefined) queryParams.append('dayOfWeek', params.dayOfWeek.toString());
  return getJson(`/api/agent-availability?${queryParams.toString()}`);
}

export async function getAvailability(id: string): Promise<AgentAvailability> {
  return getJson(`/api/agent-availability/${id}`);
}

export async function updateAvailability(id: string, data: Partial<AgentAvailabilityCreateRequest>): Promise<AgentAvailability> {
  return putJson(`/api/agent-availability/${id}`, data);
}

export async function deleteAvailability(id: string): Promise<void> {
  return deleteVoid(`/api/agent-availability/${id}`);
}
