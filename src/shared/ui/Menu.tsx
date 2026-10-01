import { ReactNode, useEffect, useId, useRef, useState } from 'react';
import { buttonClasses } from './Button';
import { cn } from './cn';

export interface MenuItem {
  label: string;
  onSelect: () => void;
  danger?: boolean;
  disabled?: boolean;
}

interface MenuProps {
  items: MenuItem[];
  /** Etiqueta accesible del botón disparador. */
  label?: string;
  /** Contenido del botón; por defecto, el icono de tres puntos. */
  trigger?: ReactNode;
  align?: 'left' | 'right';
  /** Texto a mostrar cuando no hay opciones. */
  emptyLabel?: string;
}

/** Menú desplegable de acciones (botón "⋯"). Se cierra con clic fuera o Escape. */
export function Menu({ items, label = 'Más acciones', trigger, align = 'right', emptyLabel = 'Sin opciones' }: MenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent ? event.key === 'Escape' : !rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', close);
    };
  }, [open]);

  return (
    <div className="relative" ref={rootRef}>
      <button
        aria-controls={open ? menuId : undefined}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={label}
        className={trigger
          ? buttonClasses({ variant: 'secondary', size: 'sm' })
          : 'grid size-9 place-items-center rounded-lg text-fg-subtle transition hover:bg-surface-sunken hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'}
        onClick={() => setOpen(current => !current)}
        type="button"
      >
        {trigger ?? (
          <svg aria-hidden="true" className="size-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        )}
      </button>
      {open && (
        <div
          className={cn('absolute top-full z-30 mt-1 max-h-72 min-w-48 overflow-y-auto rounded-xl border border-border bg-surface p-1 shadow-pop', align === 'right' ? 'right-0' : 'left-0')}
          id={menuId}
          role="menu"
        >
          {items.length === 0 && <p className="px-3 py-2 text-sm text-fg-subtle">{emptyLabel}</p>}
          {items.map(item => (
            <button
              className={cn(
                'flex w-full items-center rounded-lg px-3 py-2 text-left text-sm transition disabled:pointer-events-none disabled:opacity-50',
                item.danger ? 'text-danger-fg hover:bg-danger-soft' : 'text-fg-muted hover:bg-surface-sunken hover:text-fg',
              )}
              disabled={item.disabled}
              key={item.label}
              onClick={() => { setOpen(false); item.onSelect(); }}
              role="menuitem"
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
