import { postJson } from '../../../shared/services/api';

/** Datos que deja un visitante en el formulario "Me interesa" de una propiedad. */
export type PropertyInquiry = {
  fullName: string;
  phoneE164: string;
  email?: string;
  message?: string;
  preferredVisit?: string;
  acceptsPrivacy: boolean;
  /** Campo trampa para robots: el formulario lo oculta y una persona lo deja vacío. */
  website: string;
};

/** El backend crea (o actualiza) el prospecto en la inmobiliaria dueña de la propiedad. */
export function sendPropertyInquiry(propertyId: string, inquiry: PropertyInquiry): Promise<void> {
  return postJson<void>(`/properties/public/${propertyId}/inquiries`, inquiry);
}

/**
 * Convierte lo que escribe la persona a formato internacional. Diez dígitos se toman como número de
 * México (+52); si ya trae lada internacional (+ o 00) se respeta. Devuelve null si no parece un teléfono.
 */
export function toE164(input: string, defaultCountryCode = '52'): string | null {
  const trimmed = input.trim();
  const digits = trimmed.replace(/\D/g, '');
  let e164: string;
  if (trimmed.startsWith('+')) e164 = `+${digits}`;
  else if (digits.startsWith('00')) e164 = `+${digits.slice(2)}`;
  else if (digits.length === 10) e164 = `+${defaultCountryCode}${digits}`;
  else e164 = `+${digits}`;
  return /^\+[1-9]\d{9,14}$/.test(e164) ? e164 : null;
}
