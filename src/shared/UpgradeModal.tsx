import { useNavigate } from 'react-router-dom';
import { Modal } from './ui/Modal';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  feature: string;
  level: 'LIMITED' | 'BLOCKED';
};

export function UpgradeModal({ isOpen, onClose, feature, level }: Props) {
  const navigate = useNavigate();

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
    >
      <div className="mb-4 flex items-center gap-3">
        <div className={`grid size-12 place-items-center rounded-full ${level === 'BLOCKED' ? 'bg-slate-700/50' : 'bg-amber-600/20'}`}>
          {level === 'BLOCKED' ? (
            <svg className="size-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          ) : (
            <svg className="size-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          )}
        </div>
        <div>
          <h3 className="font-bold text-white">
            {level === 'BLOCKED' ? 'Función Bloqueada' : 'LÍMITE ALCANZADO'}
          </h3>
          <p className="text-sm text-slate-400">Renueva para continuar</p>
        </div>
      </div>

      <p className="mb-6 text-sm text-slate-300">
        {level === 'BLOCKED' ? (
          <>
            No puedes <strong className="text-white">{feature}</strong> porque tu cuenta está suspendida.
            Renueva tu suscripción para recuperar el acceso completo a HomeForge.
          </>
        ) : (
          <>
            Actualiza a Pro para <strong className="text-amber-300">{feature}</strong>
          </>
        )}
      </p>

      <div className="space-y-3">
        <button
          className="w-full rounded-xl bg-amber-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-amber-700"
          onClick={handleUpgrade}
          type="button"
        >
          Comparar planes
        </button>
        <button
          className="w-full rounded-xl border border-slate-600/50 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-700/50"
          onClick={onClose}
          type="button"
        >
          Cancelar
        </button>
      </div>

      {level === 'LIMITED' && (
        <div className="mt-4 rounded-xl bg-amber-600/10 border border-amber-600/20 p-3">
          <p className="text-xs text-amber-300">
            💡 Aún puedes ver y editar tus datos existentes. Solo está bloqueada la creación de nuevo contenido.
          </p>
        </div>
      )}
    </Modal>
  );
}
