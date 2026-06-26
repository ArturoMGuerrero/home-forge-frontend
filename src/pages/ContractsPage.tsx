import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Document,
  DocumentStatus,
  documentStatusLabels,
  documentTypeLabels,
  listDocuments
} from '../shared/documents';
import { PageHeader } from '../shared/ui/PageHeader';
import { Tabs, Tab } from '../shared/ui/Tabs';

const STATUS_FILTERS: (DocumentStatus | 'ALL')[] = ['ALL', 'DRAFT', 'PENDING_SIGNATURE', 'SIGNED', 'COMPLETED'];

export default function ContractsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<DocumentStatus | 'ALL'>('ALL');

  useEffect(() => {
    loadDocuments();
  }, []);

  async function loadDocuments() {
    try {
      const data = await listDocuments();
      setDocuments(data);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  }

  function getFilteredDocuments() {
    if (activeTab === 'ALL') return documents;
    return documents.filter(d => d.status === activeTab);
  }

  const filteredDocuments = getFilteredDocuments();

  const tabs: Tab[] = STATUS_FILTERS.map(status => ({
    id: status,
    label: status === 'ALL' ? 'Todos' : documentStatusLabels[status],
    count: status === 'ALL' ? documents.length : documents.filter(d => d.status === status).length
  }));

  function getStatusColor(status: DocumentStatus): string {
    switch (status) {
      case 'DRAFT': return 'bg-gray-100 text-gray-800';
      case 'PENDING_SIGNATURE': return 'bg-yellow-100 text-yellow-800';
      case 'PARTIALLY_SIGNED': return 'bg-blue-100 text-blue-800';
      case 'SIGNED': return 'bg-green-100 text-green-800';
      case 'COMPLETED': return 'bg-emerald-100 text-emerald-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      case 'EXPIRED': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-slate-500">Cargando contratos...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <PageHeader
        title="Contratos y Documentos"
        subtitle="Gestiona plantillas, genera contratos y administra firmas electrónicas"
        badge={{ value: documents.length, label: 'documentos' }}
        actions={
          <div className="flex gap-2">
            <Link
              to="/app/contratos/plantillas"
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              📝 Plantillas
            </Link>
            <Link
              to="/app/contratos/nuevo"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
            >
              + Nuevo Contrato
            </Link>
          </div>
        }
      >
        <Tabs tabs={tabs} activeTab={activeTab} onChange={(id) => setActiveTab(id as DocumentStatus | 'ALL')} variant="pills" size="sm" />
      </PageHeader>

      <div className="p-4 lg:p-6">
        {filteredDocuments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="rounded-full bg-slate-100 p-6 mb-4">
              <svg className="size-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-slate-600 font-medium">No hay contratos {activeTab !== 'ALL' && documentStatusLabels[activeTab as DocumentStatus]}</p>
            <p className="text-sm text-slate-500 mt-1">Crea tu primer contrato desde una plantilla</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocuments.map(doc => (
              <Link
                key={doc.id}
                to={`/app/contratos/${doc.id}`}
                className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg hover:border-indigo-300 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="size-10 rounded-lg bg-indigo-100 flex items-center justify-center text-xl">
                      📄
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 truncate">{doc.name}</h3>
                      <p className="text-xs text-slate-500">{documentTypeLabels[doc.documentType]}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                    {documentStatusLabels[doc.status]}
                  </span>
                  <span className="text-xs text-slate-500">
                    {new Date(doc.createdAt).toLocaleDateString('es-MX')}
                  </span>
                </div>

                {doc.version > 1 && (
                  <div className="mt-2 text-xs text-slate-500">
                    Versión {doc.version}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
