import { useNavigate, useSearchParams } from 'react-router-dom';

export function PaymentFailurePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-muted px-4">
      <div className="max-w-md w-full space-y-8 text-center">
        {/* Icono de error */}
        <div className="flex justify-center">
          <div className="rounded-full bg-danger-muted p-4">
            <svg className="h-16 w-16 text-danger-fg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        </div>

        {/* Título */}
        <h2 className="text-3xl font-bold text-fg">
          Pago rechazado
        </h2>

        {/* Mensaje */}
        <p className="text-fg-muted">
          No se pudo procesar tu pago. Esto puede deberse a:
        </p>

        {/* Razones comunes */}
        <ul className="text-left space-y-2 text-sm text-fg-muted">
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
            className="w-full bg-info hover:bg-info-hover-hover text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Intentar de nuevo
          </button>

          <button
            onClick={() => navigate('/app')}
            className="w-full bg-surface-strong hover:bg-border-strong text-fg font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Volver al dashboard
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
