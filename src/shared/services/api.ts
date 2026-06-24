// Detectar automáticamente el host: si se accede por IP, usar esa IP para el backend
function getApiBase(): string {
  // Si hay una variable de entorno definida, usarla
  if (import.meta.env.VITE_API_BASE) {
    return import.meta.env.VITE_API_BASE;
  }

  // Detectar automáticamente basado en el hostname actual
  const hostname = window.location.hostname;
  const port = '8080';
  const protocol = window.location.protocol;

  return `${protocol}//${hostname}:${port}/api`;
}

const API_BASE = getApiBase();

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers }
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null) as { error?: string } | null;
    throw new Error(body?.error ?? `API error ${res.status}`);
  }
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

export async function deleteJson<T>(path: string): Promise<T> {
  return request<T>(path, { method: 'DELETE' });
}

export async function deleteVoid(path: string): Promise<void> {
  const res = await fetch(`${API_BASE}${path}`, { method: 'DELETE' });
  if (!res.ok) {
    const body = await res.json().catch(() => null) as { error?: string } | null;
    throw new Error(body?.error ?? `API error ${res.status}`);
  }
}

export async function postForm<T>(path: string, body: FormData): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { method: 'POST', body });
  if (!res.ok) {
    const response = await res.json().catch(() => null) as { error?: string } | null;
    throw new Error(response?.error ?? `API error ${res.status}`);
  }
  return res.json();
}

export function resolveApiAsset(path?: string): string | undefined {
  if (!path || path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${API_BASE.replace(/\/api$/, '')}${path}`;
}

export function apiUrl(path: string): string {
  return `${API_BASE}${path}`;
}
