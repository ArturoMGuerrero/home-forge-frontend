// Gradientes compartidos para mantener consistencia visual en toda la app

export const gradients = {
  // Gradientes principales
  primary: 'bg-gradient-to-r from-indigo-600 to-purple-600',
  primaryHover: 'hover:from-indigo-700 hover:to-purple-700',

  // Gradientes de background suaves
  bgSoft: 'bg-gradient-to-br from-slate-50 to-white',
  bgIndigo: 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50',

  // Gradientes para tarjetas
  cardSuccess: 'bg-gradient-to-br from-emerald-500 to-teal-600',
  cardWarning: 'bg-gradient-to-br from-amber-500 to-orange-600',
  cardInfo: 'bg-gradient-to-br from-indigo-500 to-blue-600',
  cardPurple: 'bg-gradient-to-br from-purple-500 to-pink-600',

  // Gradientes de texto
  textPrimary: 'bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent',
} as const;

export const shadows = {
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  '2xl': 'shadow-2xl',

  // Sombras de color
  indigo: 'shadow-lg shadow-indigo-500/20',
  purple: 'shadow-lg shadow-purple-500/20',
  success: 'shadow-lg shadow-emerald-500/20',
} as const;

export const animations = {
  fadeIn: 'animate-fadeIn',
  slideUp: 'animate-slideUp',
  slideDown: 'animate-slideDown',
  spin: 'animate-spin',
  pulse: 'animate-pulse',
  bounce: 'animate-bounce',
} as const;
