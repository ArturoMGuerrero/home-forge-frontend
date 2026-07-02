import { Button } from '../shared/ui';

export function ButtonTestPage() {
  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold mb-6">Comparación de Botones - Original vs Componente</h1>

      {/* PRIMARY BUTTONS */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Primary (Gradiente Indigo → Purple)</h2>

        <div className="flex gap-4 items-center">
          <div>
            <p className="text-xs text-slate-500 mb-2">Original (HTML)</p>
            <button className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-900/20 transition hover:shadow-xl hover:shadow-indigo-900/30">
              + Nueva propiedad
            </button>
          </div>

          <div>
            <p className="text-xs text-slate-500 mb-2">Componente</p>
            <Button variant="primary">
              + Nueva propiedad
            </Button>
          </div>
        </div>
      </section>

      {/* SECONDARY BUTTONS */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Secondary (Borde Indigo)</h2>

        <div className="flex gap-4 items-center">
          <div>
            <p className="text-xs text-slate-500 mb-2">Original (HTML)</p>
            <button className="bg-white border-2 border-indigo-600 px-4 py-2.5 text-sm font-semibold text-indigo-600 shadow-sm transition hover:bg-indigo-50 rounded-xl">
              Crear rápida
            </button>
          </div>

          <div>
            <p className="text-xs text-slate-500 mb-2">Componente</p>
            <Button variant="secondary">
              Crear rápida
            </Button>
          </div>
        </div>
      </section>

      {/* TERTIARY BUTTONS */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Tertiary (Borde Gris)</h2>

        <div className="flex gap-4 items-center">
          <div>
            <p className="text-xs text-slate-500 mb-2">Original (HTML)</p>
            <button className="border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 rounded-xl">
              Cancelar
            </button>
          </div>

          <div>
            <p className="text-xs text-slate-500 mb-2">Componente</p>
            <Button variant="tertiary">
              Cancelar
            </Button>
          </div>
        </div>
      </section>

      {/* DANGER BUTTONS */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Danger (Rojo)</h2>

        <div className="flex gap-4 items-center">
          <div>
            <p className="text-xs text-slate-500 mb-2">Original (HTML)</p>
            <button className="bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 rounded-xl transition">
              Eliminar
            </button>
          </div>

          <div>
            <p className="text-xs text-slate-500 mb-2">Componente</p>
            <Button variant="danger">
              Eliminar
            </Button>
          </div>
        </div>
      </section>

      {/* SUCCESS BUTTONS */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Success (Verde)</h2>

        <div className="flex gap-4 items-center">
          <div>
            <p className="text-xs text-slate-500 mb-2">Original (HTML)</p>
            <button className="bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 rounded-xl transition">
              Ver leads
            </button>
          </div>

          <div>
            <p className="text-xs text-slate-500 mb-2">Componente</p>
            <Button variant="success">
              Ver leads
            </Button>
          </div>
        </div>
      </section>

      {/* DISABLED STATE */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Disabled State</h2>

        <div className="flex gap-4 items-center">
          <div>
            <p className="text-xs text-slate-500 mb-2">Original (HTML)</p>
            <button disabled className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg disabled:opacity-60 disabled:cursor-not-allowed">
              Deshabilitado
            </button>
          </div>

          <div>
            <p className="text-xs text-slate-500 mb-2">Componente</p>
            <Button variant="primary" disabled>
              Deshabilitado
            </Button>
          </div>
        </div>
      </section>

      {/* WITH ICON */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">With Icon</h2>

        <div className="flex gap-4 items-center">
          <div>
            <p className="text-xs text-slate-500 mb-2">Original (HTML)</p>
            <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg">
              <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Crear completa
            </button>
          </div>

          <div>
            <p className="text-xs text-slate-500 mb-2">Componente</p>
            <Button
              variant="primary"
              icon={
                <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              }
            >
              Crear completa
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
