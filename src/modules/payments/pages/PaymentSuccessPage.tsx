import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '../../../shared/ui';
import { processPayment } from '../../settings/api/paymentApi';
import { PaymentResultLayout } from '../components/PaymentResultLayout';

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

    let redirectTimer: ReturnType<typeof setTimeout> | undefined;
    processPayment(paymentId)
      .then(() => {
        setStatus('success');
        setMessage(`Tu suscripción al plan ${plan || ''} ha sido activada.`);
        // Redirigir al dashboard después de 3 segundos
        redirectTimer = setTimeout(() => navigate('/app'), 3000);
      })
      .catch((error) => {
        setStatus('error');
        setMessage(`Error al procesar el pago: ${error.message}`);
      });

    return () => clearTimeout(redirectTimer);
  }, [searchParams, navigate]);

  const titles = { processing: 'Procesando pago...', success: '¡Pago exitoso!', error: 'Error en el pago' };

  return (
    <PaymentResultLayout
      actions={
        <>
          {status === 'error' && <Button fullWidth onClick={() => navigate('/app/planes')}>Volver a intentar</Button>}
          <Button fullWidth onClick={() => navigate('/app')} variant={status === 'error' ? 'tertiary' : 'primary'}>Ir al dashboard</Button>
        </>
      }
      title={titles[status]}
      tone={status}
    >
      <p>{message}</p>
      {status === 'success' && <p className="text-fg-subtle">Serás redirigido al dashboard en unos segundos...</p>}
    </PaymentResultLayout>
  );
}
