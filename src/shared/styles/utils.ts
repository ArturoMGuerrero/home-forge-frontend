import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combina clases de Tailwind de forma inteligente, resolviendo conflictos
 * Usa clsx para manejar condicionales y twMerge para resolver conflictos
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Trunca texto con ellipsis
 */
export const truncate = {
  single: 'truncate',
  lines2: 'line-clamp-2',
  lines3: 'line-clamp-3',
  lines4: 'line-clamp-4',
} as const;

/**
 * Transiciones comunes
 */
export const transitions = {
  base: 'transition-all duration-200',
  fast: 'transition-all duration-150',
  slow: 'transition-all duration-300',
  colors: 'transition-colors duration-200',
} as const;

/**
 * Estilos de foco accesibles
 */
export const focus = {
  ring: 'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
  ringInset: 'focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500',
  border: 'focus:outline-none focus:border-indigo-500',
} as const;

/**
 * Estilos de scroll personalizados
 */
export const scrollbar = {
  thin: 'scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100',
  hidden: 'scrollbar-none',
} as const;
