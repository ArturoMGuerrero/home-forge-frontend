import { Link } from 'react-router-dom';

/** Pie del sitio público: contacto y documentos legales (obligatorios al recibir datos de interesados). */
export function PublicFooter() {
  return (
    <footer className="mt-16 border-t border-border bg-surface">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-10 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-sm">
          <Link className="flex items-center gap-2.5" to="/propiedades">
            <img alt="" className="size-8 rounded-lg object-contain" src="/favicon.png" />
            <strong className="font-semibold text-fg">HomeForge</strong>
          </Link>
          <p className="mt-3 text-sm text-fg-subtle">Propiedades en venta y renta publicadas directamente por inmobiliarias.</p>
        </div>
        <nav aria-label="Enlaces del sitio" className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm">
          <span className="font-semibold text-fg">Explorar</span>
          <span className="font-semibold text-fg">Legal</span>
          <Link className="text-fg-subtle hover:text-fg" to="/propiedades">Propiedades</Link>
          <Link className="text-fg-subtle hover:text-fg" to="/aviso-de-privacidad">Aviso de privacidad</Link>
          <Link className="text-fg-subtle hover:text-fg" to="/registro">¿Eres inmobiliaria?</Link>
          <Link className="text-fg-subtle hover:text-fg" to="/terminos">Términos y condiciones</Link>
        </nav>
      </div>
      <div className="border-t border-border">
        <p className="mx-auto max-w-7xl px-5 py-4 text-xs text-fg-subtle">© {new Date().getFullYear()} HomeForge. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}
