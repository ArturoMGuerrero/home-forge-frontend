import { useState } from 'react';
import { ApiProperty, formatApiPrice, listingLabel, propertyStatusLabel } from '../shared/propertyApi';

type PropertyComparatorProps = {
  properties: ApiProperty[];
  selectedIds: string[];
  onClose: () => void;
};

const money = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  maximumFractionDigits: 0
});

export function PropertyComparator({ properties, selectedIds, onClose }: PropertyComparatorProps) {
  const selectedProperties = properties.filter(p => selectedIds.includes(p.id));

  if (selectedProperties.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-slate-950/50 p-4">
      <div className="mx-auto min-h-full max-w-7xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Comparador de Propiedades</h2>
            <p className="mt-1 text-sm text-slate-500">
              Comparando {selectedProperties.length} {selectedProperties.length === 1 ? 'propiedad' : 'propiedades'}
            </p>
          </div>
          <button
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            onClick={onClose}
            type="button"
          >
            <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabla de comparación */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-200">
                <th className="sticky left-0 z-10 bg-white p-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600">
                  Característica
                </th>
                {selectedProperties.map(property => (
                  <th className="min-w-[280px] p-4" key={property.id}>
                    <div className="space-y-3">
                      {property.images?.[0] ? (
                        <img
                          alt={property.title}
                          className="h-40 w-full rounded-xl object-cover"
                          src={property.images[0].imageUrl.startsWith('http') ? property.images[0].imageUrl : `http://localhost:8080${property.images[0].imageUrl}`}
                        />
                      ) : (
                        <div className="grid h-40 place-items-center rounded-xl bg-indigo-50 text-3xl font-bold text-indigo-700">
                          {property.propertyType.slice(0, 2)}
                        </div>
                      )}
                      <div>
                        <h3 className="font-bold text-slate-900">{property.title}</h3>
                        <p className="text-sm text-slate-500">{property.code}</p>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Precio */}
              <ComparisonRow
                label="Precio"
                values={selectedProperties.map(p => formatApiPrice(p))}
                highlight
              />

              {/* Operación */}
              <ComparisonRow
                label="Operación"
                values={selectedProperties.map(p => listingLabel(p.listingType))}
              />

              {/* Estado */}
              <ComparisonRow
                label="Estado"
                values={selectedProperties.map(p => propertyStatusLabel(p.status))}
              />

              {/* Tipo */}
              <ComparisonRow
                label="Tipo de inmueble"
                values={selectedProperties.map(p => {
                  const types: Record<string, string> = {
                    HOUSE: 'Casa',
                    APARTMENT: 'Departamento',
                    LAND: 'Terreno',
                    COMMERCIAL: 'Local comercial',
                    OFFICE: 'Oficina',
                    WAREHOUSE: 'Bodega'
                  };
                  return types[p.propertyType] || p.propertyType;
                })}
              />

              {/* Ubicación */}
              <ComparisonRow
                label="Ubicación"
                values={selectedProperties.map(p => `${p.city}, ${p.stateCode}`)}
              />

              <ComparisonRow
                label="Dirección"
                values={selectedProperties.map(p => p.address || 'No especificada')}
              />

              {/* Características */}
              <tr className="border-t-2 border-slate-200">
                <td className="sticky left-0 bg-slate-50 p-4" colSpan={selectedProperties.length + 1}>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Características</span>
                </td>
              </tr>

              <ComparisonRow
                label="Recámaras"
                values={selectedProperties.map(p => p.bedrooms?.toString() || '-')}
                highlight
              />

              <ComparisonRow
                label="Baños"
                values={selectedProperties.map(p => p.bathrooms?.toString() || '-')}
                highlight
              />

              <ComparisonRow
                label="Estacionamientos"
                values={selectedProperties.map(p => p.parkingSpaces?.toString() || '-')}
              />

              <ComparisonRow
                label="Terreno (m²)"
                values={selectedProperties.map(p => p.landArea ? `${p.landArea.toLocaleString()} m²` : '-')}
                highlight
              />

              <ComparisonRow
                label="Construcción (m²)"
                values={selectedProperties.map(p => p.constructionArea ? `${p.constructionArea.toLocaleString()} m²` : '-')}
                highlight
              />

              {/* Precio por m² */}
              <ComparisonRow
                label="Precio por m² construcción"
                values={selectedProperties.map(p => {
                  if (!p.constructionArea || p.constructionArea === 0 || p.currencyCode !== 'MXN') return '-';
                  const pricePerSqm = p.price / p.constructionArea;
                  return money.format(pricePerSqm);
                })}
              />

              {/* Publicación */}
              <tr className="border-t-2 border-slate-200">
                <td className="sticky left-0 bg-slate-50 p-4" colSpan={selectedProperties.length + 1}>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Publicación</span>
                </td>
              </tr>

              <ComparisonRow
                label="Estado de publicación"
                values={selectedProperties.map(p => p.published ? '✅ Publicada' : '⚠️ Borrador')}
              />

              <ComparisonRow
                label="Fotos"
                values={selectedProperties.map(p => `${p.images?.length || 0} fotos`)}
              />

              <ComparisonRow
                label="Fecha de creación"
                values={selectedProperties.map(p => new Date(p.createdAt).toLocaleDateString('es-MX'))}
              />
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
            onClick={onClose}
            type="button"
          >
            Cerrar comparación
          </button>
        </div>
      </div>
    </div>
  );
}

type ComparisonRowProps = {
  label: string;
  values: string[];
  highlight?: boolean;
};

function ComparisonRow({ label, values, highlight }: ComparisonRowProps) {
  // Find best/worst values for highlighting
  const numericValues = values.map(v => {
    const num = parseFloat(v.replace(/[^0-9.-]/g, ''));
    return isNaN(num) ? null : num;
  });

  const hasDifferentValues = new Set(values).size > 1;
  const allNumeric = numericValues.every(v => v !== null);

  let bestIndex = -1;
  let worstIndex = -1;

  if (highlight && hasDifferentValues && allNumeric) {
    const max = Math.max(...numericValues.filter(v => v !== null) as number[]);
    const min = Math.min(...numericValues.filter(v => v !== null) as number[]);
    bestIndex = numericValues.indexOf(max);
    worstIndex = numericValues.indexOf(min);
  }

  return (
    <tr className="border-b border-slate-100 transition hover:bg-slate-50">
      <td className="sticky left-0 bg-white p-4 text-sm font-semibold text-slate-700">
        {label}
      </td>
      {values.map((value, index) => (
        <td
          className={`p-4 text-center text-sm ${
            highlight && index === bestIndex
              ? 'bg-emerald-50 font-bold text-emerald-700'
              : highlight && index === worstIndex
              ? 'bg-slate-100 text-slate-500'
              : 'text-slate-900'
          }`}
          key={index}
        >
          {value}
        </td>
      ))}
    </tr>
  );
}
