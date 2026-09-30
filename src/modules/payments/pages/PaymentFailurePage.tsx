import { useNavigate } from 'react-router-dom';
import { Button } from '../../../shared/ui';
import { PaymentResultLayout } from '../components/PaymentResultLayout';

const reasons = [
  'Fondos insuficientes en la tarjeta',
  'Datos de la tarjeta incorrectos',
  'La transacción fue rechazada por el banco',
  'Cancelaste el pago',
];

export function PaymentFailurePage() {
  const navigate = useNavigate();

  return (
    <PaymentResultLayout
      actions={
        <>
          <Button fullWidth onClick={() => navigate('/app/planes')}>Intentar de nuevo</Button>
          <Button fullWidth onClick={() => navigate('/app')} variant="tertiary">Volver al dashboard</Button>
        </>
      }
      title="Pago rechazado"
      tone="error"
    >
      <p>No se pudo procesar tu pago. Esto puede deberse a:</p>
      <ul className="space-y-1.5 rounded-xl bg-surface-muted p-4 text-left">
        {reasons.map(reason => (
          <li className="flex gap-2" key={reason}>
            <span aria-hidden="true" className="text-fg-subtle">•</span>
            {reason}
          </li>
        ))}
      </ul>
    </PaymentResultLayout>
  );
}
