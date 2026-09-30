import { useState } from 'react';
import { Button, Card, Checkbox, cn, Input, SearchInput, Select } from '../../../shared/ui';
import { ApiProperty } from '../api/propertyApi';

const statusOptions = [
  { value: 'ALL', label: 'Todos los estados' },
  { value: 'AVAILABLE', label: 'Disponible' },
  { value: 'RESERVED', label: 'Apartada' },
  { value: 'SOLD', label: 'Vendida' },
  { value: 'RENTED', label: 'Rentada' },
  { value: 'UNAVAILABLE', label: 'No disponible' }
];
const listingOptions = [
  { value: 'ALL', label: 'Venta y renta' },
  { value: 'SALE', label: 'Venta' },
  { value: 'RENT', label: 'Renta' }
];
const propertyTypeOptions = [
  { value: 'ALL', label: 'Todos los tipos' },
  { value: 'HOUSE', label: 'Casa' },
  { value: 'APARTMENT', label: 'Departamento' },
  { value: 'LAND', label: 'Terreno' },
  { value: 'COMMERCIAL', label: 'Local comercial' },
  { value: 'OFFICE', label: 'Oficina' },
  { value: 'WAREHOUSE', label: 'Bodega' }
];

export type PropertyFilterOptions = {
  searchQuery: string;
  statusFilter: string;
  listingTypeFilter: string;
  propertyTypeFilter: string;
  minPrice: string;
  maxPrice: string;
  minBedrooms: string;
  maxBedrooms: string;
  minBathrooms: string;
  maxBathrooms: string;
  minArea: string;
  maxArea: string;
  publishedOnly: boolean;
};

type PropertyFiltersProps = {
  filters: PropertyFilterOptions;
  onChange: (filters: PropertyFilterOptions) => void;
  resultCount: number;
  totalCount: number;
};

export function PropertyFilters({ filters, onChange, resultCount, totalCount }: PropertyFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  function updateFilter(key: keyof PropertyFilterOptions, value: string | boolean) {
    onChange({ ...filters, [key]: value });
  }

  function clearFilters() {
    onChange({
      searchQuery: '',
      statusFilter: 'ALL',
      listingTypeFilter: 'ALL',
      propertyTypeFilter: 'ALL',
      minPrice: '',
      maxPrice: '',
      minBedrooms: '',
      maxBedrooms: '',
      minBathrooms: '',
      maxBathrooms: '',
      minArea: '',
      maxArea: '',
      publishedOnly: false
    });
    setShowAdvanced(false);
  }

  const hasActiveFilters = filters.searchQuery ||
    filters.statusFilter !== 'ALL' ||
    filters.listingTypeFilter !== 'ALL' ||
    filters.propertyTypeFilter !== 'ALL' ||
    filters.minPrice || filters.maxPrice ||
    filters.minBedrooms || filters.maxBedrooms ||
    filters.minBathrooms || filters.maxBathrooms ||
    filters.minArea || filters.maxArea ||
    filters.publishedOnly;

  return (
    <Card className="space-y-4 p-4 sm:p-5">
      <div className="flex flex-col gap-3 lg:flex-row">
        <SearchInput
          aria-label="Buscar propiedades"
          containerClassName="lg:flex-1"
          onChange={e => updateFilter('searchQuery', e.target.value)}
          onClear={() => updateFilter('searchQuery', '')}
          placeholder="Buscar por código, título o ciudad..."
          value={filters.searchQuery}
        />
        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_1fr_auto] lg:flex-[1.4]">
          <Select aria-label="Estado" onChange={e => updateFilter('statusFilter', e.target.value)} options={statusOptions} value={filters.statusFilter} />
          <Select aria-label="Operación" onChange={e => updateFilter('listingTypeFilter', e.target.value)} options={listingOptions} value={filters.listingTypeFilter} />
          <Select aria-label="Tipo de inmueble" onChange={e => updateFilter('propertyTypeFilter', e.target.value)} options={propertyTypeOptions} value={filters.propertyTypeFilter} />
          <Button
            aria-expanded={showAdvanced}
            className="min-h-11"
            iconRight={<svg aria-hidden="true" className={cn('size-4 transition', showAdvanced && 'rotate-180')} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>}
            onClick={() => setShowAdvanced(!showAdvanced)}
            variant={showAdvanced ? 'secondary' : 'tertiary'}
          >
            Más filtros
          </Button>
        </div>
      </div>

      {showAdvanced && (
        <div className="grid gap-4 rounded-xl border border-border bg-surface-muted p-4 sm:grid-cols-2 lg:grid-cols-4">
          <Input label="Precio mínimo (MXN)" min="0" onChange={e => updateFilter('minPrice', e.target.value)} placeholder="$ 0" type="number" value={filters.minPrice} />
          <Input label="Precio máximo (MXN)" min="0" onChange={e => updateFilter('maxPrice', e.target.value)} placeholder="$ 10,000,000" type="number" value={filters.maxPrice} />
          <Input label="Superficie mínima (m²)" min="0" onChange={e => updateFilter('minArea', e.target.value)} placeholder="0" type="number" value={filters.minArea} />
          <Input label="Superficie máxima (m²)" min="0" onChange={e => updateFilter('maxArea', e.target.value)} placeholder="1000" type="number" value={filters.maxArea} />
          <Input label="Recámaras mínimas" max="20" min="0" onChange={e => updateFilter('minBedrooms', e.target.value)} placeholder="0" type="number" value={filters.minBedrooms} />
          <Input label="Recámaras máximas" max="20" min="0" onChange={e => updateFilter('maxBedrooms', e.target.value)} placeholder="10" type="number" value={filters.maxBedrooms} />
          <Input label="Baños mínimos" max="20" min="0" onChange={e => updateFilter('minBathrooms', e.target.value)} placeholder="0" step="0.5" type="number" value={filters.minBathrooms} />
          <Input label="Baños máximos" max="20" min="0" onChange={e => updateFilter('maxBathrooms', e.target.value)} placeholder="10" step="0.5" type="number" value={filters.maxBathrooms} />
          <div className="sm:col-span-2 lg:col-span-4">
            <Checkbox checked={filters.publishedOnly} label="Solo mostrar propiedades publicadas" onChange={e => updateFilter('publishedOnly', e.target.checked)} />
          </div>
        </div>
      )}

      {hasActiveFilters && (
        <div className="flex items-center justify-between gap-3 border-t border-border pt-3 text-sm">
          <span className="text-fg-subtle">
            <strong className="font-semibold text-fg">{resultCount}</strong> de {totalCount} {resultCount === 1 ? 'propiedad encontrada' : 'propiedades encontradas'}
          </span>
          <Button onClick={clearFilters} size="sm" variant="ghost">Limpiar filtros</Button>
        </div>
      )}
    </Card>
  );
}

export function applyPropertyFilters(properties: ApiProperty[], filters: PropertyFilterOptions): ApiProperty[] {
  return properties.filter(property => {
    // Búsqueda por texto
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const matchesCode = property.code?.toLowerCase().includes(query);
      const matchesTitle = property.title?.toLowerCase().includes(query);
      const matchesCity = property.city?.toLowerCase().includes(query);
      const matchesState = property.stateCode?.toLowerCase().includes(query);
      if (!matchesCode && !matchesTitle && !matchesCity && !matchesState) return false;
    }

    // Filtro por estado
    if (filters.statusFilter !== 'ALL' && property.status !== filters.statusFilter) return false;

    // Filtro por tipo de operación
    if (filters.listingTypeFilter !== 'ALL' && property.listingType !== filters.listingTypeFilter) return false;

    // Filtro por tipo de propiedad
    if (filters.propertyTypeFilter !== 'ALL' && property.propertyType !== filters.propertyTypeFilter) return false;

    // Filtro de precio
    if (filters.minPrice && property.price < Number(filters.minPrice)) return false;
    if (filters.maxPrice && property.price > Number(filters.maxPrice)) return false;

    // Filtro de recámaras
    if (filters.minBedrooms && (property.bedrooms === undefined || property.bedrooms < Number(filters.minBedrooms))) return false;
    if (filters.maxBedrooms && (property.bedrooms === undefined || property.bedrooms > Number(filters.maxBedrooms))) return false;

    // Filtro de baños
    if (filters.minBathrooms && (property.bathrooms === undefined || property.bathrooms < Number(filters.minBathrooms))) return false;
    if (filters.maxBathrooms && (property.bathrooms === undefined || property.bathrooms > Number(filters.maxBathrooms))) return false;

    // Filtro de superficie (usar construcción o terreno, el mayor)
    const area = Math.max(property.constructionArea || 0, property.landArea || 0);
    if (filters.minArea && area < Number(filters.minArea)) return false;
    if (filters.maxArea && area > Number(filters.maxArea)) return false;

    // Solo publicadas
    if (filters.publishedOnly && !property.published) return false;

    return true;
  });
}
