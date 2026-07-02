import { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import toast from 'react-hot-toast';
import { LeadItem } from '../shared/leads';
import { ApiProperty } from '../shared/propertyApi';
import { Appointment, deleteAppointment, listAppointments, loadOperationsContext, updateAppointment } from '../shared/operationsApi';
import { AppointmentModal } from '../components/AppointmentModal';
import { ConfirmModal } from '../shared/ConfirmModal';
import { SubscriptionRestrictions } from '../shared/subscriptionRestrictions';
import { ExportButton } from '../shared/ExportButton';
import { exportToExcel, formatDateTime } from '../shared/excelExport';
import { PageHeader } from '../shared/ui/PageHeader';
import { Button } from '../shared/ui';

type CalendarView = 'month' | 'week' | 'day' | 'agenda';

export function AgendaPage() {
  const context = useOutletContext<{ restrictions: SubscriptionRestrictions }>();
  const restrictions = context?.restrictions || { canCreate: true, canExport: true, level: 'NONE' };
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [properties, setProperties] = useState<ApiProperty[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>('month');
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    Promise.all([listAppointments(), loadOperationsContext()])
      .then(([items, [leadItems, propertyItems]]) => {
        setAppointments(items);
        setLeads(leadItems);
        setProperties(propertyItems);
      })
      .catch(requestError => toast.error(requestError instanceof Error ? requestError.message : 'No fue posible cargar la agenda.'));
  }, []);

  // Generar días del mes actual
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: Array<{ date: Date | null; appointments: Appointment[] }> = [];

    // Días vacíos antes del primer día del mes
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ date: null, appointments: [] });
    }

    // Días del mes
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayAppointments = appointments.filter(apt => {
        const aptDate = new Date(apt.startsAt);
        return (
          aptDate.getFullYear() === year &&
          aptDate.getMonth() === month &&
          aptDate.getDate() === day
        );
      });
      days.push({ date, appointments: dayAppointments });
    }

    return days;
  }, [currentDate, appointments]);

  const selectedDayAppointments = useMemo(() => {
    const today = new Date();
    return appointments.filter(apt => {
      const aptDate = new Date(apt.startsAt);
      return (
        aptDate.getFullYear() === today.getFullYear() &&
        aptDate.getMonth() === today.getMonth() &&
        aptDate.getDate() === today.getDate()
      );
    }).sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  }, [appointments]);

  const upcomingAppointments = useMemo(() => {
    const now = new Date();
    return appointments
      .filter(apt => new Date(apt.startsAt) >= now)
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
      .slice(0, 5);
  }, [appointments]);

  function handleAppointmentCreated(appointment: Appointment) {
    setAppointments(current => [...current, appointment].sort((a, b) => a.startsAt.localeCompare(b.startsAt)));
  }

  async function complete(item: Appointment) {
    const updated = await updateAppointment(item.id, { ...item, status: 'COMPLETED' });
    setAppointments(current => current.map(candidate => (candidate.id === item.id ? updated : candidate)));
    toast.success('Cita marcada como realizada');
  }

  async function confirmDelete() {
    if (!appointmentToDelete) return;
    setDeleting(true);
    try {
      await deleteAppointment(appointmentToDelete);
      setAppointments(current => current.filter(item => item.id !== appointmentToDelete));
      toast.success('Cita eliminada');
      setAppointmentToDelete(null);
    } catch (requestError) {
      toast.error(requestError instanceof Error ? requestError.message : 'No fue posible eliminar la cita.');
    } finally {
      setDeleting(false);
    }
  }

  function handleExport() {
    if (!restrictions.canExport) {
      toast.error('Esta funcionalidad requiere un plan superior');
      return;
    }
    const typeLabels: Record<string, string> = { TOUR: 'Recorrido', CALL: 'Llamada', MEETING: 'Reunión', FOLLOW_UP: 'Seguimiento', OTHER: 'Otro' };
    const statusLabels: Record<string, string> = { SCHEDULED: 'Programada', COMPLETED: 'Completada', CANCELLED: 'Cancelada', CANCELED: 'Cancelada' };
    exportToExcel(
      appointments,
      [
        { header: 'Título', key: 'title', width: 30 },
        { header: 'Tipo', key: item => typeLabels[item.appointmentType] || item.appointmentType, width: 15 },
        { header: 'Estado', key: item => statusLabels[item.status] || item.status, width: 15 },
        { header: 'Inicio', key: item => formatDateTime(item.startsAt), width: 20 },
        { header: 'Fin', key: item => formatDateTime(item.endsAt), width: 20 },
        { header: 'Prospecto', key: item => (item.leadId ? leads.find(l => l.id === item.leadId)?.firstName + ' ' + (leads.find(l => l.id === item.leadId)?.lastName || '') : ''), width: 25 },
        { header: 'Propiedad', key: item => (item.propertyId ? properties.find(p => p.id === item.propertyId)?.title || '' : ''), width: 30 },
        { header: 'Ubicación', key: 'location', width: 30 },
        { header: 'Notas', key: 'notes', width: 40 }
      ],
      'agenda-homeforge',
      'Citas'
    );
  }

  function previousMonth() {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  }

  function nextMonth() {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  }

  function goToToday() {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  }

  function previousPeriod() {
    if (view === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    } else if (view === 'week') {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() - 7);
      setCurrentDate(newDate);
    } else if (view === 'day') {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() - 1);
      setCurrentDate(newDate);
    }
  }

  function nextPeriod() {
    if (view === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    } else if (view === 'week') {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() + 7);
      setCurrentDate(newDate);
    } else if (view === 'day') {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() + 1);
      setCurrentDate(newDate);
    }
  }

  const monthName = currentDate.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
  const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  // Obtener appointments para la vista actual
  const viewAppointments = useMemo(() => {
    if (view === 'day') {
      return appointments.filter(apt => {
        const aptDate = new Date(apt.startsAt);
        return (
          aptDate.getFullYear() === currentDate.getFullYear() &&
          aptDate.getMonth() === currentDate.getMonth() &&
          aptDate.getDate() === currentDate.getDate()
        );
      }).sort((a, b) => a.startsAt.localeCompare(b.startsAt));
    } else if (view === 'week') {
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 7);

      return appointments.filter(apt => {
        const aptDate = new Date(apt.startsAt);
        return aptDate >= startOfWeek && aptDate < endOfWeek;
      }).sort((a, b) => a.startsAt.localeCompare(b.startsAt));
    } else if (view === 'agenda') {
      const now = new Date();
      return appointments.filter(apt => new Date(apt.startsAt) >= now)
        .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
        .slice(0, 20);
    }
    return appointments;
  }, [view, currentDate, appointments]);

  // Generar días de la semana para vista de semana
  const weekDaysForWeekView = useMemo(() => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(date.getDate() + i);
      days.push(date);
    }
    return days;
  }, [currentDate]);

  // Generar horarios para vista de día/semana
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    return slots;
  }, []);

  function getAppointmentPosition(apt: Appointment, slotHeight: number = 60) {
    const start = new Date(apt.startsAt);
    const end = new Date(apt.endsAt);
    const startMinutes = start.getHours() * 60 + start.getMinutes();
    const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);

    return {
      top: (startMinutes / 30) * slotHeight,
      height: Math.max((durationMinutes / 30) * slotHeight, slotHeight)
    };
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <AppointmentModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onAppointmentCreated={handleAppointmentCreated} leads={leads} properties={properties} restrictions={restrictions} />

      <PageHeader
        title="Agenda"
        subtitle="Gestiona tus citas y recorridos"
        badge={{ value: appointments.length, label: 'citas' }}
        actions={
          <div className="flex gap-3">
            {appointments.length > 0 && <ExportButton onExport={handleExport} variant="secondary" />}
            <Button
              variant="primary"
              onClick={() => setModalOpen(true)}
              icon={
                <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              }
            >
              Nueva cita
            </Button>
          </div>
        }
      />

      <div className="p-4 lg:p-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Calendario Premium */}
        <div className="overflow-hidden rounded-3xl border-2 border-indigo-100 bg-white shadow-2xl shadow-indigo-500/10">
          {/* Header del Calendario con Gradiente */}
          <div className="relative border-b-2 border-indigo-200 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 px-8 py-6">
            {/* Selector de vistas */}
            <div className="mb-4 flex items-center justify-between border-b border-white/20 pb-4">
              <div className="inline-flex rounded-xl bg-white/10 p-1 backdrop-blur-sm">
                {[
                  { value: 'month' as CalendarView, label: 'Mes', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
                  { value: 'week' as CalendarView, label: 'Semana', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
                  { value: 'day' as CalendarView, label: 'Día', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
                  { value: 'agenda' as CalendarView, label: 'Agenda', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' }
                ].map(({ value, label, icon }) => (
                  <button
                    key={value}
                    onClick={() => setView(value)}
                    className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                      view === value
                        ? 'bg-white text-indigo-600 shadow-lg'
                        : 'text-white hover:bg-white/10'
                    }`}
                  >
                    <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                    </svg>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold capitalize text-white">
                  {view === 'month' && monthName}
                  {view === 'week' && `Semana del ${currentDate.toLocaleDateString('es-MX', { day: 'numeric', month: 'long' })}`}
                  {view === 'day' && currentDate.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  {view === 'agenda' && 'Próximos Eventos'}
                </h2>
                <p className="mt-1 text-sm text-indigo-100">
                  {appointments.length} {appointments.length === 1 ? 'cita programada' : 'citas programadas'}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  className="rounded-xl bg-white/20 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/30"
                  onClick={goToToday}
                >
                  Hoy
                </button>
                {view !== 'agenda' && (
                  <>
                    <button
                      className="flex size-10 items-center justify-center rounded-xl bg-white/20 text-white backdrop-blur-sm transition hover:bg-white/30"
                      onClick={previousPeriod}
                    >
                      <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      className="flex size-10 items-center justify-center rounded-xl bg-white/20 text-white backdrop-blur-sm transition hover:bg-white/30"
                      onClick={nextPeriod}
                    >
                      <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-b from-indigo-50/50 to-white p-8">
            {/* VISTA DE MES */}
            {view === 'month' && (
              <>
                {/* Días de la semana */}
                <div className="mb-4 grid grid-cols-7 gap-3">
                  {weekDays.map(day => (
                    <div key={day} className="rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 py-3 text-center text-xs font-bold uppercase tracking-wide text-white shadow-md">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Días del mes */}
                <div className="grid grid-cols-7 gap-3">
              {calendarDays.map((day, index) => {
                const isToday = day.date && day.date.toDateString() === new Date().toDateString();
                const hasAppointments = day.appointments.length > 0;

                return (
                  <div
                    key={index}
                    className={`group relative min-h-32 overflow-hidden rounded-2xl transition-all duration-200 ${
                      day.date
                        ? isToday
                          ? 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 ring-4 ring-indigo-300 shadow-2xl shadow-indigo-500/50 scale-105'
                          : hasAppointments
                          ? 'border-2 border-indigo-300 bg-gradient-to-br from-white to-indigo-50 hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-200/50 cursor-pointer hover:scale-105'
                          : 'border-2 border-slate-200 bg-white hover:border-indigo-200 hover:bg-gradient-to-br hover:from-white hover:to-slate-50 hover:shadow-lg'
                        : 'bg-slate-100/50'
                    }`}
                  >
                    {day.date && (
                      <>
                        {/* Número del día */}
                        <div className={`absolute right-2 top-2 flex size-8 items-center justify-center rounded-xl text-sm font-bold ${
                          isToday
                            ? 'bg-white/30 text-white backdrop-blur-sm'
                            : hasAppointments
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {day.date.getDate()}
                        </div>

                        {/* Citas */}
                        <div className="space-y-1 p-2 pt-12">
                          {day.appointments.slice(0, 2).map(apt => (
                            <div
                              key={apt.id}
                              className={`truncate rounded-lg px-2 py-1 text-xs font-medium transition ${
                                isToday
                                  ? 'bg-white/30 text-white backdrop-blur-sm'
                                  : 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700'
                              }`}
                              title={apt.title}
                            >
                              <div className="flex items-center gap-1">
                                <svg className="size-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                </svg>
                                <span className="truncate">
                                  {new Date(apt.startsAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <div className="mt-0.5 truncate text-[10px] opacity-90">{apt.title}</div>
                            </div>
                          ))}
                          {day.appointments.length > 2 && (
                            <div className={`text-center text-xs font-semibold ${
                              isToday ? 'text-white/90' : 'text-indigo-600'
                            }`}>
                              +{day.appointments.length - 2} más
                            </div>
                          )}
                        </div>

                        {/* Indicador de múltiples citas */}
                        {hasAppointments && !isToday && (
                          <div className="absolute bottom-1 left-1/2 flex -translate-x-1/2 gap-1">
                            {Array.from({ length: Math.min(day.appointments.length, 3) }).map((_, i) => (
                              <div key={i} className="size-1.5 rounded-full bg-indigo-400" />
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
                </div>
              </>
            )}

            {/* VISTA DE SEMANA */}
            {view === 'week' && (
              <div className="overflow-x-auto">
                <div className="min-w-[800px]">
                  {/* Header con días de la semana */}
                  <div className="grid grid-cols-8 gap-2 mb-4">
                    <div className="text-xs font-semibold text-slate-500 text-right pr-2">Hora</div>
                    {weekDaysForWeekView.map((date, i) => {
                      const isToday = date.toDateString() === new Date().toDateString();
                      return (
                        <div key={i} className={`rounded-xl p-3 text-center ${
                          isToday
                            ? 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg'
                            : 'bg-white border-2 border-slate-200'
                        }`}>
                          <div className={`text-xs font-semibold ${isToday ? 'text-white' : 'text-slate-500'}`}>
                            {weekDays[date.getDay()]}
                          </div>
                          <div className={`text-lg font-bold mt-1 ${isToday ? 'text-white' : 'text-slate-900'}`}>
                            {date.getDate()}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Timeline */}
                  <div className="grid grid-cols-8 gap-2 relative">
                    {/* Columna de horas */}
                    <div className="space-y-[60px]">
                      {Array.from({ length: 24 }).map((_, hour) => (
                        <div key={hour} className="text-xs font-medium text-slate-500 text-right pr-2 -mt-2">
                          {hour.toString().padStart(2, '0')}:00
                        </div>
                      ))}
                    </div>

                    {/* Columnas de días */}
                    {weekDaysForWeekView.map((date, dayIndex) => {
                      const dayAppointments = viewAppointments.filter(apt => {
                        const aptDate = new Date(apt.startsAt);
                        return aptDate.toDateString() === date.toDateString();
                      });

                      return (
                        <div key={dayIndex} className="relative border-l-2 border-slate-200">
                          {/* Líneas de horas */}
                          {Array.from({ length: 24 }).map((_, hour) => (
                            <div key={hour} className="h-[60px] border-b border-slate-100" />
                          ))}

                          {/* Appointments */}
                          {dayAppointments.map(apt => {
                            const { top, height } = getAppointmentPosition(apt, 60);
                            return (
                              <div
                                key={apt.id}
                                className="absolute left-1 right-1 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-2 shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition z-10"
                                style={{ top: `${top}px`, height: `${height}px`, minHeight: '60px' }}
                                title={apt.title}
                              >
                                <div className="text-xs font-bold truncate">{apt.title}</div>
                                <div className="text-[10px] opacity-90 mt-1">
                                  {new Date(apt.startsAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* VISTA DE DÍA */}
            {view === 'day' && (
              <div className="space-y-2">
                {timeSlots.map((time, index) => {
                  const [hours, minutes] = time.split(':').map(Number);
                  const slotAppointments = viewAppointments.filter(apt => {
                    const start = new Date(apt.startsAt);
                    const startMinutes = start.getHours() * 60 + start.getMinutes();
                    const slotMinutes = hours * 60 + minutes;
                    return startMinutes === slotMinutes;
                  });

                  const isCurrentTime = () => {
                    const now = new Date();
                    return now.getHours() === hours && Math.floor(now.getMinutes() / 30) * 30 === minutes;
                  };

                  return (
                    <div key={index} className={`flex gap-4 p-3 rounded-xl border-2 transition ${
                      isCurrentTime()
                        ? 'border-indigo-500 bg-indigo-50'
                        : slotAppointments.length > 0
                          ? 'border-indigo-200 bg-white hover:shadow-md'
                          : 'border-slate-100 bg-slate-50'
                    }`}>
                      <div className="w-20 shrink-0">
                        <div className={`text-sm font-bold ${isCurrentTime() ? 'text-indigo-600' : 'text-slate-900'}`}>
                          {time}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        {slotAppointments.length > 0 ? (
                          <div className="space-y-2">
                            {slotAppointments.map(apt => (
                              <div key={apt.id} className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                                <svg className="size-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div className="flex-1 min-w-0">
                                  <div className="font-bold">{apt.title}</div>
                                  <div className="text-sm opacity-90 mt-1">
                                    {new Date(apt.startsAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })} - {new Date(apt.endsAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                                  </div>
                                  {apt.location && (
                                    <div className="text-xs opacity-80 mt-1 flex items-center gap-1">
                                      <svg className="size-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                      </svg>
                                      {apt.location}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-sm text-slate-400">-</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* VISTA DE AGENDA */}
            {view === 'agenda' && (
              <div className="space-y-3">
                {viewAppointments.length > 0 ? (
                  viewAppointments.map(apt => {
                    const aptDate = new Date(apt.startsAt);
                    const isToday = aptDate.toDateString() === new Date().toDateString();
                    const isTomorrow = aptDate.toDateString() === new Date(Date.now() + 86400000).toDateString();

                    return (
                      <div key={apt.id} className="group rounded-2xl border-2 border-slate-200 bg-white hover:border-indigo-300 hover:shadow-lg transition overflow-hidden">
                        {/* Fecha */}
                        <div className={`px-4 py-2 text-xs font-semibold ${
                          isToday ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white' :
                          isTomorrow ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {isToday ? '🔥 HOY' : isTomorrow ? '📅 MAÑANA' : aptDate.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </div>

                        {/* Contenido */}
                        <div className="p-4">
                          <div className="flex items-start gap-4">
                            <div className={`flex size-14 shrink-0 items-center justify-center rounded-2xl shadow-lg ${
                              apt.status === 'COMPLETED' ? 'bg-gradient-to-br from-emerald-500 to-teal-600' :
                              'bg-gradient-to-br from-indigo-500 to-purple-600'
                            }`}>
                              <svg className="size-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>

                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition">{apt.title}</h3>
                              <div className="mt-2 flex flex-wrap gap-2">
                                <span className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                                  <svg className="size-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                  </svg>
                                  {new Date(apt.startsAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                {apt.location && (
                                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                                    <svg className="size-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    </svg>
                                    {apt.location}
                                  </span>
                                )}
                              </div>
                              {apt.notes && (
                                <p className="mt-2 text-sm text-slate-600 line-clamp-2">{apt.notes}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 py-16 text-center">
                    <div className="rounded-full bg-indigo-100 p-4">
                      <svg className="size-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    </div>
                    <p className="mt-4 text-base font-semibold text-slate-700">No hay eventos próximos</p>
                    <p className="mt-1 text-sm text-slate-500">Todas tus citas están al día</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Panel lateral con próximos eventos */}
        <div className="space-y-6">
          {/* Eventos de hoy */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <div className="rounded-lg bg-indigo-100 p-2">
                <svg className="size-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Hoy</h2>
                <p className="text-xs text-slate-500">{new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
              </div>
            </div>
            {selectedDayAppointments.length > 0 ? (
              <div className="space-y-3">
                {selectedDayAppointments.map(apt => (
                  <article key={apt.id} className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:border-indigo-300 hover:shadow-md">
                  {/* Header con hora y estado */}
                  <div className="flex items-start gap-3 border-b border-slate-100 bg-gradient-to-br from-slate-50 to-white p-4">
                    {/* Icono de la cita */}
                    <div className={`flex size-12 shrink-0 items-center justify-center rounded-2xl shadow-lg ring-4 ${
                      apt.status === 'COMPLETED' ? 'bg-gradient-to-br from-emerald-500 to-teal-600 ring-emerald-50' :
                      apt.status === 'CANCELED' ? 'bg-gradient-to-br from-slate-400 to-slate-600 ring-slate-50' :
                      'bg-gradient-to-br from-indigo-500 to-purple-600 ring-indigo-50'
                    }`}>
                      <svg className="size-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {apt.appointmentType === 'TOUR' ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        ) : apt.appointmentType === 'CALL' ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        )}
                      </svg>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition">{apt.title}</h3>
                          <div className="mt-1.5 flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-100 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                              <svg className="size-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                              </svg>
                              {new Date(apt.startsAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold ${
                              apt.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                              apt.status === 'CANCELED' ? 'bg-slate-200 text-slate-700' :
                              'bg-cyan-100 text-cyan-800'
                            }`}>
                              <span className="size-1.5 rounded-full bg-current opacity-75"></span>
                              {apt.status === 'COMPLETED' ? 'Realizada' : apt.status === 'CANCELED' ? 'Cancelada' : 'Programada'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Detalles */}
                  {(apt.location || apt.notes) && (
                    <div className="space-y-2 border-b border-slate-100 bg-white px-4 py-3">
                      {apt.location && (
                        <div className="flex items-start gap-2 text-sm">
                          <svg className="size-4 mt-0.5 shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="text-slate-700">{apt.location}</span>
                        </div>
                      )}
                      {apt.notes && (
                        <div className="flex items-start gap-2 text-sm">
                          <svg className="size-4 mt-0.5 shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                          </svg>
                          <span className="text-slate-600">{apt.notes}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Acciones */}
                  <div className="flex flex-wrap gap-2 bg-slate-50/50 px-4 py-3">
                    {apt.status === 'SCHEDULED' && (
                      <button
                        className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 hover:border-emerald-300"
                        onClick={() => complete(apt)}
                      >
                        <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Marcar realizada
                      </button>
                    )}
                    <button
                      className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 hover:border-rose-300"
                      onClick={() => setAppointmentToDelete(apt.id)}
                    >
                      <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Eliminar
                    </button>
                  </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 py-8 text-center">
                <svg className="size-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="mt-2 text-sm font-semibold text-slate-700">Sin eventos hoy</p>
              </div>
            )}
          </div>

          {/* Próximos eventos */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <div className="rounded-lg bg-purple-100 p-2">
                <svg className="size-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Próximos</h2>
                <p className="text-xs text-slate-500">Siguientes {upcomingAppointments.length} eventos</p>
              </div>
            </div>

            {upcomingAppointments.length > 0 ? (
              <div className="space-y-2">
                {upcomingAppointments.map(apt => {
                  const aptDate = new Date(apt.startsAt);
                  const isToday = aptDate.toDateString() === new Date().toDateString();
                  const isTomorrow = aptDate.toDateString() === new Date(Date.now() + 86400000).toDateString();

                  return (
                    <div key={apt.id} className="group rounded-lg border border-slate-200 bg-white p-3 hover:border-indigo-300 hover:shadow-md transition">
                      <div className="flex items-start gap-3">
                        <div className={`size-10 shrink-0 rounded-lg flex items-center justify-center ${
                          isToday ? 'bg-gradient-to-br from-indigo-500 to-purple-500' :
                          isTomorrow ? 'bg-gradient-to-br from-cyan-500 to-blue-500' :
                          'bg-gradient-to-br from-slate-400 to-slate-600'
                        }`}>
                          <svg className="size-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-slate-900 truncate">{apt.title}</div>
                          <div className="text-xs text-slate-500 mt-1">
                            {isToday ? 'Hoy' : isTomorrow ? 'Mañana' : aptDate.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' })} • {aptDate.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 py-8 text-center">
                <svg className="size-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <p className="mt-2 text-sm font-semibold text-slate-700">Sin eventos próximos</p>
              </div>
            )}
          </div>
        </div>
        </div>
      </div>

      <ConfirmModal isOpen={appointmentToDelete !== null} title="¿Eliminar esta cita?" message="Esta acción no se puede deshacer." confirmLabel="Eliminar" cancelLabel="Cancelar" onConfirm={confirmDelete} onCancel={() => setAppointmentToDelete(null)} loading={deleting} danger={true} />
    </div>
  );
}
