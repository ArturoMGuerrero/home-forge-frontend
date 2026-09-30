import { ReactNode, useEffect, useId, useRef } from 'react';
import { cn } from './cn';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  /** Botones de acción fijos al pie del modal. */
  footer?: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '7xl';
  showCloseButton?: boolean;
  noPadding?: boolean;
}

const maxWidthClasses = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-md',
  lg: 'sm:max-w-lg',
  xl: 'sm:max-w-xl',
  '2xl': 'sm:max-w-2xl',
  '3xl': 'sm:max-w-3xl',
  '4xl': 'sm:max-w-4xl',
  '5xl': 'sm:max-w-5xl',
  '7xl': 'sm:max-w-7xl',
};

const focusableSelector = 'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])';

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = 'lg',
  showCloseButton = true,
  noPadding = false,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const titleId = useId();
  const subtitleId = useId();

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Foco inicial, trampa de foco, cierre con Escape y bloqueo del scroll del body.
  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;
    const firstField = dialog?.querySelector<HTMLElement>('input:not(:disabled), select:not(:disabled), textarea:not(:disabled)');
    (firstField ?? dialog)?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCloseRef.current();
        return;
      }
      if (event.key !== 'Tab' || !dialog) return;
      const elements = Array.from(dialog.querySelectorAll<HTMLElement>(focusableSelector));
      if (!elements.length) {
        event.preventDefault();
        return;
      }
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <div aria-hidden="true" className="absolute inset-0 bg-overlay backdrop-blur-[2px]" onClick={onClose} />

      <div
        aria-describedby={subtitle ? subtitleId : undefined}
        aria-labelledby={title ? titleId : undefined}
        aria-modal="true"
        className={cn(
          'relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-2xl border border-border bg-surface text-fg shadow-pop outline-none',
          'sm:max-h-[calc(100dvh-3rem)] sm:rounded-2xl',
          maxWidthClasses[maxWidth],
        )}
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
      >
        {(title || showCloseButton) && (
          <div className="relative shrink-0 border-b border-border px-5 py-4 sm:px-6">
            {title && (
              <div className="pr-10">
                <h2 className="text-lg font-semibold text-fg" id={titleId}>{title}</h2>
                {subtitle && <p className="mt-0.5 text-sm text-fg-subtle" id={subtitleId}>{subtitle}</p>}
              </div>
            )}
            {showCloseButton && (
              <button
                aria-label="Cerrar ventana"
                className="absolute right-3 top-3 grid size-9 place-items-center rounded-lg text-fg-subtle transition hover:bg-surface-sunken hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                onClick={onClose}
                type="button"
              >
                <svg aria-hidden="true" className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}

        <div className={cn('min-h-0 flex-1 overflow-y-auto overscroll-contain', !noPadding && 'p-5 sm:p-6')}>
          {children}
        </div>

        {footer && (
          <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-border bg-surface-muted px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
