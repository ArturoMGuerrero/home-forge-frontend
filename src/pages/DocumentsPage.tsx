import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import toast from 'react-hot-toast';
import { LeadItem } from '../shared/leads';
import { ApiProperty } from '../shared/propertyApi';
import { deleteDocument, documentDownloadUrl, listDocuments, loadOperationsContext, StoredDocument } from '../shared/operationsApi';
import { DocumentPreviewModal } from '../components/DocumentPreviewModal';
import { UploadDocumentModal } from '../components/UploadDocumentModal';
import { ExportButton } from '../shared/ExportButton';
import { exportToExcel, formatDate } from '../shared/excelExport';
import { SubscriptionRestrictions } from '../shared/subscriptionRestrictions';
import { PageHeader } from '../shared/ui/PageHeader';

function sizeLabel(size?: number) {
  if (!size) return '-';
  return size > 1024 * 1024 ? `${(size / 1024 / 1024).toFixed(1)} MB` : `${Math.ceil(size / 1024)} KB`;
}

export function DocumentsPage() {
  const context = useOutletContext<{ restrictions: SubscriptionRestrictions }>();
  const restrictions = context?.restrictions || { canCreate: true, canExport: true, level: 'NONE' };
  const [documents, setDocuments] = useState<StoredDocument[]>([]);
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [properties, setProperties] = useState<ApiProperty[]>([]);
  const [previewDocument, setPreviewDocument] = useState<StoredDocument>();
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [entityFilter, setEntityFilter] = useState<string>('ALL');

  useEffect(() => { Promise.all([listDocuments(), loadOperationsContext()]).then(([items, [leadItems, propertyItems]]) => { setDocuments(items); setLeads(leadItems); setProperties(propertyItems); }).catch(e => toast.error(e.message)); }, []);

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
    if (!restrictions.canExport) {
      toast.error('Esta funcionalidad requiere un plan superior');
      return;
    }
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

  function handleDocumentUploaded(doc: StoredDocument) {
    setDocuments(current => [doc, ...current]);
  }

  async function remove(id: string) {
    await deleteDocument(id);
    setDocuments(current => current.filter(item => item.id !== id));
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {previewDocument && <DocumentPreviewModal document={previewDocument} onClose={() => setPreviewDocument(undefined)} />}

      <UploadDocumentModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onDocumentUploaded={handleDocumentUploaded}
        leads={leads}
        properties={properties}
        restrictions={restrictions}
      />

      <PageHeader
        title="Documentos"
        subtitle="Gestiona archivos relacionados con prospectos y propiedades"
        badge={{ value: documents.length, label: 'documentos' }}
        actions={
          <div className="flex gap-3">
            {documents.length > 0 && <ExportButton onExport={handleExport} variant="secondary" />}
            <button
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-900/20 transition hover:shadow-xl hover:shadow-indigo-900/30"
              onClick={() => setUploadModalOpen(true)}
            >
              <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Subir documento
            </button>
          </div>
        }
      />

      <div className="p-4 lg:p-6">
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

        <div className="space-y-3">
        {filteredDocuments.map(item => (
          <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-500/10" key={item.id}>
            {/* Header */}
            <div className="flex items-start gap-4 border-b border-slate-100 bg-gradient-to-br from-slate-50 to-white p-5">
              {/* Icono del documento */}
              <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30 ring-4 ring-indigo-50">
                <svg className="size-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>

              {/* Información del documento */}
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition">
                      {item.fileName}
                    </h3>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-800">
                        <svg className="size-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                        </svg>
                        {item.documentType}
                      </span>
                      <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold ${
                        item.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                        item.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' :
                        item.status === 'VALIDATED' ? 'bg-cyan-100 text-cyan-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        <span className="size-1.5 rounded-full bg-current opacity-75"></span>
                        {item.status === 'APPROVED' ? 'Aprobado' :
                         item.status === 'REJECTED' ? 'Rechazado' :
                         item.status === 'VALIDATED' ? 'Validado' :
                         item.status === 'RECEIVED' ? 'Recibido' : 'Pendiente'}
                      </span>
                      <span className="text-xs text-slate-500">
                        {new Date(item.createdAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-sm font-bold text-slate-600">{sizeLabel(item.fileSize)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Relacionado con */}
            {(item.leadName || item.propertyTitle) && (
              <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-3">
                <div className="flex items-center gap-2 text-sm">
                  <svg className="size-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  <span className="text-slate-600">Relacionado con:</span>
                  <span className="font-semibold text-slate-900">{item.leadName || item.propertyTitle}</span>
                </div>
              </div>
            )}

            {/* Notas */}
            {item.notes && (
              <div className="border-b border-slate-100 bg-white px-5 py-3">
                <p className="text-sm text-slate-600 line-clamp-2">{item.notes}</p>
              </div>
            )}

            {/* Acciones */}
            <div className="flex flex-wrap gap-2 bg-slate-50/50 px-5 py-4">
              <button
                className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100 hover:border-indigo-300"
                onClick={() => setPreviewDocument(item)}
              >
                <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Vista previa
              </button>
              <a
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:border-slate-300"
                href={documentDownloadUrl(item.id)}
              >
                <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Descargar
              </a>
              <button
                className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 hover:border-rose-300"
                onClick={() => remove(item.id)}
              >
                <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Eliminar
              </button>
            </div>
          </article>
        ))}

        {/* Estado vacío */}
        {documents.length === 0 && filteredDocuments.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 py-16">
            <div className="rounded-full bg-indigo-100 p-4">
              <svg className="size-12 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="mt-4 text-base font-semibold text-slate-700">No hay documentos guardados</p>
            <p className="mt-1 text-sm text-slate-500">Haz clic en "Subir documento" para comenzar</p>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
