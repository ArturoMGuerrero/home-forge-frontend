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
    setCurrentDate(new Date());
  }

  const monthName = currentDate.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
  const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

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
            <button
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-900/20 transition hover:shadow-xl hover:shadow-indigo-900/30"
              onClick={() => setModalOpen(true)}
            >
              <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nueva cita
            </button>
          </div>
        }
      />

      <div className="p-4 lg:p-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Calendario */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {/* Controles del calendario */}
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold capitalize">{monthName}</h2>
            <div className="flex gap-2">
              <button className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50" onClick={goToToday}>
                Hoy
              </button>
              <button className="rounded-lg border border-slate-200 p-2 text-slate-700 transition hover:bg-slate-50" onClick={previousMonth}>
                <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button className="rounded-lg border border-slate-200 p-2 text-slate-700 transition hover:bg-slate-50" onClick={nextMonth}>
                <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Días de la semana */}
          <div className="mb-2 grid grid-cols-7 gap-2">
            {weekDays.map(day => (
              <div key={day} className="p-2 text-center text-xs font-bold uppercase text-slate-500">
                {day}
              </div>
            ))}
          </div>

          {/* Días del mes */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, index) => (
              <div
                key={index}
                className={`min-h-24 rounded-lg border p-2 transition ${
                  day.date
                    ? day.date.toDateString() === new Date().toDateString()
                      ? 'border-indigo-500 bg-indigo-50'
                      : day.appointments.length > 0
                      ? 'border-slate-300 bg-slate-50 hover:bg-slate-100'
                      : 'border-slate-200 hover:bg-slate-50'
                    : 'border-transparent bg-slate-50'
                }`}
              >
                {day.date && (
                  <>
                    <div className={`mb-1 text-right text-sm font-bold ${day.date.toDateString() === new Date().toDateString() ? 'text-indigo-600' : 'text-slate-700'}`}>{day.date.getDate()}</div>
                    <div className="space-y-1">
                      {day.appointments.slice(0, 2).map(apt => (
                        <div key={apt.id} className="truncate rounded bg-indigo-100 px-1.5 py-0.5 text-xs font-medium text-indigo-700" title={apt.title}>
                          {new Date(apt.startsAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })} {apt.title}
                        </div>
                      ))}
                      {day.appointments.length > 2 && <div className="text-xs font-medium text-slate-500">+{day.appointments.length - 2} más</div>}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Lista de citas del día actual */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <svg className="size-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h2 className="text-lg font-bold">Hoy</h2>
          </div>
          {selectedDayAppointments.length > 0 ? (
            <div className="space-y-3">
              {selectedDayAppointments.map(apt => (
                <article key={apt.id} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-500/10">
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
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 py-12 text-center">
              <div className="rounded-full bg-indigo-100 p-4">
                <svg className="size-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="mt-4 text-base font-semibold text-slate-700">No hay citas para hoy</p>
              <p className="mt-1 text-sm text-slate-500">Haz clic en "Nueva cita" para agregar una</p>
            </div>
          )}
        </div>
        </div>
      </div>

      <ConfirmModal isOpen={appointmentToDelete !== null} title="¿Eliminar esta cita?" message="Esta acción no se puede deshacer." confirmLabel="Eliminar" cancelLabel="Cancelar" onConfirm={confirmDelete} onCancel={() => setAppointmentToDelete(null)} loading={deleting} danger={true} />
    </div>
  );
}
