import { useNavigate, useSearchParams } from 'react-router-dom';

export function PaymentFailurePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full space-y-8 text-center">
        {/* Icono de error */}
        <div className="flex justify-center">
          <div className="rounded-full bg-red-100 dark:bg-red-900 p-4">
            <svg className="h-16 w-16 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        </div>

        {/* Título */}
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          Pago rechazado
        </h2>

        {/* Mensaje */}
        <p className="text-gray-600 dark:text-gray-300">
          No se pudo procesar tu pago. Esto puede deberse a:
        </p>

        {/* Razones comunes */}
        <ul className="text-left space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Fondos insuficientes en la tarjeta</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Datos de la tarjeta incorrectos</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>La transacción fue rechazada por el banco</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Cancelaste el pago</span>
          </li>
        </ul>

        {/* Botones */}
        <div className="space-y-3 pt-4">
          <button
            onClick={() => navigate('/app/planes')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Intentar de nuevo
          </button>

          <button
            onClick={() => navigate('/app')}
            className="w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Volver al dashboard
          </button>
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
