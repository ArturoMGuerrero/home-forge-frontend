import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useOutletContext } from 'react-router-dom';
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
} from '../shared/leads';
import { MoneyInput } from '../shared/MoneyInput';
import { ConfirmModal } from '../shared/ConfirmModal';
import { SubscriptionRestrictions } from '../shared/subscriptionRestrictions';

const inputClass = 'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-normal text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100';
const labelClass = 'grid gap-2 text-sm font-semibold text-slate-700';

const activityLabels: Record<LeadActivityType, string> = {
  CALL: 'Llamada',
  WHATSAPP: 'WhatsApp',
  EMAIL: 'Correo',
  NOTE: 'Nota',
  TOUR: 'Visita',
  MEETING: 'Reunión',
  STATUS_CHANGE: 'Cambio de etapa'
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

  if (loading) return <p className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">Cargando prospecto...</p>;
  if (!lead) return <p className="rounded-2xl bg-rose-50 p-6 text-sm text-rose-700">Prospecto no encontrado.</p>;

  return (
    <>
      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="grid size-12 place-items-center rounded-full bg-rose-100">
                <svg className="size-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-slate-900">¿Eliminar prospecto?</h3>
                <p className="text-sm text-slate-500">Esta acción no se puede deshacer</p>
              </div>
            </div>
            <p className="mb-6 text-sm text-slate-600">
              Se eliminará <strong>{lead.firstName} {lead.lastName}</strong> y todo su historial de actividades. Las asignaciones de propiedades también se eliminarán.
            </p>
            <div className="flex gap-3">
              <button
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                disabled={deleting}
                onClick={() => setShowDeleteModal(false)}
                type="button"
              >
                Cancelar
              </button>
              <button
                className="flex-1 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={deleting}
                onClick={handleDelete}
                type="button"
              >
                {deleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link className="text-sm font-semibold text-indigo-600" to="/app/prospectos">&lt;- Volver a prospectos</Link>
          <p className="mb-1 mt-5 text-[11px] font-bold uppercase tracking-[0.16em] text-indigo-600">Ficha CRM</p>
          <h1 className="text-3xl font-bold">{lead.firstName} {lead.lastName}</h1>
          <p className="mt-2 text-sm text-slate-500">Actualiza sus necesidades y registra cada contacto para mantener clara la siguiente acción.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {lead.phoneE164 && <a className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700" href={`https://wa.me/${lead.phoneE164.replace(/\D/g, '')}`} rel="noreferrer" target="_blank">WhatsApp</a>}
          {lead.email && <a className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:border-indigo-300" href={`mailto:${lead.email}`}>Correo</a>}
          <button
            className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-bold text-rose-700 transition hover:bg-rose-100"
            onClick={() => setShowDeleteModal(true)}
            type="button"
          >
            Eliminar prospecto
          </button>
        </div>
      </header>

      <div className="grid gap-7 xl:grid-cols-[1fr_420px]">
        <form className="space-y-6" onSubmit={saveProfile}>
          <section className="grid gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2 sm:p-6">
            <div className="sm:col-span-2"><h2 className="text-lg font-bold">Datos y control comercial</h2></div>
            <label className={labelClass}>Nombre<input className={inputClass} onChange={event => update('firstName', event.target.value)} required value={lead.firstName} /></label>
            <label className={labelClass}>Apellido<input className={inputClass} onChange={event => update('lastName', event.target.value)} required value={lead.lastName} /></label>
            <label className={labelClass}>Correo<input className={inputClass} onChange={event => update('email', event.target.value)} type="email" value={lead.email ?? ''} /></label>
            <label className={labelClass}>Teléfono<input className={inputClass} onChange={event => update('phoneE164', event.target.value)} pattern="^\+[1-9][0-9]{1,14}$" value={lead.phoneE164 ?? ''} /></label>
            <label className={labelClass}>Etapa
              <select className={inputClass} onChange={event => update('status', event.target.value as LeadStatus)} value={lead.status}>
                {(Object.keys(leadStatusLabels) as LeadStatus[]).map(status => <option key={status} value={status}>{leadStatusLabels[status]}</option>)}
              </select>
            </label>
            <label className={labelClass}>Prioridad
              <select className={inputClass} onChange={event => update('priority', event.target.value as LeadPriority)} value={lead.priority}>
                <option value="LOW">Baja</option><option value="MEDIUM">Media</option><option value="HIGH">Alta</option>
              </select>
            </label>
            <label className={labelClass}>Origen
              <select className={inputClass} onChange={event => update('source', event.target.value)} value={lead.source ?? ''}>
                <option value="">Sin especificar</option><option value="WEBSITE">Sitio web</option><option value="REFERRAL">Referido</option><option value="SOCIAL_MEDIA">Redes sociales</option><option value="PROPERTY_PORTAL">Portal inmobiliario</option><option value="WALK_IN">Visita directa</option><option value="OTHER">Otro</option>
              </select>
            </label>
            <label className={labelClass}>Asesor responsable<input className={inputClass} maxLength={180} onChange={event => update('assignedTo', event.target.value)} value={lead.assignedTo ?? ''} /></label>
          </section>

          <section className="grid gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2 sm:p-6">
            <div className="sm:col-span-2"><h2 className="text-lg font-bold">Necesidades inmobiliarias</h2></div>
            <label className={labelClass}>Busca
              <select className={inputClass} onChange={event => update('listingType', event.target.value)} value={lead.listingType ?? ''}>
                <option value="">Sin especificar</option><option value="SALE">Comprar</option><option value="RENT">Rentar</option>
              </select>
            </label>
            <label className={labelClass}>Tipo de propiedad
              <select className={inputClass} onChange={event => update('propertyType', event.target.value)} value={lead.propertyType ?? ''}>
                <option value="">Cualquier tipo</option><option value="HOUSE">Casa</option><option value="APARTMENT">Departamento</option><option value="LAND">Terreno</option><option value="COMMERCIAL">Local comercial</option><option value="OFFICE">Oficina</option><option value="WAREHOUSE">Bodega</option>
              </select>
            </label>
            <label className={labelClass}>Presupuesto mínimo<MoneyInput className={inputClass} currency={lead.currencyCode || 'MXN'} maxLength={19} onChange={value => update('budgetMin', optionalNumber(value))} value={lead.budgetMin} /></label>
            <label className={labelClass}>Presupuesto máximo<MoneyInput className={inputClass} currency={lead.currencyCode || 'MXN'} maxLength={19} onChange={value => update('budgetMax', optionalNumber(value))} value={lead.budgetMax} /></label>
            <label className={labelClass}>Moneda
              <select className={inputClass} onChange={event => update('currencyCode', event.target.value)} value={lead.currencyCode ?? ''}><option value="">Sin especificar</option><option value="MXN">MXN</option><option value="USD">USD</option></select>
            </label>
            <label className={labelClass}>Financiamiento
              <select className={inputClass} onChange={event => update('financingType', event.target.value)} value={lead.financingType ?? ''}><option value="">Sin especificar</option><option value="CASH">Contado</option><option value="BANK">Crédito bancario</option><option value="INFONAVIT">Infonavit</option><option value="FOVISSSTE">Fovissste</option><option value="OTHER">Otro</option></select>
            </label>
            <label className={labelClass}>País<select className={inputClass} onChange={event => update('countryCode', event.target.value)} value={lead.countryCode ?? ''}><option value="">Sin especificar</option><option value="MX">México</option><option value="US">Estados Unidos</option></select></label>
            <label className={labelClass}>Estado<input className={inputClass} onChange={event => update('stateCode', event.target.value)} value={lead.stateCode ?? ''} /></label>
            <label className={labelClass}>Ciudad<input className={inputClass} onChange={event => update('city', event.target.value)} value={lead.city ?? ''} /></label>
            <label className={labelClass}>Recámaras mínimas<input className={inputClass} max="100" min="0" onChange={event => update('bedroomsMin', optionalNumber(event.target.value))} type="number" value={lead.bedroomsMin ?? ''} /></label>
            <label className={labelClass}>Baños mínimos<input className={inputClass} max="100" min="0" onChange={event => update('bathroomsMin', optionalNumber(event.target.value))} step="0.5" type="number" value={lead.bathroomsMin ?? ''} /></label>
            <label className={`${labelClass} sm:col-span-2`}>Notas generales<textarea className={`${inputClass} min-h-32 resize-y`} maxLength={5000} onChange={event => update('notes', event.target.value)} value={lead.notes ?? ''} /></label>
          </section>

          <button className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white disabled:opacity-60" disabled={saving || !restrictions.canEdit} type="submit">
            {!restrictions.canEdit ? '🔒 Edición bloqueada' : saving ? 'Guardando...' : 'Guardar información del prospecto'}
          </button>
        </form>

        <aside className="space-y-6">
          <form className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" onSubmit={saveActivity}>
            <p className="text-xs font-bold uppercase tracking-[.16em] text-indigo-600">Nuevo seguimiento</p>
            <h2 className="mt-1 text-xl font-bold">Registrar actividad</h2>
            <div className="mt-5 grid gap-4">
              <label className={labelClass}>Tipo
                <select className={inputClass} onChange={event => setActivity(current => ({ ...current, activityType: event.target.value as LeadActivityType }))} value={activity.activityType}>
                  {(Object.keys(activityLabels) as LeadActivityType[]).map(type => <option key={type} value={type}>{activityLabels[type]}</option>)}
                </select>
              </label>
              <label className={labelClass}>Resultado o nota<textarea className={`${inputClass} min-h-28 resize-y`} onChange={event => setActivity(current => ({ ...current, notes: event.target.value }))} placeholder="Qué se habló, qué necesita y cuál fue el acuerdo." required value={activity.notes} /></label>
              <label className={labelClass}>Siguiente contacto<input className={inputClass} onChange={event => setActivity(current => ({ ...current, nextFollowUpAt: event.target.value }))} type="datetime-local" value={activity.nextFollowUpAt} /></label>
              <button className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white disabled:opacity-60" disabled={savingActivity} type="submit">{savingActivity ? 'Registrando...' : 'Agregar a la línea de tiempo'}</button>
            </div>
          </form>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5">
              <p className="text-xs font-bold uppercase tracking-[.16em] text-indigo-600">Historial</p>
              <h2 className="mt-1 text-xl font-bold">Línea de tiempo</h2>
            </div>
            {activities.length === 0 && <p className="py-8 text-center text-sm text-slate-500">Todavía no hay actividades registradas.</p>}
            <div className="space-y-5">
              {activities.map(item => (
                <article className="group relative border-l-2 border-indigo-100 pl-5" key={item.id}>
                  <span className="absolute -left-[7px] top-1 size-3 rounded-full bg-indigo-600" />
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <strong className="text-sm">{activityLabels[item.activityType]}</strong>
                    <div className="flex items-center gap-2">
                      <time className="text-xs text-slate-400">{new Date(item.occurredAt).toLocaleString('es-MX')}</time>
                      <button
                        className="opacity-0 transition group-hover:opacity-100 rounded-lg p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600"
                        onClick={() => setActivityToDelete(item.id)}
                        title="Eliminar actividad"
                        type="button"
                      >
                        <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">{item.notes}</p>
                  {item.nextFollowUpAt && <p className="mt-2 rounded-lg bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700">Siguiente contacto: {new Date(item.nextFollowUpAt).toLocaleString('es-MX')}</p>}
                </article>
              ))}
            </div>
          </section>
        </aside>
      </div>

      <ConfirmModal
        isOpen={activityToDelete !== null}
        title="¿Eliminar esta actividad de la línea de tiempo?"
        message="Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        onConfirm={confirmDeleteActivity}
        onCancel={() => setActivityToDelete(null)}
        loading={deletingActivity}
        danger={true}
      />
    </>
  );
}
