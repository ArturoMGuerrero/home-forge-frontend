import { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ApiProperty, formatApiPrice, listingLabel, listProperties, propertyImages, propertyStatusClass, propertyStatusLabel } from '../shared/propertyApi';
import { ExportButton } from '../shared/ExportButton';
import { exportToExcel, formatCurrency } from '../shared/excelExport';
import { UpgradeModal } from '../shared/UpgradeModal';
import { SubscriptionRestrictions } from '../shared/subscriptionRestrictions';

export function PropertiesPage() {
  const context = useOutletContext<{ restrictions: SubscriptionRestrictions }>();
  const restrictions = context?.restrictions || { canCreate: true, canExport: true, level: 'NONE' };
  const [properties, setProperties] = useState<ApiProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [listingTypeFilter, setListingTypeFilter] = useState<string>('ALL');
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'recent' | 'price-asc' | 'price-desc' | 'alpha'>('recent');
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  useEffect(() => {
    listProperties()
      .then(setProperties)
      .catch(() => toast.error('No fue posible consultar las propiedades. Verifica que el backend esté activo.'))
      .finally(() => setLoading(false));
  }, []);

  const filteredProperties = properties.filter(property => {
    // Búsqueda por texto
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesCode = property.code?.toLowerCase().includes(query);
      const matchesTitle = property.title?.toLowerCase().includes(query);
      const matchesCity = property.city?.toLowerCase().includes(query);
      const matchesState = property.stateCode?.toLowerCase().includes(query);
      if (!matchesCode && !matchesTitle && !matchesCity && !matchesState) return false;
    }

    // Filtro por estado
    if (statusFilter !== 'ALL' && property.status !== statusFilter) return false;

    // Filtro por tipo de operación
    if (listingTypeFilter !== 'ALL' && property.listingType !== listingTypeFilter) return false;

    // Filtro por tipo de propiedad
    if (propertyTypeFilter !== 'ALL' && property.propertyType !== propertyTypeFilter) return false;

    return true;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'price-asc':
        return (a.price || 0) - (b.price || 0);
      case 'price-desc':
        return (b.price || 0) - (a.price || 0);
      case 'alpha':
        return a.title.localeCompare(b.title);
      case 'recent':
      default:
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    }
  });

  function handleExport() {
    if (!restrictions.canExport) {
      setUpgradeModalOpen(true);
      return;
    }
    exportToExcel(
      filteredProperties,
      [
        { header: 'Código', key: 'code', width: 12 },
        { header: 'Título', key: 'title', width: 30 },
        { header: 'Tipo', key: 'propertyType', width: 15 },
        { header: 'Operación', key: item => listingLabel(item.listingType), width: 12 },
        { header: 'Estado', key: item => propertyStatusLabel(item.status), width: 15 },
        { header: 'Precio', key: item => formatCurrency(item.price, item.currencyCode), width: 15 },
        { header: 'Recámaras', key: 'bedrooms', width: 10 },
        { header: 'Baños', key: 'bathrooms', width: 10 },
        { header: 'Estacionamiento', key: 'parkingSpaces', width: 15 },
        { header: 'Terreno m²', key: 'landArea', width: 12 },
        { header: 'Construcción m²', key: 'constructionArea', width: 15 },
        { header: 'País', key: 'countryCode', width: 10 },
        { header: 'Estado', key: 'stateCode', width: 15 },
        { header: 'Ciudad', key: 'city', width: 20 },
        { header: 'Dirección', key: 'address', width: 30 },
        { header: 'Publicada', key: item => item.published ? 'Sí' : 'No', width: 10 }
      ],
      'propiedades-homeforge',
      'Propiedades'
    );
  }

  function handleCreateProperty() {
    if (!restrictions.canCreate) {
      setUpgradeModalOpen(true);
    }
  }

  return (
    <>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.16em] text-indigo-600">Inventario</p>
          <h1 className="text-3xl font-bold">Propiedades</h1>
          <p className="mt-2 text-sm text-slate-500">Administra inmuebles en venta y renta desde PostgreSQL.</p>
        </div>
        <div className="flex gap-3">
          <ExportButton onExport={handleExport} variant="secondary" />
          {restrictions.canCreate ? (
            <Link className="shrink-0 rounded-xl bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700" to="/app/propiedades/nueva">
              + Agregar propiedad
            </Link>
          ) : (
            <button
              className="shrink-0 rounded-xl bg-slate-200 px-3.5 py-2.5 text-sm font-semibold text-slate-500 cursor-not-allowed"
              onClick={handleCreateProperty}
              type="button"
            >
              🔒 Agregar propiedad
            </button>
          )}
        </div>
      </header>

      {loading && <p className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">Consultando propiedades...</p>}

      {!loading && (
        <>
          {/* Búsqueda y Filtros */}
          <div className="mb-6 space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            {/* Búsqueda */}
            <div className="relative">
              <svg className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-11 pr-4 text-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Buscar por código, título o ciudad..."
                type="text"
                value={searchQuery}
              />
              {searchQuery && (
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                  onClick={() => setSearchQuery('')}
                  type="button"
                >
                  <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Filtros */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {/* Filtro de Estado */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Estado</label>
                <select
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  onChange={e => setStatusFilter(e.target.value)}
                  value={statusFilter}
                >
                  <option value="ALL">Todos</option>
                  <option value="AVAILABLE">Disponible</option>
                  <option value="RESERVED">Apartada</option>
                  <option value="SOLD">Vendida</option>
                  <option value="RENTED">Rentada</option>
                  <option value="UNAVAILABLE">No disponible</option>
                </select>
              </div>

              {/* Filtro de Tipo de Operación */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Operación</label>
                <select
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  onChange={e => setListingTypeFilter(e.target.value)}
                  value={listingTypeFilter}
                >
                  <option value="ALL">Todas</option>
                  <option value="SALE">Venta</option>
                  <option value="RENT">Renta</option>
                </select>
              </div>

              {/* Filtro de Tipo de Propiedad */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Tipo</label>
                <select
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  onChange={e => setPropertyTypeFilter(e.target.value)}
                  value={propertyTypeFilter}
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

              {/* Ordenamiento */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Ordenar por</label>
                <select
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  onChange={e => setSortBy(e.target.value as any)}
                  value={sortBy}
                >
                  <option value="recent">Más reciente</option>
                  <option value="price-asc">Precio menor</option>
                  <option value="price-desc">Precio mayor</option>
                  <option value="alpha">Alfabético</option>
                </select>
              </div>
            </div>

            {/* Contador de resultados */}
            {(searchQuery || statusFilter !== 'ALL' || listingTypeFilter !== 'ALL' || propertyTypeFilter !== 'ALL') && (
              <div className="flex items-center justify-between rounded-lg bg-indigo-50 px-4 py-2.5 text-xs">
                <span className="font-medium text-indigo-900">
                  {filteredProperties.length} {filteredProperties.length === 1 ? 'propiedad encontrada' : 'propiedades encontradas'}
                </span>
                <button
                  className="font-semibold text-indigo-600 transition hover:text-indigo-700"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('ALL');
                    setListingTypeFilter('ALL');
                    setPropertyTypeFilter('ALL');
                    setSortBy('recent');
                  }}
                  type="button"
                >
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>

          {/* Estado vacío cuando no hay resultados */}
          {filteredProperties.length === 0 && properties.length > 0 && (
            <div className="py-12 text-center">
              <svg className="mx-auto mb-3 size-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-sm font-medium text-slate-600">No se encontraron propiedades</p>
              <p className="mt-1 text-xs text-slate-500">Intenta ajustar los filtros de búsqueda</p>
            </div>
          )}

          {properties.length === 0 && <p className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">Aún no hay propiedades registradas.</p>}
        </>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        {filteredProperties.map(property => (
          <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" key={property.id}>
            <div className="flex gap-4 p-5">
              {propertyImages(property)[0] ? (
                <div className="relative size-28 shrink-0">
                  <img alt={property.title} className="size-28 rounded-xl object-cover" src={propertyImages(property)[0]} />
                  {propertyImages(property).length > 1 && <span className="absolute bottom-2 right-2 rounded-full bg-slate-950/75 px-2 py-1 text-[10px] font-bold text-white">{propertyImages(property).length} fotos</span>}
                </div>
              ) : (
                <span className="grid size-28 shrink-0 place-items-center rounded-xl bg-indigo-50 text-lg font-bold text-indigo-700">{property.propertyType.slice(0, 2)}</span>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap gap-2">
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${property.listingType === 'RENT' ? 'bg-violet-100 text-violet-800' : 'bg-cyan-100 text-cyan-800'}`}>{listingLabel(property.listingType)}</span>
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${propertyStatusClass(property.status)}`}>{propertyStatusLabel(property.status)}</span>
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${property.published ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{property.published ? 'Publicada' : 'Borrador'}</span>
                </div>
                <h2 className="mt-3 truncate text-lg font-bold">{property.title}</h2>
                <p className="mt-1 text-sm text-slate-500">{property.code} · {property.city}, {property.stateCode}</p>
                <strong className="mt-3 block text-lg text-indigo-700">{formatApiPrice(property)}</strong>
                <Link className="mt-3 inline-flex rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700" to={`/app/propiedades/${property.id}/editar`}>
                  Editar propiedad
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-px border-t border-slate-100 bg-slate-100 text-center text-xs sm:grid-cols-5">
              <Feature value={property.bedrooms} label="Recámaras" />
              <Feature value={property.bathrooms} label="Baños" />
              <Feature value={property.parkingSpaces} label="Autos" />
              <Feature value={property.landArea} label="Terreno m²" />
              <Feature value={property.constructionArea} label="Construcción m²" />
            </div>
          </article>
        ))}
      </div>
      <UpgradeModal
        feature="crear nuevas propiedades"
        isOpen={upgradeModalOpen}
        level={restrictions.level === 'BLOCKED' ? 'BLOCKED' : 'LIMITED'}
        onClose={() => setUpgradeModalOpen(false)}
      />
    </>
  );
}

function Feature({ value, label }: { value?: number; label: string }) {
  return (
    <div className="bg-white px-3 py-3">
      <strong className="block text-sm text-slate-800">{value ?? '-'}</strong>
      <span className="text-slate-400">{label}</span>
    </div>
  );
}
