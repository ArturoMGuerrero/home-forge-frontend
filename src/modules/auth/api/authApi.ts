import { postJson } from '../../../shared/services/api';
import { clearSession, SESSION_KEY } from '../../../shared/services/sessionStorage';

const LEGACY_SESSION_KEY = 'casaflow_session';

// Conserva la sesión iniciada antes del cambio de nombre CasaFlow -> HomeForge.
function migrateLegacySession() {
  const legacy = localStorage.getItem(LEGACY_SESSION_KEY);
  if (legacy === null) return;
  if (localStorage.getItem(SESSION_KEY) === null) localStorage.setItem(SESSION_KEY, legacy);
  localStorage.removeItem(LEGACY_SESSION_KEY);
}

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
  /** JWT que autoriza las peticiones a la API. */
  token: string;
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
  clearSession();
}

/** Actualiza datos de la sesión guardada (p. ej. el nombre tras editar el perfil o el token tras cambiar la contraseña). */
export function updateSessionAccount(changes: Partial<Pick<Session, 'name' | 'token'>>) {
  const session = getSession();
  if (!session) return;
  saveSession({ ...session, ...changes });
}

export function updateSessionSubscription(planCode: Session['planCode'], userLimit: number, subscriptionStatus?: string, trialEndsAt?: string) {
  const session = getSession();
  if (!session) return;
  saveSession({ ...session, planCode, userLimit, subscriptionStatus, trialEndsAt });
}

export function getSession(): Session | null {
  migrateLegacySession();
  const value = localStorage.getItem(SESSION_KEY);
  if (!value) return null;

  try {
    const session = JSON.parse(value) as Partial<Session>;
    // Las sesiones anteriores a la autenticación con token se descartan: hay que volver a iniciar sesión.
    if (!session.userId || !session.companyId || !session.name || !session.email || !session.token) {
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

export async function requestPasswordReset(email: string): Promise<void> {
  await postJson('/auth/request-password-reset', { email });
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  await postJson('/auth/reset-password', { token, newPassword });
}
