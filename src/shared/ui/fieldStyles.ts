import { cn } from './cn';

export const fieldLabelClass = 'mb-1.5 block text-sm font-semibold text-fg-muted';

export const fieldControlClass =
  'w-full min-h-11 rounded-xl border bg-surface px-3.5 py-2.5 text-sm text-fg shadow-sm outline-none transition ' +
  'placeholder:text-fg-subtle disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:text-fg-subtle';

export function fieldStateClass(hasError: boolean) {
  return hasError
    ? 'border-danger-line focus:border-danger focus:ring-3 focus:ring-danger/15'
    : 'border-border hover:border-border-strong focus:border-primary focus:ring-3 focus:ring-primary/15';
}

/** Clases para un control de formulario nativo (input, select, textarea) fuera de los componentes. */
export function fieldClass(hasError = false, className?: string) {
  return cn(fieldControlClass, fieldStateClass(hasError), className);
}
