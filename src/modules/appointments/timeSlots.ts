import { BusinessHours, businessTimeSlots, fromMinutes, toMinutes } from '../settings/api/businessHours';

/**
 * Opciones de hora para las citas según el horario de atención de la empresa. Si la cita ya tiene una
 * hora fuera del horario (se agendó antes de cambiarlo), se conserva como opción para no perderla.
 */
export function timeSlotOptions(hours: BusinessHours, ...keep: string[]) {
  const slots = new Set(businessTimeSlots(hours));
  keep.filter(Boolean).forEach(time => slots.add(time));
  return [...slots].sort().map(slot => ({ value: slot, label: slot }));
}

/** Inicio y fin sugeridos para una cita nueva en `date`: la hora elegida si cae en horario, si no la apertura. */
export function defaultAppointmentTimes(hours: BusinessHours, date?: Date) {
  const open = toMinutes(hours.start);
  const close = toMinutes(hours.end);
  let start = open;
  if (date && (date.getHours() > 0 || date.getMinutes() > 0)) {
    const chosen = date.getHours() * 60 + date.getMinutes();
    const rounded = open + Math.floor((chosen - open) / hours.slotMinutes) * hours.slotMinutes;
    if (rounded >= open && rounded < close) start = rounded;
  }
  // Las citas duran una hora por defecto, sin pasar del cierre.
  const end = Math.min(start + 60, close);
  return { startTime: fromMinutes(start), endTime: fromMinutes(end > start ? end : start + hours.slotMinutes) };
}
