import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import toast from 'react-hot-toast';
import { LeadItem } from '../../leads';
import { ApiProperty } from '../../properties';
import { deleteStoredDocument as deleteDocument, storedDocumentDownloadUrl as documentDownloadUrl, listStoredDocuments as listDocuments, StoredDocument } from '../api/storedDocumentsApi';
import { loadOperationsContext } from '../../../shared/operationsContext';
import { DocumentPreviewModal } from '../components/DocumentPreviewModal';
import { UploadDocumentModal } from '../components/UploadDocumentModal';
import { ExportButton } from '../../../shared/ExportButton';
import { exportToExcel, formatDate } from '../../../shared/excelExport';
import { SubscriptionRestrictions } from '../../../shared/subscriptionRestrictions';
import { ConfirmModal } from '../../../shared/ConfirmModal';
import { Icon } from '../../../shared/Icon';
import { Badge, BadgeVariant, Button, buttonClasses, Card, EmptyState, PageHeader, SearchInput, Select } from '../../../shared/ui';

const documentTypeOptions = [
  { value: 'IDENTIFICATION', label: 'Identificación' },
  { value: 'PROOF_OF_ADDRESS', label: 'Comprobante de domicilio' },
  { value: 'PROOF_OF_INCOME', label: 'Comprobante de ingresos' },
  { value: 'CONTRACT', label: 'Contrato' },
  { value: 'PROPERTY_DEED', label: 'Escritura' },
  { value: 'OTHER', label: 'Otro' }
];
const documentTypeLabels: Record<string, string> = Object.fromEntries(documentTypeOptions.map(option => [option.value, option.label]));
const documentStatusOptions = [
  { value: 'PENDING', label: 'Pendiente' },
  { value: 'RECEIVED', label: 'Recibido' },
  { value: 'VALIDATED', label: 'Validado' },
  { value: 'REJECTED', label: 'Rechazado' }
];
const documentStatusStyles: Record<string, { label: string; variant: BadgeVariant }> = {
  PENDING: { label: 'Pendiente', variant: 'warning' },
  RECEIVED: { label: 'Recibido', variant: 'info' },
  VALIDATED: { label: 'Validado', variant: 'info' },
  APPROVED: { label: 'Aprobado', variant: 'success' },
  REJECTED: { label: 'Rechazado', variant: 'error' }
};
const entityOptions = [
  { value: 'ALL', label: 'Cualquier relación' },
  { value: 'LEAD', label: 'Prospectos' },
  { value: 'PROPERTY', label: 'Propiedades' },
  { value: 'NONE', label: 'Sin vincular' }
];

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
  const [documentToDelete, setDocumentToDelete] = useState<StoredDocument | null>(null);
  const [deleting, setDeleting] = useState(false);

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

  async function confirmRemove() {
    if (!documentToDelete) return;
    setDeleting(true);
    try {
      await deleteDocument(documentToDelete.id);
      setDocuments(current => current.filter(item => item.id !== documentToDelete.id));
      toast.success('Documento eliminado.');
      setDocumentToDelete(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No fue posible eliminar el documento.');
    } finally {
      setDeleting(false);
    }
  }

  const hasFilters = Boolean(searchQuery) || typeFilter !== 'ALL' || statusFilter !== 'ALL' || entityFilter !== 'ALL';

  function clearFilters() {
    setSearchQuery('');
    setTypeFilter('ALL');
    setStatusFilter('ALL');
    setEntityFilter('ALL');
  }

  return (
    <>
      {previewDocument && <DocumentPreviewModal document={previewDocument} onClose={() => setPreviewDocument(undefined)} />}

      <UploadDocumentModal
        isOpen={uploadModalOpen}
        leads={leads}
        onClose={() => setUploadModalOpen(false)}
        onDocumentUploaded={handleDocumentUploaded}
        properties={properties}
        restrictions={restrictions}
      />

      <PageHeader
        actions={
          <>
            {documents.length > 0 && <ExportButton onExport={handleExport} variant="secondary" />}
            <Button icon={<Icon className="size-4" name="plus" />} onClick={() => setUploadModalOpen(true)}>Subir documento</Button>
          </>
        }
        badge={{ value: documents.length, label: 'documentos' }}
        subtitle="Gestiona archivos relacionados con prospectos y propiedades"
        title="Documentos"
      />

      {documents.length > 0 && (
        <Card className="mb-6 space-y-4 p-4 sm:p-5">
          <div className="grid gap-3">
            <SearchInput
              aria-label="Buscar documentos"
              
              onChange={e => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery('')}
              placeholder="Buscar por nombre de archivo..."
              value={searchQuery}
            />
            <div className="grid gap-3 sm:grid-cols-3">
              <Select aria-label="Tipo de documento" onChange={e => setTypeFilter(e.target.value)} options={[{ value: 'ALL', label: 'Todos los tipos' }, ...documentTypeOptions]} value={typeFilter} />
              <Select aria-label="Estado" onChange={e => setStatusFilter(e.target.value)} options={[{ value: 'ALL', label: 'Todos los estados' }, ...documentStatusOptions]} value={statusFilter} />
              <Select aria-label="Relacionado con" onChange={e => setEntityFilter(e.target.value)} options={entityOptions} value={entityFilter} />
            </div>
          </div>
          {hasFilters && (
            <div className="flex items-center justify-between gap-3 border-t border-border pt-3 text-sm">
              <span className="text-fg-subtle">
                <strong className="font-semibold text-fg">{filteredDocuments.length}</strong> {filteredDocuments.length === 1 ? 'documento encontrado' : 'documentos encontrados'}
              </span>
              <Button onClick={clearFilters} size="sm" variant="ghost">Limpiar filtros</Button>
            </div>
          )}
        </Card>
      )}

      {documents.length === 0 && (
        <Card className="border-dashed">
          <EmptyState
            actionLabel="Subir documento"
            description="Guarda identificaciones, comprobantes y contratos vinculados a tus prospectos y propiedades."
            icon={<Icon name="document" />}
            onAction={() => setUploadModalOpen(true)}
            title="No hay documentos guardados"
          />
        </Card>
      )}

      {documents.length > 0 && filteredDocuments.length === 0 && (
        <EmptyState
          actions={<Button onClick={clearFilters} variant="tertiary">Limpiar filtros</Button>}
          description="Intenta ajustar los filtros de búsqueda."
          title="No se encontraron documentos"
        />
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredDocuments.map(item => {
          const status = documentStatusStyles[item.status] ?? documentStatusStyles.PENDING;
          return (
            <Card className="flex flex-col" key={item.id} noPadding>
              <div className="flex items-start gap-3.5 p-5">
                <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary-fg">
                  <Icon className="size-5" name="document" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="truncate text-sm font-semibold text-fg" title={item.fileName}>{item.fileName}</h3>
                    <span className="shrink-0 text-xs text-fg-subtle">{sizeLabel(item.fileSize)}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <Badge variant="primary">{documentTypeLabels[item.documentType] ?? item.documentType}</Badge>
                    <Badge dot variant={status.variant}>{status.label}</Badge>
                  </div>
                  <p className="mt-2 text-xs text-fg-subtle">
                    {new Date(item.createdAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>

              {(item.leadName || item.propertyTitle || item.notes) && (
                <div className="space-y-1 border-t border-border bg-surface-muted px-5 py-2.5 text-xs">
                  {(item.leadName || item.propertyTitle) && (
                    <p className="truncate text-fg-subtle">Relacionado con <span className="font-medium text-fg">{item.leadName || item.propertyTitle}</span></p>
                  )}
                  {item.notes && <p className="line-clamp-1 text-fg-muted">{item.notes}</p>}
                </div>
              )}

              <div className="mt-auto flex gap-2 border-t border-border p-3">
                <Button className="flex-1" onClick={() => setPreviewDocument(item)} size="sm" variant="secondary">Vista previa</Button>
                <a className={buttonClasses({ variant: 'tertiary', size: 'sm', className: 'flex-1' })} href={documentDownloadUrl(item.id)}>Descargar</a>
                <Button aria-label={`Eliminar ${item.fileName}`} onClick={() => setDocumentToDelete(item)} size="sm" variant="danger-ghost">
                  <svg aria-hidden="true" className="size-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      <ConfirmModal
        isOpen={documentToDelete !== null}
        loading={deleting}
        message={<>Se eliminará <strong className="text-fg">{documentToDelete?.fileName}</strong>. Esta acción no se puede deshacer.</>}
        onCancel={() => setDocumentToDelete(null)}
        onConfirm={confirmRemove}
        title="¿Eliminar documento?"
      />
    </>
  );
}
