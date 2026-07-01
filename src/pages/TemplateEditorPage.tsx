import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  NotificationType,
  MessageTemplateCategory,
  createMessageTemplate,
  getMessageTemplate,
  updateMessageTemplate,
  notificationTypeLabels,
  templateCategoryLabels,
  MessageTemplate
} from '../shared/notifications';
import { PageHeader } from '../shared/ui/PageHeader';

export default function TemplateEditorPage() {
  const navigate = useNavigate();
  const { templateId } = useParams();
  const isEditing = !!templateId;

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [template, setTemplate] = useState<MessageTemplate | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    templateType: 'EMAIL' as NotificationType,
    channel: 'EMAIL' as NotificationType,
    subject: '',
    content: '',
    category: 'GENERAL' as MessageTemplateCategory,
    isDefault: false
  });

  useEffect(() => {
    if (isEditing && templateId) {
      loadTemplate();
    }
  }, [isEditing, templateId]);

  async function loadTemplate() {
    try {
      const data = await getMessageTemplate(templateId!);
      setTemplate(data);
      setFormData({
        name: data.name,
        description: data.description || '',
        templateType: data.templateType,
        channel: data.channel,
        subject: data.subject || '',
        content: data.content,
        category: data.category || 'GENERAL',
        isDefault: data.isDefault
      });
    } catch (error) {
      console.error('Error loading template:', error);
      toast.error('Error al cargar la plantilla');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      if (isEditing && templateId) {
        await updateMessageTemplate(templateId, formData.content);
        toast.success('Plantilla actualizada exitosamente');
      } else {
        await createMessageTemplate(formData);
        toast.success('Plantilla creada exitosamente');
      }
      navigate('/app/notificaciones/plantillas');
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Error al guardar la plantilla');
    } finally {
      setSaving(false);
    }
  }

  function handleChange(field: string, value: any) {
    setFormData(prev => ({ ...prev, [field]: value }));
  }

  function insertVariable(variable: string) {
    const textarea = document.querySelector('textarea[name="content"]') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = formData.content;
      const before = text.substring(0, start);
      const after = text.substring(end);
      const newContent = before + `{{${variable}}}` + after;
      handleChange('content', newContent);

      // Restore cursor position
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variable.length + 4, start + variable.length + 4);
      }, 0);
    }
  }

  const commonVariables = [
    'leadName',
    'leadFirstName',
    'leadEmail',
    'leadPhone',
    'propertyAddress',
    'propertyPrice',
    'companyName',
    'userName',
    'fecha',
    'hora'
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-slate-500">Cargando plantilla...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <PageHeader
        title={isEditing ? 'Editar Plantilla' : 'Nueva Plantilla'}
        subtitle="Crea plantillas reutilizables con variables dinámicas"
        backLink={{ to: '/app/notificaciones/plantillas', label: 'Volver a Plantillas' }}
      />

      <div className="p-4 lg:p-6">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
            {/* Información básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nombre de la plantilla *
                </label>
                <input
                  type="text"
                  required
                  disabled={isEditing}
                  value={formData.name}
                  onChange={e => handleChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-slate-100 disabled:cursor-not-allowed"
                  placeholder="Ej: Bienvenida a nuevo prospecto"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Categoría</label>
                <select
                  disabled={isEditing}
                  value={formData.category}
                  onChange={e => handleChange('category', e.target.value as MessageTemplateCategory)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-slate-100 disabled:cursor-not-allowed"
                >
                  {Object.entries(templateCategoryLabels).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
              <input
                type="text"
                disabled={isEditing}
                value={formData.description}
                onChange={e => handleChange('description', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-slate-100 disabled:cursor-not-allowed"
                placeholder="Describe el propósito de esta plantilla"
              />
            </div>

            {/* Tipo y canal */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tipo de notificación *
                </label>
                <select
                  required
                  disabled={isEditing}
                  value={formData.templateType}
                  onChange={e => {
                    const type = e.target.value as NotificationType;
                    handleChange('templateType', type);
                    handleChange('channel', type);
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-slate-100 disabled:cursor-not-allowed"
                >
                  {Object.entries(notificationTypeLabels).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    disabled={isEditing}
                    checked={formData.isDefault}
                    onChange={e => handleChange('isDefault', e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 disabled:cursor-not-allowed"
                  />
                  Plantilla por defecto
                </label>
                <p className="text-xs text-slate-500 mt-1">
                  Se usará automáticamente para este tipo de notificación
                </p>
              </div>
            </div>

            {/* Asunto (solo para emails) */}
            {formData.templateType === 'EMAIL' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Asunto del email *
                </label>
                <input
                  type="text"
                  required={formData.templateType === 'EMAIL'}
                  value={formData.subject}
                  onChange={e => handleChange('subject', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Ej: ¡Bienvenido {{leadName}}!"
                />
              </div>
            )}

            {/* Variables disponibles */}
            <div className="border-t border-slate-200 pt-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Variables disponibles
              </label>
              <div className="flex flex-wrap gap-2">
                {commonVariables.map(variable => (
                  <button
                    key={variable}
                    type="button"
                    onClick={() => insertVariable(variable)}
                    className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-mono"
                  >
                    {`{{${variable}}}`}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Haz clic en una variable para insertarla en el contenido
              </p>
            </div>

            {/* Contenido */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Contenido del mensaje *
              </label>
              <textarea
                name="content"
                required
                value={formData.content}
                onChange={e => handleChange('content', e.target.value)}
                rows={12}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm"
                placeholder={
                  formData.templateType === 'EMAIL'
                    ? 'Hola {{leadName}},\n\nGracias por tu interés en {{propertyAddress}}...'
                    : formData.templateType === 'WHATSAPP'
                    ? 'Hola {{leadFirstName}} 👋\n\nTe escribo de {{companyName}}...'
                    : 'Escribe el contenido de tu mensaje aquí...'
                }
              />
              <p className="text-xs text-slate-500 mt-1">
                Usa variables como {'{{leadName}}'} para personalizar el mensaje
              </p>
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => navigate('/app/notificaciones/plantillas')}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Guardando...' : isEditing ? 'Actualizar plantilla' : 'Crear plantilla'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
