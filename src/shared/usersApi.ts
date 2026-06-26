import { getSession } from './auth';
import { getJson, postJson, patchJson, deleteJson } from './services/api';

export type CompanyUser = {
  id: string;
  fullName: string;
  email: string;
  phoneE164?: string;
  role: 'ADMIN' | 'AGENT';
  roleId?: string;
  active: boolean;
};

export type UserListResponse = {
  planCode: 'STARTER' | 'PRO' | 'BUSINESS';
  userLimit: number;
  usedSeats: number;
  users: CompanyUser[];
};

export type UserSettings = {
  language: string;
  timezone: string;
  currency: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  notificationNewLead: boolean;
  notificationLeadUpdate: boolean;
  notificationAppointment: boolean;
  notificationTeamActivity: boolean;
  theme: string;
  emailSignature?: string;
  dashboardLayout: string;
};

export type Team = {
  id: string;
  name: string;
  description?: string;
  leaderId?: string;
  active: boolean;
  memberCount: number;
  memberIds: string[];
};

export type UserActivity = {
  id: string;
  userId: string;
  activityType: string;
  activityCategory: string;
  entityType?: string;
  entityId?: string;
  descriptionEn: string;
  descriptionEs: string;
  createdAt: string;
};

export type PagedResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
};

function sessionIds() {
  const session = getSession();
  if (!session) throw new Error('Sesión no disponible.');
  return session;
}

export function listCompanyUsers(): Promise<UserListResponse> {
  const session = sessionIds();
  return getJson<UserListResponse>(`/users?companyId=${session.companyId}&requesterUserId=${session.userId}`);
}

export function createCompanyUser(payload: {
  fullName: string;
  email: string;
  phoneE164?: string;
  role: 'ADMIN' | 'AGENT';
  password: string;
}): Promise<CompanyUser> {
  const session = sessionIds();
  return postJson<CompanyUser>('/users', {
    companyId: session.companyId,
    requesterUserId: session.userId,
    ...payload
  });
}

export function updateUser(userId: string, payload: {
  fullName?: string;
  email?: string;
  phoneE164?: string;
}): Promise<CompanyUser> {
  const session = sessionIds();
  return patchJson<CompanyUser>(`/users/${userId}`, {
    companyId: session.companyId,
    requesterUserId: session.userId,
    ...payload
  });
}

export function changeUserStatus(userId: string, active: boolean): Promise<void> {
  const session = sessionIds();
  return patchJson<void>(`/users/${userId}/status`, {
    companyId: session.companyId,
    requesterUserId: session.userId,
    active
  });
}

export function changeUserRole(userId: string, role: 'ADMIN' | 'AGENT', roleId?: string): Promise<void> {
  const session = sessionIds();
  return patchJson<void>(`/users/${userId}/role`, {
    companyId: session.companyId,
    requesterUserId: session.userId,
    role,
    roleId
  });
}

export function getUserSettings(userId: string): Promise<UserSettings> {
  return getJson<UserSettings>(`/users/${userId}/settings`);
}

export function updateUserSettings(userId: string, payload: Partial<UserSettings>): Promise<UserSettings> {
  return patchJson<UserSettings>(`/users/${userId}/settings`, payload);
}

export function listTeams(): Promise<Team[]> {
  const session = sessionIds();
  return getJson<Team[]>(`/teams?companyId=${session.companyId}`);
}

export function createTeam(payload: {
  name: string;
  description?: string;
  leaderId?: string;
  memberIds?: string[];
}): Promise<Team> {
  const session = sessionIds();
  return postJson<Team>('/teams', {
    companyId: session.companyId,
    requesterUserId: session.userId,
    ...payload
  });
}

export function addTeamMember(teamId: string, userId: string): Promise<void> {
  const session = sessionIds();
  return postJson<void>(`/teams/${teamId}/members/${userId}?companyId=${session.companyId}&requesterId=${session.userId}`, {});
}

export function removeTeamMember(teamId: string, userId: string): Promise<void> {
  const session = sessionIds();
  return deleteJson<void>(`/teams/${teamId}/members/${userId}?companyId=${session.companyId}&requesterId=${session.userId}`);
}

export function listUserActivity(page = 0, size = 50): Promise<PagedResponse<UserActivity>> {
  const session = sessionIds();
  return getJson<PagedResponse<UserActivity>>(`/user-activity?companyId=${session.companyId}&page=${page}&size=${size}`);
}

export function listUserActivityByUser(userId: string, page = 0, size = 50): Promise<PagedResponse<UserActivity>> {
  return getJson<PagedResponse<UserActivity>>(`/user-activity/user/${userId}?page=${page}&size=${size}`);
}
