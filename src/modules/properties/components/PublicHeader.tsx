import { Link } from 'react-router-dom';
import { buttonClasses } from '../../../shared/ui';

/** Encabezado del sitio público (catálogo y detalle de propiedades). */
export function PublicHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3">
        <Link className="flex items-center gap-3" to="/propiedades">
          <img alt="" className="size-10 rounded-xl object-contain" src="/favicon.png" />
          <span>
            <strong className="block text-base font-semibold text-fg">HomeForge</strong>
            <small className="hidden text-xs text-fg-subtle sm:block">Encuentra tu hogar ideal</small>
          </span>
        </Link>
        <Link className={buttonClasses({ variant: 'tertiary', size: 'sm' })} to="/login">Acceso inmobiliarias</Link>
      </div>
    </header>
  );
}
