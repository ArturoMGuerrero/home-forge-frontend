import { getSession } from './auth';
import { deleteVoid, getJson, patchJson, postJson } from './services/api';

const DEMO_COMPANY_ID = '00000000-0000-0000-0000-000000000001';

export function getCompanyId(): string {
  return getSession()?.companyId ?? DEMO_COMPANY_ID;
}

export type FollowUpTaskType =
  | 'CALL'
  | 'WHATSAPP'
  | 'EMAIL'
  | 'MEETING'
  | 'SEND_PROPERTY'
  | 'SCHEDULE_TOUR'
  | 'SEND_CONTRACT'
  | 'FOLLOW_UP'
  | 'OTHER';

export type FollowUpTaskStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'OVERDUE';

export type FollowUpTaskPriority =
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'URGENT';

export type FollowUpTask = {
  id: string;
  companyId: string;
  leadId: string;
  title: string;
  description?: string;
  taskType: FollowUpTaskType;
  status: FollowUpTaskStatus;
  scheduledFor: string;
  completedAt?: string;
  assignedToUserId?: string;
  priority: FollowUpTaskPriority;
  reminderSentAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateFollowUpTaskPayload = {
  leadId: string;
  title: string;
  description?: string;
  taskType: FollowUpTaskType;
  scheduledFor: string;
  assignedToUserId?: string;
  priority?: FollowUpTaskPriority;
};

export type UpdateFollowUpTaskPayload = {
  title?: string;
  description?: string;
  status?: FollowUpTaskStatus;
  scheduledFor?: string;
  assignedToUserId?: string;
  priority?: FollowUpTaskPriority;
};

export function listFollowUpTasks(): Promise<FollowUpTask[]> {
  return getJson<FollowUpTask[]>(`/follow-up-tasks?companyId=${getCompanyId()}`);
}

export function listFollowUpTasksByLead(leadId: string): Promise<FollowUpTask[]> {
  return getJson<FollowUpTask[]>(`/follow-up-tasks/lead/${leadId}?companyId=${getCompanyId()}`);
}

export function listFollowUpTasksByUser(userId: string): Promise<FollowUpTask[]> {
  return getJson<FollowUpTask[]>(`/follow-up-tasks/user/${userId}?companyId=${getCompanyId()}`);
}

export function listOverdueTasks(): Promise<FollowUpTask[]> {
  return getJson<FollowUpTask[]>('/follow-up-tasks/overdue');
}

export function createFollowUpTask(payload: CreateFollowUpTaskPayload): Promise<FollowUpTask> {
  return postJson<FollowUpTask>('/follow-up-tasks', {
    companyId: getCompanyId(),
    ...payload
  });
}

export function updateFollowUpTask(
  taskId: string,
  payload: UpdateFollowUpTaskPayload
): Promise<FollowUpTask> {
  return patchJson<FollowUpTask>(`/follow-up-tasks/${taskId}`, {
    companyId: getCompanyId(),
    ...payload
  });
}

export function deleteFollowUpTask(taskId: string): Promise<void> {
  return deleteVoid(`/follow-up-tasks/${taskId}?companyId=${getCompanyId()}`);
}

export const taskTypeLabels: Record<FollowUpTaskType, string> = {
  CALL: 'Llamada',
  WHATSAPP: 'WhatsApp',
  EMAIL: 'Email',
  MEETING: 'Reunión',
  SEND_PROPERTY: 'Enviar propiedad',
  SCHEDULE_TOUR: 'Agendar visita',
  SEND_CONTRACT: 'Enviar contrato',
  FOLLOW_UP: 'Seguimiento',
  OTHER: 'Otro'
};

export const taskStatusLabels: Record<FollowUpTaskStatus, string> = {
  PENDING: 'Pendiente',
  IN_PROGRESS: 'En progreso',
  COMPLETED: 'Completada',
  CANCELLED: 'Cancelada',
  OVERDUE: 'Vencida'
};

export const taskPriorityLabels: Record<FollowUpTaskPriority, string> = {
  LOW: 'Baja',
  MEDIUM: 'Media',
  HIGH: 'Alta',
  URGENT: 'Urgente'
};
