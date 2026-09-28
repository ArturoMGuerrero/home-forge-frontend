export type CatalogItem = {
  code: string;
  labelEs: string;
  labelEn: string;
};

export type CatalogIndex = {
  catalogs: string[];
};

export const primaryCatalogs = [
  'lead-sources',
  'property-types',
  'listing-types',
  'document-types',
  'mortgage-types',
  'countries',
  'currencies'
];

export const workflowCatalogs = [
  'lead-statuses',
  'property-statuses',
  'task-statuses',
  'document-statuses',
  'mortgage-statuses'
];

export const catalogLabels: Record<string, { es: string; en: string; description: string }> = {
  'lead-statuses': { es: 'Estados de prospecto', en: 'Lead statuses', description: 'Etapas disponibles para el seguimiento comercial.' },
  'lead-sources': { es: 'Origen de prospectos', en: 'Lead sources', description: 'Canales por los que llegan nuevos prospectos.' },
  'property-statuses': { es: 'Estados de propiedad', en: 'Property statuses', description: 'Disponibilidad y situación comercial del inventario.' },
  'listing-types': { es: 'Operaciones inmobiliarias', en: 'Listing types', description: 'Modalidades de publicación: venta o renta.' },
  'property-types': { es: 'Tipos de propiedad', en: 'Property types', description: 'Clasificaciones disponibles para los inmuebles.' },
  'task-statuses': { es: 'Estados de tareas', en: 'Task statuses', description: 'Etapas para organizar pendientes y actividades.' },
  'document-statuses': { es: 'Estados de documentos', en: 'Document statuses', description: 'Situación de los documentos recibidos.' },
  'document-types': { es: 'Tipos de documento', en: 'Document types', description: 'Documentos utilizados en los expedientes.' },
  'mortgage-types': { es: 'Tipos de financiamiento', en: 'Mortgage types', description: 'Alternativas de crédito y formas de pago.' },
  'mortgage-statuses': { es: 'Estados de financiamiento', en: 'Mortgage statuses', description: 'Etapas del proceso hipotecario.' },
  countries: { es: 'Países', en: 'Countries', description: 'Países habilitados para operar en HomeForge.' },
  currencies: { es: 'Monedas', en: 'Currencies', description: 'Monedas aceptadas para precios y operaciones.' }
};

export function catalogLabel(name: string, language = 'es') {
  return catalogLabels[name]?.[language === 'es' ? 'es' : 'en'] ?? name;
}
