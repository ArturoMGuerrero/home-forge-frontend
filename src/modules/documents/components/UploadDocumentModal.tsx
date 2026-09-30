import { DragEvent, FormEvent, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { LeadItem } from '../../leads';
import { ApiProperty } from '../../properties';
import { uploadStoredDocument as uploadDocument, StoredDocument } from '../api/storedDocumentsApi';
import { SubscriptionRestrictions } from '../../../shared/subscriptionRestrictions';
import { UpgradeModal } from '../../../shared/UpgradeModal';
import { Modal } from '../../../shared/ui/Modal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onDocumentUploaded: (doc: StoredDocument) => void;
  leads: LeadItem[];
  properties: ApiProperty[];
  restrictions: SubscriptionRestrictions;
}

function sizeLabel(size?: number) {
  if (!size) return '-';
  return size > 1024 * 1024 ? `${(size / 1024 / 1024).toFixed(1)} MB` : `${Math.ceil(size / 1024)} KB`;
}

export function UploadDocumentModal({ isOpen, onClose, onDocumentUploaded, leads, properties, restrictions }: Props) {
  const [file, setFile] = useState<File>();
  const [form, setForm] = useState({ leadId: '', propertyId: '', documentType: 'IDENTIFICATION', status: 'PENDING', notes: '' });
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

    console.log('Iniciando subida de documento:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      documentType: form.documentType,
      status: form.status,
      leadId: form.leadId || undefined,
      propertyId: form.propertyId || undefined,
      notes: form.notes
    });

    setSaving(true);
    try {
      const created = await uploadDocument({
        ...form,
        leadId: form.leadId || undefined,
        propertyId: form.propertyId || undefined,
        file
      });

      console.log('Documento subido exitosamente:', created);

      onDocumentUploaded(created);
      setFile(undefined);
      setForm({ leadId: '', propertyId: '', documentType: 'IDENTIFICATION', status: 'PENDING', notes: '' });
      formRef.current?.reset();
      toast.success('Documento guardado correctamente');
      onClose();
    } catch (e) {
      console.error('Error al subir documento:', e);
      const errorMessage = e instanceof Error ? e.message : 'No fue posible subir el documento.';
      toast.error(errorMessage);
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
    if (droppedFile) {
      validateAndSetFile(droppedFile);
    }
  }

  function validateAndSetFile(file: File) {
    const validTypes = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
    const validMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/jpg',
      'image/png'
    ];
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    const maxSize = 8 * 1024 * 1024; // 8 MB

    if (!validTypes.includes(extension) && !validMimeTypes.includes(file.type)) {
      toast.error('Tipo de archivo no válido. Solo PDF, DOC, DOCX, JPG, JPEG, PNG.');
      return;
    }

    if (file.size > maxSize) {
      toast.error('El archivo es demasiado grande. Máximo 8 MB.');
      return;
    }

    console.log('Archivo válido:', {
      name: file.name,
      type: file.type,
      size: file.size,
      extension
    });

    setFile(file);
  }

  function handleClose() {
    setFile(undefined);
    setForm({ leadId: '', propertyId: '', documentType: 'IDENTIFICATION', status: 'PENDING', notes: '' });
    formRef.current?.reset();
    onClose();
  }

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title="Subir documento"
        subtitle="Máximo 8 MB por archivo"
        maxWidth="3xl"
      >
        <form ref={formRef} onSubmit={submit}>
            {/* Área de carga */}
            <div className="mb-5">
              <label
                className={`group relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-all ${
                  isDragging
                    ? 'border-primary bg-primary-muted scale-[1.02]'
                    : file
                    ? 'border-success bg-success-soft'
                    : 'border-border-strong bg-surface-muted hover:border-primary hover:bg-primary-soft'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className={`rounded-full p-4 transition-all ${isDragging ? 'bg-primary-muted' : file ? 'bg-success-muted' : 'bg-surface-strong group-hover:bg-primary-muted'}`}>
                  <svg className={`size-8 transition-colors ${isDragging ? 'text-primary-fg' : file ? 'text-success-fg' : 'text-fg-subtle group-hover:text-primary-fg'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p className={`text-sm font-semibold transition-colors ${isDragging ? 'text-primary-fg' : file ? 'text-success-fg' : 'text-fg-muted'}`}>
                    {isDragging ? 'Suelta el archivo aquí' : file ? file.name : 'Arrastra un archivo o haz clic para seleccionar'}
                  </p>
                  <p className={`mt-1 text-xs transition-colors ${isDragging ? 'text-primary-fg' : file ? 'text-success-fg' : 'text-fg-subtle'}`}>
                    {file ? `${sizeLabel(file.size)} • Listo para subir` : 'PDF, DOC, DOCX, JPG, JPEG, PNG • Máximo 8MB'}
                  </p>
                </div>
                <input
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png"
                  className="sr-only"
                  onChange={e => {
                    const selectedFile = e.target.files?.[0];
                    if (selectedFile) {
                      validateAndSetFile(selectedFile);
                    }
                  }}
                  type="file"
                />
              </label>
            </div>

            {/* Formulario */}
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold text-fg-muted">
                Tipo
                <select
                  className="w-full rounded-xl border border-border bg-surface px-3.5 py-3 text-sm font-normal outline-none transition focus:border-primary focus:ring-2 focus:ring-primary-line"
                  onChange={e => setForm({ ...form, documentType: e.target.value })}
                  value={form.documentType}
                >
                  <option value="IDENTIFICATION">Identificación</option>
                  <option value="PROOF_OF_ADDRESS">Comprobante de domicilio</option>
                  <option value="PROOF_OF_INCOME">Comprobante de ingresos</option>
                  <option value="CONTRACT">Contrato</option>
                  <option value="PROPERTY_DEED">Escritura</option>
                  <option value="OTHER">Otro</option>
                </select>
              </label>

              <label className="grid gap-2 text-sm font-semibold text-fg-muted">
                Estado
                <select
                  className="w-full rounded-xl border border-border bg-surface px-3.5 py-3 text-sm font-normal outline-none transition focus:border-primary focus:ring-2 focus:ring-primary-line"
                  onChange={e => setForm({ ...form, status: e.target.value })}
                  value={form.status}
                >
                  <option value="PENDING">Pendiente</option>
                  <option value="RECEIVED">Recibido</option>
                  <option value="VALIDATED">Validado</option>
                  <option value="REJECTED">Rechazado</option>
                </select>
              </label>

              <label className="grid gap-2 text-sm font-semibold text-fg-muted">
                Prospecto
                <select
                  className="w-full rounded-xl border border-border bg-surface px-3.5 py-3 text-sm font-normal outline-none transition focus:border-primary focus:ring-2 focus:ring-primary-line"
                  onChange={e => setForm({ ...form, leadId: e.target.value })}
                  value={form.leadId}
                >
                  <option value="">Sin prospecto</option>
                  {leads.map(lead => (
                    <option key={lead.id} value={lead.id}>
                      {lead.firstName} {lead.lastName}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2 text-sm font-semibold text-fg-muted">
                Propiedad
                <select
                  className="w-full rounded-xl border border-border bg-surface px-3.5 py-3 text-sm font-normal outline-none transition focus:border-primary focus:ring-2 focus:ring-primary-line"
                  onChange={e => setForm({ ...form, propertyId: e.target.value })}
                  value={form.propertyId}
                >
                  <option value="">Sin propiedad</option>
                  {properties.map(property => (
                    <option key={property.id} value={property.id}>
                      {property.code} · {property.title}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2 text-sm font-semibold text-fg-muted md:col-span-2">
                Notas
                <input
                  className="w-full rounded-xl border border-border bg-surface px-3.5 py-3 text-sm font-normal outline-none transition placeholder:text-fg-subtle focus:border-primary focus:ring-2 focus:ring-primary-line"
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  placeholder="Observaciones adicionales..."
                  value={form.notes}
                />
              </label>
            </div>

            {/* Footer con botones */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                className="rounded-xl border border-border bg-surface px-6 py-3 text-sm font-semibold text-fg-muted transition hover:bg-surface-muted"
                onClick={handleClose}
                type="button"
              >
                Cancelar
              </button>
              <button
                className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-900/20 transition hover:shadow-xl hover:shadow-indigo-900/30 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={saving}
              >
                {saving ? 'Subiendo...' : 'Guardar documento'}
              </button>
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
