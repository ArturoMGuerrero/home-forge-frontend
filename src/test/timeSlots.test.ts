import { describe, expect, it } from 'vitest';
import { defaultAppointmentTimes, timeSlotOptions } from '../modules/appointments/timeSlots';

const office = { start: '09:00', end: '18:00', slotMinutes: 30 };

describe('horas de las citas según el horario de atención', () => {
  it('ofrece de apertura a cierre en el intervalo configurado', () => {
    const values = timeSlotOptions(office).map(option => option.value);
    expect(values[0]).toBe('09:00');
    expect(values[values.length - 1]).toBe('18:00');
    expect(values).toHaveLength(19);
    expect(timeSlotOptions({ ...office, slotMinutes: 60 }).map(option => option.value)).toEqual(
      ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00']
    );
  });

  it('conserva la hora de una cita agendada fuera del horario', () => {
    const values = timeSlotOptions(office, '07:30').map(option => option.value);
    expect(values[0]).toBe('07:30');
    expect(values).toContain('09:00');
  });

  it('sugiere la hora elegida en el calendario si cae en horario', () => {
    expect(defaultAppointmentTimes(office, new Date(2026, 9, 5, 11, 40))).toEqual({ startTime: '11:30', endTime: '12:30' });
  });

  it('sugiere la apertura si se eligió un día sin hora o una hora fuera del horario', () => {
    expect(defaultAppointmentTimes(office, new Date(2026, 9, 5))).toEqual({ startTime: '09:00', endTime: '10:00' });
    expect(defaultAppointmentTimes(office, new Date(2026, 9, 5, 21, 0))).toEqual({ startTime: '09:00', endTime: '10:00' });
  });

  it('no termina la cita después del cierre', () => {
    expect(defaultAppointmentTimes(office, new Date(2026, 9, 5, 17, 30))).toEqual({ startTime: '17:30', endTime: '18:00' });
  });
});
