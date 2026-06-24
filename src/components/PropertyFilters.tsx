import { useState } from 'react';
import { ApiProperty } from '../shared/propertyApi';

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
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      {/* Búsqueda principal */}
      <div className="relative">
        <svg className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          className="w-full rounded-xl border border-slate-200 py-2.5 pl-11 pr-4 text-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          onChange={e => updateFilter('searchQuery', e.target.value)}
          placeholder="Buscar por código, título o ciudad..."
          type="text"
          value={filters.searchQuery}
        />
        {filters.searchQuery && (
          <button
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            onClick={() => updateFilter('searchQuery', '')}
            type="button"
          >
            <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Filtros básicos */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-600">Estado</label>
          <select
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            onChange={e => updateFilter('statusFilter', e.target.value)}
            value={filters.statusFilter}
          >
            <option value="ALL">Todos</option>
            <option value="AVAILABLE">Disponible</option>
            <option value="RESERVED">Apartada</option>
            <option value="SOLD">Vendida</option>
            <option value="RENTED">Rentada</option>
            <option value="UNAVAILABLE">No disponible</option>
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-600">Operación</label>
          <select
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            onChange={e => updateFilter('listingTypeFilter', e.target.value)}
            value={filters.listingTypeFilter}
          >
            <option value="ALL">Todas</option>
            <option value="SALE">Venta</option>
            <option value="RENT">Renta</option>
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-600">Tipo</label>
          <select
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            onChange={e => updateFilter('propertyTypeFilter', e.target.value)}
            value={filters.propertyTypeFilter}
          >
            <option value="ALL">Todos</option>
            <option value="HOUSE">Casa</option>
            <option value="APARTMENT">Departamento</option>
            <option value="LAND">Terreno</option>
            <option value="COMMERCIAL">Local comercial</option>
            <option value="OFFICE">Oficina</option>
            <option value="WAREHOUSE">Bodega</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            className="w-full rounded-xl border-2 border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100"
            onClick={() => setShowAdvanced(!showAdvanced)}
            type="button"
          >
            {showAdvanced ? '⬆ Menos filtros' : '⬇ Más filtros'}
          </button>
        </div>
      </div>

      {/* Filtros avanzados */}
      {showAdvanced && (
        <div className="space-y-4 rounded-xl border border-indigo-100 bg-indigo-50/50 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-indigo-700">Filtros avanzados</p>

          {/* Rango de precio */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">Precio mínimo (MXN)</label>
              <input
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                min="0"
                placeholder="$ 0"
                type="number"
                value={filters.minPrice}
                onChange={e => updateFilter('minPrice', e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">Precio máximo (MXN)</label>
              <input
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                min="0"
                placeholder="$ 10,000,000"
                type="number"
                value={filters.maxPrice}
                onChange={e => updateFilter('maxPrice', e.target.value)}
              />
            </div>
          </div>

          {/* Rango de recámaras */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">Recámaras mínimas</label>
              <input
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                min="0"
                max="20"
                placeholder="0"
                type="number"
                value={filters.minBedrooms}
                onChange={e => updateFilter('minBedrooms', e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">Recámaras máximas</label>
              <input
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                min="0"
                max="20"
                placeholder="10"
                type="number"
                value={filters.maxBedrooms}
                onChange={e => updateFilter('maxBedrooms', e.target.value)}
              />
            </div>
          </div>

          {/* Rango de baños */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">Baños mínimos</label>
              <input
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                min="0"
                max="20"
                step="0.5"
                placeholder="0"
                type="number"
                value={filters.minBathrooms}
                onChange={e => updateFilter('minBathrooms', e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">Baños máximos</label>
              <input
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                min="0"
                max="20"
                step="0.5"
                placeholder="10"
                type="number"
                value={filters.maxBathrooms}
                onChange={e => updateFilter('maxBathrooms', e.target.value)}
              />
            </div>
          </div>

          {/* Rango de superficie */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">Superficie mínima (m²)</label>
              <input
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                min="0"
                placeholder="0"
                type="number"
                value={filters.minArea}
                onChange={e => updateFilter('minArea', e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">Superficie máxima (m²)</label>
              <input
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                min="0"
                placeholder="1000"
                type="number"
                value={filters.maxArea}
                onChange={e => updateFilter('maxArea', e.target.value)}
              />
            </div>
          </div>

          {/* Solo publicadas */}
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              checked={filters.publishedOnly}
              className="size-4 rounded border-slate-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
              type="checkbox"
              onChange={e => updateFilter('publishedOnly', e.target.checked)}
            />
            <span className="font-medium">Solo mostrar propiedades publicadas</span>
          </label>
        </div>
      )}

      {/* Contador de resultados */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between rounded-lg bg-indigo-50 px-4 py-2.5 text-xs">
          <span className="font-medium text-indigo-900">
            {resultCount} de {totalCount} {resultCount === 1 ? 'propiedad encontrada' : 'propiedades encontradas'}
          </span>
          <button
            className="font-semibold text-indigo-600 transition hover:text-indigo-700"
            onClick={clearFilters}
            type="button"
          >
            Limpiar filtros
          </button>
        </div>
      )}
    </div>
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
