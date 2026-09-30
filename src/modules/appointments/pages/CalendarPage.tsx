import { useEffect, useState } from 'react';
import type { MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { listAppointments, Appointment, AppointmentStatus, appointmentTypeLabels, appointmentStatusLabels } from '../api/appointmentsApi';
import NewAppointmentModal from '../components/NewAppointmentModal';
import { getSession } from '../../auth';
import { Icon } from '../../../shared/Icon';
import { Badge, BadgeVariant, Button, buttonClasses, Card, cn, PageHeader, SegmentedControl } from '../../../shared/ui';

type ViewMode = 'month' | 'week' | 'day';

const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const WORK_HOURS = Array.from({ length: 14 }, (_, i) => i + 7);

const statusStyles: Record<AppointmentStatus, { chip: string; badge: BadgeVariant }> = {
  [AppointmentStatus.SCHEDULED]: { chip: 'border-info bg-info-soft text-info-fg', badge: 'info' },
  [AppointmentStatus.CONFIRMED]: { chip: 'border-success bg-success-soft text-success-fg', badge: 'success' },
  [AppointmentStatus.COMPLETED]: { chip: 'border-border-strong bg-surface-sunken text-fg-muted', badge: 'neutral' },
  [AppointmentStatus.CANCELLED]: { chip: 'border-danger bg-danger-soft text-danger-fg line-through', badge: 'error' },
  [AppointmentStatus.NO_SHOW]: { chip: 'border-warning bg-warning-soft text-warning-fg', badge: 'warning' },
  [AppointmentStatus.RESCHEDULED]: { chip: 'border-accent bg-accent-soft text-accent-fg', badge: 'purple' }
};

const timeLabel = (value: string | Date) => new Date(value).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

/** Compara días en la zona horaria local (toISOString usa UTC y movía citas nocturnas al día siguiente). */
const sameLocalDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

function startOfWeek(date: Date) {
  const start = new Date(date);
  start.setDate(start.getDate() - start.getDay());
  start.setHours(0, 0, 0, 0);
  return start;
}

export default function CalendarPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const companyId = getSession()?.companyId || '';

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = startOfWeek(currentDate);
    date.setDate(date.getDate() + i);
    return date;
  });

  const loadAppointments = async () => {
    if (!companyId) return;
    // Cubre el mes visible y la semana visible, que puede cruzar al mes vecino.
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59);
    const weekStart = startOfWeek(currentDate);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    try {
      const data = await listAppointments({
        companyId,
        startTimestamp: Math.min(monthStart.getTime(), weekStart.getTime()),
        endTimestamp: Math.max(monthEnd.getTime(), weekEnd.getTime())
      });
      setAppointments(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No fue posible cargar las citas.');
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [currentDate]);

  const monthDays: (Date | null)[] = (() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const leading = new Date(year, month, 1).getDay();
    const total = new Date(year, month + 1, 0).getDate();
    return [...Array<null>(leading).fill(null), ...Array.from({ length: total }, (_, i) => new Date(year, month, i + 1))];
  })();

  const appointmentsForDay = (date: Date) => appointments
    .filter(apt => sameLocalDay(new Date(apt.startsAt), date))
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));

  const appointmentsStartingAt = (date: Date, hour: number) =>
    appointmentsForDay(date).filter(apt => new Date(apt.startsAt).getHours() === hour);

  function move(direction: -1 | 1) {
    const next = new Date(currentDate);
    if (viewMode === 'month') next.setMonth(next.getMonth() + direction, 1);
    else next.setDate(next.getDate() + (viewMode === 'week' ? 7 : 1) * direction);
    setCurrentDate(next);
  }

  function openNew(date?: Date) {
    setEditingAppointment(null);
    setSelectedDate(date ?? null);
    setShowNewModal(true);
  }

  function openExisting(event: MouseEvent, appointment: Appointment) {
    event.stopPropagation();
    setEditingAppointment(appointment);
    setSelectedDate(new Date(appointment.startsAt));
    setShowNewModal(true);
  }

  function closeModal() {
    setShowNewModal(false);
    setSelectedDate(null);
    setEditingAppointment(null);
  }

  const today = new Date();
  const title =
    viewMode === 'month' ? `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`
    : viewMode === 'week' ? `Semana del ${weekDays[0].toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}`
    : currentDate.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <>
      <PageHeader
        actions={
          <>
            <Link className={buttonClasses({ variant: 'tertiary' })} to="/app/calendario/disponibilidad">
              <Icon className="size-4" name="calendar" />
              Mi disponibilidad
            </Link>
            <Button icon={<Icon className="size-4" name="plus" />} onClick={() => openNew()}>Nueva cita</Button>
          </>
        }
        subtitle="Gestiona tus citas y eventos del día a día."
        title="Calendario"
      />

      <Card noPadding truncate>
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Button onClick={() => setCurrentDate(new Date())} size="sm" variant="tertiary">Hoy</Button>
            <div className="flex">
              <Button aria-label="Anterior" onClick={() => move(-1)} size="sm" variant="ghost">
                <svg aria-hidden="true" className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </Button>
              <Button aria-label="Siguiente" onClick={() => move(1)} size="sm" variant="ghost">
                <svg aria-hidden="true" className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </Button>
            </div>
            <h2 className="ml-1 text-base font-semibold capitalize text-fg">{title}</h2>
          </div>
          <SegmentedControl
            onChange={setViewMode}
            options={[{ value: 'month', label: 'Mes' }, { value: 'week', label: 'Semana' }, { value: 'day', label: 'Día' }]}
            size="sm"
            value={viewMode}
          />
        </div>

        <div className="p-3 sm:p-4">
          {viewMode === 'month' && (
            <div className="grid grid-cols-7 gap-px overflow-hidden rounded-xl border border-border bg-border">
              {DAYS.map(day => (
                <div className="bg-surface-muted py-2 text-center text-xs font-semibold uppercase tracking-wide text-fg-subtle" key={day}>{day}</div>
              ))}
              {monthDays.map((date, index) => {
                if (!date) return <div className="min-h-24 bg-surface-muted sm:min-h-28" key={index} />;
                const dayAppointments = appointmentsForDay(date);
                const isToday = sameLocalDay(date, today);
                return (
                  <div className="group min-h-24 cursor-pointer bg-surface p-1.5 transition-colors hover:bg-surface-muted sm:min-h-28" key={index} onClick={() => openNew(date)}>
                    <button
                      aria-label={`Agregar cita el ${date.toLocaleDateString('es-MX', { day: 'numeric', month: 'long' })}`}
                      className={cn(
                        'grid size-7 place-items-center rounded-full text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                        isToday ? 'bg-primary text-white' : 'text-fg-muted group-hover:bg-surface-sunken'
                      )}
                      onClick={event => { event.stopPropagation(); openNew(date); }}
                      type="button"
                    >
                      {date.getDate()}
                    </button>
                    <div className="mt-1 space-y-1">
                      {dayAppointments.slice(0, 2).map(apt => (
                        <button
                          className={cn('block w-full truncate rounded-md border-l-2 px-1.5 py-0.5 text-left text-[11px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary', statusStyles[apt.status]?.chip)}
                          key={apt.id}
                          onClick={event => openExisting(event, apt)}
                          title={`${timeLabel(apt.startsAt)} - ${apt.title}`}
                          type="button"
                        >
                          <span className="tabular-nums">{timeLabel(apt.startsAt)}</span> {apt.title}
                        </button>
                      ))}
                      {dayAppointments.length > 2 && <p className="px-1.5 text-[11px] font-medium text-fg-subtle">+{dayAppointments.length - 2} más</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {viewMode === 'week' && (
            <div className="overflow-x-auto">
              <div className="min-w-[760px] overflow-hidden rounded-xl border border-border">
                <div className="grid grid-cols-[64px_repeat(7,1fr)] border-b border-border bg-surface-muted">
                  <span />
                  {weekDays.map(date => {
                    const isToday = sameLocalDay(date, today);
                    return (
                      <div className="py-2 text-center" key={date.toISOString()}>
                        <p className="text-xs font-medium uppercase text-fg-subtle">{DAYS[date.getDay()]}</p>
                        <p className={cn('mx-auto mt-0.5 grid size-8 place-items-center rounded-full text-sm font-semibold', isToday ? 'bg-primary text-white' : 'text-fg')}>{date.getDate()}</p>
                      </div>
                    );
                  })}
                </div>
                {WORK_HOURS.map(hour => (
                  <div className="grid grid-cols-[64px_repeat(7,1fr)] border-b border-border last:border-b-0" key={hour}>
                    <div className="bg-surface-muted px-2 py-2 text-right text-xs tabular-nums text-fg-subtle">{String(hour).padStart(2, '0')}:00</div>
                    {weekDays.map(date => (
                      <div
                        className="min-h-14 cursor-pointer space-y-1 border-l border-border p-1 transition-colors hover:bg-surface-muted"
                        key={date.toISOString()}
                        onClick={() => {
                          const slot = new Date(date);
                          slot.setHours(hour, 0, 0, 0);
                          openNew(slot);
                        }}
                      >
                        {appointmentsStartingAt(date, hour).map(apt => (
                          <button
                            className={cn('block w-full rounded-md border-l-2 px-1.5 py-1 text-left text-[11px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary', statusStyles[apt.status]?.chip)}
                            key={apt.id}
                            onClick={event => openExisting(event, apt)}
                            type="button"
                          >
                            <span className="block truncate font-semibold">{apt.title}</span>
                            <span className="tabular-nums opacity-80">{timeLabel(apt.startsAt)} – {timeLabel(apt.endsAt)}</span>
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {viewMode === 'day' && (
            <div className="mx-auto max-w-4xl overflow-hidden rounded-xl border border-border">
              {WORK_HOURS.map(hour => {
                const hourAppointments = appointmentsStartingAt(currentDate, hour);
                return (
                  <div className="flex border-b border-border last:border-b-0" key={hour}>
                    <div className="w-20 shrink-0 border-r border-border bg-surface-muted px-3 py-3 text-sm font-medium tabular-nums text-fg-subtle">
                      {String(hour).padStart(2, '0')}:00
                    </div>
                    <div className="min-h-16 flex-1 space-y-2 p-2">
                      {hourAppointments.length === 0 ? (
                        <button
                          className="flex h-full min-h-12 w-full items-center justify-center rounded-lg text-sm text-fg-subtle opacity-0 transition hover:bg-surface-muted hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                          onClick={() => {
                            const slot = new Date(currentDate);
                            slot.setHours(hour, 0, 0, 0);
                            openNew(slot);
                          }}
                          type="button"
                        >
                          + Agregar cita
                        </button>
                      ) : hourAppointments.map(apt => (
                        <button
                          className={cn('block w-full rounded-lg border-l-4 p-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary', statusStyles[apt.status]?.chip)}
                          key={apt.id}
                          onClick={event => openExisting(event, apt)}
                          type="button"
                        >
                          <span className="flex items-start justify-between gap-3">
                            <span className="min-w-0">
                              <span className="block font-semibold">{apt.title}</span>
                              <span className="block text-sm tabular-nums opacity-80">{timeLabel(apt.startsAt)} – {timeLabel(apt.endsAt)}</span>
                              {apt.description && <span className="mt-1 block text-sm opacity-80">{apt.description}</span>}
                              {apt.location && <span className="mt-1 block text-xs opacity-80">{apt.location}</span>}
                            </span>
                            <span className="flex shrink-0 flex-col items-end gap-1">
                              <Badge variant={statusStyles[apt.status]?.badge ?? 'neutral'}>{appointmentStatusLabels[apt.status]}</Badge>
                              {apt.appointmentType && <Badge variant="info">{appointmentTypeLabels[apt.appointmentType]}</Badge>}
                            </span>
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>

      {showNewModal && (
        <NewAppointmentModal
          appointment={editingAppointment}
          defaultDate={selectedDate || undefined}
          onClose={closeModal}
          onSuccess={() => {
            closeModal();
            loadAppointments();
          }}
        />
      )}
    </>
  );
}
