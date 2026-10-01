import type { LeadItem } from '../leads';
import type { ApiProperty } from '../properties';
import { formatApiPrice } from '../properties';

/** Variables sugeridas para las plantillas; se llenan solas al elegir cliente y propiedad. */
export const STANDARD_VARIABLES: Array<{ key: string; label: string }> = [
  { key: 'cliente_nombre', label: 'Nombre del cliente' },
  { key: 'cliente_email', label: 'Correo del cliente' },
  { key: 'cliente_telefono', label: 'Teléfono del cliente' },
  { key: 'propiedad_titulo', label: 'Título de la propiedad' },
  { key: 'propiedad_direccion', label: 'Dirección de la propiedad' },
  { key: 'propiedad_ciudad', label: 'Ciudad de la propiedad' },
  { key: 'propiedad_precio', label: 'Precio de la propiedad' },
  { key: 'inmobiliaria_nombre', label: 'Nombre de la inmobiliaria' },
  { key: 'asesor_nombre', label: 'Nombre del asesor' },
  { key: 'fecha', label: 'Fecha de hoy' }
];

const VARIABLE_PATTERN = /\{\{\s*([^{}]+?)\s*\}\}/g;

/** Variables usadas en el texto de una plantilla, en orden de aparición y sin repetir. */
export function extractVariables(content: string): string[] {
  return [...new Set([...content.matchAll(VARIABLE_PATTERN)].map(match => match[1].trim()))];
}

/** Sustituye las variables para la vista previa; las vacías se muestran entre corchetes. */
export function fillTemplate(content: string, values: Record<string, string>): string {
  return content.replace(VARIABLE_PATTERN, (_, name: string) => values[name.trim()] || `[${name.trim()}]`);
}

export function variableLabel(key: string): string {
  return STANDARD_VARIABLES.find(variable => variable.key === key)?.label
    ?? key.replace(/_/g, ' ').replace(/^\w/, letter => letter.toUpperCase());
}

export function suggestedValues(input: {
  lead?: LeadItem;
  property?: ApiProperty;
  companyName?: string;
  agentName?: string;
}): Record<string, string> {
  const { lead, property } = input;
  const values: Record<string, string> = {
    inmobiliaria_nombre: input.companyName ?? '',
    asesor_nombre: input.agentName ?? '',
    fecha: new Date().toLocaleDateString('es-MX', { dateStyle: 'long' })
  };
  if (lead) {
    values.cliente_nombre = `${lead.firstName} ${lead.lastName}`.trim();
    values.cliente_email = lead.email ?? '';
    values.cliente_telefono = lead.phoneE164 ?? '';
  }
  if (property) {
    values.propiedad_titulo = property.title;
    values.propiedad_direccion = property.address ?? '';
    values.propiedad_ciudad = `${property.city}, ${property.stateCode}`;
    values.propiedad_precio = formatApiPrice(property);
  }
  return values;
}
