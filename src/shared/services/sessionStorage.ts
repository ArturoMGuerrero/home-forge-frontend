// Almacenamiento de la sesión compartido entre el cliente de la API y el módulo de autenticación.
export const SESSION_KEY = 'homeforge_session';

/** Token JWT de la sesión actual, o null si no hay sesión. */
export function readSessionToken(): string | null {
  try {
    const value = localStorage.getItem(SESSION_KEY);
    if (!value) return null;
    const token = (JSON.parse(value) as { token?: unknown }).token;
    return typeof token === 'string' && token ? token : null;
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}
