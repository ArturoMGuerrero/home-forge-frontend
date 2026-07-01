import { useEffect, useState } from 'react';
import { listAppointments, Appointment, AppointmentStatus, appointmentTypeLabels, appointmentStatusLabels } from '../shared/appointments';
import NewAppointmentModal from '../components/NewAppointmentModal';

const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

export default function CalendarPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const companyId = localStorage.getItem('companyId') || '';

  const loadAppointments = async () => {
    try {
      const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59);

      const data = await listAppointments({
        companyId,
        startTimestamp: start.getTime(),
        endTimestamp: end.getTime()
      });
      setAppointments(data);
    } catch (error) {
      console.error('Error loading appointments:', error);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [currentDate]);

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const getAppointmentsForDay = (date: Date | null) => {
    if (!date) return [];
    const dateStr = date.toISOString().split('T')[0];
    return appointments.filter(apt => {
      const aptDate = new Date(apt.startTime).toISOString().split('T')[0];
      return aptDate === dateStr;
    });
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleDayClick = (date: Date | null) => {
    if (date) {
      setSelectedDate(date);
      setShowNewModal(true);
    }
  };

  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.SCHEDULED: return 'bg-blue-100 text-blue-800 border-blue-300';
      case AppointmentStatus.CONFIRMED: return 'bg-green-100 text-green-800 border-green-300';
      case AppointmentStatus.COMPLETED: return 'bg-gray-100 text-gray-800 border-gray-300';
      case AppointmentStatus.CANCELLED: return 'bg-red-100 text-red-800 border-red-300';
      case AppointmentStatus.NO_SHOW: return 'bg-orange-100 text-orange-800 border-orange-300';
      case AppointmentStatus.RESCHEDULED: return 'bg-purple-100 text-purple-800 border-purple-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const days = getDaysInMonth();

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendario de Citas</h1>
          <p className="text-gray-600 mt-1">Gestiona tus citas y eventos</p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Nueva Cita
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="mb-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={goToPreviousMonth} className="px-3 py-1 border rounded hover:bg-gray-50">
              ←
            </button>
            <h2 className="text-xl font-semibold">
              {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button onClick={goToNextMonth} className="px-3 py-1 border rounded hover:bg-gray-50">
              →
            </button>
            <button onClick={goToToday} className="px-3 py-1 border rounded hover:bg-gray-50 text-sm">
              Hoy
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 rounded ${viewMode === 'month' ? 'bg-blue-600 text-white' : 'border hover:bg-gray-50'}`}
            >
              Mes
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 rounded ${viewMode === 'week' ? 'bg-blue-600 text-white' : 'border hover:bg-gray-50'}`}
            >
              Semana
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1 rounded ${viewMode === 'day' ? 'bg-blue-600 text-white' : 'border hover:bg-gray-50'}`}
            >
              Día
            </button>
          </div>
        </div>

        {viewMode === 'month' && (
          <div>
            <div className="grid grid-cols-7 gap-2 mb-2">
              {DAYS.map(day => (
                <div key={day} className="text-center font-semibold text-gray-700 py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {days.map((date, index) => {
                const dayAppointments = getAppointmentsForDay(date);
                return (
                  <div
                    key={index}
                    onClick={() => handleDayClick(date)}
                    className={`min-h-[120px] border rounded-lg p-2 cursor-pointer transition-colors ${
                      date ? 'bg-white hover:bg-blue-50' : 'bg-gray-50'
                    } ${isToday(date) ? 'ring-2 ring-blue-500' : ''}`}
                  >
                    {date && (
                      <>
                        <div className={`text-sm font-semibold mb-1 ${isToday(date) ? 'text-blue-600' : 'text-gray-700'}`}>
                          {date.getDate()}
                        </div>
                        <div className="space-y-1">
                          {dayAppointments.slice(0, 3).map(apt => (
                            <div
                              key={apt.id}
                              className={`text-xs p-1 rounded border ${getStatusColor(apt.status)}`}
                              title={`${new Date(apt.startTime).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })} - ${apt.title}`}
                            >
                              <div className="font-semibold truncate">
                                {new Date(apt.startTime).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                              </div>
                              <div className="truncate">{apt.title}</div>
                            </div>
                          ))}
                          {dayAppointments.length > 3 && (
                            <div className="text-xs text-gray-500 text-center">
                              +{dayAppointments.length - 3} más
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {viewMode === 'week' && (
          <div className="text-center text-gray-500 py-12">
            Vista semanal - próximamente
          </div>
        )}

        {viewMode === 'day' && (
          <div className="text-center text-gray-500 py-12">
            Vista diaria - próximamente
          </div>
        )}
      </div>

      {showNewModal && (
        <NewAppointmentModal
          defaultDate={selectedDate || undefined}
          onClose={() => {
            setShowNewModal(false);
            setSelectedDate(null);
          }}
          onSuccess={() => {
            setShowNewModal(false);
            setSelectedDate(null);
            loadAppointments();
          }}
        />
      )}
    </div>
  );
}
