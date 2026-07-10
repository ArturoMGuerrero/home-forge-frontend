import { FormEvent, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { LeadItem } from '../shared/leads';
import { ApiProperty } from '../shared/propertyApi';
import { Appointment, createAppointment } from '../shared/operationsApi';
import { SubscriptionRestrictions } from '../shared/subscriptionRestrictions';
import { UpgradeModal } from '../shared/UpgradeModal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAppointmentCreated: (appointment: Appointment) => void;
  leads: LeadItem[];
  properties: ApiProperty[];
  restrictions: SubscriptionRestrictions;
}

const inputClass = 'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100';
const initialForm = {
  title: '',
  appointmentType: 'TOUR' as Appointment['appointmentType'],
  status: 'SCHEDULED' as Appointment['status'],
  date: '',
  startTime: '09:00',
  endTime: '10:00',
  leadId: '',
  propertyId: '',
  location: '',
  notes: ''
};

// Generate time slots in 30-minute intervals
const generateTimeSlots = () => {
  const slots: string[] = [];
  for (let hour = 0; hour < 24; hour++) {
    slots.push(`${String(hour).padStart(2, '0')}:00`);
    slots.push(`${String(hour).padStart(2, '0')}:30`);
  }
  return slots;
};

export function AppointmentModal({ isOpen, onClose, onAppointmentCreated, leads, properties, restrictions }: Props) {
  const { t } = useTranslation();
  const timeSlots = generateTimeSlots();
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [searchLead, setSearchLead] = useState('');
  const [searchProperty, setSearchProperty] = useState('');
  const formRef = useRef<HTMLFormElement>(null);

  if (!isOpen) return null;

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
      const startDateTime = new Date(`${form.date}T${form.startTime}`);
      const endDateTime = new Date(`${form.date}T${form.endTime}`);

      const created = await createAppointment({
        title: form.title.trim(),
        appointmentType: form.appointmentType,
        status: form.status,
        startsAt: startDateTime.toISOString(),
        endsAt: endDateTime.toISOString(),
        leadId: form.leadId || undefined,
        propertyId: form.propertyId || undefined,
        location: form.location.trim() || undefined,
        notes: form.notes.trim() || undefined
      });
      onAppointmentCreated(created);
      setForm(initialForm);
      formRef.current?.reset();
      toast.success(t('agenda.appointmentCreated'));
      onClose();
    } catch (requestError) {
      toast.error(requestError instanceof Error ? requestError.message : 'No fue posible guardar la cita.');
    } finally {
      setSaving(false);
    }
  }

  function handleClose() {
    setForm(initialForm);
    setSearchLead('');
    setSearchProperty('');
    formRef.current?.reset();
    onClose();
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4" onClick={handleClose}>
        <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl" onClick={e => e.stopPropagation()}>
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-gradient-to-br from-slate-50 to-white px-6 py-5">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Nueva cita</h2>
              <p className="mt-0.5 text-sm text-slate-500">Agrega una cita a tu agenda</p>
            </div>
            <button
              className="flex size-10 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              onClick={handleClose}
              type="button"
            >
              <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <form ref={formRef} className="p-6" onSubmit={submit}>
            <div className="grid gap-4">
              <label className="text-sm font-semibold">
                Título
                <input className={inputClass} maxLength={180} onChange={e => setForm({ ...form, title: e.target.value })} required value={form.title} />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="text-sm font-semibold">
                  Tipo
                  <select className={inputClass} onChange={e => setForm({ ...form, appointmentType: e.target.value as Appointment['appointmentType'] })} value={form.appointmentType}>
                    <option value="TOUR">Recorrido</option>
                    <option value="CALL">Llamada</option>
                    <option value="MEETING">Reunión</option>
                    <option value="FOLLOW_UP">Seguimiento</option>
                    <option value="OTHER">Otro</option>
                  </select>
                </label>
                <label className="text-sm font-semibold">
                  Estado
                  <select className={inputClass} onChange={e => setForm({ ...form, status: e.target.value as Appointment['status'] })} value={form.status}>
                    <option value="SCHEDULED">Programada</option>
                    <option value="COMPLETED">Realizada</option>
                    <option value="CANCELED">Cancelada</option>
                  </select>
                </label>
              </div>

              <label className="text-sm font-semibold">
                Fecha
                <input
                  className={inputClass}
                  onChange={e => setForm({ ...form, date: e.target.value })}
                  required
                  type="date"
                  value={form.date}
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="text-sm font-semibold">
                  Hora de Inicio
                  <select
                    className={inputClass}
                    onChange={e => setForm({ ...form, startTime: e.target.value })}
                    required
                    value={form.startTime}
                  >
                    {timeSlots.map(slot => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </label>
                <label className="text-sm font-semibold">
                  Hora de Fin
                  <select
                    className={inputClass}
                    onChange={e => setForm({ ...form, endTime: e.target.value })}
                    required
                    value={form.endTime}
                  >
                    {timeSlots.map(slot => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </label>
              </div>

              {/* Prospecto con búsqueda */}
              <div>
                <label className="text-sm font-semibold">Prospecto (opcional)</label>
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
                  {filteredLeads.map(lead => (
                    <option key={lead.id} value={lead.id}>
                      {lead.firstName} {lead.lastName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Propiedad con búsqueda */}
              <div>
                <label className="text-sm font-semibold">Propiedad (opcional)</label>
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
                  {filteredProperties.map(property => (
                    <option key={property.id} value={property.id}>
                      {property.code} · {property.title}
                    </option>
                  ))}
                </select>
              </div>

              <label className="text-sm font-semibold">
                Lugar (opcional)
                <input className={inputClass} maxLength={255} onChange={e => setForm({ ...form, location: e.target.value })} value={form.location} />
              </label>

              <label className="text-sm font-semibold">
                Notas (opcional)
                <textarea className={`${inputClass} min-h-24`} onChange={e => setForm({ ...form, notes: e.target.value })} value={form.notes} />
              </label>
            </div>

            {/* Footer con botones */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                onClick={handleClose}
                type="button"
              >
                Cancelar
              </button>
              <button
                className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-900/20 transition hover:shadow-xl hover:shadow-indigo-900/30 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={saving}
              >
                {saving ? 'Guardando...' : 'Agregar cita'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <UpgradeModal feature="crear nuevas citas" isOpen={upgradeModalOpen} level={restrictions.level === 'BLOCKED' ? 'BLOCKED' : 'LIMITED'} onClose={() => setUpgradeModalOpen(false)} />
    </>
  );
}
