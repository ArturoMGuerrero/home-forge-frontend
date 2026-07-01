import { useEffect, useState } from 'react';
import { listAvailability, createAvailability, deleteAvailability, AgentAvailability, dayLabels } from '../shared/agentAvailability';

export default function AgentAvailabilityPage() {
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
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mi Disponibilidad</h1>
          <p className="text-gray-600 mt-1">Configura tu horario disponible</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Agregar Horario
        </button>
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
                    <button
                      onClick={() => handleDelete(avail.id)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Eliminar
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Sin horarios configurados</p>
            )}
          </div>
        ))}
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowAddForm(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full" onClick={e => e.stopPropagation()}>
            <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Agregar Horario</h2>
              <button onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Día de la Semana</label>
                <select
                  value={formData.dayOfWeek}
                  onChange={e => setFormData({ ...formData, dayOfWeek: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(dayLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hora Inicio</label>
                  <input
                    type="time"
                    required
                    value={formData.startTime}
                    onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hora Fin</label>
                  <input
                    type="time"
                    required
                    value={formData.endTime}
                    onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
