import { useCallback, useEffect, useState } from 'react';

// Propiedades que le gustaron al visitante del sitio público. Viven solo en su navegador:
// no requieren cuenta y no se envían a ningún servidor.
const STORAGE_KEY = 'homeforge_liked_properties';
const CHANGE_EVENT = 'homeforge:liked-properties';

function read(): string[] {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(value) ? value.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

function write(ids: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // Sin almacenamiento (modo privado o bloqueado): el "me gusta" solo dura esta visita.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function useLikedProperties() {
  const [likedIds, setLikedIds] = useState<string[]>(read);

  useEffect(() => {
    const sync = () => setLikedIds(read());
    window.addEventListener(CHANGE_EVENT, sync);
    window.addEventListener('storage', sync); // otras pestañas
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const isLiked = useCallback((id: string) => likedIds.includes(id), [likedIds]);

  const toggleLike = useCallback((id: string) => {
    const current = read();
    const next = current.includes(id) ? current.filter(item => item !== id) : [id, ...current];
    setLikedIds(next);
    write(next);
  }, []);

  return { likedIds, isLiked, toggleLike };
}
