import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DocumentTemplate,
  documentTypeLabels,
  listDocumentTemplates,
  toggleTemplateActive
} from '../shared/documents';
import { PageHeader } from '../shared/ui/PageHeader';
import { Button, Spinner, Checkbox } from '../shared/ui';

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInactive, setShowInactive] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  async function loadTemplates() {
    try {
      const data = await listDocumentTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleActive(templateId: string) {
    try {
      const updated = await toggleTemplateActive(templateId);
      setTemplates(prev => prev.map(t => t.id === templateId ? updated : t));
    } catch (error) {
      console.error('Error toggling template:', error);
      alert('Error al cambiar estado de la plantilla');
    }
  }

  const filteredTemplates = showInactive
    ? templates
    : templates.filter(t => t.active);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <PageHeader
        title="Plantillas de Documentos"
        subtitle="Crea y gestiona plantillas reutilizables con variables dinámicas"
        backLink={{ to: '/app/contratos', label: 'Volver a Contratos' }}
        badge={{ value: templates.filter(t => t.active).length, label: 'activas' }}
        actions={
          <Button
            as={Link}
            to="/app/contratos/plantillas/nueva"
            variant="primary"
            icon={
              <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            }
          >
            Nueva Plantilla
          </Button>
        }
      />

      <div className="p-4 lg:p-6">
        <div className="mb-4 flex items-center gap-2">
          <Checkbox
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
            label="Mostrar inactivas"
          />
        </div>

        {filteredTemplates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="rounded-full bg-slate-100 p-6 mb-4">
              <svg className="size-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-slate-600 font-medium">No hay plantillas {!showInactive && 'activas'}</p>
            <p className="text-sm text-slate-500 mt-1">Crea tu primera plantilla con variables dinámicas</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredTemplates.map(template => (
              <div
                key={template.id}
                className={`bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg transition-all ${
                  !template.active ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-slate-900">{template.name}</h3>
                      {template.isDefault && (
                        <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Por defecto
                        </span>
                      )}
                      {!template.active && (
                        <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          Inactiva
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">{documentTypeLabels[template.documentType]}</p>
                    {template.description && (
                      <p className="text-sm text-slate-600 mt-2">{template.description}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4">
                  <Button
                    as={Link}
                    to={`/app/contratos/plantillas/${template.id}`}
                    variant="primary"
                    size="sm"
                  >
                    Ver/Editar
                  </Button>
                  <Button
                    onClick={() => handleToggleActive(template.id)}
                    variant="secondary"
                    size="sm"
                  >
                    {template.active ? 'Desactivar' : 'Activar'}
                  </Button>
                  <span className="ml-auto text-xs text-slate-500">
                    v{template.version}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
