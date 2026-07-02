// Estilos estandarizados para botones

export const buttonStyles = {
  // Botón primario - Gradiente indigo-purple
  primary: 'inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed',

  // Botón secundario - Borde indigo
  secondary: 'inline-flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-indigo-600 text-indigo-600 rounded-xl font-semibold hover:bg-indigo-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed',

  // Botón terciario - Borde gris
  tertiary: 'inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-50 hover:border-slate-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed',

  // Botón de peligro
  danger: 'inline-flex items-center gap-2 px-4 py-2 bg-white border border-rose-200 text-rose-600 rounded-lg font-medium hover:bg-rose-50 hover:border-rose-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed',

  // Botón pequeño
  small: 'inline-flex items-center gap-1.5 px-3 py-1.5 text-sm',

  // Botón grande
  large: 'inline-flex items-center gap-2.5 px-6 py-3 text-base',
};

export const inputStyles = {
  // Input estándar
  base: 'w-full px-3.5 py-3 border border-slate-200 bg-white rounded-xl text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50 disabled:text-slate-500',

  // Select estándar
  select: 'w-full px-3.5 py-3 border border-slate-200 bg-white rounded-xl text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 cursor-pointer',

  // Textarea estándar
  textarea: 'w-full px-3.5 py-3 border border-slate-200 bg-white rounded-xl text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 resize-none',

  // Input de búsqueda
  search: 'w-full pl-11 pr-4 py-2.5 border border-slate-200 bg-white rounded-xl text-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20',

  // Label
  label: 'block text-sm font-semibold text-slate-700 mb-2',
};

export const badgeStyles = {
  // Badge de contador
  counter: 'inline-flex items-center px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-semibold',

  // Badge de estado
  status: {
    success: 'inline-flex items-center px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold',
    warning: 'inline-flex items-center px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold',
    error: 'inline-flex items-center px-2.5 py-1 bg-rose-100 text-rose-700 rounded-full text-xs font-semibold',
    info: 'inline-flex items-center px-2.5 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold',
    neutral: 'inline-flex items-center px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold',
  },
};

export const cardStyles = {
  // Card base
  base: 'bg-white rounded-2xl border border-slate-200 shadow-sm p-6',

  // Card con hover
  interactive: 'bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-lg hover:border-indigo-200 transition-all cursor-pointer',
};
