export function RouteFallback() {
  return (
    <div aria-live="polite" className="grid min-h-[45vh] place-items-center" role="status">
      <div className="flex items-center gap-3 rounded-2xl border border-[rgb(var(--border-color))] bg-[rgb(var(--card-bg))] px-5 py-4 text-sm font-medium text-[rgb(var(--text-secondary))] shadow-sm">
        <span aria-hidden="true" className="size-5 animate-spin rounded-full border-2 border-border border-t-primary" />
        Cargando sección…
      </div>
    </div>
  );
}
