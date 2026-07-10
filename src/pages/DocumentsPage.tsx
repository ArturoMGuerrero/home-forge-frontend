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
import { Button } from '../shared/ui';

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
            <Button
              variant="primary"
              onClick={() => setUploadModalOpen(true)}
              icon={
                <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              }
            >
              Subir documento
            </Button>
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

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredDocuments.map(item => (
          <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-500/10 flex flex-col" key={item.id}>
            {/* Header */}
            <div className="flex items-start gap-4 p-5">
              {/* Icono del documento */}
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <svg className="size-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>

              {/* Información del documento */}
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-base font-bold text-slate-900 group-hover:text-indigo-600 transition">
                      {item.fileName}
                    </h3>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 border border-indigo-200 px-2.5 py-0.5 text-xs font-bold text-indigo-700">
                        {item.documentType}
                      </span>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        item.status === 'APPROVED' ? 'bg-emerald-100 border border-emerald-200 text-emerald-700' :
                        item.status === 'REJECTED' ? 'bg-rose-100 border border-rose-200 text-rose-700' :
                        item.status === 'VALIDATED' ? 'bg-cyan-100 border border-cyan-200 text-cyan-700' :
                        item.status === 'RECEIVED' ? 'bg-blue-100 border border-blue-200 text-blue-700' :
                        'bg-amber-100 border border-amber-200 text-amber-700'
                      }`}>
                        {item.status === 'APPROVED' ? 'Aprobado' :
                         item.status === 'REJECTED' ? 'Rechazado' :
                         item.status === 'VALIDATED' ? 'Validado' :
                         item.status === 'RECEIVED' ? 'Recibido' : 'Pendiente'}
                      </span>
                      <span className="text-xs font-medium text-slate-500">
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
              <div className="border-t border-slate-100 bg-slate-50 px-5 py-2">
                <div className="flex items-center gap-2 text-xs">
                  <svg className="size-3.5 text-indigo-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  <span className="text-slate-600 font-medium">Relacionado con:</span>
                  <span className="font-bold text-slate-900 truncate">{item.leadName || item.propertyTitle}</span>
                </div>
              </div>
            )}

            {/* Notas */}
            {item.notes && (
              <div className="border-t border-slate-100 bg-white px-5 py-2">
                <p className="text-xs text-slate-600 line-clamp-1">{item.notes}</p>
              </div>
            )}

            {/* Acciones */}
            <div className="flex flex-col gap-2 border-t border-slate-100 bg-white px-5 py-3 mt-auto">
              <button
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-sm shadow-indigo-600/30 transition-all hover:bg-indigo-700 hover:shadow-md hover:shadow-indigo-600/40"
                onClick={() => setPreviewDocument(item)}
              >
                <svg className="size-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Vista previa
              </button>
              <a
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-all hover:bg-slate-50 hover:border-slate-300"
                href={documentDownloadUrl(item.id)}
              >
                <svg className="size-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Descargar
              </a>
              <button
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border-2 border-rose-200 bg-white px-3 py-2 text-xs font-semibold text-rose-600 transition-all hover:bg-rose-50 hover:border-rose-300"
                onClick={() => remove(item.id)}
              >
                <svg className="size-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
