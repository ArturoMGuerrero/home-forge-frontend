import { getSession } from './auth';
import { getJson, postJson } from './services/api';

export type CompanyUser = {
  id: string;
  fullName: string;
  email: string;
  phoneE164?: string;
  role: 'ADMIN' | 'AGENT';
  active: boolean;
};

export type UserListResponse = {
  planCode: 'STARTER' | 'PRO' | 'BUSINESS';
  userLimit: number;
  usedSeats: number;
  users: CompanyUser[];
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
