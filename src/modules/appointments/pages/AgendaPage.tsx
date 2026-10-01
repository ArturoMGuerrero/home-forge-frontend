import { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import toast from 'react-hot-toast';
import { LeadItem } from '../../leads';
import { ApiProperty } from '../../properties';
import { AgendaAppointment as Appointment, deleteAgendaAppointment as deleteAppointment, listAgendaAppointments as listAppointments, updateAgendaAppointment as updateAppointment } from '../api/agendaApi';
import { loadOperationsContext } from '../../../shared/operationsContext';
import { AppointmentModal } from '../components/AppointmentModal';
import { ConfirmModal } from '../../../shared/ConfirmModal';
import { SubscriptionRestrictions } from '../../../shared/subscriptionRestrictions';
import { ExportButton } from '../../../shared/ExportButton';
import { exportToExcel, formatDateTime } from '../../../shared/excelExport';
import { Icon } from '../../../shared/Icon';
import { Badge, BadgeVariant, Button, Card, CardWithHeader, cn, EmptyState, PageHeader, SegmentedControl } from '../../../shared/ui';

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
    try {
      const updated = await updateAppointment(item.id, { ...item, status: 'COMPLETED' });
      setAppointments(current => current.map(candidate => (candidate.id === item.id ? updated : candidate)));
      toast.success('Cita marcada como realizada');
    } catch (requestError) {
      toast.error(requestError instanceof Error ? requestError.message : 'No fue posible actualizar la cita.');
    }
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
    const typeLabels: Record<string, string> = { PROPERTY_TOUR: 'Recorrido', CALL: 'Llamada', MEETING: 'Reunión', VIDEO_CALL: 'Videollamada', SIGNING: 'Firma', OTHER: 'Otro' };
    const statusLabels: Record<string, string> = { SCHEDULED: 'Programada', CONFIRMED: 'Confirmada', COMPLETED: 'Completada', CANCELLED: 'Cancelada', NO_SHOW: 'No asistió', RESCHEDULED: 'Reprogramada' };
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

  function goToToday() {
    setCurrentDate(new Date());
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

  const periodTitle =
    view === 'month' ? monthName
    : view === 'week' ? `Semana del ${weekDaysForWeekView[0].toLocaleDateString('es-MX', { day: 'numeric', month: 'long' })}`
    : view === 'day' ? currentDate.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : 'Próximos eventos';

  const todayKey = new Date().toDateString();
  const timeLabel = (value: string) => new Date(value).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

  return (
    <>
      <AppointmentModal isOpen={modalOpen} leads={leads} onAppointmentCreated={handleAppointmentCreated} onClose={() => setModalOpen(false)} properties={properties} restrictions={restrictions} />

      <PageHeader
        actions={
          <>
            {appointments.length > 0 && <ExportButton onExport={handleExport} variant="secondary" />}
            <Button icon={<Icon className="size-4" name="plus" />} onClick={() => setModalOpen(true)}>Nueva cita</Button>
          </>
        }
        badge={{ value: appointments.length, label: 'citas' }}
        subtitle="Gestiona tus citas y recorridos."
        title="Agenda"
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <Card noPadding truncate>
          <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Button onClick={goToToday} size="sm" variant="tertiary">Hoy</Button>
              {view !== 'agenda' && (
                <div className="flex">
                  <Button aria-label="Periodo anterior" onClick={previousPeriod} size="sm" variant="ghost">
                    <svg aria-hidden="true" className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  </Button>
                  <Button aria-label="Periodo siguiente" onClick={nextPeriod} size="sm" variant="ghost">
                    <svg aria-hidden="true" className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </Button>
                </div>
              )}
              <h2 className="ml-1 text-base font-semibold capitalize text-fg">{periodTitle}</h2>
            </div>
            <SegmentedControl
              onChange={setView}
              options={[
                { value: 'month', label: 'Mes' },
                { value: 'week', label: 'Semana' },
                { value: 'day', label: 'Día' },
                { value: 'agenda', label: 'Lista' }
              ]}
              size="sm"
              value={view}
            />
          </div>

          <div className="p-3 sm:p-4">
            {view === 'month' && (
              <div className="grid grid-cols-7 gap-px overflow-hidden rounded-xl border border-border bg-border">
                {weekDays.map(day => (
                  <div className="bg-surface-muted py-2 text-center text-xs font-semibold uppercase tracking-wide text-fg-subtle" key={day}>{day}</div>
                ))}
                {calendarDays.map((day, index) => {
                  const isToday = day.date?.toDateString() === todayKey;
                  return (
                    <div className={cn('min-h-24 p-1.5 sm:min-h-28', day.date ? 'bg-surface' : 'bg-surface-muted')} key={index}>
                      {day.date && (
                        <>
                          <span className={cn('grid size-7 place-items-center rounded-full text-xs font-semibold', isToday ? 'bg-primary text-white' : 'text-fg-muted')}>
                            {day.date.getDate()}
                          </span>
                          <div className="mt-1 space-y-1">
                            {day.appointments.slice(0, 2).map(apt => (
                              <div className={cn('truncate rounded-md px-1.5 py-0.5 text-[11px] font-medium', appointmentTone(apt.status))} key={apt.id} title={apt.title}>
                                <span className="tabular-nums">{timeLabel(apt.startsAt)}</span> {apt.title}
                              </div>
                            ))}
                            {day.appointments.length > 2 && (
                              <p className="px-1.5 text-[11px] font-medium text-fg-subtle">+{day.appointments.length - 2} más</p>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {view === 'week' && (
              <div className="overflow-x-auto">
                <div className="min-w-[760px]">
                  <div className="grid grid-cols-[56px_repeat(7,1fr)] border-b border-border pb-2">
                    <span />
                    {weekDaysForWeekView.map(date => {
                      const isToday = date.toDateString() === todayKey;
                      return (
                        <div className="text-center" key={date.toISOString()}>
                          <p className="text-xs font-medium uppercase text-fg-subtle">{weekDays[date.getDay()]}</p>
                          <p className={cn('mx-auto mt-1 grid size-8 place-items-center rounded-full text-sm font-semibold', isToday ? 'bg-primary text-white' : 'text-fg')}>{date.getDate()}</p>
                        </div>
                      );
                    })}
                  </div>
                  <div className="relative grid max-h-[600px] grid-cols-[56px_repeat(7,1fr)] overflow-y-auto">
                    <div>
                      {Array.from({ length: 24 }).map((_, hour) => (
                        <div className="h-12 pr-2 text-right text-[11px] tabular-nums text-fg-subtle" key={hour}>{String(hour).padStart(2, '0')}:00</div>
                      ))}
                    </div>
                    {weekDaysForWeekView.map(date => {
                      const dayAppointments = viewAppointments.filter(apt => new Date(apt.startsAt).toDateString() === date.toDateString());
                      return (
                        <div className="relative border-l border-border" key={date.toISOString()}>
                          {Array.from({ length: 24 }).map((_, hour) => <div className="h-12 border-b border-border/60" key={hour} />)}
                          {dayAppointments.map(apt => {
                            const { top, height } = getAppointmentPosition(apt, 24);
                            return (
                              <div
                                className="absolute inset-x-1 z-10 overflow-hidden rounded-md border-l-2 border-primary bg-primary-soft px-1.5 py-1 text-primary-fg"
                                key={apt.id}
                                style={{ top, height }}
                                title={apt.title}
                              >
                                <p className="truncate text-[11px] font-semibold">{apt.title}</p>
                                <p className="text-[10px] tabular-nums opacity-80">{timeLabel(apt.startsAt)}</p>
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

            {view === 'day' && (
              viewAppointments.length > 0 ? (
                <ol className="space-y-2">
                  {viewAppointments.map(apt => (
                    <li className="flex gap-4 rounded-xl border border-border p-3" key={apt.id}>
                      <div className="w-24 shrink-0 text-sm font-semibold tabular-nums text-fg">
                        {timeLabel(apt.startsAt)}
                        <span className="block text-xs font-normal text-fg-subtle">{timeLabel(apt.endsAt)}</span>
                      </div>
                      <div className="min-w-0 flex-1 border-l-2 border-primary pl-3">
                        <p className="font-semibold text-fg">{apt.title}</p>
                        {apt.location && <p className="mt-0.5 text-sm text-fg-subtle">{apt.location}</p>}
                        {apt.notes && <p className="mt-1 line-clamp-2 text-sm text-fg-muted">{apt.notes}</p>}
                      </div>
                      <Badge dot variant={statusVariant(apt.status)}>{statusLabel(apt.status)}</Badge>
                    </li>
                  ))}
                </ol>
              ) : (
                <EmptyState description="Usa “Nueva cita” para agendar algo este día." icon={<Icon name="calendar" />} title="Sin citas este día" />
              )
            )}

            {view === 'agenda' && (
              viewAppointments.length > 0 ? (
                <ol className="space-y-2">
                  {viewAppointments.map(apt => (
                    <li className="flex items-center gap-4 rounded-xl border border-border p-3" key={apt.id}>
                      <DateChip date={new Date(apt.startsAt)} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-fg">{apt.title}</p>
                        <p className="truncate text-sm text-fg-subtle">
                          {relativeDay(new Date(apt.startsAt))} · {timeLabel(apt.startsAt)}{apt.location ? ` · ${apt.location}` : ''}
                        </p>
                      </div>
                      <Badge dot variant={statusVariant(apt.status)}>{statusLabel(apt.status)}</Badge>
                    </li>
                  ))}
                </ol>
              ) : (
                <EmptyState description="Todas tus citas están al día." icon={<Icon name="calendar" />} title="No hay eventos próximos" />
              )
            )}
          </div>
        </Card>

        <aside className="space-y-6">
          <CardWithHeader subtitle={new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })} title="Hoy">
            {selectedDayAppointments.length > 0 ? (
              <div className="space-y-3">
                {selectedDayAppointments.map(apt => (
                  <article className="rounded-xl border border-border p-3.5" key={apt.id}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-fg">{apt.title}</h3>
                        <p className="mt-0.5 text-sm tabular-nums text-fg-subtle">{timeLabel(apt.startsAt)} – {timeLabel(apt.endsAt)}</p>
                      </div>
                      <Badge dot variant={statusVariant(apt.status)}>{statusLabel(apt.status)}</Badge>
                    </div>
                    {apt.location && <p className="mt-2 text-sm text-fg-muted">{apt.location}</p>}
                    {apt.notes && <p className="mt-1 line-clamp-2 text-sm text-fg-subtle">{apt.notes}</p>}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {apt.status === 'SCHEDULED' && <Button onClick={() => complete(apt)} size="sm" variant="secondary">Marcar realizada</Button>}
                      <Button onClick={() => setAppointmentToDelete(apt.id)} size="sm" variant="danger-ghost">Eliminar</Button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState className="py-6" title="Sin eventos hoy" />
            )}
          </CardWithHeader>

          <CardWithHeader subtitle={`Siguientes ${upcomingAppointments.length} eventos`} title="Próximos">
            {upcomingAppointments.length > 0 ? (
              <ul className="space-y-3">
                {upcomingAppointments.map(apt => {
                  const aptDate = new Date(apt.startsAt);
                  return (
                    <li className="flex items-center gap-3" key={apt.id}>
                      <DateChip date={aptDate} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-fg">{apt.title}</p>
                        <p className="text-xs text-fg-subtle">{relativeDay(aptDate)} · {timeLabel(apt.startsAt)}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <EmptyState className="py-6" title="Sin eventos próximos" />
            )}
          </CardWithHeader>
        </aside>
      </div>

      <ConfirmModal
        isOpen={appointmentToDelete !== null}
        loading={deleting}
        message="Esta acción no se puede deshacer."
        onCancel={() => setAppointmentToDelete(null)}
        onConfirm={confirmDelete}
        title="¿Eliminar esta cita?"
      />
    </>
  );
}

const statusLabels: Record<string, string> = { SCHEDULED: 'Programada', CONFIRMED: 'Confirmada', COMPLETED: 'Realizada', CANCELLED: 'Cancelada' };

function statusLabel(status: string) {
  return statusLabels[status] ?? 'Programada';
}

function statusVariant(status: string): BadgeVariant {
  if (status === 'COMPLETED') return 'success';
  if (status === 'CANCELLED') return 'neutral';
  if (status === 'CONFIRMED') return 'primary';
  return 'info';
}

function appointmentTone(status: string) {
  if (status === 'COMPLETED') return 'bg-success-soft text-success-fg';
  if (status === 'CANCELLED') return 'bg-surface-sunken text-fg-subtle line-through';
  return 'bg-primary-soft text-primary-fg';
}

function relativeDay(date: Date) {
  const today = new Date();
  const tomorrow = new Date(Date.now() + 86400000);
  if (date.toDateString() === today.toDateString()) return 'Hoy';
  if (date.toDateString() === tomorrow.toDateString()) return 'Mañana';
  return date.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' });
}

function DateChip({ date }: { date: Date }) {
  const isToday = date.toDateString() === new Date().toDateString();
  return (
    <div className={cn('grid w-12 shrink-0 place-items-center rounded-xl py-1.5 text-center', isToday ? 'bg-primary text-white' : 'bg-surface-sunken text-fg')}>
      <span className="text-[10px] font-semibold uppercase leading-none opacity-80">{date.toLocaleDateString('es-MX', { month: 'short' })}</span>
      <span className="text-lg font-bold leading-tight tabular-nums">{date.getDate()}</span>
    </div>
  );
}
