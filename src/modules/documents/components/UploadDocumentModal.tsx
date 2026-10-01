import { DragEvent, FormEvent, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { LeadItem } from '../../leads';
import { ApiProperty } from '../../properties';
import { uploadStoredDocument as uploadDocument, StoredDocument } from '../api/storedDocumentsApi';
import { SubscriptionRestrictions } from '../../../shared/subscriptionRestrictions';
import { UpgradeModal } from '../../../shared/UpgradeModal';
import { Button, cn, Input, Modal, Select } from '../../../shared/ui';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onDocumentUploaded: (doc: StoredDocument) => void;
  leads: LeadItem[];
  properties: ApiProperty[];
  restrictions: SubscriptionRestrictions;
}

const FORM_ID = 'upload-document-form';
const emptyForm = { leadId: '', propertyId: '', documentType: 'IDENTIFICATION', status: 'PENDING', notes: '' };
const documentTypeOptions = [
  { value: 'IDENTIFICATION', label: 'Identificación' },
  { value: 'PROOF_OF_ADDRESS', label: 'Comprobante de domicilio' },
  { value: 'PROOF_OF_INCOME', label: 'Comprobante de ingresos' },
  { value: 'CONTRACT', label: 'Contrato' },
  { value: 'PROPERTY_DEED', label: 'Escritura' },
  { value: 'OTHER', label: 'Otro' }
];
const statusOptions = [
  { value: 'PENDING', label: 'Pendiente' },
  { value: 'RECEIVED', label: 'Recibido' },
  { value: 'VALIDATED', label: 'Validado' },
  { value: 'REJECTED', label: 'Rechazado' }
];
const validExtensions = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
const validMimeTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/jpg',
  'image/png'
];
const MAX_SIZE = 8 * 1024 * 1024;

function sizeLabel(size?: number) {
  if (!size) return '-';
  return size > 1024 * 1024 ? `${(size / 1024 / 1024).toFixed(1)} MB` : `${Math.ceil(size / 1024)} KB`;
}

export function UploadDocumentModal({ isOpen, onClose, onDocumentUploaded, leads, properties, restrictions }: Props) {
  const [file, setFile] = useState<File>();
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!restrictions.canCreate) {
      setUpgradeModalOpen(true);
      return;
    }
    if (!file) {
      toast.error('Por favor selecciona un archivo');
      return;
    }

    setSaving(true);
    try {
      const created = await uploadDocument({
        ...form,
        leadId: form.leadId || undefined,
        propertyId: form.propertyId || undefined,
        file
      });
      onDocumentUploaded(created);
      reset();
      toast.success('Documento guardado correctamente');
      onClose();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No fue posible subir el documento.');
    } finally {
      setSaving(false);
    }
  }

  function handleDragOver(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile) validateAndSetFile(droppedFile);
  }

  function validateAndSetFile(candidate: File) {
    const extension = '.' + candidate.name.split('.').pop()?.toLowerCase();
    if (!validExtensions.includes(extension) && !validMimeTypes.includes(candidate.type)) {
      toast.error('Tipo de archivo no válido. Solo PDF, DOC, DOCX, JPG, JPEG, PNG.');
      return;
    }
    if (candidate.size > MAX_SIZE) {
      toast.error('El archivo es demasiado grande. Máximo 8 MB.');
      return;
    }
    setFile(candidate);
  }

  function reset() {
    setFile(undefined);
    setForm(emptyForm);
    formRef.current?.reset();
  }

  function handleClose() {
    reset();
    onClose();
  }

  const dropTone = isDragging ? 'primary' : file ? 'success' : 'idle';

  return (
    <>
      <Modal
        footer={
          <>
            <Button onClick={handleClose} variant="tertiary">Cancelar</Button>
            <Button form={FORM_ID} loading={saving} type="submit">{saving ? 'Subiendo...' : 'Guardar documento'}</Button>
          </>
        }
        isOpen={isOpen}
        maxWidth="3xl"
        onClose={handleClose}
        subtitle="Máximo 8 MB por archivo"
        title="Subir documento"
      >
        <form id={FORM_ID} onSubmit={submit} ref={formRef}>
          <label
            className={cn(
              'group mb-5 flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-9 text-center transition',
              'has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary',
              dropTone === 'primary' && 'border-primary bg-primary-soft',
              dropTone === 'success' && 'border-success-line bg-success-soft',
              dropTone === 'idle' && 'border-border-strong bg-surface-muted hover:border-primary hover:bg-primary-soft',
            )}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <span className={cn(
              'grid size-12 place-items-center rounded-xl transition',
              dropTone === 'primary' && 'bg-primary-muted text-primary-fg',
              dropTone === 'success' && 'bg-success-muted text-success-fg',
              dropTone === 'idle' && 'bg-surface-sunken text-fg-subtle group-hover:bg-primary-muted group-hover:text-primary-fg',
            )}>
              <svg aria-hidden="true" className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </span>
            <span>
              <span className={cn('block text-sm font-semibold', file ? 'text-success-fg' : 'text-fg')}>
                {isDragging ? 'Suelta el archivo aquí' : file ? file.name : 'Arrastra un archivo o haz clic para seleccionar'}
              </span>
              <span className="mt-1 block text-xs text-fg-subtle">
                {file ? `${sizeLabel(file.size)} · Listo para subir` : 'PDF, DOC, DOCX, JPG, JPEG, PNG · Máximo 8 MB'}
              </span>
            </span>
            <input
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png"
              className="sr-only"
              onChange={e => {
                const selectedFile = e.target.files?.[0];
                if (selectedFile) validateAndSetFile(selectedFile);
              }}
              type="file"
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <Select label="Tipo" onChange={e => setForm({ ...form, documentType: e.target.value })} options={documentTypeOptions} value={form.documentType} />
            <Select label="Estado" onChange={e => setForm({ ...form, status: e.target.value })} options={statusOptions} value={form.status} />
            <Select
              label="Prospecto"
              onChange={e => setForm({ ...form, leadId: e.target.value })}
              options={leads.map(lead => ({ value: lead.id, label: `${lead.firstName} ${lead.lastName}` }))}
              placeholder="Sin prospecto"
              value={form.leadId}
            />
            <Select
              label="Propiedad"
              onChange={e => setForm({ ...form, propertyId: e.target.value })}
              options={properties.map(property => ({ value: property.id, label: `${property.code} · ${property.title}` }))}
              placeholder="Sin propiedad"
              value={form.propertyId}
            />
            <Input containerClassName="md:col-span-2" label="Notas" onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Observaciones adicionales..." value={form.notes} />
          </div>
        </form>
      </Modal>

      <UpgradeModal
        feature="subir nuevos documentos"
        isOpen={upgradeModalOpen}
        level={restrictions.level === 'BLOCKED' ? 'BLOCKED' : 'LIMITED'}
        onClose={() => setUpgradeModalOpen(false)}
      />
    </>
  );
}
