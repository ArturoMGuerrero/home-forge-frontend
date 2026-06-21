import { postJson } from './services/api';

const SESSION_KEY = 'casaflow_session';

export type Session = {
  userId: string;
  companyId: string;
  name: string;
  companyName: string;
  email: string;
  role: string;
  planCode: 'STARTER' | 'PRO' | 'BUSINESS';
  userLimit: number;
  subscriptionStatus?: string;
  trialEndsAt?: string;
};

type RegisterPayload = {
  fullName: string;
  companyName: string;
  email: string;
  phoneE164: string;
  password: string;
};

function saveSession(session: Session): Session {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export async function login(email: string, password: string): Promise<Session> {
  const session = await postJson<Session>('/auth/login', { email, password });
  return saveSession(session);
}

export async function register(payload: RegisterPayload): Promise<Session> {
  const session = await postJson<Session>('/auth/register', payload);
  return saveSession(session);
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
}

export function updateSessionSubscription(planCode: Session['planCode'], userLimit: number, subscriptionStatus?: string, trialEndsAt?: string) {
  const session = getSession();
  if (!session) return;
  saveSession({ ...session, planCode, userLimit, subscriptionStatus, trialEndsAt });
}

export function getSession(): Session | null {
  const value = localStorage.getItem(SESSION_KEY);
  if (!value) return null;

  try {
    const session = JSON.parse(value) as Partial<Session>;
    if (!session.userId || !session.companyId || !session.name || !session.email) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return {
      ...session,
      planCode: session.planCode ?? 'STARTER',
      userLimit: session.userLimit ?? 2,
      subscriptionStatus: session.subscriptionStatus ?? 'TRIAL'
    } as Session;
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export function isAuthenticated() {
  return getSession() !== null;
}

export async function requestPasswordReset(email: string, newPassword: string): Promise<void> {
  await postJson('/auth/reset-password', { email, newPassword });
}
