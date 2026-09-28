export const fieldLabelClass = 'block text-sm font-semibold text-slate-700 mb-2';

export const fieldControlClass =
  'w-full px-3.5 py-3 border rounded-xl text-sm bg-[rgb(var(--input-bg))] text-[rgb(var(--text-primary))] ' +
  'placeholder:text-[rgb(var(--text-tertiary))] outline-none transition ' +
  'disabled:bg-slate-50 disabled:text-slate-500';

export function fieldStateClass(hasError: boolean) {
  return hasError
    ? 'border-rose-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-100'
    : 'border-[rgb(var(--border-color))] focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100';
}
