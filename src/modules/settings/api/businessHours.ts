import { useEffect, useState } from 'react';
import { getCompanyId } from '../../leads';
import { getJson, putJson } from '../../../shared/services/api';

/** Horario de atención de la empresa: limita las horas que se ofrecen al agendar citas y las que muestra el calendario. */
export type BusinessHours = {
  /** "HH:mm" */
  start: string;
  /** "HH:mm" */
  end: string;
  /** 15, 30 o 60 */
  slotMinutes: number;
};

export const DEFAULT_BUSINESS_HOURS: BusinessHours = { start: '09:00', end: '19:00', slotMinutes: 30 };
export const SLOT_MINUTE_OPTIONS = [15, 30, 60];

const CHANGED_EVENT = 'homeforge:business-hours-changed';
// Se pide una vez por empresa (cambia muy poco); si se inicia sesión con otra empresa se vuelve a pedir.
let cached: { companyId: string; hours: Promise<BusinessHours> } | null = null;

export function getBusinessHours(): Promise<BusinessHours> {
  const companyId = getCompanyId();
  if (cached?.companyId !== companyId) {
    const hours = getJson<BusinessHours>(`/companies/${companyId}/business-hours`).catch(() => {
      cached = null;
      return DEFAULT_BUSINESS_HOURS;
    });
    cached = { companyId, hours };
  }
  return cached.hours;
}

export async function updateBusinessHours(hours: BusinessHours): Promise<BusinessHours> {
  const companyId = getCompanyId();
  const saved = await putJson<BusinessHours>(`/companies/${companyId}/business-hours`, hours);
  cached = { companyId, hours: Promise.resolve(saved) };
  window.dispatchEvent(new Event(CHANGED_EVENT));
  return saved;
}

/** Horario de la empresa; mientras carga (o si falla) usa el horario por defecto. */
export function useBusinessHours(): BusinessHours {
  const [hours, setHours] = useState<BusinessHours>(DEFAULT_BUSINESS_HOURS);
  useEffect(() => {
    let active = true;
    const load = () => getBusinessHours().then(value => { if (active) setHours(value); });
    load();
    window.addEventListener(CHANGED_EVENT, load);
    return () => {
      active = false;
      window.removeEventListener(CHANGED_EVENT, load);
    };
  }, []);
  return hours;
}

export const toMinutes = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

export const fromMinutes = (total: number) =>
  `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;

/** Horas de apertura a cierre (inclusive), cada `slotMinutes`. */
export function businessTimeSlots({ start, end, slotMinutes }: BusinessHours): string[] {
  const slots: string[] = [];
  for (let minute = toMinutes(start); minute <= toMinutes(end); minute += slotMinutes) {
    slots.push(fromMinutes(minute));
  }
  return slots;
}
