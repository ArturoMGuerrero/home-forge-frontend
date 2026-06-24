import { Link } from 'react-router-dom';

export function PaymentPendingPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 px-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-6 inline-flex size-20 items-center justify-center rounded-full bg-amber-100">
          <svg className="size-10 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h1 className="mb-3 text-3xl font-bold text-slate-900">Pago Pendiente</h1>
        <p className="mb-8 text-slate-600">
          Tu pago está siendo procesado. Te notificaremos cuando se confirme.
        </p>

        <div className="mb-8 rounded-2xl border border-amber-200 bg-white p-6 text-left">
          <h2 className="mb-3 font-semibold text-slate-900">¿Qué sigue?</h2>
          <ul className="space-y-3 text-sm text-slate-600">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-amber-600">1.</span>
              <span>Recibirás un correo de confirmación cuando se apruebe el pago</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-amber-600">2.</span>
              <span>El proceso puede tardar hasta 48 horas hábiles</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-amber-600">3.</span>
              <span>Tu suscripción se activará automáticamente al confirmar</span>
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <Link
            className="block rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700"
            to="/app/configuracion"
          >
            Ver Estado de Suscripción
          </Link>
          <Link
            className="block rounded-xl border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
            to="/app"
          >
            Volver al Dashboard
          </Link>
        </div>

        <div className="mt-6 rounded-xl bg-amber-50 p-4">
          <p className="text-xs text-amber-800">
            <strong>Nota:</strong> Algunos métodos de pago requieren aprobación manual y pueden demorar más tiempo.
          </p>
        </div>
      </div>
    </div>
  );
}
