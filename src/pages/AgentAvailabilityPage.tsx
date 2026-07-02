import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listAvailability, createAvailability, deleteAvailability, AgentAvailability, dayLabels } from '../shared/agentAvailability';
import { Modal, Button, Select, Input } from '../shared/ui';

export default function AgentAvailabilityPage() {
  const navigate = useNavigate();
  const [availabilities, setAvailabilities] = useState<AgentAvailability[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const userId = localStorage.getItem('userId') || '';
  const companyId = localStorage.getItem('companyId') || '';

  const [formData, setFormData] = useState({
    dayOfWeek: 1,
    startTime: '09:00',
    endTime: '17:00'
  });

  const loadAvailabilities = async () => {
    try {
      const data = await listAvailability({ userId });
      setAvailabilities(data);
    } catch (error) {
      console.error('Error loading availabilities:', error);
    }
  };

  useEffect(() => {
    loadAvailabilities();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAvailability({
        companyId,
        userId,
        ...formData
      });
      setShowAddForm(false);
      setFormData({ dayOfWeek: 1, startTime: '09:00', endTime: '17:00' });
      loadAvailabilities();
    } catch (error) {
      console.error('Error creating availability:', error);
      alert('Error al crear disponibilidad');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta disponibilidad?')) return;
    try {
      await deleteAvailability(id);
      loadAvailabilities();
    } catch (error) {
      console.error('Error deleting availability:', error);
      alert('Error al eliminar disponibilidad');
    }
  };

  const groupedByDay = availabilities.reduce((acc, avail) => {
    if (!acc[avail.dayOfWeek]) acc[avail.dayOfWeek] = [];
    acc[avail.dayOfWeek].push(avail);
    return acc;
  }, {} as Record<number, AgentAvailability[]>);

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-6">
          {/* Botón de volver */}
          <Button
            onClick={() => navigate(-1)}
            variant="tertiary"
            icon={
              <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            }
          >
            Volver
          </Button>

          {/* Título */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mi Disponibilidad</h1>
            <p className="text-gray-600 mt-1">Configura tu horario disponible</p>
          </div>
        </div>

        {/* Botón agregar */}
        <Button
          onClick={() => setShowAddForm(true)}
          variant="primary"
          icon={
            <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          }
        >
          Agregar Horario
        </Button>
      </div>

      <div className="grid gap-4">
        {[1, 2, 3, 4, 5, 6, 0].map(day => (
          <div key={day} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-3">{dayLabels[day]}</h3>
            {groupedByDay[day] && groupedByDay[day].length > 0 ? (
              <div className="space-y-2">
                {groupedByDay[day].map(avail => (
                  <div key={avail.id} className="flex justify-between items-center p-3 bg-gray-50 rounded border">
                    <div className="flex items-center gap-4">
                      <span className="font-medium text-gray-900">
                        {avail.startTime} - {avail.endTime}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        avail.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {avail.isAvailable ? 'Disponible' : 'No disponible'}
                      </span>
                    </div>
                    <Button
                      onClick={() => handleDelete(avail.id)}
                      variant="danger-ghost"
                      size="sm"
                    >
                      Eliminar
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Sin horarios configurados</p>
            )}
          </div>
        ))}
      </div>

      <Modal
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        title="Agregar Horario"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Día de la Semana"
            value={formData.dayOfWeek}
            onChange={e => setFormData({ ...formData, dayOfWeek: Number(e.target.value) })}
          >
            {Object.entries(dayLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </Select>

          <div className="grid grid-cols-2 gap-4">
            <Input
              type="time"
              label="Hora Inicio"
              required
              value={formData.startTime}
              onChange={e => setFormData({ ...formData, startTime: e.target.value })}
            />

            <Input
              type="time"
              label="Hora Fin"
              required
              value={formData.endTime}
              onChange={e => setFormData({ ...formData, endTime: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              onClick={() => setShowAddForm(false)}
              variant="tertiary"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
            >
              Guardar
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
