import { useEffect, useRef, useState } from 'react';
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
} from '../api/notificationsApi';
import { Alert, Button, Card, Checkbox, Input, LoadingState, PageHeader, Select, Textarea } from '../../../shared/ui';

export default function TemplateEditorPage() {
  const navigate = useNavigate();
  const { templateId } = useParams();
  const isEditing = !!templateId;

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [, setTemplate] = useState<MessageTemplate | null>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

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
      toast.error(error instanceof Error ? error.message : 'Error al cargar la plantilla');
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
      toast.error(error instanceof Error ? error.message : 'Error al guardar la plantilla');
    } finally {
      setSaving(false);
    }
  }

  function handleChange<K extends keyof typeof formData>(field: K, value: (typeof formData)[K]) {
    setFormData(prev => ({ ...prev, [field]: value }));
  }

  function insertVariable(variable: string) {
    const textarea = contentRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const token = `{{${variable}}}`;
    const text = formData.content;
    handleChange('content', text.substring(0, start) + token + text.substring(end));

    // Restaurar la posición del cursor después del token insertado
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + token.length, start + token.length);
    }, 0);
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
    return <Card><LoadingState message="Cargando plantilla..." /></Card>;
  }

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        backLink={{ to: '/app/notificaciones/plantillas', label: 'Plantillas' }}
        subtitle="Crea plantillas reutilizables con variables dinámicas"
        title={isEditing ? 'Editar plantilla' : 'Nueva plantilla'}
      />

      <form onSubmit={handleSubmit}>
        <Card className="space-y-6">
          {isEditing && (
            <Alert variant="info">Al editar una plantilla existente solo se puede modificar el contenido del mensaje.</Alert>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <Input
              disabled={isEditing}
              label="Nombre de la plantilla"
              onChange={e => handleChange('name', e.target.value)}
              placeholder="Ej: Bienvenida a nuevo prospecto"
              required
              value={formData.name}
            />
            <Select
              disabled={isEditing}
              label="Categoría"
              onChange={e => handleChange('category', e.target.value as MessageTemplateCategory)}
              options={Object.entries(templateCategoryLabels).map(([value, label]) => ({ value, label }))}
              value={formData.category}
            />
          </div>

          <Input
            disabled={isEditing}
            label="Descripción"
            onChange={e => handleChange('description', e.target.value)}
            placeholder="Describe el propósito de esta plantilla"
            value={formData.description}
          />

          <div className="grid gap-4 md:grid-cols-2 md:items-end">
            <Select
              disabled={isEditing}
              label="Tipo de notificación"
              onChange={e => {
                const type = e.target.value as NotificationType;
                handleChange('templateType', type);
                handleChange('channel', type);
              }}
              options={Object.entries(notificationTypeLabels).map(([value, label]) => ({ value, label }))}
              required
              value={formData.templateType}
            />
            <div className="pb-1">
              <Checkbox
                checked={formData.isDefault}
                description="Se usará automáticamente para este tipo de notificación"
                disabled={isEditing}
                label="Plantilla por defecto"
                onChange={e => handleChange('isDefault', e.target.checked)}
              />
            </div>
          </div>

          {formData.templateType === 'EMAIL' && (
            <Input
              label="Asunto del email"
              onChange={e => handleChange('subject', e.target.value)}
              placeholder="Ej: ¡Bienvenido {{leadName}}!"
              required
              value={formData.subject}
            />
          )}

          <div className="border-t border-border pt-5">
            <p className="mb-2 text-sm font-semibold text-fg-muted">Variables disponibles</p>
            <div className="flex flex-wrap gap-2">
              {commonVariables.map(variable => (
                <button
                  className="rounded-lg bg-primary-soft px-2.5 py-1 font-mono text-xs text-primary-fg ring-1 ring-inset ring-primary-line transition hover:bg-primary-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  key={variable}
                  onClick={() => insertVariable(variable)}
                  type="button"
                >
                  {`{{${variable}}}`}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-fg-subtle">Haz clic en una variable para insertarla donde está el cursor.</p>
          </div>

          <Textarea
            className="font-mono"
            helperText="Usa variables como {{leadName}} para personalizar el mensaje."
            label="Contenido del mensaje"
            name="content"
            onChange={e => handleChange('content', e.target.value)}
            placeholder={
              formData.templateType === 'EMAIL'
                ? 'Hola {{leadName}},\n\nGracias por tu interés en {{propertyAddress}}...'
                : formData.templateType === 'WHATSAPP'
                ? 'Hola {{leadFirstName}} 👋\n\nTe escribo de {{companyName}}...'
                : 'Escribe el contenido de tu mensaje aquí...'
            }
            ref={contentRef}
            required
            rows={12}
            value={formData.content}
          />

          <div className="flex flex-col-reverse gap-2 border-t border-border pt-5 sm:flex-row sm:justify-end">
            <Button onClick={() => navigate('/app/notificaciones/plantillas')} variant="tertiary">Cancelar</Button>
            <Button loading={saving} type="submit">
              {saving ? 'Guardando...' : isEditing ? 'Actualizar plantilla' : 'Crear plantilla'}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
