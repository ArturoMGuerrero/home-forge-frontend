import { clearSession, readSessionToken } from './sessionStorage';

// Detectar automáticamente el host: si se accede por IP, usar esa IP para el backend
function getApiBase(): string {
  // Si hay una variable de entorno definida, usarla
  if (import.meta.env.VITE_API_BASE) {
    return import.meta.env.VITE_API_BASE;
  }

  // En pruebas/SSR no existe window; usar un origen local estable.
  if (typeof window === 'undefined') {
    return 'http://localhost:8080/api';
  }

  // Detectar automáticamente basado en el hostname actual
  const hostname = window.location.hostname;
  const port = '8080';
  const protocol = window.location.protocol;

  return `${protocol}//${hostname}:${port}/api`;
  // return `https://electro-der-lenders-means.trycloudflare.com/api`
}

const API_BASE = getApiBase();

/**
 * fetch al backend con el token de la sesión. Si el servidor rechaza un token (expirado,
 * usuario desactivado), se cierra la sesión y se vuelve al inicio de sesión.
 */
async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const token = readSessionToken();
  const headers = new Headers(init?.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  if (res.status === 401 && token) {
    clearSession();
    window.location.assign('/login?expired=1');
  }
  return res;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await apiFetch(path, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers }
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null) as { error?: string } | null;
    throw new Error(body?.error ?? `API error ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export async function getJson<T>(path: string): Promise<T> {
  return request<T>(path);
}

export async function postJson<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, { method: 'POST', body: JSON.stringify(body) });
}

export async function putJson<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, { method: 'PUT', body: body === undefined ? undefined : JSON.stringify(body) });
}

export async function patchJson<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, { method: 'PATCH', body: JSON.stringify(body) });
}

export async function deleteJson<T>(path: string): Promise<T> {
  return request<T>(path, { method: 'DELETE' });
}

export async function deleteVoid(path: string): Promise<void> {
  const res = await apiFetch(path, { method: 'DELETE' });
  if (!res.ok) {
    const body = await res.json().catch(() => null) as { error?: string } | null;
    throw new Error(body?.error ?? `API error ${res.status}`);
  }
}

export async function postForm<T>(path: string, body: FormData): Promise<T> {
  const res = await apiFetch(path, { method: 'POST', body });

  if (!res.ok) {
    const contentType = res.headers.get('content-type');
    let errorMessage = `API error ${res.status}`;

    if (contentType?.includes('application/json')) {
      const response = await res.json().catch(() => null) as { error?: string; message?: string } | null;
      errorMessage = response?.error || response?.message || errorMessage;
    } else {
      const text = await res.text().catch(() => '');
      if (text) {
        errorMessage = text.substring(0, 200);
      }
    }

    throw new Error(errorMessage);
  }

  return res.json();
}

export function resolveApiAsset(path?: string): string | undefined {
  if (!path || path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${API_BASE.replace(/\/api$/, '')}${path}`;
}

/** Descarga un archivo protegido (con token) como Blob. */
export async function getBlob(path: string): Promise<Blob> {
  const res = await apiFetch(path);
  if (!res.ok) {
    const body = await res.json().catch(() => null) as { error?: string } | null;
    throw new Error(body?.error ?? `API error ${res.status}`);
  }
  return res.blob();
}
