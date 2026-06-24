import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import toast from 'react-hot-toast';
import { LeadItem } from '../shared/leads';
import { ApiProperty } from '../shared/propertyApi';
import { Appointment, createAppointment, deleteAppointment, listAppointments, loadOperationsContext, updateAppointment } from '../shared/operationsApi';
import { ExportButton } from '../shared/ExportButton';
import { exportToExcel, formatDateTime } from '../shared/excelExport';
import { UpgradeModal } from '../shared/UpgradeModal';
import { SubscriptionRestrictions } from '../shared/subscriptionRestrictions';
import { ConfirmModal } from '../shared/ConfirmModal';

const inputClass = 'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100';
const initialForm = { title: '', appointmentType: 'TOUR' as Appointment['appointmentType'], status: 'SCHEDULED' as Appointment['status'], startsAt: '', endsAt: '', leadId: '', propertyId: '', location: '', notes: '' };

export function AgendaPage() {
  const context = useOutletContext<{ restrictions: SubscriptionRestrictions }>();
  const restrictions = context?.restrictions || { canCreate: true, canExport: true, level: 'NONE' };
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [properties, setProperties] = useState<ApiProperty[]>([]);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [searchLead, setSearchLead] = useState('');
  const [searchProperty, setSearchProperty] = useState('');
  const [appointmentToDelete, setAppointmentToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    Promise.all([listAppointments(), loadOperationsContext()])
      .then(([items, [leadItems, propertyItems]]) => { setAppointments(items); setLeads(leadItems); setProperties(propertyItems); })
      .catch(requestError => toast.error(requestError instanceof Error ? requestError.message : 'No fue posible cargar la agenda.'));
  }, []);

  const grouped = useMemo(() => appointments.reduce<Record<string, Appointment[]>>((result, item) => {
    const key = new Date(item.startsAt).toLocaleDateString('es-MX', { dateStyle: 'full' });
    (result[key] ??= []).push(item);
    return result;
  }, {}), [appointments]);

  const filteredLeads = leads.filter(lead => {
    if (!searchLead) return true;
    const query = searchLead.toLowerCase();
    const fullName = `${lead.firstName} ${lead.lastName}`.toLowerCase();
    return fullName.includes(query) || lead.email?.toLowerCase().includes(query);
  });

  const filteredProperties = properties.filter(property => {
    if (!searchProperty) return true;
    const query = searchProperty.toLowerCase();
    return (
      property.code?.toLowerCase().includes(query) ||
      property.title?.toLowerCase().includes(query) ||
      property.city?.toLowerCase().includes(query)
    );
  });

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!restrictions.canCreate) {
      setUpgradeModalOpen(true);
      return;
    }
    setSaving(true);
    try {
      const created = await createAppointment({
        title: form.title.trim(),
        appointmentType: form.appointmentType,
        status: form.status,
        startsAt: new Date(form.startsAt).toISOString(),
        endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : undefined,
        leadId: form.leadId || undefined,
        propertyId: form.propertyId || undefined,
        location: form.location.trim() || undefined,
        notes: form.notes.trim() || undefined
      });
      setAppointments(current => [...current, created].sort((a, b) => a.startsAt.localeCompare(b.startsAt)));
      setForm(initialForm);
      toast.success('Cita agregada a la agenda');
    } catch (requestError) {
      toast.error(requestError instanceof Error ? requestError.message : 'No fue posible guardar la cita.');
    } finally { setSaving(false); }
  }

  async function complete(item: Appointment) {
    const updated = await updateAppointment(item.id, { ...item, status: 'COMPLETED' });
    setAppointments(current => current.map(candidate => candidate.id === item.id ? updated : candidate));
  }

  async function confirmDelete() {
    if (!appointmentToDelete) return;
    setDeleting(true);
    try {
      await deleteAppointment(appointmentToDelete);
      setAppointments(current => current.filter(item => item.id !== appointmentToDelete));
      toast.success('Cita eliminada');
      setAppointmentToDelete(null);
    } catch (requestError) {
      toast.error(requestError instanceof Error ? requestError.message : 'No fue posible eliminar la cita.');
    } finally {
      setDeleting(false);
    }
  }

  function handleExport() {
    if (!restrictions.canExport) {
      setUpgradeModalOpen(true);
      return;
    }
    const typeLabels: Record<string, string> = { TOUR: 'Recorrido', CALL: 'Llamada', MEETING: 'Reunión', FOLLOW_UP: 'Seguimiento', OTHER: 'Otro' };
    const statusLabels: Record<string, string> = { SCHEDULED: 'Programada', COMPLETED: 'Completada', CANCELLED: 'Cancelada', CANCELED: 'Cancelada' };
    exportToExcel(
      appointments,
      [
        { header: 'Título', key: 'title', width: 30 },
        { header: 'Tipo', key: item => typeLabels[item.appointmentType] || item.appointmentType, width: 15 },
        { header: 'Estado', key: item => statusLabels[item.status] || item.status, width: 15 },
        { header: 'Inicio', key: item => formatDateTime(item.startsAt), width: 20 },
        { header: 'Fin', key: item => formatDateTime(item.endsAt), width: 20 },
        { header: 'Prospecto', key: item => item.leadId ? leads.find(l => l.id === item.leadId)?.firstName + ' ' + (leads.find(l => l.id === item.leadId)?.lastName || '') : '', width: 25 },
        { header: 'Propiedad', key: item => item.propertyId ? properties.find(p => p.id === item.propertyId)?.title || '' : '', width: 30 },
        { header: 'Ubicación', key: 'location', width: 30 },
        { header: 'Notas', key: 'notes', width: 40 }
      ],
      'agenda-homeforge',
      'Citas'
    );
  }

  return (
    <>
      <header className="mb-8 flex items-end justify-between gap-4"><div><p className="text-[11px] font-bold uppercase tracking-[.16em] text-indigo-600">Operación</p><h1 className="mt-1 text-3xl font-bold">Agenda</h1><p className="mt-2 text-sm text-slate-500">Organiza llamadas, reuniones, recorridos y seguimientos.</p></div>{appointments.length > 0 && <ExportButton onExport={handleExport} variant="secondary" />}</header>
      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <form className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" onSubmit={submit}>
          <h2 className="text-xl font-bold">Nueva cita</h2>
          <div className="mt-5 grid gap-4">
            <label className="text-sm font-semibold">Título<input className={inputClass} maxLength={180} onChange={e => setForm({ ...form, title: e.target.value })} required value={form.title} /></label>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm font-semibold">Tipo<select className={inputClass} onChange={e => setForm({ ...form, appointmentType: e.target.value as Appointment['appointmentType'] })} value={form.appointmentType}><option value="TOUR">Recorrido</option><option value="CALL">Llamada</option><option value="MEETING">Reunión</option><option value="FOLLOW_UP">Seguimiento</option><option value="OTHER">Otro</option></select></label>
              <label className="text-sm font-semibold">Estado<select className={inputClass} onChange={e => setForm({ ...form, status: e.target.value as Appointment['status'] })} value={form.status}><option value="SCHEDULED">Programada</option><option value="COMPLETED">Realizada</option><option value="CANCELED">Cancelada</option></select></label>
            </div>
            <label className="text-sm font-semibold">Inicio<input className={inputClass} onChange={e => setForm({ ...form, startsAt: e.target.value })} required type="datetime-local" value={form.startsAt} /></label>
            <label className="text-sm font-semibold">Fin<input className={inputClass} onChange={e => setForm({ ...form, endsAt: e.target.value })} type="datetime-local" value={form.endsAt} /></label>

            {/* Prospecto con búsqueda */}
            <div>
              <label className="text-sm font-semibold">Prospecto</label>
              <div className="relative mb-2 mt-2">
                <svg className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  className="w-full rounded-lg border border-slate-200 py-2 pl-11 pr-9 text-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  onChange={e => setSearchLead(e.target.value)}
                  placeholder="Buscar prospecto..."
                  type="text"
                  value={searchLead}
                />
                {searchLead && (
                  <button
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                    onClick={() => setSearchLead('')}
                    type="button"
                  >
                    <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              <select className={inputClass} onChange={e => { setForm({ ...form, leadId: e.target.value }); setSearchLead(''); }} value={form.leadId}>
                <option value="">Sin vincular ({filteredLeads.length})</option>
                {filteredLeads.map(lead => <option key={lead.id} value={lead.id}>{lead.firstName} {lead.lastName}</option>)}
              </select>
            </div>

            {/* Propiedad con búsqueda */}
            <div>
              <label className="text-sm font-semibold">Propiedad</label>
              <div className="relative mb-2 mt-2">
                <svg className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  className="w-full rounded-lg border border-slate-200 py-2 pl-11 pr-9 text-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  onChange={e => setSearchProperty(e.target.value)}
                  placeholder="Buscar propiedad..."
                  type="text"
                  value={searchProperty}
                />
                {searchProperty && (
                  <button
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                    onClick={() => setSearchProperty('')}
                    type="button"
                  >
                    <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              <select className={inputClass} onChange={e => { setForm({ ...form, propertyId: e.target.value }); setSearchProperty(''); }} value={form.propertyId}>
                <option value="">Sin vincular ({filteredProperties.length})</option>
                {filteredProperties.map(property => <option key={property.id} value={property.id}>{property.code} · {property.title}</option>)}
              </select>
            </div>

            <label className="text-sm font-semibold">Lugar<input className={inputClass} maxLength={255} onChange={e => setForm({ ...form, location: e.target.value })} value={form.location} /></label>
            <label className="text-sm font-semibold">Notas<textarea className={`${inputClass} min-h-24`} onChange={e => setForm({ ...form, notes: e.target.value })} value={form.notes} /></label>
            <button className="rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-60" disabled={saving}>{saving ? 'Guardando...' : 'Agregar a agenda'}</button>
          </div>
        </form>
        <section className="space-y-5">
          {Object.entries(grouped).map(([date, items]) => <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" key={date}><h2 className="mb-3 capitalize font-bold text-slate-700">{date}</h2>{items.map(item => <article className="flex flex-wrap items-center gap-4 border-t border-slate-100 py-4 first:border-0" key={item.id}><time className="w-20 text-sm font-bold text-indigo-700">{new Date(item.startsAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}</time><div className="min-w-0 flex-1"><strong className="block">{item.title}</strong><p className="text-sm text-slate-500">{item.location || 'Sin ubicación'}{item.notes ? ` · ${item.notes}` : ''}</p></div><span className={`rounded-full px-3 py-1 text-xs font-bold ${item.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : item.status === 'CANCELED' ? 'bg-slate-200 text-slate-700' : 'bg-indigo-100 text-indigo-800'}`}>{item.status}</span><div className="flex gap-2">{item.status === 'SCHEDULED' && <button className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold hover:bg-slate-50" onClick={() => complete(item)}>Marcar realizada</button>}<button className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100" onClick={() => setAppointmentToDelete(item.id)}>Eliminar</button></div></article>)}</div>)}
          {appointments.length === 0 && <p className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">No hay citas programadas.</p>}
        </section>
      </div>
      <UpgradeModal
        feature="crear nuevas citas"
        isOpen={upgradeModalOpen}
        level={restrictions.level === 'BLOCKED' ? 'BLOCKED' : 'LIMITED'}
        onClose={() => setUpgradeModalOpen(false)}
      />
      <ConfirmModal
        isOpen={appointmentToDelete !== null}
        title="¿Eliminar esta cita?"
        message="Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        onConfirm={confirmDelete}
        onCancel={() => setAppointmentToDelete(null)}
        loading={deleting}
        danger={true}
      />
    </>
  );
}
