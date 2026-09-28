import { Link } from 'react-router-dom';

export function PaymentFailurePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-rose-50 to-red-50 px-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-6 inline-flex size-20 items-center justify-center rounded-full bg-rose-100">
          <svg className="size-10 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>

        <h1 className="mb-3 text-3xl font-bold text-slate-900">Pago Rechazado</h1>
        <p className="mb-8 text-slate-600">
          No fue posible procesar tu pago. Por favor, intenta nuevamente.
        </p>

        <div className="mb-8 rounded-2xl border border-rose-200 bg-white p-6 text-left">
          <h2 className="mb-3 font-semibold text-slate-900">Posibles razones:</h2>
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-rose-600">•</span>
              <span>Fondos insuficientes en la tarjeta</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-rose-600">•</span>
              <span>Datos de la tarjeta incorrectos</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-rose-600">•</span>
              <span>Tarjeta bloqueada o vencida</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-rose-600">•</span>
              <span>Límite de compras alcanzado</span>
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <Link
            className="block rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700"
            to="/app/planes"
          >
            Intentar Nuevamente
          </Link>
          <Link
            className="block rounded-xl border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
            to="/app"
          >
            Volver al Dashboard
          </Link>
        </div>

        <p className="mt-6 text-xs text-slate-500">
          Si el problema persiste, contacta a soporte.
        </p>
      </div>
    </div>
  );
}
