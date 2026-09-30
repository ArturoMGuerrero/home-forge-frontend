import { Button, cn, Modal } from '../../../shared/ui';
import { ApiProperty, formatApiPrice, listingLabel, propertyImages, propertyStatusLabel } from '../api/propertyApi';

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

const propertyTypeLabels: Record<string, string> = {
  HOUSE: 'Casa',
  APARTMENT: 'Departamento',
  LAND: 'Terreno',
  COMMERCIAL: 'Local comercial',
  OFFICE: 'Oficina',
  WAREHOUSE: 'Bodega'
};

export function PropertyComparator({ properties, selectedIds, onClose }: PropertyComparatorProps) {
  const selectedProperties = properties.filter(p => selectedIds.includes(p.id));

  if (selectedProperties.length === 0) {
    return null;
  }

  const columns = selectedProperties.length + 1;

  return (
    <Modal
      footer={<Button onClick={onClose}>Cerrar comparación</Button>}
      isOpen
      maxWidth="7xl"
      noPadding
      onClose={onClose}
      subtitle={`Comparando ${selectedProperties.length} ${selectedProperties.length === 1 ? 'propiedad' : 'propiedades'}`}
      title="Comparador de propiedades"
    >
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="sticky left-0 z-10 bg-surface p-4 text-left text-xs font-semibold uppercase tracking-wide text-fg-subtle" scope="col">
                Característica
              </th>
              {selectedProperties.map(property => {
                const image = propertyImages(property)[0];
                return (
                  <th className="min-w-[260px] p-4 text-left font-normal" key={property.id} scope="col">
                    {image ? (
                      <img alt={property.title} className="aspect-[16/10] w-full rounded-xl object-cover" src={image} />
                    ) : (
                      <div className="grid aspect-[16/10] place-items-center rounded-xl bg-primary-soft text-2xl font-bold text-primary-fg">
                        {property.propertyType.slice(0, 2)}
                      </div>
                    )}
                    <h3 className="mt-3 font-semibold text-fg">{property.title}</h3>
                    <p className="text-xs text-fg-subtle">{property.code}</p>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            <ComparisonRow label="Precio" values={selectedProperties.map(p => formatApiPrice(p))} />
            <ComparisonRow label="Operación" values={selectedProperties.map(p => listingLabel(p.listingType))} />
            <ComparisonRow label="Estado" values={selectedProperties.map(p => propertyStatusLabel(p.status))} />
            <ComparisonRow label="Tipo de inmueble" values={selectedProperties.map(p => propertyTypeLabels[p.propertyType] || p.propertyType)} />
            <ComparisonRow label="Ubicación" values={selectedProperties.map(p => `${p.city}, ${p.stateCode}`)} />
            <ComparisonRow label="Dirección" values={selectedProperties.map(p => p.address || 'No especificada')} />

            <SectionRow colSpan={columns} label="Características" />
            <ComparisonRow highlight label="Recámaras" values={selectedProperties.map(p => p.bedrooms?.toString() || '—')} />
            <ComparisonRow highlight label="Baños" values={selectedProperties.map(p => p.bathrooms?.toString() || '—')} />
            <ComparisonRow highlight label="Estacionamientos" values={selectedProperties.map(p => p.parkingSpaces?.toString() || '—')} />
            <ComparisonRow highlight label="Terreno" values={selectedProperties.map(p => p.landArea ? `${p.landArea.toLocaleString()} m²` : '—')} />
            <ComparisonRow highlight label="Construcción" values={selectedProperties.map(p => p.constructionArea ? `${p.constructionArea.toLocaleString()} m²` : '—')} />
            <ComparisonRow
              label="Precio por m² construcción"
              values={selectedProperties.map(p => {
                if (!p.constructionArea || p.currencyCode !== 'MXN') return '—';
                return money.format(p.price / p.constructionArea);
              })}
            />

            <SectionRow colSpan={columns} label="Publicación" />
            <ComparisonRow label="Estado de publicación" values={selectedProperties.map(p => p.published ? 'Publicada' : 'Borrador')} />
            <ComparisonRow label="Fotos" values={selectedProperties.map(p => `${p.images?.length || 0} fotos`)} />
            <ComparisonRow label="Fecha de creación" values={selectedProperties.map(p => new Date(p.createdAt).toLocaleDateString('es-MX'))} />
          </tbody>
        </table>
      </div>
    </Modal>
  );
}

function SectionRow({ label, colSpan }: { label: string; colSpan: number }) {
  return (
    <tr className="border-b border-border bg-surface-muted">
      <td className="sticky left-0 bg-surface-muted px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-fg-subtle" colSpan={colSpan}>
        {label}
      </td>
    </tr>
  );
}

type ComparisonRowProps = {
  label: string;
  values: string[];
  /** Resalta el valor más alto (para características donde "más" es mejor). */
  highlight?: boolean;
};

function ComparisonRow({ label, values, highlight }: ComparisonRowProps) {
  const numericValues = values.map(v => {
    const num = parseFloat(v.replace(/[^0-9.-]/g, ''));
    return isNaN(num) ? null : num;
  });

  const hasDifferentValues = new Set(values).size > 1;
  const allNumeric = numericValues.every(v => v !== null);
  const bestIndex = highlight && hasDifferentValues && allNumeric
    ? numericValues.indexOf(Math.max(...(numericValues as number[])))
    : -1;

  return (
    <tr className="border-b border-border last:border-0">
      <th className="sticky left-0 bg-surface p-4 text-left text-sm font-medium text-fg-muted" scope="row">
        {label}
      </th>
      {values.map((value, index) => (
        <td className={cn('p-4 text-fg', index === bestIndex && 'bg-success-soft font-semibold text-success-fg')} key={index}>
          {value}
        </td>
      ))}
    </tr>
  );
}
