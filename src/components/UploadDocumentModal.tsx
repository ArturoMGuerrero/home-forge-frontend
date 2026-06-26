import { DragEvent, FormEvent, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { LeadItem } from '../shared/leads';
import { ApiProperty } from '../shared/propertyApi';
import { uploadDocument, StoredDocument } from '../shared/operationsApi';
import { SubscriptionRestrictions } from '../shared/subscriptionRestrictions';
import { UpgradeModal } from '../shared/UpgradeModal';

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

  if (!isOpen) return null;

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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={handleClose}>
        <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl" onClick={e => e.stopPropagation()}>
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Subir documento</h2>
              <p className="mt-0.5 text-sm text-slate-500">Máximo 8 MB por archivo</p>
            </div>
            <button
              className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              onClick={handleClose}
              type="button"
            >
              <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <form ref={formRef} className="p-6" onSubmit={submit}>
            {/* Área de carga */}
            <div className="mb-5">
              <label
                className={`group relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-all ${
                  isDragging
                    ? 'border-indigo-500 bg-indigo-100 scale-[1.02]'
                    : file
                    ? 'border-green-400 bg-green-50'
                    : 'border-slate-300 bg-slate-50 hover:border-indigo-400 hover:bg-indigo-50'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className={`rounded-full p-4 transition-all ${isDragging ? 'bg-indigo-200' : file ? 'bg-green-200' : 'bg-slate-200 group-hover:bg-indigo-100'}`}>
                  <svg className={`size-8 transition-colors ${isDragging ? 'text-indigo-600' : file ? 'text-green-600' : 'text-slate-400 group-hover:text-indigo-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p className={`text-sm font-semibold transition-colors ${isDragging ? 'text-indigo-700' : file ? 'text-green-700' : 'text-slate-700'}`}>
                    {isDragging ? 'Suelta el archivo aquí' : file ? file.name : 'Arrastra un archivo o haz clic para seleccionar'}
                  </p>
                  <p className={`mt-1 text-xs transition-colors ${isDragging ? 'text-indigo-600' : file ? 'text-green-600' : 'text-slate-500'}`}>
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
              <label className="grid gap-2 text-sm font-semibold text-slate-700">
                Tipo
                <select
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-normal outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
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

              <label className="grid gap-2 text-sm font-semibold text-slate-700">
                Estado
                <select
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-normal outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  onChange={e => setForm({ ...form, status: e.target.value })}
                  value={form.status}
                >
                  <option value="PENDING">Pendiente</option>
                  <option value="RECEIVED">Recibido</option>
                  <option value="VALIDATED">Validado</option>
                  <option value="REJECTED">Rechazado</option>
                </select>
              </label>

              <label className="grid gap-2 text-sm font-semibold text-slate-700">
                Prospecto
                <select
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-normal outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
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

              <label className="grid gap-2 text-sm font-semibold text-slate-700">
                Propiedad
                <select
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-normal outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
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

              <label className="grid gap-2 text-sm font-semibold text-slate-700 md:col-span-2">
                Notas
                <input
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-normal outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  placeholder="Observaciones adicionales..."
                  value={form.notes}
                />
              </label>
            </div>

            {/* Footer con botones */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                onClick={handleClose}
                type="button"
              >
                Cancelar
              </button>
              <button
                className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-900/20 transition hover:shadow-xl hover:shadow-indigo-900/30 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={saving}
              >
                {saving ? 'Subiendo...' : 'Guardar documento'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <UpgradeModal
        feature="subir nuevos documentos"
        isOpen={upgradeModalOpen}
        level={restrictions.level === 'BLOCKED' ? 'BLOCKED' : 'LIMITED'}
        onClose={() => setUpgradeModalOpen(false)}
      />
    </>
  );
}
