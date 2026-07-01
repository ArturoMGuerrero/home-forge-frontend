import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  NotificationType,
  NotificationPriority,
  RecipientType,
  MessageTemplate,
  createNotification,
  listMessageTemplates,
  notificationTypeLabels,
  notificationPriorityLabels
} from '../shared/notifications';

type NewNotificationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export function NewNotificationModal({ isOpen, onClose, onSuccess }: NewNotificationModalProps) {
  const [saving, setSaving] = useState(false);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);

  const [formData, setFormData] = useState({
    notificationType: 'EMAIL' as NotificationType,
    priority: 'MEDIUM' as NotificationPriority,
    recipientType: 'CUSTOM' as RecipientType,
    recipientName: '',
    recipientEmail: '',
    recipientPhone: '',
    subject: '',
    content: '',
    scheduledFor: ''
  });

  useEffect(() => {
    if (isOpen) {
      loadTemplates();
    }
  }, [isOpen]);

  async function loadTemplates() {
    try {
      const data = await listMessageTemplates();
      setTemplates(data.filter(t => t.active));
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  }

  function handleChange(field: string, value: any) {
    setFormData(prev => ({ ...prev, [field]: value }));
  }

  function handleTemplateSelect(templateId: string) {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(template);
      handleChange('notificationType', template.templateType);
      handleChange('subject', template.subject || '');
      handleChange('content', template.content);
    } else {
      setSelectedTemplate(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const payload: any = {
        notificationType: formData.notificationType,
        priority: formData.priority,
        recipientType: formData.recipientType,
        recipientName: formData.recipientName,
        content: formData.content
      };

      if (formData.recipientEmail) payload.recipientEmail = formData.recipientEmail;
      if (formData.recipientPhone) payload.recipientPhone = formData.recipientPhone;
      if (formData.subject) payload.subject = formData.subject;
      if (formData.scheduledFor) payload.scheduledFor = new Date(formData.scheduledFor).toISOString();

      await createNotification(payload);
      toast.success('Notificación enviada exitosamente');
      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Error creating notification:', error);
      toast.error('Error al crear la notificación');
    } finally {
      setSaving(false);
    }
  }

  function handleClose() {
    setFormData({
      notificationType: 'EMAIL',
      priority: 'MEDIUM',
      recipientType: 'CUSTOM',
      recipientName: '',
      recipientEmail: '',
      recipientPhone: '',
      subject: '',
      content: '',
      scheduledFor: ''
    });
    setSelectedTemplate(null);
    onClose();
  }

  const filteredTemplates = templates.filter(t => t.templateType === formData.notificationType);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={handleClose}>
      <div
        className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Nueva Notificación</h2>
            <p className="text-sm text-slate-500">Envía emails, WhatsApp, notificaciones push o SMS</p>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Tipo de notificación */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Tipo *</label>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(notificationTypeLabels).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    handleChange('notificationType', key as NotificationType);
                    setSelectedTemplate(null);
                  }}
                  className={`px-4 py-2 rounded-lg border-2 transition-all text-sm font-medium ${
                    formData.notificationType === key
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Plantilla */}
          {filteredTemplates.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Plantilla (opcional)</label>
              <select
                value={selectedTemplate?.id || ''}
                onChange={e => handleTemplateSelect(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              >
                <option value="">Sin plantilla</option>
                {filteredTemplates.map(template => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Destinatario */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Nombre *</label>
              <input
                type="text"
                required
                value={formData.recipientName}
                onChange={e => handleChange('recipientName', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                placeholder="Juan Pérez"
              />
            </div>

            {formData.notificationType === 'EMAIL' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.recipientEmail}
                  onChange={e => handleChange('recipientEmail', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  placeholder="ejemplo@email.com"
                />
              </div>
            )}

            {(formData.notificationType === 'WHATSAPP' || formData.notificationType === 'SMS') && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Teléfono *</label>
                <input
                  type="tel"
                  required
                  value={formData.recipientPhone}
                  onChange={e => handleChange('recipientPhone', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  placeholder="+52 614 123 4567"
                />
              </div>
            )}
          </div>

          {/* Prioridad */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Prioridad</label>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(notificationPriorityLabels).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleChange('priority', key as NotificationPriority)}
                  className={`px-3 py-1.5 rounded-lg border-2 transition-all text-xs font-medium ${
                    formData.priority === key
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Asunto (emails) */}
          {formData.notificationType === 'EMAIL' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Asunto *</label>
              <input
                type="text"
                required
                value={formData.subject}
                onChange={e => handleChange('subject', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                placeholder="Información sobre tu propiedad"
              />
            </div>
          )}

          {/* Mensaje */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Mensaje *</label>
            <textarea
              required
              value={formData.content}
              onChange={e => handleChange('content', e.target.value)}
              rows={6}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              placeholder="Escribe tu mensaje aquí..."
            />
          </div>

          {/* Programar */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Programar envío (opcional)</label>
            <input
              type="datetime-local"
              value={formData.scheduledFor}
              onChange={e => handleChange('scheduledFor', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50"
            >
              {saving ? 'Enviando...' : formData.scheduledFor ? 'Programar' : 'Enviar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
