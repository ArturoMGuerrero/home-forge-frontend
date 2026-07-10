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

  const goToPreviousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const goToPreviousDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getWeekDays = () => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day;
    startOfWeek.setDate(diff);

    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      week.push(date);
    }
    return week;
  };

  const getAppointmentsForTimeSlot = (date: Date, hour: number) => {
    const dateStr = date.toISOString().split('T')[0];
    const slotStart = new Date(date);
    slotStart.setHours(hour, 0, 0, 0);
    const slotEnd = new Date(date);
    slotEnd.setHours(hour + 1, 0, 0, 0);

    return appointments.filter(apt => {
      const aptStart = new Date(apt.startTime);
      const aptEnd = new Date(apt.endTime);
      const aptDateStr = aptStart.toISOString().split('T')[0];

      // Solo mostrar si es el mismo día
      if (aptDateStr !== dateStr) return false;

      // Mostrar si la cita empieza en esta hora O si está en progreso durante esta hora
      return (
        (aptStart >= slotStart && aptStart < slotEnd) || // Empieza en esta hora
        (aptStart < slotStart && aptEnd > slotStart)     // Ya empezó pero sigue activa
      );
    });
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
    <div className="min-h-screen p-6 overflow-x-hidden">
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
                onClick={
                  viewMode === 'month' ? goToPreviousMonth :
                  viewMode === 'week' ? goToPreviousWeek :
                  goToPreviousDay
                }
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
                {viewMode === 'month' && `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
                {viewMode === 'week' && `Semana del ${currentDate.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                {viewMode === 'day' && currentDate.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </h2>
              <Button
                onClick={
                  viewMode === 'month' ? goToNextMonth :
                  viewMode === 'week' ? goToNextWeek :
                  goToNextDay
                }
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
          <div className="p-6">
            {/* Week Header */}
            <div className="grid grid-cols-8 gap-2 mb-2">
              <div className="text-xs font-semibold text-slate-600 py-2"></div>
              {getWeekDays().map((date, index) => {
                const today = isToday(date);
                return (
                  <div key={index} className={`text-center py-2 rounded-lg ${today ? 'bg-blue-100' : ''}`}>
                    <div className="text-xs font-semibold text-slate-600 uppercase">
                      {DAYS[date.getDay()]}
                    </div>
                    <div className={`text-lg font-bold ${today ? 'text-blue-600' : 'text-slate-800'}`}>
                      {date.getDate()}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Time slots */}
            <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
              {Array.from({ length: 14 }, (_, i) => i + 7).map(hour => (
                <div key={hour} className="grid grid-cols-8 gap-2 border-b border-slate-100 last:border-b-0">
                  <div className="text-xs font-semibold text-slate-600 py-3 px-2 bg-slate-50">
                    {hour.toString().padStart(2, '0')}:00
                  </div>
                  {getWeekDays().map((date, dayIndex) => {
                    const dayAppointments = getAppointmentsForTimeSlot(date, hour);
                    // Filtrar para mostrar solo las que EMPIEZAN en esta hora (evitar duplicados)
                    const appointmentsStartingHere = dayAppointments.filter(apt => {
                      const startHour = new Date(apt.startTime).getHours();
                      return startHour === hour;
                    });

                    return (
                      <div
                        key={dayIndex}
                        className="min-h-[60px] p-1 border-l border-slate-100 hover:bg-blue-50 cursor-pointer transition relative"
                        onClick={() => {
                          setSelectedDate(new Date(date.setHours(hour, 0, 0, 0)));
                          setShowNewModal(true);
                        }}
                      >
                        {appointmentsStartingHere.map(apt => {
                          const startTime = new Date(apt.startTime);
                          const endTime = new Date(apt.endTime);
                          const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
                          const heightMultiplier = Math.max(1, Math.min(durationHours, 4));

                          return (
                            <div
                              key={apt.id}
                              className={`text-xs p-1.5 rounded mb-1 border-l-2 ${getStatusColor(apt.status)}`}
                              style={{ minHeight: `${heightMultiplier * 50}px` }}
                              title={`${apt.title}\n${startTime.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })} - ${endTime.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}`}
                            >
                              <div className="font-bold truncate">{apt.title}</div>
                              <div className="text-[10px] truncate">
                                {startTime.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                                {' - '}
                                {endTime.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}

        {viewMode === 'day' && (
          <div className="p-6">
            <div className="border border-slate-200 rounded-lg overflow-hidden bg-white max-w-4xl mx-auto">
              {/* Day appointments by hour */}
              {Array.from({ length: 14 }, (_, i) => i + 7).map(hour => {
                const hourAppointments = getAppointmentsForTimeSlot(currentDate, hour);
                // Solo mostrar las que EMPIEZAN en esta hora
                const appointmentsStartingHere = hourAppointments.filter(apt => {
                  const startHour = new Date(apt.startTime).getHours();
                  return startHour === hour;
                });

                return (
                  <div key={hour} className="flex border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition">
                    <div className="w-24 py-4 px-4 bg-slate-50 border-r border-slate-200 flex-shrink-0">
                      <div className="text-sm font-bold text-slate-700">
                        {hour.toString().padStart(2, '0')}:00
                      </div>
                      <div className="text-xs text-slate-500">
                        {hour < 12 ? 'AM' : 'PM'}
                      </div>
                    </div>
                    <div
                      className="flex-1 p-3 cursor-pointer min-h-[80px]"
                      onClick={() => {
                        if (appointmentsStartingHere.length === 0) {
                          const newDate = new Date(currentDate);
                          newDate.setHours(hour, 0, 0, 0);
                          setSelectedDate(newDate);
                          setShowNewModal(true);
                        }
                      }}
                    >
                      {appointmentsStartingHere.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                          Click para agregar cita
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {appointmentsStartingHere.map(apt => (
                            <div
                              key={apt.id}
                              className={`p-4 rounded-lg border-l-4 ${getStatusColor(apt.status)} shadow-sm`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1">
                                  <div className="font-bold text-base mb-1">{apt.title}</div>
                                  <div className="text-sm text-slate-600 mb-2">
                                    {new Date(apt.startTime).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                                    {' - '}
                                    {new Date(apt.endTime).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                                  </div>
                                  {apt.description && (
                                    <p className="text-sm text-slate-600">{apt.description}</p>
                                  )}
                                  {apt.location && (
                                    <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
                                      <svg className="size-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                      </svg>
                                      {apt.location}
                                    </div>
                                  )}
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(apt.status)}`}>
                                    {appointmentStatusLabels[apt.status]}
                                  </span>
                                  {apt.appointmentType && (
                                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                                      {appointmentTypeLabels[apt.appointmentType]}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
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
