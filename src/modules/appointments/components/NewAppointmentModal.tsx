import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { createAppointment, updateAppointment, Appointment, AppointmentType, LocationType, appointmentTypeLabels, locationTypeLabels } from '../api/appointmentsApi';
import { getSession } from '../../auth';
import { Modal } from '../../../shared/ui/Modal';

interface NewAppointmentModalProps {
  defaultDate?: Date;
  appointment?: Appointment | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function NewAppointmentModal({ defaultDate, appointment, onClose, onSuccess }: NewAppointmentModalProps) {
  const session = getSession();

  // Generate time slots in 30-minute intervals
  const generateTimeSlots = () => {
    const slots: string[] = [];
    for (let hour = 0; hour < 24; hour++) {
      slots.push(`${String(hour).padStart(2, '0')}:00`);
      slots.push(`${String(hour).padStart(2, '0')}:30`);
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

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

    try {
      const startDateTime = new Date(`${formData.date}T${formData.startTime}`);
      const endDateTime = new Date(`${formData.date}T${formData.endTime}`);

      if (endDateTime <= startDateTime) {
        toast.error('La hora de fin debe ser posterior a la hora de inicio.');
        return;
      }

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
      console.error('Error creating appointment:', error);
      toast.error(error instanceof Error ? error.message : 'Error al crear la cita.');
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={appointment ? 'Editar cita' : 'Nueva cita'}
      subtitle={appointment ? 'Actualiza los datos de la cita' : 'Agrega una cita a tu agenda'}
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-fg-muted mb-1">Título *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-border-strong rounded-lg focus:ring-2 focus:ring-info"
              placeholder="Ej: Visita a casa en Las Lomas"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-fg-muted mb-1">Descripción</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-border-strong rounded-lg focus:ring-2 focus:ring-info"
              rows={3}
              placeholder="Detalles adicionales de la cita..."
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-fg-muted mb-1">Tipo de Cita *</label>
              <select
                required
                value={formData.appointmentType}
                onChange={e => setFormData({ ...formData, appointmentType: e.target.value as AppointmentType })}
                className="w-full px-3 py-2 border border-border-strong rounded-lg focus:ring-2 focus:ring-info"
              >
                {Object.entries(appointmentTypeLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-fg-muted mb-1">Tipo de Ubicación *</label>
              <select
                required
                value={formData.locationType}
                onChange={e => setFormData({ ...formData, locationType: e.target.value as LocationType })}
                className="w-full px-3 py-2 border border-border-strong rounded-lg focus:ring-2 focus:ring-info"
              >
                {Object.entries(locationTypeLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-fg-muted mb-1">Fecha *</label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={e => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 border border-border-strong rounded-lg focus:ring-2 focus:ring-info"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-fg-muted mb-1">Hora de Inicio *</label>
              <select
                required
                value={formData.startTime}
                onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-3 py-2 border border-border-strong rounded-lg focus:ring-2 focus:ring-info"
              >
                {timeSlots.map(slot => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-fg-muted mb-1">Hora de Fin *</label>
              <select
                required
                value={formData.endTime}
                onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-3 py-2 border border-border-strong rounded-lg focus:ring-2 focus:ring-info"
              >
                {timeSlots.map(slot => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
            </div>
          </div>

          {formData.locationType === LocationType.IN_PERSON && (
            <div>
              <label className="block text-sm font-medium text-fg-muted mb-1">Dirección</label>
              <input
                type="text"
                value={formData.locationAddress}
                onChange={e => setFormData({ ...formData, locationAddress: e.target.value })}
                className="w-full px-3 py-2 border border-border-strong rounded-lg focus:ring-2 focus:ring-info"
                placeholder="Ej: Av. Principal 123, Col. Centro"
              />
            </div>
          )}

          {formData.locationType === LocationType.VIRTUAL && (
            <div>
              <label className="block text-sm font-medium text-fg-muted mb-1">URL de Reunión</label>
              <input
                type="url"
                value={formData.virtualMeetingUrl}
                onChange={e => setFormData({ ...formData, virtualMeetingUrl: e.target.value })}
                className="w-full px-3 py-2 border border-border-strong rounded-lg focus:ring-2 focus:ring-info"
                placeholder="https://meet.google.com/..."
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-fg-muted mb-1">Recordatorio</label>
            <select
              value={formData.reminderMinutes}
              onChange={e => setFormData({ ...formData, reminderMinutes: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-border-strong rounded-lg focus:ring-2 focus:ring-info"
            >
              <option value={0}>Sin recordatorio</option>
              <option value={15}>15 minutos antes</option>
              <option value={30}>30 minutos antes</option>
              <option value={60}>1 hora antes</option>
              <option value={1440}>1 día antes</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-fg-muted mb-1">Notas</label>
            <textarea
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-border-strong rounded-lg focus:ring-2 focus:ring-info"
              rows={3}
              placeholder="Notas internas..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border border-border rounded-xl text-sm font-semibold text-fg-muted hover:bg-surface-muted transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transition"
            >
              {appointment ? 'Guardar cambios' : 'Crear cita'}
            </button>
          </div>
        </form>
    </Modal>
  );
}
