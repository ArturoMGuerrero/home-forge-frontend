import { useNavigate } from 'react-router-dom';
import { Alert, Button } from '../../../shared/ui';
import { PaymentResultLayout } from '../components/PaymentResultLayout';

export function PaymentPendingPage() {
  const navigate = useNavigate();

  return (
    <PaymentResultLayout
      actions={
        <>
          <Button fullWidth onClick={() => navigate('/app')}>Ir al dashboard</Button>
          <Button fullWidth onClick={() => navigate('/app/planes')} variant="tertiary">Ver mis planes</Button>
        </>
      }
      footer="Si tienes dudas, contacta a soporte con tu ID de pago."
      title="Pago pendiente"
      tone="warning"
    >
      <p>Tu pago está siendo procesado. Esto puede tardar unos minutos.</p>
      <Alert className="text-left" variant="info">Te enviaremos un correo electrónico cuando se confirme el pago.</Alert>
      <p className="text-fg-subtle">Los pagos con transferencia bancaria o efectivo pueden tardar hasta 48 horas en acreditarse.</p>
    </PaymentResultLayout>
  );
}
