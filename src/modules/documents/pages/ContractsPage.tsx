import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Document,
  DocumentStatus,
  documentStatusLabels,
  documentTypeLabels,
  listDocuments
} from '../api/documentsApi';
import { Icon } from '../../../shared/Icon';
import { Badge, BadgeVariant, buttonClasses, Card, cardClass, cn, EmptyState, LoadingState, PageHeader, Tab, Tabs } from '../../../shared/ui';

const STATUS_FILTERS: (DocumentStatus | 'ALL')[] = ['ALL', 'DRAFT', 'PENDING_SIGNATURE', 'SIGNED', 'COMPLETED'];

const statusVariants: Partial<Record<DocumentStatus, BadgeVariant>> = {
  DRAFT: 'neutral',
  PENDING_SIGNATURE: 'warning',
  PARTIALLY_SIGNED: 'info',
  SIGNED: 'success',
  COMPLETED: 'success',
  CANCELLED: 'error',
  EXPIRED: 'warning'
};

export default function ContractsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<DocumentStatus | 'ALL'>('ALL');

  useEffect(() => {
    listDocuments()
      .then(setDocuments)
      .catch(error => toast.error(error instanceof Error ? error.message : 'No fue posible cargar los contratos.'))
      .finally(() => setLoading(false));
  }, []);

  const filteredDocuments = activeTab === 'ALL' ? documents : documents.filter(d => d.status === activeTab);

  const tabs: Tab[] = STATUS_FILTERS.map(status => ({
    id: status,
    label: status === 'ALL' ? 'Todos' : documentStatusLabels[status],
    count: status === 'ALL' ? documents.length : documents.filter(d => d.status === status).length
  }));

  return (
    <>
      <PageHeader
        actions={
          <>
            <Link className={buttonClasses({ variant: 'tertiary' })} to="/app/contratos/plantillas">
              <Icon className="size-4" name="document" />
              Plantillas
            </Link>
            <Link className={buttonClasses()} to="/app/contratos/nuevo">
              <Icon className="size-4" name="plus" />
              Nuevo contrato
            </Link>
          </>
        }
        badge={{ value: documents.length, label: 'documentos' }}
        subtitle="Gestiona plantillas, genera contratos y administra firmas electrónicas."
        title="Contratos"
      >
        <Tabs activeTab={activeTab} onChange={id => setActiveTab(id as DocumentStatus | 'ALL')} tabs={tabs} variant="pills" />
      </PageHeader>

      {loading ? (
        <Card><LoadingState message="Cargando contratos..." /></Card>
      ) : filteredDocuments.length === 0 ? (
        <Card className="border-dashed">
          <EmptyState
            description="Crea tu primer contrato desde una plantilla."
            icon={<Icon name="document" />}
            title={activeTab === 'ALL' ? 'No hay contratos' : `No hay contratos en "${documentStatusLabels[activeTab]}"`}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredDocuments.map(doc => (
            <Link
              className={cn(cardClass, 'block p-5 transition hover:border-primary-line hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary')}
              key={doc.id}
              to={`/app/contratos/${doc.id}`}
            >
              <div className="flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary-fg">
                  <Icon className="size-5" name="document" />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-semibold text-fg">{doc.name}</h3>
                  <p className="text-xs text-fg-subtle">{documentTypeLabels[doc.documentType]}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between gap-3">
                <Badge dot variant={statusVariants[doc.status] ?? 'neutral'}>{documentStatusLabels[doc.status]}</Badge>
                <span className="text-xs text-fg-subtle">
                  {new Date(doc.createdAt).toLocaleDateString('es-MX')}
                  {doc.version > 1 && ` · v${doc.version}`}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
