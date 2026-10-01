import { FormEvent, useEffect, useState } from 'react';
import { useNavigate, useParams, useOutletContext } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  addLeadActivity,
  deleteLead,
  deleteLeadActivity,
  getLead,
  LeadActivity,
  LeadActivityType,
  LeadItem,
  LeadPayload,
  LeadPriority,
  LeadStatus,
  leadStatusLabels,
  listLeadActivities,
  updateLead
} from '../api/leadsApi';
import { MoneyInput } from '../../../shared/MoneyInput';
import { ConfirmModal } from '../../../shared/ConfirmModal';
import { SubscriptionRestrictions } from '../../../shared/subscriptionRestrictions';
import { Icon } from '../../../shared/Icon';
import { Alert, Badge, BadgeVariant, Button, buttonClasses, Card, EmptyState, fieldClass, fieldLabelClass, Input, LoadingState, PageHeader, Select, Textarea } from '../../../shared/ui';


const activityLabels: Record<LeadActivityType, string> = {
  CALL: 'Llamada',
  WHATSAPP: 'WhatsApp',
  EMAIL: 'Correo',
  NOTE: 'Nota',
  TOUR: 'Visita',
  MEETING: 'Reunión',
  STATUS_CHANGE: 'Cambio de etapa'
};

const activityOptions = (Object.keys(activityLabels) as LeadActivityType[]).map(type => ({ value: type, label: activityLabels[type] }));
const statusOptions = (Object.keys(leadStatusLabels) as LeadStatus[]).map(status => ({ value: status, label: leadStatusLabels[status] }));
const priorityOptions = [{ value: 'LOW', label: 'Baja' }, { value: 'MEDIUM', label: 'Media' }, { value: 'HIGH', label: 'Alta' }];
const sourceOptions = [
  { value: 'WEBSITE', label: 'Sitio web' },
  { value: 'REFERRAL', label: 'Referido' },
  { value: 'SOCIAL_MEDIA', label: 'Redes sociales' },
  { value: 'PROPERTY_PORTAL', label: 'Portal inmobiliario' },
  { value: 'WALK_IN', label: 'Visita directa' },
  { value: 'OTHER', label: 'Otro' }
];
const listingOptions = [{ value: 'SALE', label: 'Comprar' }, { value: 'RENT', label: 'Rentar' }];
const propertyTypeOptions = [
  { value: 'HOUSE', label: 'Casa' },
  { value: 'APARTMENT', label: 'Departamento' },
  { value: 'LAND', label: 'Terreno' },
  { value: 'COMMERCIAL', label: 'Local comercial' },
  { value: 'OFFICE', label: 'Oficina' },
  { value: 'WAREHOUSE', label: 'Bodega' }
];
const currencyOptions = [{ value: 'MXN', label: 'MXN' }, { value: 'USD', label: 'USD' }];
const financingOptions = [
  { value: 'CASH', label: 'Contado' },
  { value: 'BANK', label: 'Crédito bancario' },
  { value: 'INFONAVIT', label: 'Infonavit' },
  { value: 'FOVISSSTE', label: 'Fovissste' },
  { value: 'OTHER', label: 'Otro' }
];
const countryOptions = [{ value: 'MX', label: 'México' }, { value: 'US', label: 'Estados Unidos' }];
const outcomeStyles: Record<string, { label: string; variant: BadgeVariant }> = {
  SUCCESS: { label: 'Exitoso', variant: 'success' },
  SCHEDULED: { label: 'Agendado', variant: 'info' },
  NO_ANSWER: { label: 'Sin respuesta', variant: 'warning' }
};

export function LeadDetailPage() {
  const navigate = useNavigate();
  const { leadId = '' } = useParams();
  const context = useOutletContext<{ restrictions: SubscriptionRestrictions }>();
  const restrictions = context?.restrictions || { canCreate: true, canEdit: true, canExport: true, level: 'NONE' };
  const [lead, setLead] = useState<LeadItem | null>(null);
  const [activities, setActivities] = useState<LeadActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingActivity, setSavingActivity] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingActivity, setDeletingActivity] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState<string | null>(null);
  const [activity, setActivity] = useState({
    activityType: 'CALL' as LeadActivityType,
    notes: '',
    nextFollowUpAt: ''
  });

  useEffect(() => {
    load();
  }, [leadId]);

  async function load() {
    try {
      const [leadResponse, activityResponse] = await Promise.all([
        getLead(leadId),
        listLeadActivities(leadId)
      ]);
      setLead(leadResponse);
      setActivities(activityResponse);
    } catch (requestError) {
      toast.error(requestError instanceof Error ? requestError.message : 'No fue posible cargar el prospecto.');
    } finally {
      setLoading(false);
    }
  }

  function update<K extends keyof LeadItem>(name: K, value: LeadItem[K]) {
    setLead(current => current ? { ...current, [name]: value } : current);
  }

  function optionalNumber(value: string) {
    return value === '' ? undefined : Number(value);
  }

  async function saveProfile(event: FormEvent) {
    event.preventDefault();
    if (!lead) return;

    if (!restrictions.canEdit) {
      toast.error('No puedes editar prospectos. Tu plan ha expirado.');
      return;
    }

    setSaving(true);
    try {
      const payload: LeadPayload = {
        firstName: lead.firstName.trim(),
        lastName: lead.lastName.trim(),
        email: lead.email?.trim() || undefined,
        phoneE164: lead.phoneE164?.trim() || undefined,
        source: lead.source?.trim() || undefined,
        status: lead.status,
        listingType: lead.listingType || undefined,
        budgetMin: lead.budgetMin,
        budgetMax: lead.budgetMax,
        currencyCode: lead.currencyCode || undefined,
        countryCode: lead.countryCode || undefined,
        stateCode: lead.stateCode?.trim() || undefined,
        city: lead.city?.trim() || undefined,
        propertyType: lead.propertyType || undefined,
        bedroomsMin: lead.bedroomsMin,
        bathroomsMin: lead.bathroomsMin,
        financingType: lead.financingType || undefined,
        priority: lead.priority,
        assignedTo: lead.assignedTo?.trim() || undefined,
        nextFollowUpAt: lead.nextFollowUpAt || undefined,
        notes: lead.notes?.trim() || undefined
      };
      setLead(await updateLead(leadId, payload));
      toast.success('Información del prospecto actualizada.');
    } catch (requestError) {
      toast.error(requestError instanceof Error ? requestError.message : 'No fue posible actualizar el prospecto.');
    } finally {
      setSaving(false);
    }
  }

  async function saveActivity(event: FormEvent) {
    event.preventDefault();
    setSavingActivity(true);
    try {
      const created = await addLeadActivity(leadId, {
        activityType: activity.activityType,
        notes: activity.notes.trim(),
        nextFollowUpAt: activity.nextFollowUpAt ? new Date(activity.nextFollowUpAt).toISOString() : undefined
      });
      setActivities(current => [created, ...current]);
      if (created.nextFollowUpAt) {
        setLead(current => current ? { ...current, nextFollowUpAt: created.nextFollowUpAt } : current);
      }
      setActivity({ activityType: 'CALL', notes: '', nextFollowUpAt: '' });
      toast.success('Seguimiento registrado en la línea de tiempo.');
    } catch (requestError) {
      toast.error(requestError instanceof Error ? requestError.message : 'No fue posible registrar el seguimiento.');
    } finally {
      setSavingActivity(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteLead(leadId);
      toast.success('Prospecto eliminado correctamente.');
      navigate('/app/prospectos');
    } catch (requestError) {
      toast.error(requestError instanceof Error ? requestError.message : 'No fue posible eliminar el prospecto.');
      setShowDeleteModal(false);
    } finally {
      setDeleting(false);
    }
  }

  async function confirmDeleteActivity() {
    if (!activityToDelete) return;
    setDeletingActivity(true);
    try {
      await deleteLeadActivity(leadId, activityToDelete);
      setActivities(current => current.filter(item => item.id !== activityToDelete));
      toast.success('Actividad eliminada de la línea de tiempo.');
      setActivityToDelete(null);
    } catch (requestError) {
      toast.error(requestError instanceof Error ? requestError.message : 'No fue posible eliminar la actividad.');
    } finally {
      setDeletingActivity(false);
    }
  }

  if (loading) return <Card><LoadingState message="Cargando prospecto..." /></Card>;
  if (!lead) return <Alert variant="error">Prospecto no encontrado.</Alert>;

  const currency = lead.currencyCode || 'MXN';

  return (
    <>
      <PageHeader
        actions={
          <>
            {lead.phoneE164 && <a className={buttonClasses({ variant: 'success' })} href={`https://wa.me/${lead.phoneE164.replace(/\D/g, '')}`} rel="noreferrer" target="_blank">WhatsApp</a>}
            {lead.email && <a className={buttonClasses({ variant: 'tertiary' })} href={`mailto:${lead.email}`}>Correo</a>}
            <Button onClick={() => setShowDeleteModal(true)} variant="danger">Eliminar</Button>
          </>
        }
        backLink={{ to: '/app/prospectos', label: 'Prospectos' }}
        eyebrow="Ficha CRM"
        subtitle="Actualiza sus necesidades y registra cada contacto para mantener clara la siguiente acción."
        title={`${lead.firstName} ${lead.lastName}`}
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_400px]">
        <form className="space-y-6" onSubmit={saveProfile}>
          <Card>
            <h2 className="mb-5 text-lg font-semibold">Datos y control comercial</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <Input label="Nombre" onChange={event => update('firstName', event.target.value)} required value={lead.firstName} />
              <Input label="Apellido" onChange={event => update('lastName', event.target.value)} required value={lead.lastName} />
              <Input label="Correo" onChange={event => update('email', event.target.value)} type="email" value={lead.email ?? ''} />
              <Input label="Teléfono" onChange={event => update('phoneE164', event.target.value)} pattern="^\+[1-9][0-9]{1,14}$" type="tel" value={lead.phoneE164 ?? ''} />
              <Select label="Etapa" onChange={event => update('status', event.target.value as LeadStatus)} options={statusOptions} value={lead.status} />
              <Select label="Prioridad" onChange={event => update('priority', event.target.value as LeadPriority)} options={priorityOptions} value={lead.priority} />
              <Select label="Origen" onChange={event => update('source', event.target.value)} options={sourceOptions} placeholder="Sin especificar" value={lead.source ?? ''} />
              <Input label="Asesor responsable" maxLength={180} onChange={event => update('assignedTo', event.target.value)} value={lead.assignedTo ?? ''} />
            </div>
          </Card>

          <Card>
            <h2 className="mb-5 text-lg font-semibold">Necesidades inmobiliarias</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <Select label="Busca" onChange={event => update('listingType', event.target.value)} options={listingOptions} placeholder="Sin especificar" value={lead.listingType ?? ''} />
              <Select label="Tipo de propiedad" onChange={event => update('propertyType', event.target.value)} options={propertyTypeOptions} placeholder="Cualquier tipo" value={lead.propertyType ?? ''} />
              <div>
                <label className={fieldLabelClass} htmlFor="lead-budget-min">Presupuesto mínimo</label>
                <MoneyInput className={fieldClass()} currency={currency} id="lead-budget-min" maxLength={19} onChange={value => update('budgetMin', optionalNumber(value))} value={lead.budgetMin} />
              </div>
              <div>
                <label className={fieldLabelClass} htmlFor="lead-budget-max">Presupuesto máximo</label>
                <MoneyInput className={fieldClass()} currency={currency} id="lead-budget-max" maxLength={19} onChange={value => update('budgetMax', optionalNumber(value))} value={lead.budgetMax} />
              </div>
              <Select label="Moneda" onChange={event => update('currencyCode', event.target.value)} options={currencyOptions} placeholder="Sin especificar" value={lead.currencyCode ?? ''} />
              <Select label="Financiamiento" onChange={event => update('financingType', event.target.value)} options={financingOptions} placeholder="Sin especificar" value={lead.financingType ?? ''} />
              <Select label="País" onChange={event => update('countryCode', event.target.value)} options={countryOptions} placeholder="Sin especificar" value={lead.countryCode ?? ''} />
              <Input label="Estado" onChange={event => update('stateCode', event.target.value)} value={lead.stateCode ?? ''} />
              <Input label="Ciudad" onChange={event => update('city', event.target.value)} value={lead.city ?? ''} />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Recámaras mín." max="100" min="0" onChange={event => update('bedroomsMin', optionalNumber(event.target.value))} type="number" value={lead.bedroomsMin ?? ''} />
                <Input label="Baños mín." max="100" min="0" onChange={event => update('bathroomsMin', optionalNumber(event.target.value))} step="0.5" type="number" value={lead.bathroomsMin ?? ''} />
              </div>
              <Textarea className="min-h-32" containerClassName="sm:col-span-2" label="Notas generales" maxLength={5000} onChange={event => update('notes', event.target.value)} value={lead.notes ?? ''} />
            </div>
          </Card>

          <div className="flex justify-end">
            <Button disabled={!restrictions.canEdit} icon={!restrictions.canEdit ? <Icon className="size-4" name="lock" /> : undefined} loading={saving} type="submit">
              {!restrictions.canEdit ? 'Edición bloqueada' : saving ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </div>
        </form>

        <aside className="space-y-6">
          <Card>
            <form onSubmit={saveActivity}>
              <h2 className="text-lg font-semibold">Registrar actividad</h2>
              <p className="mt-1 text-sm text-fg-subtle">Cada contacto queda en la línea de tiempo del prospecto.</p>
              <div className="mt-5 grid gap-4">
                <Select
                  label="Tipo"
                  onChange={event => setActivity(current => ({ ...current, activityType: event.target.value as LeadActivityType }))}
                  options={activityOptions}
                  value={activity.activityType}
                />
                <Textarea
                  className="min-h-28"
                  label="Resultado o nota"
                  onChange={event => setActivity(current => ({ ...current, notes: event.target.value }))}
                  placeholder="Qué se habló, qué necesita y cuál fue el acuerdo."
                  required
                  value={activity.notes}
                />
                <Input
                  label="Siguiente contacto"
                  onChange={event => setActivity(current => ({ ...current, nextFollowUpAt: event.target.value }))}
                  type="datetime-local"
                  value={activity.nextFollowUpAt}
                />
                <Button fullWidth loading={savingActivity} type="submit" variant="secondary">
                  {savingActivity ? 'Registrando...' : 'Agregar a la línea de tiempo'}
                </Button>
              </div>
            </form>
          </Card>

          <Card>
            <h2 className="mb-5 text-lg font-semibold">Línea de tiempo</h2>
            {activities.length === 0 && <EmptyState className="py-8" title="Todavía no hay actividades registradas" />}
            <ol className="space-y-5">
              {activities.map(item => (
                <li className="group relative border-l-2 border-border pl-5" key={item.id}>
                  <span aria-hidden="true" className="absolute -left-[7px] top-1 size-3 rounded-full bg-primary ring-4 ring-surface" />
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <strong className="text-sm font-semibold">{activityLabels[item.activityType]}</strong>
                    <div className="flex items-center gap-1">
                      <time className="text-xs text-fg-subtle">{new Date(item.occurredAt).toLocaleString('es-MX')}</time>
                      <button
                        aria-label="Eliminar actividad"
                        className="grid size-7 place-items-center rounded-lg text-fg-subtle opacity-0 transition hover:bg-danger-soft hover:text-danger-fg focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary group-hover:opacity-100"
                        onClick={() => setActivityToDelete(item.id)}
                        type="button"
                      >
                        <svg aria-hidden="true" className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <p className="mt-1.5 whitespace-pre-line text-sm leading-6 text-fg-muted">{item.notes}</p>
                  {(item.durationMinutes || item.outcome || item.propertyId) && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {item.durationMinutes && <Badge>{item.durationMinutes} min</Badge>}
                      {item.outcome && (
                        <Badge variant={outcomeStyles[item.outcome]?.variant ?? 'neutral'}>{outcomeStyles[item.outcome]?.label ?? item.outcome}</Badge>
                      )}
                      {item.propertyId && <Badge variant="purple">Propiedad vinculada</Badge>}
                    </div>
                  )}
                  {item.nextFollowUpAt && (
                    <p className="mt-2 rounded-lg bg-primary-soft px-3 py-2 text-xs font-medium text-primary-fg">
                      Siguiente contacto: {new Date(item.nextFollowUpAt).toLocaleString('es-MX')}
                    </p>
                  )}
                </li>
              ))}
            </ol>
          </Card>
        </aside>
      </div>

      <ConfirmModal
        isOpen={showDeleteModal}
        loading={deleting}
        message={<>Se eliminará <strong className="text-fg">{lead.firstName} {lead.lastName}</strong> y todo su historial de actividades. Las asignaciones de propiedades también se eliminarán.</>}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="¿Eliminar prospecto?"
      />

      <ConfirmModal
        isOpen={activityToDelete !== null}
        loading={deletingActivity}
        message="Esta acción no se puede deshacer."
        onCancel={() => setActivityToDelete(null)}
        onConfirm={confirmDeleteActivity}
        title="¿Eliminar esta actividad de la línea de tiempo?"
      />
    </>
  );
}
