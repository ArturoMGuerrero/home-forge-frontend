import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import toast from 'react-hot-toast';
import { getSession } from '../../auth';
import {
  BusinessHours,
  businessTimeSlots,
  DEFAULT_BUSINESS_HOURS,
  fromMinutes,
  getBusinessHours,
  SLOT_MINUTE_OPTIONS,
  toMinutes,
  updateBusinessHours
} from '../api/businessHours';
import { Alert, Button, Card, LoadingState, PageHeader, Select } from '../../../shared/ui';

/** Cada media hora del día, para elegir apertura y cierre. */
const HALF_HOURS = Array.from({ length: 48 }, (_, index) => fromMinutes(index * 30));
const HOUR_OPTIONS = HALF_HOURS.map(time => ({ value: time, label: time }));

const PRESETS: { label: string; hours: BusinessHours }[] = [
  { label: 'Oficina (9:00 a 18:00)', hours: { start: '09:00', end: '18:00', slotMinutes: 30 } },
  { label: 'Extendido (8:00 a 20:00)', hours: { start: '08:00', end: '20:00', slotMinutes: 30 } },
  { label: 'Por defecto (9:00 a 19:00)', hours: DEFAULT_BUSINESS_HOURS }
];

export function BusinessHoursSettingsPage() {
  const isAdmin = getSession()?.role === 'ADMIN';
  const [hours, setHours] = useState<BusinessHours | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getBusinessHours().then(setHours);
  }, []);

  if (!hours) return <Card><LoadingState message="Cargando horario de atención..." /></Card>;

  const invalid = toMinutes(hours.end) <= toMinutes(hours.start);
  const slots = invalid ? [] : businessTimeSlots(hours);
  const withCurrent = (time: string) =>
    HOUR_OPTIONS.some(option => option.value === time) ? HOUR_OPTIONS : [...HOUR_OPTIONS, { value: time, label: time }].sort((a, b) => a.value.localeCompare(b.value));

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!hours || invalid) return;
    setSaving(true);
    try {
      setHours(await updateBusinessHours(hours));
      toast.success('Horario de atención guardado.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No fue posible guardar el horario.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader
        backLink={{ to: '/app/configuracion', label: 'Configuración' }}
        eyebrow="Agenda"
        subtitle="Define en qué horario se agendan citas y visitas. Los selectores de hora y el calendario solo muestran ese rango."
        title="Horario de atención"
      />

      {!isAdmin && (
        <Alert className="mb-6" variant="info">Solo un administrador puede cambiar el horario de atención.</Alert>
      )}

      <form className="grid gap-6 xl:grid-cols-[1fr_320px]" onSubmit={submit}>
        <Card>
          <h2 className="text-lg font-semibold text-fg">Rango de horario</h2>
          <p className="mt-1 text-sm text-fg-subtle">Aplica a toda la empresa.</p>

          <div className="mt-5 flex flex-wrap gap-2">
            {PRESETS.map(preset => (
              <Button disabled={!isAdmin} key={preset.label} onClick={() => setHours(preset.hours)} size="sm" type="button" variant="tertiary">
                {preset.label}
              </Button>
            ))}
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-3">
            <Select disabled={!isAdmin} label="Apertura" onChange={event => setHours({ ...hours, start: event.target.value })} options={withCurrent(hours.start)} value={hours.start} />
            <Select disabled={!isAdmin} label="Cierre" onChange={event => setHours({ ...hours, end: event.target.value })} options={withCurrent(hours.end)} value={hours.end} />
            <Select
              disabled={!isAdmin}
              label="Citas cada"
              onChange={event => setHours({ ...hours, slotMinutes: Number(event.target.value) })}
              options={SLOT_MINUTE_OPTIONS.map(minutes => ({ value: String(minutes), label: minutes === 60 ? '1 hora' : `${minutes} minutos` }))}
              value={String(hours.slotMinutes)}
            />
          </div>

          {invalid && <Alert className="mt-5" variant="error">La hora de cierre debe ser posterior a la de apertura.</Alert>}
        </Card>

        <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
          <Card>
            <h2 className="font-semibold text-fg">Así se verá al agendar</h2>
            <p className="mt-1.5 text-sm text-fg-subtle">
              {slots.length > 0 ? `${slots.length} horarios disponibles, de ${hours.start} a ${hours.end}.` : 'Elige un rango válido.'}
            </p>
            <div className="mt-4 flex max-h-56 flex-wrap gap-1.5 overflow-y-auto">
              {slots.map(slot => (
                <span className="rounded-md bg-surface-muted px-2 py-1 text-xs tabular-nums text-fg-muted" key={slot}>{slot}</span>
              ))}
            </div>
            <p className="mt-4 text-xs text-fg-subtle">Las citas que ya estén fuera de este horario se conservan y siguen apareciendo en el calendario.</p>
          </Card>
          {isAdmin && (
            <Button disabled={invalid} fullWidth loading={saving} size="lg" type="submit">
              {saving ? 'Guardando...' : 'Guardar horario'}
            </Button>
          )}
        </aside>
      </form>
    </>
  );
}
