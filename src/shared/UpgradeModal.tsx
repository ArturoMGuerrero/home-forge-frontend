import { useNavigate } from 'react-router-dom';
import { Alert, Button, Modal } from './ui';
import { cn } from './ui/cn';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  feature: string;
  level: 'LIMITED' | 'BLOCKED';
};

export function UpgradeModal({ isOpen, onClose, feature, level }: Props) {
  const navigate = useNavigate();
  const blocked = level === 'BLOCKED';

  const handleUpgrade = () => {
    onClose();
    navigate('/app/planes');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      showCloseButton={false}
      footer={
        <>
          <Button onClick={onClose} variant="tertiary">Cancelar</Button>
          <Button onClick={handleUpgrade}>Comparar planes</Button>
        </>
      }
    >
      <div className="flex gap-4">
        <div className={cn('grid size-11 shrink-0 place-items-center rounded-full', blocked ? 'bg-surface-sunken text-fg-muted' : 'bg-warning-soft text-warning')}>
          <svg aria-hidden="true" className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={blocked
                ? 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
                : 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'}
            />
          </svg>
        </div>
        <div className="min-w-0 pt-0.5">
          <h3 className="text-base font-semibold text-fg">{blocked ? 'Función bloqueada' : 'Límite alcanzado'}</h3>
          <p className="mt-1.5 text-sm text-fg-subtle">
            {blocked ? (
              <>
                No puedes <strong className="font-semibold text-fg">{feature}</strong> porque tu cuenta está suspendida.
                Renueva tu suscripción para recuperar el acceso completo a HomeForge.
              </>
            ) : (
              <>Actualiza a Pro para <strong className="font-semibold text-fg">{feature}</strong>.</>
            )}
          </p>
        </div>
      </div>

      {!blocked && (
        <Alert className="mt-5" variant="warning">
          Aún puedes ver y editar tus datos existentes. Solo está bloqueada la creación de nuevo contenido.
        </Alert>
      )}
    </Modal>
  );
}
