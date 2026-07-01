import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageTemplate,
  listMessageTemplates,
  toggleTemplateActive,
  notificationTypeLabels,
  templateCategoryLabels
} from '../shared/notifications';
import { PageHeader } from '../shared/ui/PageHeader';

export default function MessageTemplatesPage() {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInactive, setShowInactive] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  async function loadTemplates() {
    try {
      const data = await listMessageTemplates();
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
      setTemplates(prev => prev.map(t => (t.id === templateId ? updated : t)));
    } catch (error) {
      console.error('Error toggling template:', error);
      alert('Error al cambiar estado de la plantilla');
    }
  }

  const filteredTemplates = showInactive ? templates : templates.filter(t => t.active);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-slate-500">Cargando plantillas...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <PageHeader
        title="Plantillas de Mensajes"
        subtitle="Crea plantillas reutilizables para emails, WhatsApp, push y SMS"
        backLink={{ to: '/app/notificaciones', label: 'Volver a Notificaciones' }}
        badge={{ value: templates.filter(t => t.active).length, label: 'activas' }}
        actions={
          <Link
            to="/app/notificaciones/plantillas/nueva"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
          >
            + Nueva Plantilla
          </Link>
        }
      />

      <div className="p-4 lg:p-6">
        <div className="mb-4 flex items-center gap-2">
          <button
            onClick={() => setShowInactive(!showInactive)}
            className="text-sm text-slate-600 hover:text-slate-900"
          >
            {showInactive ? '✓' : '○'} Mostrar inactivas
          </button>
        </div>

        {filteredTemplates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="rounded-full bg-slate-100 p-6 mb-4">
              <svg className="size-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
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

                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                      <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                        {notificationTypeLabels[template.templateType]}
                      </span>
                      {template.category && (
                        <span className="px-2 py-0.5 rounded-full bg-slate-50 text-slate-700">
                          {templateCategoryLabels[template.category]}
                        </span>
                      )}
                    </div>

                    {template.description && (
                      <p className="text-sm text-slate-600 mb-2">{template.description}</p>
                    )}

                    {template.subject && (
                      <div className="text-sm text-slate-600 mb-2">
                        <span className="font-medium">Asunto:</span> {template.subject}
                      </div>
                    )}

                    <div className="text-sm text-slate-600 line-clamp-2 bg-slate-50 p-2 rounded border border-slate-200">
                      {template.content}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4">
                  <Link
                    to={`/app/notificaciones/plantillas/${template.id}`}
                    className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                  >
                    Ver/Editar
                  </Link>
                  <button
                    onClick={() => handleToggleActive(template.id)}
                    className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                  >
                    {template.active ? 'Desactivar' : 'Activar'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
