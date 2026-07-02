import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listAppointments, Appointment, AppointmentStatus, appointmentTypeLabels, appointmentStatusLabels } from '../shared/appointments';
import NewAppointmentModal from '../components/NewAppointmentModal';
import { Button } from '../shared/ui';

const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

export default function CalendarPage() {
  const navigate = useNavigate();
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-gray-100 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Calendario de Citas
            </h1>
            <p className="text-slate-600 mt-2 text-lg">Gestiona tus citas y eventos del día a día</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => navigate('/app/calendario/disponibilidad')}
              variant="secondary"
              icon={
                <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            >
              Mi Disponibilidad
            </Button>
            <Button
              onClick={() => setShowNewModal(true)}
              variant="primary"
              icon={
                <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              }
            >
              Nueva Cita
            </Button>
          </div>
        </div>
      </div>

      {/* Calendar Card */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Calendar Controls */}
        <div className="bg-gradient-to-r from-slate-700 to-slate-800 p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Button
                onClick={goToPreviousMonth}
                variant="secondary"
                size="sm"
                className="!bg-white/20 !border-white/30 !text-white hover:!bg-white/30"
                icon={
                  <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                }
              />
              <h2 className="text-2xl font-bold text-white min-w-[250px] text-center">
                {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <Button
                onClick={goToNextMonth}
                variant="secondary"
                size="sm"
                className="!bg-white/20 !border-white/30 !text-white hover:!bg-white/30"
                icon={
                  <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                }
              />
              <Button
                onClick={goToToday}
                variant="secondary"
                size="sm"
                className="!bg-white !text-slate-700 hover:!bg-white/90 !font-semibold"
              >
                Hoy
              </Button>
            </div>

            <div className="flex gap-1 bg-slate-800/50 backdrop-blur-sm rounded-xl p-1.5 border border-white/10">
              <button
                onClick={() => setViewMode('month')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  viewMode === 'month'
                    ? 'bg-white text-slate-800 shadow-lg'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                Mes
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  viewMode === 'week'
                    ? 'bg-white text-slate-800 shadow-lg'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                Semana
              </button>
              <button
                onClick={() => setViewMode('day')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  viewMode === 'day'
                    ? 'bg-white text-slate-800 shadow-lg'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                Día
              </button>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        {viewMode === 'month' && (
          <div className="p-6">
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-3 mb-4">
              {DAYS.map(day => (
                <div key={day} className="text-center font-bold text-slate-700 py-3 text-sm uppercase tracking-wider">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-3">
              {days.map((date, index) => {
                const dayAppointments = getAppointmentsForDay(date);
                const today = isToday(date);
                return (
                  <div
                    key={index}
                    onClick={() => handleDayClick(date)}
                    className={`
                      min-h-[130px] rounded-xl p-3 transition-all duration-200 relative overflow-hidden
                      ${date ? 'bg-white border-2 cursor-pointer shadow-sm hover:shadow-lg hover:scale-[1.02]' : 'bg-slate-50/50 border-2 border-transparent'}
                      ${today ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-sky-50 ring-2 ring-blue-200' : 'border-slate-200 hover:border-blue-400'}
                    `}
                  >
                    {date && (
                      <>
                        {/* Day Number */}
                        <div className={`
                          flex items-center justify-center w-8 h-8 rounded-full mb-2 font-bold text-sm
                          ${today
                            ? 'bg-gradient-to-r from-blue-600 to-sky-600 text-white shadow-md'
                            : 'text-slate-700'
                          }
                        `}>
                          {date.getDate()}
                        </div>

                        {/* Appointments */}
                        <div className="space-y-1.5">
                          {dayAppointments.slice(0, 2).map(apt => (
                            <div
                              key={apt.id}
                              className={`
                                text-xs p-2 rounded-lg border-l-4 shadow-sm hover:shadow-md transition-all
                                ${getStatusColor(apt.status)}
                              `}
                              title={`${new Date(apt.startTime).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })} - ${apt.title}`}
                            >
                              <div className="font-bold text-xs mb-0.5">
                                {new Date(apt.startTime).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                              </div>
                              <div className="truncate font-medium">{apt.title}</div>
                            </div>
                          ))}
                          {dayAppointments.length > 2 && (
                            <div className="text-xs text-blue-600 font-semibold text-center bg-blue-50 rounded-lg py-1">
                              +{dayAppointments.length - 2} más
                            </div>
                          )}
                        </div>

                        {/* Indicator for days with events */}
                        {dayAppointments.length > 0 && (
                          <div className="absolute top-2 right-2">
                            <div className="size-2 rounded-full bg-blue-500 animate-pulse" />
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {viewMode === 'week' && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="bg-gradient-to-br from-blue-100 to-sky-100 rounded-full p-8 mb-6">
              <svg className="size-16 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Vista Semanal</h3>
            <p className="text-slate-500 text-center max-w-md">
              La vista semanal estará disponible próximamente para visualizar tus citas en formato de semana.
            </p>
          </div>
        )}

        {viewMode === 'day' && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="bg-gradient-to-br from-slate-100 to-gray-100 rounded-full p-8 mb-6">
              <svg className="size-16 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Vista Diaria</h3>
            <p className="text-slate-500 text-center max-w-md">
              La vista diaria estará disponible próximamente para ver todas tus citas del día en detalle.
            </p>
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
