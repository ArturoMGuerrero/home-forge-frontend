import { DragEvent, FormEvent, useEffect, useRef, useState } from 'react';
import { LeadItem } from '../shared/leads';
import { ApiProperty } from '../shared/propertyApi';
import { deleteDocument, documentDownloadUrl, listDocuments, loadOperationsContext, StoredDocument, uploadDocument } from '../shared/operationsApi';
import { DocumentPreviewModal } from '../components/DocumentPreviewModal';
import { ExportButton } from '../shared/ExportButton';
import { exportToExcel, formatDate } from '../shared/excelExport';

function sizeLabel(size?: number) {
  if (!size) return '-';
  return size > 1024 * 1024 ? `${(size / 1024 / 1024).toFixed(1)} MB` : `${Math.ceil(size / 1024)} KB`;
}

export function DocumentsPage() {
  const [documents, setDocuments] = useState<StoredDocument[]>([]);
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [properties, setProperties] = useState<ApiProperty[]>([]);
  const [file, setFile] = useState<File>();
  const [form, setForm] = useState({ leadId: '', propertyId: '', documentType: 'IDENTIFICATION', status: 'PENDING', notes: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<StoredDocument>();
  const formRef = useRef<HTMLFormElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [entityFilter, setEntityFilter] = useState<string>('ALL');

  useEffect(() => { Promise.all([listDocuments(), loadOperationsContext()]).then(([items, [leadItems, propertyItems]]) => { setDocuments(items); setLeads(leadItems); setProperties(propertyItems); }).catch(e => setError(e.message)); }, []);

  const filteredDocuments = documents.filter(doc => {
    // Búsqueda por nombre
    if (searchQuery && !doc.fileName.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Filtro por tipo
    if (typeFilter !== 'ALL' && doc.documentType !== typeFilter) return false;

    // Filtro por estado
    if (statusFilter !== 'ALL' && doc.status !== statusFilter) return false;

    // Filtro por entidad (prospecto/propiedad)
    if (entityFilter !== 'ALL') {
      if (entityFilter === 'LEAD' && !doc.leadName) return false;
      if (entityFilter === 'PROPERTY' && !doc.propertyTitle) return false;
      if (entityFilter === 'NONE' && (doc.leadName || doc.propertyTitle)) return false;
    }

    return true;
  });

  function handleExport() {
    const statusLabels: Record<string, string> = { PENDING: 'Pendiente', APPROVED: 'Aprobado', REJECTED: 'Rechazado' };
    exportToExcel(
      filteredDocuments,
      [
        { header: 'Nombre del archivo', key: 'fileName', width: 35 },
        { header: 'Tipo', key: 'documentType', width: 20 },
        { header: 'Estado', key: item => statusLabels[item.status] || item.status, width: 15 },
        { header: 'Prospecto', key: 'leadName', width: 25 },
        { header: 'Propiedad', key: 'propertyTitle', width: 30 },
        { header: 'Tamaño', key: item => sizeLabel(item.fileSize), width: 12 },
        { header: 'Fecha de subida', key: item => formatDate(item.createdAt), width: 18 },
        { header: 'Notas', key: 'notes', width: 40 }
      ],
      'documentos-homeforge',
      'Documentos'
    );
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!file) return;
    setSaving(true);
    setError('');
    try {
      const created = await uploadDocument({ ...form, leadId: form.leadId || undefined, propertyId: form.propertyId || undefined, file });
      setDocuments(current => [created, ...current]);
      setFile(undefined);
      setForm({ leadId: '', propertyId: '', documentType: 'IDENTIFICATION', status: 'PENDING', notes: '' });
      formRef.current?.reset();
    } catch (e) { setError(e instanceof Error ? e.message : 'No fue posible subir el documento.'); } finally { setSaving(false); }
  }

  async function remove(id: string) {
    await deleteDocument(id);
    setDocuments(current => current.filter(item => item.id !== id));
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
      const validTypes = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
      const extension = '.' + droppedFile.name.split('.').pop()?.toLowerCase();
      if (validTypes.includes(extension)) {
        setFile(droppedFile);
        setError('');
      } else {
        setError('Tipo de archivo no válido. Solo PDF, DOC, DOCX, JPG, JPEG, PNG.');
      }
    }
  }

  return <>{previewDocument && <DocumentPreviewModal document={previewDocument} onClose={() => setPreviewDocument(undefined)} />}<header className="mb-8 flex items-end justify-between gap-4"><div><p className="text-[11px] font-bold uppercase tracking-[.16em] text-indigo-600">Expedientes</p><h1 className="mt-1 text-3xl font-bold">Documentos</h1><p className="mt-2 text-sm text-slate-500">Guarda archivos relacionados con prospectos y propiedades. Máximo 8 MB por archivo.</p></div>{documents.length > 0 && <ExportButton onExport={handleExport} variant="secondary" />}</header>{error && <p className="mb-5 rounded-xl bg-rose-50 p-4 text-sm font-semibold text-rose-700">{error}</p>}

  {/* Búsqueda y Filtros */}
  {documents.length > 0 && (
    <div className="mb-6 space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      {/* Búsqueda */}
      <div className="relative">
        <svg className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          className="w-full rounded-xl border border-slate-200 py-2.5 pl-11 pr-4 text-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Buscar por nombre de archivo..."
          type="text"
          value={searchQuery}
        />
        {searchQuery && (
          <button
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            onClick={() => setSearchQuery('')}
            type="button"
          >
            <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="grid gap-3 sm:grid-cols-3">
        {/* Filtro por Tipo */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-600">Tipo de documento</label>
          <select
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            onChange={e => setTypeFilter(e.target.value)}
            value={typeFilter}
          >
            <option value="ALL">Todos</option>
            <option value="IDENTIFICATION">Identificación</option>
            <option value="PROOF_OF_ADDRESS">Comprobante de domicilio</option>
            <option value="PROOF_OF_INCOME">Comprobante de ingresos</option>
            <option value="CONTRACT">Contrato</option>
            <option value="PROPERTY_DEED">Escritura</option>
            <option value="OTHER">Otro</option>
          </select>
        </div>

        {/* Filtro por Estado */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-600">Estado</label>
          <select
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            onChange={e => setStatusFilter(e.target.value)}
            value={statusFilter}
          >
            <option value="ALL">Todos</option>
            <option value="PENDING">Pendiente</option>
            <option value="RECEIVED">Recibido</option>
            <option value="VALIDATED">Validado</option>
            <option value="REJECTED">Rechazado</option>
          </select>
        </div>

        {/* Filtro por Entidad */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-600">Relacionado con</label>
          <select
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            onChange={e => setEntityFilter(e.target.value)}
            value={entityFilter}
          >
            <option value="ALL">Todos</option>
            <option value="LEAD">Prospectos</option>
            <option value="PROPERTY">Propiedades</option>
            <option value="NONE">Sin vincular</option>
          </select>
        </div>
      </div>

      {/* Contador de resultados */}
      {(searchQuery || typeFilter !== 'ALL' || statusFilter !== 'ALL' || entityFilter !== 'ALL') && (
        <div className="flex items-center justify-between rounded-lg bg-indigo-50 px-4 py-2.5 text-xs">
          <span className="font-medium text-indigo-900">
            {filteredDocuments.length} {filteredDocuments.length === 1 ? 'documento encontrado' : 'documentos encontrados'}
          </span>
          <button
            className="font-semibold text-indigo-600 transition hover:text-indigo-700"
            onClick={() => {
              setSearchQuery('');
              setTypeFilter('ALL');
              setStatusFilter('ALL');
              setEntityFilter('ALL');
            }}
            type="button"
          >
            Limpiar filtros
          </button>
        </div>
      )}
    </div>
  )}

  <form ref={formRef} className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" onSubmit={submit}><div className="mb-5"><label
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
    <input accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" className="sr-only" onChange={e => setFile(e.target.files?.[0])} required type="file" />
  </label></div><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"><label className="grid gap-2 text-sm font-semibold text-slate-700">Tipo<select className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-normal outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" onChange={e => setForm({ ...form, documentType: e.target.value })} value={form.documentType}><option value="IDENTIFICATION">Identificación</option><option value="PROOF_OF_ADDRESS">Comprobante de domicilio</option><option value="PROOF_OF_INCOME">Comprobante de ingresos</option><option value="CONTRACT">Contrato</option><option value="PROPERTY_DEED">Escritura</option><option value="OTHER">Otro</option></select></label><label className="grid gap-2 text-sm font-semibold text-slate-700">Prospecto<select className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-normal outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" onChange={e => setForm({ ...form, leadId: e.target.value })} value={form.leadId}><option value="">Sin prospecto</option>{leads.map(lead => <option key={lead.id} value={lead.id}>{lead.firstName} {lead.lastName}</option>)}</select></label><label className="grid gap-2 text-sm font-semibold text-slate-700">Propiedad<select className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-normal outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" onChange={e => setForm({ ...form, propertyId: e.target.value })} value={form.propertyId}><option value="">Sin propiedad</option>{properties.map(property => <option key={property.id} value={property.id}>{property.code} · {property.title}</option>)}</select></label><label className="grid gap-2 text-sm font-semibold text-slate-700">Estado<select className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-normal outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" onChange={e => setForm({ ...form, status: e.target.value })} value={form.status}><option value="PENDING">Pendiente</option><option value="RECEIVED">Recibido</option><option value="VALIDATED">Validado</option><option value="REJECTED">Rechazado</option></select></label><label className="grid gap-2 text-sm font-semibold text-slate-700 md:col-span-2">Notas<input className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-normal outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Observaciones adicionales..." value={form.notes} /></label></div><button className="mt-4 w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-900/20 transition hover:shadow-xl hover:shadow-indigo-900/30 disabled:opacity-60 disabled:cursor-not-allowed md:w-auto md:px-8" disabled={saving}>{saving ? 'Subiendo documento...' : 'Guardar documento'}</button></form>

  {/* Estado vacío cuando no hay resultados */}
  {filteredDocuments.length === 0 && documents.length > 0 && (
    <div className="py-12 text-center">
      <svg className="mx-auto mb-3 size-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <p className="text-sm font-medium text-slate-600">No se encontraron documentos</p>
      <p className="mt-1 text-xs text-slate-500">Intenta ajustar los filtros de búsqueda</p>
    </div>
  )}

  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="hidden grid-cols-[1.5fr_1fr_1fr_.5fr_auto] gap-4 bg-slate-50 px-5 py-3 text-xs font-bold uppercase text-slate-500 md:grid"><span>Archivo</span><span>Relacionado con</span><span>Tipo</span><span>Tamaño</span><span>Acciones</span></div>{filteredDocuments.map(item => <article className="grid gap-3 border-t border-slate-100 px-5 py-4 first:border-0 md:grid-cols-[1.5fr_1fr_1fr_.5fr_auto] md:items-center" key={item.id}><div><strong className="block truncate text-sm">{item.fileName}</strong><span className="text-xs text-slate-400">{new Date(item.createdAt).toLocaleDateString('es-MX')}</span></div><span className="text-sm text-slate-600">{item.leadName || item.propertyTitle || 'General'}</span><span className="text-sm text-slate-600">{item.documentType}</span><span className="text-sm text-slate-500">{sizeLabel(item.fileSize)}</span><div className="flex gap-2"><button className="rounded-lg bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition" onClick={() => setPreviewDocument(item)}>Vista previa</button><a className="rounded-lg bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition" href={documentDownloadUrl(item.id)}>Descargar</a><button className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition" onClick={() => remove(item.id)}>Eliminar</button></div></article>)}{documents.length === 0 && filteredDocuments.length === 0 && <p className="p-10 text-center text-sm text-slate-500">No hay documentos guardados.</p>}</div></>;
}
