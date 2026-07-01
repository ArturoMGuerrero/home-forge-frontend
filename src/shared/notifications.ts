import { getSession } from './auth';
import { deleteVoid, getJson, patchJson, postJson } from './services/api';

const DEMO_COMPANY_ID = '00000000-0000-0000-0000-000000000001';

export function getCompanyId(): string {
  return getSession()?.companyId ?? DEMO_COMPANY_ID;
}

export type NotificationType = 'EMAIL' | 'WHATSAPP' | 'PUSH' | 'SMS';
export type NotificationStatus = 'PENDING' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED' | 'CANCELLED';
export type NotificationPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type RecipientType = 'LEAD' | 'USER' | 'CUSTOM';
export type MessageTemplateCategory =
  | 'LEAD_FOLLOWUP'
  | 'APPOINTMENT'
  | 'CONTRACT'
  | 'PAYMENT'
  | 'GENERAL'
  | 'TASK_REMINDER'
  | 'PROPERTY_ALERT';

export type Notification = {
  id: string;
  companyId: string;
  templateId?: string;
  notificationType: NotificationType;
  status: NotificationStatus;
  priority: NotificationPriority;
  recipientType: RecipientType;
  recipientId?: string;
  recipientEmail?: string;
  recipientPhone?: string;
  recipientName?: string;
  subject?: string;
  content: string;
  htmlContent?: string;
  attachments?: string;
  metadata?: string;
  leadId?: string;
  propertyId?: string;
  taskId?: string;
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  failedAt?: string;
  errorMessage?: string;
  externalId?: string;
  externalStatus?: string;
  scheduledFor?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type MessageTemplate = {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  templateType: NotificationType;
  channel: NotificationType;
  subject?: string;
  content: string;
  variables?: string;
  category?: MessageTemplateCategory;
  active: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateNotificationPayload = {
  notificationType: NotificationType;
  priority?: NotificationPriority;
  recipientType: RecipientType;
  recipientId?: string;
  recipientEmail?: string;
  recipientPhone?: string;
  recipientName?: string;
  subject?: string;
  content: string;
  htmlContent?: string;
  leadId?: string;
  propertyId?: string;
  taskId?: string;
  scheduledFor?: string;
  metadata?: string;
};

export type CreateTemplatePayload = {
  name: string;
  description?: string;
  templateType: NotificationType;
  channel: NotificationType;
  subject?: string;
  content: string;
  variables?: string;
  category?: MessageTemplateCategory;
  isDefault?: boolean;
};

// Notifications API
export function listNotifications(status?: NotificationStatus): Promise<Notification[]> {
  const params = new URLSearchParams({ companyId: getCompanyId() });
  if (status) params.append('status', status);
  return getJson<Notification[]>(`/notifications?${params}`);
}

export function listNotificationsByLead(leadId: string): Promise<Notification[]> {
  return getJson<Notification[]>(`/notifications/lead/${leadId}`);
}

export function createNotification(payload: CreateNotificationPayload): Promise<Notification> {
  return postJson<Notification>('/notifications', {
    companyId: getCompanyId(),
    ...payload
  });
}

export function sendNotification(notificationId: string): Promise<Notification> {
  return postJson<Notification>(
    `/notifications/${notificationId}/send?companyId=${getCompanyId()}`,
    {}
  );
}

export function updateNotificationStatus(
  notificationId: string,
  status: NotificationStatus
): Promise<Notification> {
  return patchJson<Notification>(
    `/notifications/${notificationId}/status?companyId=${getCompanyId()}`,
    { status }
  );
}

export function deleteNotification(notificationId: string): Promise<void> {
  return deleteVoid(`/notifications/${notificationId}?companyId=${getCompanyId()}`);
}

// Message Templates API
export function listMessageTemplates(): Promise<MessageTemplate[]> {
  return getJson<MessageTemplate[]>(`/message-templates?companyId=${getCompanyId()}`);
}

export function getMessageTemplate(templateId: string): Promise<MessageTemplate> {
  return getJson<MessageTemplate>(`/message-templates/${templateId}?companyId=${getCompanyId()}`);
}

export function listTemplatesByType(type: NotificationType): Promise<MessageTemplate[]> {
  return getJson<MessageTemplate[]>(
    `/message-templates/by-type?companyId=${getCompanyId()}&type=${type}`
  );
}

export function listTemplatesByCategory(category: MessageTemplateCategory): Promise<MessageTemplate[]> {
  return getJson<MessageTemplate[]>(
    `/message-templates/by-category?companyId=${getCompanyId()}&category=${category}`
  );
}

export function createMessageTemplate(payload: CreateTemplatePayload): Promise<MessageTemplate> {
  return postJson<MessageTemplate>('/message-templates', {
    companyId: getCompanyId(),
    ...payload
  });
}

export function updateMessageTemplate(templateId: string, content: string): Promise<MessageTemplate> {
  return patchJson<MessageTemplate>(
    `/message-templates/${templateId}?companyId=${getCompanyId()}`,
    { content }
  );
}

export function toggleTemplateActive(templateId: string): Promise<MessageTemplate> {
  return patchJson<MessageTemplate>(
    `/message-templates/${templateId}/toggle-active?companyId=${getCompanyId()}`,
    {}
  );
}

export function deleteMessageTemplate(templateId: string): Promise<void> {
  return deleteVoid(`/message-templates/${templateId}?companyId=${getCompanyId()}`);
}

// Labels en español
export const notificationTypeLabels: Record<NotificationType, string> = {
  EMAIL: 'Email',
  WHATSAPP: 'WhatsApp',
  PUSH: 'Notificación Push',
  SMS: 'SMS'
};

export const notificationStatusLabels: Record<NotificationStatus, string> = {
  PENDING: 'Pendiente',
  SENT: 'Enviado',
  DELIVERED: 'Entregado',
  READ: 'Leído',
  FAILED: 'Fallido',
  CANCELLED: 'Cancelado'
};

export const notificationPriorityLabels: Record<NotificationPriority, string> = {
  LOW: 'Baja',
  MEDIUM: 'Media',
  HIGH: 'Alta',
  URGENT: 'Urgente'
};

export const templateCategoryLabels: Record<MessageTemplateCategory, string> = {
  LEAD_FOLLOWUP: 'Seguimiento de Prospecto',
  APPOINTMENT: 'Citas',
  CONTRACT: 'Contratos',
  PAYMENT: 'Pagos',
  GENERAL: 'General',
  TASK_REMINDER: 'Recordatorio de Tareas',
  PROPERTY_ALERT: 'Alerta de Propiedades'
};
