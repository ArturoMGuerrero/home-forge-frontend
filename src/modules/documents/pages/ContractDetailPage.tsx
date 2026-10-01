import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  createDocumentSignature,
  deleteDocument,
  deleteDocumentSignature,
  Document,
  DocumentSignature,
  DocumentStatus,
  documentStatusLabels,
  documentTypeLabels,
  getDocument,
  listDocumentSignatures,
  sendDocumentForSignature,
  signatureStatusLabels,
  signDocument,
  updateDocumentStatus
} from '../api/documentsApi';
import { ConfirmModal } from '../../../shared/ConfirmModal';
import { Badge, BadgeVariant, Button, Card, Input, LoadingState, PageHeader } from '../../../shared/ui';

const STATUS_VARIANTS: Record<DocumentStatus, BadgeVariant> = {
  DRAFT: 'neutral',
  PENDING_SIGNATURE: 'warning',
  PARTIALLY_SIGNED: 'warning',
  SIGNED: 'success',
  COMPLETED: 'success',
  CANCELLED: 'error',
  EXPIRED: 'error'
};

/** Abre el contrato en una ventana limpia para imprimirlo o guardarlo como PDF. */
function printContract(contract: Document) {
  const popup = window.open('', '_blank', 'width=900,height=1000');
  if (!popup) {
    toast.error('Permite las ventanas emergentes para imprimir el contrato.');
    return;
  }
  const doc = popup.document;
  doc.title = contract.name;
  const style = doc.createElement('style');
  style.textContent = 'body{font-family:Georgia,"Times New Roman",serif;max-width:720px;margin:48px auto;padding:0 24px;line-height:1.7;font-size:14px;color:#111}h1{font-size:18px;text-align:center;margin-bottom:32px}pre{white-space:pre-wrap;font:inherit}';
  doc.head.appendChild(style);
  const title = doc.createElement('h1');
  title.textContent = contract.name;
  const body = doc.createElement('pre');
  body.textContent = contract.content ?? ''; // texto plano: nunca se interpreta como HTML
  doc.body.append(title, body);
  popup.focus();
  popup.print();
}

/** /app/contratos/:contractId */
export function ContractDetailPage() {
  const { contractId = '' } = useParams();
  const navigate = useNavigate();
  const [contract, setContract] = useState<Document | null>(null);
  const [signatures, setSignatures] = useState<DocumentSignature[]>([]);
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [signer, setSigner] = useState({ signerName: '', signerEmail: '', signerRole: '' });

  const reload = useCallback(async () => {
    const [document, signatureList] = await Promise.all([getDocument(contractId), listDocumentSignatures(contractId)]);
    setContract(document);
    setSignatures(signatureList);
  }, [contractId]);

  useEffect(() => {
    reload().catch(() => {
      toast.error('No se encontró el contrato.');
      navigate('/app/contratos', { replace: true });
    });
  }, [navigate, reload]);

  async function run(action: () => Promise<unknown>, success: string) {
    setBusy(true);
    try {
      await action();
      await reload();
      toast.success(success);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No fue posible completar la acción.');
    } finally {
      setBusy(false);
    }
  }

  function addSigner(event: FormEvent) {
    event.preventDefault();
    run(async () => {
      await createDocumentSignature({
        documentId: contractId,
        signerName: signer.signerName.trim(),
        signerEmail: signer.signerEmail.trim(),
        signerRole: signer.signerRole.trim() || undefined
      });
      setSigner({ signerName: '', signerEmail: '', signerRole: '' });
    }, 'Firmante agregado');
  }

  async function removeContract() {
    setBusy(true);
    try {
      await deleteDocument(contractId);
      toast.success('Contrato eliminado');
      navigate('/app/contratos');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No fue posible eliminar el contrato.');
      setBusy(false);
    }
  }

  if (!contract) return <Card><LoadingState message="Cargando contrato..." /></Card>;

  const closed = ['COMPLETED', 'CANCELLED', 'EXPIRED'].includes(contract.status);
  const editableSigners = contract.status === 'DRAFT';

  return (
    <>
      <PageHeader
        actions={(
          <>
            <Button onClick={() => printContract(contract)} variant="secondary">Imprimir o PDF</Button>
            {contract.status === 'DRAFT' && (
              <Button
                disabled={busy || signatures.length === 0}
                onClick={() => run(() => sendDocumentForSignature(contract.id), 'Contrato enviado a firma')}
                title={signatures.length === 0 ? 'Agrega al menos un firmante' : undefined}
              >
                Enviar a firma
              </Button>
            )}
            {!closed && contract.status !== 'DRAFT' && (
              <Button disabled={busy} onClick={() => run(() => updateDocumentStatus(contract.id, 'COMPLETED'), 'Contrato completado')}>
                Marcar como completado
              </Button>
            )}
          </>
        )}
        backLink={{ to: '/app/contratos', label: 'Contratos' }}
        eyebrow={documentTypeLabels[contract.documentType]}
        title={contract.name}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Badge dot size="md" variant={STATUS_VARIANTS[contract.status]}>{documentStatusLabels[contract.status]}</Badge>
            <span className="text-xs text-fg-subtle">
              Creado el {new Date(contract.createdAt).toLocaleDateString('es-MX', { dateStyle: 'long' })} · versión {contract.version}
            </span>
          </div>
          <div className="whitespace-pre-wrap rounded-xl border border-border bg-surface-muted p-6 font-serif text-sm leading-7 text-fg sm:p-8">
            {contract.content || 'Este contrato no tiene contenido.'}
          </div>
        </Card>

        <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
          <Card>
            <h2 className="font-semibold text-fg">Firmantes</h2>
            {signatures.length === 0 && <p className="mt-2 text-sm text-fg-subtle">Agrega a las personas que deben firmar antes de enviarlo a firma.</p>}
            <ul className="mt-3 divide-y divide-border">
              {signatures.map(signature => (
                <li className="py-3" key={signature.id}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-fg">{signature.signerName}</p>
                      <p className="truncate text-xs text-fg-subtle">{[signature.signerRole, signature.signerEmail].filter(Boolean).join(' · ')}</p>
                    </div>
                    <Badge variant={signature.status === 'SIGNED' ? 'success' : 'neutral'}>{signatureStatusLabels[signature.status]}</Badge>
                  </div>
                  <div className="mt-2 flex gap-2">
                    {!closed && contract.status !== 'DRAFT' && signature.status !== 'SIGNED' && (
                      <Button
                        disabled={busy}
                        onClick={() => run(() => signDocument(signature.id, `Firmado por ${signature.signerName}`), 'Firma registrada')}
                        size="sm"
                        variant="secondary"
                      >
                        Registrar firma
                      </Button>
                    )}
                    {editableSigners && (
                      <Button disabled={busy} onClick={() => run(() => deleteDocumentSignature(signature.id), 'Firmante eliminado')} size="sm" variant="danger-ghost">
                        Quitar
                      </Button>
                    )}
                  </div>
                  {signature.signedAt && (
                    <p className="mt-1 text-xs text-fg-subtle">Firmó el {new Date(signature.signedAt).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                  )}
                </li>
              ))}
            </ul>

            {editableSigners && (
              <form className="mt-3 space-y-3 border-t border-border pt-4" onSubmit={addSigner}>
                <Input label="Nombre" onChange={event => setSigner({ ...signer, signerName: event.target.value })} required value={signer.signerName} />
                <Input label="Correo" onChange={event => setSigner({ ...signer, signerEmail: event.target.value })} required type="email" value={signer.signerEmail} />
                <Input label="Rol (opcional)" onChange={event => setSigner({ ...signer, signerRole: event.target.value })} placeholder="Comprador, vendedor, testigo..." value={signer.signerRole} />
                <Button disabled={busy} fullWidth type="submit" variant="secondary">Agregar firmante</Button>
              </form>
            )}
          </Card>

          {!closed && (
            <Card className="space-y-2">
              <Button disabled={busy} fullWidth onClick={() => run(() => updateDocumentStatus(contract.id, 'CANCELLED'), 'Contrato cancelado')} variant="tertiary">
                Cancelar contrato
              </Button>
              <Button disabled={busy} fullWidth onClick={() => setConfirmDelete(true)} variant="danger-ghost">
                Eliminar
              </Button>
            </Card>
          )}
        </aside>
      </div>

      <ConfirmModal
        confirmLabel="Eliminar"
        danger
        isOpen={confirmDelete}
        loading={busy}
        message="El contrato dejará de aparecer en tu lista. Esta acción no se puede deshacer."
        onCancel={() => setConfirmDelete(false)}
        onConfirm={removeContract}
        title="¿Eliminar este contrato?"
      />
    </>
  );
}
