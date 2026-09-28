import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { processPayment } from '../../settings/api/paymentApi';

export function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Procesando tu pago...');

  useEffect(() => {
    const paymentId = searchParams.get('payment_id');
    const plan = searchParams.get('plan');

    if (!paymentId) {
      setStatus('error');
      setMessage('No se recibió información del pago');
      return;
    }

    // Procesar el pago
    processPayment(paymentId)
      .then(() => {
        setStatus('success');
        setMessage(`¡Pago exitoso! Tu suscripción al plan ${plan || ''} ha sido activada.`);

        // Redirigir al dashboard después de 3 segundos
        setTimeout(() => {
          navigate('/app');
        }, 3000);
      })
      .catch((error) => {
        setStatus('error');
        setMessage(`Error al procesar el pago: ${error.message}`);
      });
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full space-y-8 text-center">
        {/* Icono */}
        <div className="flex justify-center">
          {status === 'processing' && (
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
          )}
          {status === 'success' && (
            <div className="rounded-full bg-green-100 dark:bg-green-900 p-4">
              <svg className="h-16 w-16 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
          {status === 'error' && (
            <div className="rounded-full bg-red-100 dark:bg-red-900 p-4">
              <svg className="h-16 w-16 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          )}
        </div>

        {/* Título */}
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          {status === 'processing' && 'Procesando pago...'}
          {status === 'success' && '¡Pago exitoso!'}
          {status === 'error' && 'Error en el pago'}
        </h2>

        {/* Mensaje */}
        <p className="text-gray-600 dark:text-gray-300">{message}</p>

        {/* Botones */}
        <div className="space-y-3">
          {status === 'success' && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Serás redirigido al dashboard en unos segundos...
            </p>
          )}

          {status === 'error' && (
            <button
              onClick={() => navigate('/app/planes')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Volver a intentar
            </button>
          )}

          <button
            onClick={() => navigate('/app')}
            className="w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Ir al dashboard
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
