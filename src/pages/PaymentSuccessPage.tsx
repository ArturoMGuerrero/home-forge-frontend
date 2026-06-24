import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getSession } from '../shared/auth';
import { getPaymentStatus, PaymentStatusResponse } from '../shared/paymentApi';

export function PaymentSuccessPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<PaymentStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getSession();
    if (!session?.companyId) {
      navigate('/login');
      return;
    }

    // Verificar estado del pago
    getPaymentStatus(session.companyId)
      .then(setStatus)
      .catch(console.error)
      .finally(() => setLoading(false));

    // Redirigir automáticamente después de 5 segundos
    const timer = setTimeout(() => {
      navigate('/app/configuracion');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 px-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-6 inline-flex size-20 items-center justify-center rounded-full bg-emerald-100">
          <svg className="size-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="mb-3 text-3xl font-bold text-slate-900">¡Pago Exitoso!</h1>
        <p className="mb-8 text-slate-600">
          Tu suscripción ha sido activada correctamente.
        </p>

        {loading ? (
          <p className="mb-6 text-sm text-slate-500">Verificando estado de la suscripción...</p>
        ) : status && (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-white p-6 text-left shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-600">Plan</span>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-bold text-emerald-800">
                {status.planCode}
              </span>
            </div>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-600">Estado</span>
              <span className="text-sm font-bold text-emerald-700">Activo</span>
            </div>
            {status.nextBillingAt && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-600">Próximo pago</span>
                <span className="text-sm text-slate-700">
                  {new Date(status.nextBillingAt).toLocaleDateString('es-MX', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="space-y-3">
          <Link
            className="block rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700"
            to="/app/configuracion"
          >
            Ir a Configuración
          </Link>
          <Link
            className="block rounded-xl border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
            to="/app"
          >
            Ir al Dashboard
          </Link>
        </div>

        <p className="mt-6 text-xs text-slate-500">
          Serás redirigido automáticamente en unos segundos...
        </p>
      </div>
    </div>
  );
}
