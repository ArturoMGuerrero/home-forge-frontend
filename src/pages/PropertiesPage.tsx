import React, { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ApiProperty, formatApiPrice, listingLabel, listProperties, propertyImages, propertyStatusClass, propertyStatusLabel } from '../shared/propertyApi';
import { ExportButton } from '../shared/ExportButton';
import { exportToExcel, formatCurrency } from '../shared/excelExport';
import { UpgradeModal } from '../shared/UpgradeModal';
import { SubscriptionRestrictions } from '../shared/subscriptionRestrictions';
import { PageHeader } from '../shared/ui/PageHeader';

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
      <PageHeader
        title="Propiedades"
        subtitle="Administra inmuebles en venta y renta desde PostgreSQL"
        badge={{ value: properties.length, label: 'propiedades' }}
        actions={
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
        }
      />

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

      <div className="grid gap-5 p-4 lg:grid-cols-2 lg:p-6">
        {filteredProperties.map(property => (
          <Link
            className="group block overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-500/10"
            key={property.id}
            to={`/app/propiedades/${property.id}/editar`}
          >
            {/* Header con imagen y badges */}
            <div className="flex gap-4 border-b border-slate-100 bg-gradient-to-br from-slate-50 to-white p-5">
              {propertyImages(property)[0] ? (
                <div className="relative size-32 shrink-0">
                  <img alt={property.title} className="size-32 rounded-2xl object-cover ring-4 ring-slate-100" src={propertyImages(property)[0]} />
                  {propertyImages(property).length > 1 && (
                    <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-slate-950/90 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-sm">
                      <svg className="size-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {propertyImages(property).length}
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid size-32 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-2xl font-bold text-white ring-4 ring-indigo-50 shadow-lg shadow-indigo-500/30">
                  {property.propertyType.slice(0, 2)}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold ${property.listingType === 'RENT' ? 'bg-violet-100 text-violet-800' : 'bg-cyan-100 text-cyan-800'}`}>
                    <span className="size-1.5 rounded-full bg-current opacity-75"></span>
                    {listingLabel(property.listingType)}
                  </span>
                  <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold ${propertyStatusClass(property.status)}`}>
                    <span className="size-1.5 rounded-full bg-current opacity-75"></span>
                    {propertyStatusLabel(property.status)}
                  </span>
                  <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold ${property.published ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                    {property.published ? (
                      <svg className="size-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="size-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    )}
                    {property.published ? 'Publicada' : 'Borrador'}
                  </span>
                </div>
                <h2 className="truncate text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition">{property.title}</h2>
                <p className="mt-1 text-sm text-slate-500 flex items-center gap-2">
                  <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded">{property.code}</span>
                  <span>·</span>
                  <span>{property.city}, {property.stateCode}</span>
                </p>
                <div className="mt-3 inline-flex items-baseline gap-2">
                  <strong className="text-2xl font-bold text-indigo-600">{formatApiPrice(property)}</strong>
                </div>
              </div>
            </div>

            {/* Features grid */}
            <div className="grid grid-cols-3 gap-px border-b border-slate-100 bg-slate-100 text-center text-xs lg:grid-cols-5">
              <Feature icon={
                <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              } value={property.bedrooms} label="Recámaras" />
              <Feature icon={
                <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                </svg>
              } value={property.bathrooms} label="Baños" />
              <Feature icon={
                <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              } value={property.parkingSpaces} label="Autos" />
              <Feature icon={
                <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              } value={property.landArea} label="Terreno m²" />
              <Feature icon={
                <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              } value={property.constructionArea} label="Construcción m²" />
            </div>

            {/* Footer con acción */}
            <div className="bg-slate-50/50 px-5 py-3 text-center">
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 group-hover:text-indigo-700 transition">
                Editar propiedad
                <svg className="size-4 transition group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </Link>
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

function Feature({ icon, value, label }: { icon: React.ReactNode; value?: number; label: string }) {
  return (
    <div className="bg-white px-3 py-3 hover:bg-indigo-50 transition">
      <div className="flex items-center justify-center gap-1.5 mb-1 text-indigo-600">
        {icon}
        <strong className="text-base text-slate-800">{value ?? '-'}</strong>
      </div>
      <span className="block text-[10px] text-slate-500 font-medium">{label}</span>
    </div>
  );
}
