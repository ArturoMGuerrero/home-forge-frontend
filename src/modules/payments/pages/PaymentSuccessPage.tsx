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
    <div className="min-h-screen flex items-center justify-center bg-surface-muted px-4">
      <div className="max-w-md w-full space-y-8 text-center">
        {/* Icono */}
        <div className="flex justify-center">
          {status === 'processing' && (
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-info"></div>
          )}
          {status === 'success' && (
            <div className="rounded-full bg-success-muted p-4">
              <svg className="h-16 w-16 text-success-fg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
          {status === 'error' && (
            <div className="rounded-full bg-danger-muted p-4">
              <svg className="h-16 w-16 text-danger-fg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          )}
        </div>

        {/* Título */}
        <h2 className="text-3xl font-bold text-fg">
          {status === 'processing' && 'Procesando pago...'}
          {status === 'success' && '¡Pago exitoso!'}
          {status === 'error' && 'Error en el pago'}
        </h2>

        {/* Mensaje */}
        <p className="text-fg-muted">{message}</p>

        {/* Botones */}
        <div className="space-y-3">
          {status === 'success' && (
            <p className="text-sm text-fg-subtle">
              Serás redirigido al dashboard en unos segundos...
            </p>
          )}

          {status === 'error' && (
            <button
              onClick={() => navigate('/app/planes')}
              className="w-full bg-info hover:bg-info-hover-hover text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Volver a intentar
            </button>
          )}

          <button
            onClick={() => navigate('/app')}
            className="w-full bg-surface-strong hover:bg-border-strong text-fg font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Ir al dashboard
          </button>
        </div>

        {/* Debug info (solo en desarrollo) */}
        {import.meta.env.DEV && (
          <div className="mt-8 p-4 bg-surface-sunken rounded-lg text-left text-xs">
            <p className="font-semibold mb-2">Debug Info:</p>
            <pre className="text-fg-muted whitespace-pre-wrap">
              {JSON.stringify(Object.fromEntries(searchParams), null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
