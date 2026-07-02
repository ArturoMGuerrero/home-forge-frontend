import { useState, useEffect } from 'react';
import { createAppointment, AppointmentType, LocationType, appointmentTypeLabels, locationTypeLabels } from '../shared/appointments';
import { Modal } from '../shared/ui/Modal';

interface NewAppointmentModalProps {
  defaultDate?: Date;
  onClose: () => void;
  onSuccess: () => void;
}

export default function NewAppointmentModal({ defaultDate, onClose, onSuccess }: NewAppointmentModalProps) {
  const companyId = localStorage.getItem('companyId') || '';
  const userId = localStorage.getItem('userId') || '';

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    appointmentType: AppointmentType.MEETING,
    startTime: '',
    endTime: '',
    locationType: LocationType.IN_PERSON,
    locationAddress: '',
    virtualMeetingUrl: '',
    reminderMinutes: 30,
    notes: ''
  });

  useEffect(() => {
    if (defaultDate) {
      const year = defaultDate.getFullYear();
      const month = String(defaultDate.getMonth() + 1).padStart(2, '0');
      const day = String(defaultDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      setFormData(prev => ({
        ...prev,
        startTime: `${dateStr}T09:00`,
        endTime: `${dateStr}T10:00`
      }));
    }
  }, [defaultDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAppointment({
        companyId,
        ...formData,
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
        createdByUserId: userId,
        googleCalendarSyncEnabled: false
      });
      onSuccess();
    } catch (error) {
      console.error('Error creating appointment:', error);
      alert('Error al crear la cita');
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Nueva Cita"
      subtitle="Agrega una cita a tu agenda"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: Visita a casa en Las Lomas"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Detalles adicionales de la cita..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Cita *</label>
              <select
                required
                value={formData.appointmentType}
                onChange={e => setFormData({ ...formData, appointmentType: e.target.value as AppointmentType })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(appointmentTypeLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Ubicación *</label>
              <select
                required
                value={formData.locationType}
                onChange={e => setFormData({ ...formData, locationType: e.target.value as LocationType })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(locationTypeLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Inicio *</label>
              <input
                type="datetime-local"
                required
                value={formData.startTime}
                onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fin *</label>
              <input
                type="datetime-local"
                required
                value={formData.endTime}
                onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {formData.locationType === LocationType.IN_PERSON && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
              <input
                type="text"
                value={formData.locationAddress}
                onChange={e => setFormData({ ...formData, locationAddress: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Av. Principal 123, Col. Centro"
              />
            </div>
          )}

          {formData.locationType === LocationType.VIRTUAL && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL de Reunión</label>
              <input
                type="url"
                value={formData.virtualMeetingUrl}
                onChange={e => setFormData({ ...formData, virtualMeetingUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="https://meet.google.com/..."
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Recordatorio</label>
            <select
              value={formData.reminderMinutes}
              onChange={e => setFormData({ ...formData, reminderMinutes: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value={0}>Sin recordatorio</option>
              <option value={15}>15 minutos antes</option>
              <option value={30}>30 minutos antes</option>
              <option value={60}>1 hora antes</option>
              <option value={1440}>1 día antes</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
            <textarea
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Notas internas..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transition"
            >
              Crear Cita
            </button>
          </div>
        </form>
    </Modal>
  );
}
