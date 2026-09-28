import { useNavigate, useSearchParams } from 'react-router-dom';

export function PaymentPendingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full space-y-8 text-center">
        {/* Icono de pendiente */}
        <div className="flex justify-center">
          <div className="rounded-full bg-yellow-100 dark:bg-yellow-900 p-4">
            <svg className="h-16 w-16 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        {/* Título */}
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          Pago pendiente
        </h2>

        {/* Mensaje */}
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            Tu pago está siendo procesado. Esto puede tardar unos minutos.
          </p>

          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              Te enviaremos un correo electrónico cuando se confirme el pago.
            </p>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            Los pagos con transferencia bancaria o efectivo pueden tardar hasta 48 horas en acreditarse.
          </p>
        </div>

        {/* Botones */}
        <div className="space-y-3 pt-4">
          <button
            onClick={() => navigate('/app')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Ir al dashboard
          </button>

          <button
            onClick={() => navigate('/app/planes')}
            className="w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Ver mis planes
          </button>
        </div>

        {/* Información adicional */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Si tienes dudas, contacta a soporte con tu ID de pago
          </p>
        </div>

        {/* Debug info (solo en desarrollo) */}
        {import.meta.env.DEV && (
          <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-left text-xs">
            <p className="font-semibold mb-2">Debug Info:</p>
            <pre className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
              {JSON.stringify(Object.fromEntries(searchParams), null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
