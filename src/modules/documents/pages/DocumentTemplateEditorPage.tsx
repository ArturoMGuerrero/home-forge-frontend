import { FormEvent, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  createDocumentTemplate,
  DocumentType,
  documentTypeLabels,
  getDocumentTemplate,
  updateDocumentTemplate
} from '../api/documentsApi';
import { extractVariables, fillTemplate, STANDARD_VARIABLES, variableLabel } from '../contractVariables';
import { Button, buttonClasses, Card, Input, LoadingState, PageHeader, Select, Textarea } from '../../../shared/ui';

const SAMPLE_VALUES: Record<string, string> = {
  cliente_nombre: 'Ana López García',
  cliente_email: 'ana@example.com',
  cliente_telefono: '+52 614 123 4567',
  propiedad_titulo: 'Casa en colonia Centro',
  propiedad_direccion: 'Av. Independencia 120',
  propiedad_ciudad: 'Chihuahua, Chihuahua',
  propiedad_precio: '$2,500,000',
  inmobiliaria_nombre: 'Tu inmobiliaria',
  asesor_nombre: 'Nombre del asesor',
  fecha: new Date().toLocaleDateString('es-MX', { dateStyle: 'long' })
};

const STARTER_CONTENT = `CONTRATO DE {{tipo_operacion}}

En la ciudad de {{propiedad_ciudad}}, a {{fecha}}, comparecen por una parte {{inmobiliaria_nombre}}, representada por {{asesor_nombre}}, y por la otra {{cliente_nombre}}.

INMUEBLE: {{propiedad_titulo}}, ubicado en {{propiedad_direccion}}.
PRECIO: {{propiedad_precio}}.

CLÁUSULAS
PRIMERA. ...

Firmas

_________________________          _________________________
{{inmobiliaria_nombre}}                     {{cliente_nombre}}`;

/** Crear (/app/contratos/plantillas/nueva) o editar (/app/contratos/plantillas/:templateId) una plantilla. */
export function DocumentTemplateEditorPage() {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const isNew = !templateId;
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [documentType, setDocumentType] = useState<DocumentType>('CONTRACT');
  const [content, setContent] = useState(isNew ? STARTER_CONTENT : '');

  useEffect(() => {
    if (isNew) return;
    getDocumentTemplate(templateId)
      .then(template => {
        setName(template.name);
        setDescription(template.description ?? '');
        setDocumentType(template.documentType);
        setContent(template.content);
      })
      .catch(() => {
        toast.error('No se encontró la plantilla.');
        navigate('/app/contratos/plantillas', { replace: true });
      })
      .finally(() => setLoading(false));
  }, [isNew, navigate, templateId]);

  function insertVariable(key: string) {
    const token = `{{${key}}}`;
    const field = contentRef.current;
    if (!field) {
      setContent(current => current + token);
      return;
    }
    const start = field.selectionStart ?? content.length;
    const end = field.selectionEnd ?? content.length;
    setContent(content.slice(0, start) + token + content.slice(end));
    requestAnimationFrame(() => {
      field.focus();
      field.setSelectionRange(start + token.length, start + token.length);
    });
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!name.trim() || !content.trim()) {
      toast.error('Escribe el nombre y el contenido de la plantilla.');
      return;
    }
    setSaving(true);
    try {
      if (isNew) {
        await createDocumentTemplate({ name: name.trim(), description: description.trim() || undefined, documentType, content });
        toast.success('Plantilla creada');
      } else {
        await updateDocumentTemplate(templateId, { content, name: name.trim(), description: description.trim() });
        toast.success('Plantilla guardada');
      }
      navigate('/app/contratos/plantillas');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No fue posible guardar la plantilla.');
      setSaving(false);
    }
  }

  if (loading) return <Card><LoadingState message="Cargando plantilla..." /></Card>;

  const used = extractVariables(content);

  return (
    <form onSubmit={save}>
      <PageHeader
        actions={(
          <>
            <Link className={buttonClasses({ variant: 'tertiary' })} to="/app/contratos/plantillas">Cancelar</Link>
            <Button loading={saving} type="submit">{isNew ? 'Crear plantilla' : 'Guardar cambios'}</Button>
          </>
        )}
        eyebrow="Plantillas"
        subtitle="Escribe el texto del documento y usa variables entre llaves dobles, como {{cliente_nombre}}. Se llenan al generar cada contrato."
        title={isNew ? 'Nueva plantilla' : 'Editar plantilla'}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <Card className="grid gap-4 sm:grid-cols-2">
            <Input label="Nombre" onChange={event => setName(event.target.value)} placeholder="Contrato de compraventa" required value={name} />
            <Select disabled={!isNew} label="Tipo de documento" onChange={event => setDocumentType(event.target.value as DocumentType)} value={documentType}>
              {Object.entries(documentTypeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </Select>
            <Input containerClassName="sm:col-span-2" label="Descripción (opcional)" onChange={event => setDescription(event.target.value)} placeholder="Para qué se usa esta plantilla" value={description} />
          </Card>

          <Card>
            <div className="mb-3 flex flex-wrap gap-1.5">
              <span className="mr-1 self-center text-xs font-medium text-fg-subtle">Insertar variable:</span>
              {STANDARD_VARIABLES.map(variable => (
                <button
                  className="rounded-lg border border-border bg-surface-muted px-2 py-1 text-xs font-medium text-fg-muted transition hover:border-primary-line hover:text-primary-fg"
                  key={variable.key}
                  onClick={() => insertVariable(variable.key)}
                  title={variable.label}
                  type="button"
                >
                  {variable.key}
                </button>
              ))}
            </div>
            <Textarea
              className="min-h-[420px] font-mono text-sm leading-6"
              label="Contenido"
              onChange={event => setContent(event.target.value)}
              ref={contentRef}
              value={content}
            />
            <p className="mt-2 text-xs text-fg-subtle">
              También puedes inventar variables propias, por ejemplo {'{{plazo_meses}}'}: al generar el contrato se piden aparte.
            </p>
          </Card>
        </div>

        <Card className="xl:sticky xl:top-6 xl:self-start">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="font-semibold text-fg">Vista previa</h2>
            <span className="text-xs text-fg-subtle">Con datos de ejemplo</span>
          </div>
          <div className="max-h-[560px] overflow-y-auto whitespace-pre-wrap rounded-xl border border-border bg-surface-muted p-5 font-serif text-sm leading-7 text-fg">
            {fillTemplate(content, SAMPLE_VALUES) || 'El contenido aparecerá aquí.'}
          </div>
          {used.length > 0 && (
            <p className="mt-3 text-xs text-fg-subtle">
              Variables en uso: {used.map(variableLabel).join(', ')}.
            </p>
          )}
        </Card>
      </div>
    </form>
  );
}
