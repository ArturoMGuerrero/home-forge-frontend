import { Spinner } from '../../shared/ui';

export function RouteFallback() {
  return (
    <div aria-live="polite" className="grid min-h-[45vh] place-items-center" role="status">
      <div className="flex items-center gap-3 rounded-xl border border-border bg-surface px-5 py-3.5 text-sm font-medium text-fg-muted shadow-card">
        <Spinner className="text-primary" size="sm" />
        Cargando sección…
      </div>
    </div>
  );
}
