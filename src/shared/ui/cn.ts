import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combina clases de Tailwind resolviendo conflictos: la última clase gana,
 * así `className` puede sobrescribir los estilos por defecto de un componente.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
