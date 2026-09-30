import { ReactNode } from 'react';
import { AlertIcon, Button, Modal } from './ui';
import { cn } from './ui/cn';

type ConfirmModalProps = {
  isOpen: boolean;
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  danger?: boolean;
};

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = 'Eliminar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
  loading = false,
  danger = true
}: ConfirmModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      maxWidth="md"
      showCloseButton={false}
      footer={
        <>
          <Button disabled={loading} onClick={onCancel} variant="tertiary">
            {cancelLabel}
          </Button>
          <Button loading={loading} onClick={onConfirm} variant={danger ? 'danger-solid' : 'primary'}>
            {loading ? 'Procesando...' : confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex gap-4">
        <div className={cn('grid size-11 shrink-0 place-items-center rounded-full', danger ? 'bg-danger-soft text-danger' : 'bg-primary-soft text-primary')}>
          <AlertIcon className="size-6" variant="warning" />
        </div>
        <div className="min-w-0 pt-0.5">
          <h3 className="text-base font-semibold text-fg">{title}</h3>
          <div className="mt-1.5 text-sm text-fg-subtle">{message}</div>
        </div>
      </div>
    </Modal>
  );
}
