import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { createAppointment, updateAppointment, Appointment, AppointmentType, LocationType, appointmentTypeLabels, locationTypeLabels } from '../api/appointmentsApi';
import { getSession } from '../../auth';
import { Button, Input, Modal, Select, Textarea } from '../../../shared/ui';
import { timeSlotOptions } from '../timeSlots';

const FORM_ID = 'calendar-appointment-form';
const reminderOptions = [
  { value: '0', label: 'Sin recordatorio' },
  { value: '15', label: '15 minutos antes' },
  { value: '30', label: '30 minutos antes' },
  { value: '60', label: '1 hora antes' },
  { value: '1440', label: '1 día antes' }
];

interface NewAppointmentModalProps {
  defaultDate?: Date;
  appointment?: Appointment | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function NewAppointmentModal({ defaultDate, appointment, onClose, onSuccess }: NewAppointmentModalProps) {
  const session = getSession();

  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    appointmentType: AppointmentType.MEETING,
    date: '',
    startTime: '09:00',
    endTime: '10:00',
    locationType: LocationType.IN_PERSON,
    locationAddress: '',
    virtualMeetingUrl: '',
    reminderMinutes: 30,
    notes: ''
  });

  useEffect(() => {
    if (appointment) {
      const start = new Date(appointment.startsAt);
      const end = new Date(appointment.endsAt);
      setFormData({
        title: appointment.title,
        description: appointment.description || '',
        appointmentType: appointment.appointmentType,
        date: `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`,
        startTime: `${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}`,
        endTime: `${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`,
        locationType: appointment.locationType || LocationType.IN_PERSON,
        locationAddress: appointment.location || '',
        virtualMeetingUrl: appointment.virtualMeetingUrl || '',
        reminderMinutes: appointment.reminderMinutes ?? 30,
        notes: appointment.notes || ''
      });
      return;
    }
    if (defaultDate) {
      const year = defaultDate.getFullYear();
      const month = String(defaultDate.getMonth() + 1).padStart(2, '0');
      const day = String(defaultDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      const hour = defaultDate.getHours();
      const minutes = defaultDate.getMinutes();
      // Round to nearest 30 minutes
      const roundedMinutes = minutes < 30 ? '00' : '30';
      const startTime = `${String(hour).padStart(2, '0')}:${roundedMinutes}`;
      const endHour = minutes < 30 ? hour : hour + 1;
      const endTime = `${String(endHour).padStart(2, '0')}:${minutes < 30 ? '30' : '00'}`;

      setFormData(prev => ({
        ...prev,
        date: dateStr,
        startTime,
        endTime
      }));
    }
  }, [appointment, defaultDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.companyId || !session.userId) {
      toast.error('La sesión no contiene una empresa o usuario válido. Inicia sesión nuevamente.');
      return;
    }

    const startDateTime = new Date(`${formData.date}T${formData.startTime}`);
    const endDateTime = new Date(`${formData.date}T${formData.endTime}`);
    if (endDateTime <= startDateTime) {
      toast.error('La hora de fin debe ser posterior a la hora de inicio.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        companyId: session.companyId,
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        appointmentType: formData.appointmentType,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        locationType: formData.locationType,
        locationAddress: formData.locationAddress.trim() || undefined,
        virtualMeetingUrl: formData.virtualMeetingUrl.trim() || undefined,
        reminderMinutes: formData.reminderMinutes,
        notes: formData.notes.trim() || undefined,
        createdByUserId: session.userId
      };
      if (appointment) await updateAppointment(appointment.id, payload);
      else await createAppointment(payload);
      toast.success(appointment ? 'Cita actualizada correctamente.' : 'Cita creada correctamente.');
      onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al crear la cita.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      footer={
        <>
          <Button onClick={onClose} variant="tertiary">Cancelar</Button>
          <Button form={FORM_ID} loading={saving} type="submit">{appointment ? 'Guardar cambios' : 'Crear cita'}</Button>
        </>
      }
      isOpen
      maxWidth="2xl"
      onClose={onClose}
      subtitle={appointment ? 'Actualiza los datos de la cita' : 'Agrega una cita a tu agenda'}
      title={appointment ? 'Editar cita' : 'Nueva cita'}
    >
      <form className="grid gap-4" id={FORM_ID} onSubmit={handleSubmit}>
        <Input
          label="Título"
          onChange={e => setFormData({ ...formData, title: e.target.value })}
          placeholder="Ej: Visita a casa en Las Lomas"
          required
          value={formData.title}
        />
        <Textarea
          label="Descripción"
          onChange={e => setFormData({ ...formData, description: e.target.value })}
          placeholder="Detalles adicionales de la cita..."
          rows={3}
          value={formData.description}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Tipo de cita"
            onChange={e => setFormData({ ...formData, appointmentType: e.target.value as AppointmentType })}
            options={Object.entries(appointmentTypeLabels).map(([value, label]) => ({ value, label }))}
            required
            value={formData.appointmentType}
          />
          <Select
            label="Tipo de ubicación"
            onChange={e => setFormData({ ...formData, locationType: e.target.value as LocationType })}
            options={Object.entries(locationTypeLabels).map(([value, label]) => ({ value, label }))}
            required
            value={formData.locationType}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Input label="Fecha" onChange={e => setFormData({ ...formData, date: e.target.value })} required type="date" value={formData.date} />
          <Select label="Inicio" onChange={e => setFormData({ ...formData, startTime: e.target.value })} options={timeSlotOptions} required value={formData.startTime} />
          <Select label="Fin" onChange={e => setFormData({ ...formData, endTime: e.target.value })} options={timeSlotOptions} required value={formData.endTime} />
        </div>

        {formData.locationType === LocationType.IN_PERSON && (
          <Input
            label="Dirección"
            onChange={e => setFormData({ ...formData, locationAddress: e.target.value })}
            placeholder="Ej: Av. Principal 123, Col. Centro"
            value={formData.locationAddress}
          />
        )}

        {formData.locationType === LocationType.VIRTUAL && (
          <Input
            label="URL de reunión"
            onChange={e => setFormData({ ...formData, virtualMeetingUrl: e.target.value })}
            placeholder="https://meet.google.com/..."
            type="url"
            value={formData.virtualMeetingUrl}
          />
        )}

        <Select
          label="Recordatorio"
          onChange={e => setFormData({ ...formData, reminderMinutes: Number(e.target.value) })}
          options={reminderOptions}
          value={String(formData.reminderMinutes)}
        />

        <Textarea
          label="Notas"
          onChange={e => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Notas internas..."
          rows={3}
          value={formData.notes}
        />
      </form>
    </Modal>
  );
}
