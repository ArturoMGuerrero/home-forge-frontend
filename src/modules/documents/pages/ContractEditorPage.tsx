import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getSession } from '../../auth';
import type { LeadItem } from '../../leads';
import type { ApiProperty } from '../../properties';
import { loadOperationsContext } from '../../../shared/operationsContext';
import { createDocument, DocumentTemplate, documentTypeLabels, listDocumentTemplates } from '../api/documentsApi';
import { extractVariables, fillTemplate, suggestedValues, variableLabel } from '../contractVariables';
import { Button, buttonClasses, Card, EmptyState, Input, LoadingState, PageHeader, Select } from '../../../shared/ui';
import { Icon } from '../../../shared/Icon';

/** /app/contratos/nuevo — genera un contrato a partir de una plantilla. */
export function ContractEditorPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const session = getSession();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [properties, setProperties] = useState<ApiProperty[]>([]);

  const [templateId, setTemplateId] = useState(searchParams.get('templateId') ?? '');
  const [leadId, setLeadId] = useState(searchParams.get('leadId') ?? '');
  const [propertyId, setPropertyId] = useState(searchParams.get('propertyId') ?? '');
  const [name, setName] = useState('');
  const [nameEdited, setNameEdited] = useState(false);
  // Valores que el usuario cambió a mano; tienen prioridad sobre los sugeridos.
  const [overrides, setOverrides] = useState<Record<string, string>>({});

  useEffect(() => {
    Promise.all([listDocumentTemplates(true), loadOperationsContext()])
      .then(([templateList, [leadList, propertyList]]) => {
        setTemplates(templateList);
        setLeads(leadList);
        setProperties(propertyList);
        setTemplateId(current => current || templateList[0]?.id || '');
      })
      .catch(() => toast.error('No fue posible cargar las plantillas.'))
      .finally(() => setLoading(false));
  }, []);

  const template = templates.find(item => item.id === templateId);
  const lead = leads.find(item => item.id === leadId);
  const property = properties.find(item => item.id === propertyId);
  const variables = useMemo(() => (template ? extractVariables(template.content) : []), [template]);

  const suggested = suggestedValues({ lead, property, companyName: session?.companyName, agentName: session?.name });
  const values = Object.fromEntries(variables.map(key => [key, overrides[key] ?? suggested[key] ?? '']));
  const missing = variables.filter(key => !values[key]?.trim());

  const defaultName = template
    ? [template.name, lead ? `${lead.firstName} ${lead.lastName}`.trim() : property?.title].filter(Boolean).join(' — ')
    : '';
  const contractName = nameEdited ? name : defaultName;

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!template) return;
    setSaving(true);
    try {
      const created = await createDocument({
        templateId: template.id,
        name: contractName.trim() || template.name,
        documentType: template.documentType,
        leadId: leadId || undefined,
        propertyId: propertyId || undefined,
        variables: values
      });
      toast.success('Contrato generado');
      navigate(`/app/contratos/${created.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No fue posible generar el contrato.');
      setSaving(false);
    }
  }

  if (loading) return <Card><LoadingState message="Preparando el contrato..." /></Card>;

  if (templates.length === 0) {
    return (
      <>
        <PageHeader backLink={{ to: '/app/contratos', label: 'Contratos' }} eyebrow="Contratos" title="Nuevo contrato" />
        <Card>
          <EmptyState
            actions={<Link className={buttonClasses()} to="/app/contratos/plantillas/nueva">Crear plantilla</Link>}
            description="Los contratos se generan a partir de una plantilla con tu texto y sus variables."
            icon={<Icon name="document" />}
            title="Primero crea una plantilla"
          />
        </Card>
      </>
    );
  }

  return (
    <form onSubmit={submit}>
      <PageHeader
        actions={(
          <>
            <Link className={buttonClasses({ variant: 'tertiary' })} to="/app/contratos">Cancelar</Link>
            <Button disabled={!template} loading={saving} type="submit">Generar contrato</Button>
          </>
        )}
        backLink={{ to: '/app/contratos', label: 'Contratos' }}
        eyebrow="Contratos"
        subtitle="Elige la plantilla, el cliente y la propiedad. Los datos se llenan solos y puedes ajustarlos antes de generar."
        title="Nuevo contrato"
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="space-y-6">
          <Card className="grid gap-4">
            <Select label="Plantilla" onChange={event => { setTemplateId(event.target.value); setOverrides({}); }} value={templateId}>
              {templates.map(item => (
                <option key={item.id} value={item.id}>{item.name} · {documentTypeLabels[item.documentType]}</option>
              ))}
            </Select>
            <div className="grid gap-4 sm:grid-cols-2">
              <Select label="Cliente (opcional)" onChange={event => setLeadId(event.target.value)} value={leadId}>
                <option value="">Sin cliente</option>
                {leads.map(item => <option key={item.id} value={item.id}>{`${item.firstName} ${item.lastName}`.trim()}</option>)}
              </Select>
              <Select label="Propiedad (opcional)" onChange={event => setPropertyId(event.target.value)} value={propertyId}>
                <option value="">Sin propiedad</option>
                {properties.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}
              </Select>
            </div>
            <Input
              label="Nombre del contrato"
              onChange={event => { setName(event.target.value); setNameEdited(true); }}
              value={contractName}
            />
          </Card>

          {variables.length > 0 && (
            <Card>
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="font-semibold text-fg">Datos del contrato</h2>
                {missing.length > 0 && <span className="text-xs text-warning-fg">{missing.length} sin llenar</span>}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {variables.map(key => (
                  <Input
                    key={key}
                    label={variableLabel(key)}
                    onChange={event => setOverrides(current => ({ ...current, [key]: event.target.value }))}
                    placeholder={`{{${key}}}`}
                    value={values[key]}
                  />
                ))}
              </div>
            </Card>
          )}
        </div>

        <Card className="xl:sticky xl:top-6 xl:self-start">
          <h2 className="mb-3 font-semibold text-fg">Vista previa</h2>
          <div className="max-h-[640px] overflow-y-auto whitespace-pre-wrap rounded-xl border border-border bg-surface-muted p-5 font-serif text-sm leading-7 text-fg">
            {template ? fillTemplate(template.content, values) : ''}
          </div>
        </Card>
      </div>
    </form>
  );
}
