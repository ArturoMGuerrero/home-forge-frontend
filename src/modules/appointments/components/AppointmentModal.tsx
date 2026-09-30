import { FormEvent, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { LeadItem } from '../../leads';
import { ApiProperty } from '../../properties';
import { AgendaAppointment as Appointment, createAgendaAppointment as createAppointment } from '../api/agendaApi';
import { SubscriptionRestrictions } from '../../../shared/subscriptionRestrictions';
import { UpgradeModal } from '../../../shared/UpgradeModal';
import { Button, Input, Modal, SearchInput, Select, Textarea } from '../../../shared/ui';
import { timeSlotOptions } from '../timeSlots';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAppointmentCreated: (appointment: Appointment) => void;
  leads: LeadItem[];
  properties: ApiProperty[];
  restrictions: SubscriptionRestrictions;
}

const FORM_ID = 'agenda-appointment-form';
const appointmentTypeOptions = [
  { value: 'PROPERTY_TOUR', label: 'Recorrido' },
  { value: 'CALL', label: 'Llamada' },
  { value: 'MEETING', label: 'Reunión' },
  { value: 'VIDEO_CALL', label: 'Videollamada' },
  { value: 'SIGNING', label: 'Firma de contrato' },
  { value: 'OTHER', label: 'Otro' }
];
const statusOptions = [
  { value: 'SCHEDULED', label: 'Programada' },
  { value: 'COMPLETED', label: 'Realizada' },
  { value: 'CANCELLED', label: 'Cancelada' }
];
const initialForm = {
  title: '',
  appointmentType: 'PROPERTY_TOUR' as Appointment['appointmentType'],
  status: 'SCHEDULED' as Appointment['status'],
  date: '',
  startTime: '09:00',
  endTime: '10:00',
  leadId: '',
  propertyId: '',
  location: '',
  notes: ''
};

export function AppointmentModal({ isOpen, onClose, onAppointmentCreated, leads, properties, restrictions }: Props) {
  const { t } = useTranslation();
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

      if (endDateTime <= startDateTime) {
        toast.error('La hora de fin debe ser posterior a la hora de inicio.');
        return;
      }

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
      <Modal
        footer={
          <>
            <Button onClick={handleClose} variant="tertiary">Cancelar</Button>
            <Button form={FORM_ID} loading={saving} type="submit">{saving ? 'Guardando...' : 'Agregar cita'}</Button>
          </>
        }
        isOpen={isOpen}
        maxWidth="2xl"
        onClose={handleClose}
        subtitle="Agrega una cita a tu agenda"
        title="Nueva cita"
      >
        <form className="grid gap-4" id={FORM_ID} onSubmit={submit} ref={formRef}>
          <Input label="Título" maxLength={180} onChange={e => setForm({ ...form, title: e.target.value })} required value={form.title} />

          <div className="grid gap-4 sm:grid-cols-2">
            <Select label="Tipo" onChange={e => setForm({ ...form, appointmentType: e.target.value as Appointment['appointmentType'] })} options={appointmentTypeOptions} value={form.appointmentType} />
            <Select label="Estado" onChange={e => setForm({ ...form, status: e.target.value as Appointment['status'] })} options={statusOptions} value={form.status} />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Input label="Fecha" onChange={e => setForm({ ...form, date: e.target.value })} required type="date" value={form.date} />
            <Select label="Inicio" onChange={e => setForm({ ...form, startTime: e.target.value })} options={timeSlotOptions} required value={form.startTime} />
            <Select label="Fin" onChange={e => setForm({ ...form, endTime: e.target.value })} options={timeSlotOptions} required value={form.endTime} />
          </div>

          <div className="grid gap-2">
            <Select
              label="Prospecto (opcional)"
              onChange={e => { setForm({ ...form, leadId: e.target.value }); setSearchLead(''); }}
              options={filteredLeads.map(lead => ({ value: lead.id, label: `${lead.firstName} ${lead.lastName}` }))}
              placeholder={`Sin vincular (${filteredLeads.length})`}
              value={form.leadId}
            />
            <SearchInput aria-label="Buscar prospecto" onChange={e => setSearchLead(e.target.value)} onClear={() => setSearchLead('')} placeholder="Filtrar prospectos..." value={searchLead} />
          </div>

          <div className="grid gap-2">
            <Select
              label="Propiedad (opcional)"
              onChange={e => { setForm({ ...form, propertyId: e.target.value }); setSearchProperty(''); }}
              options={filteredProperties.map(property => ({ value: property.id, label: `${property.code} · ${property.title}` }))}
              placeholder={`Sin vincular (${filteredProperties.length})`}
              value={form.propertyId}
            />
            <SearchInput aria-label="Buscar propiedad" onChange={e => setSearchProperty(e.target.value)} onClear={() => setSearchProperty('')} placeholder="Filtrar propiedades..." value={searchProperty} />
          </div>

          <Input label="Lugar (opcional)" maxLength={255} onChange={e => setForm({ ...form, location: e.target.value })} value={form.location} />
          <Textarea className="min-h-24" label="Notas (opcional)" onChange={e => setForm({ ...form, notes: e.target.value })} value={form.notes} />
        </form>
      </Modal>

      <UpgradeModal feature="crear nuevas citas" isOpen={upgradeModalOpen} level={restrictions.level === 'BLOCKED' ? 'BLOCKED' : 'LIMITED'} onClose={() => setUpgradeModalOpen(false)} />
    </>
  );
}
