import React, { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ApiProperty, formatApiPrice, listingLabel, listProperties, propertyImages, propertyStatusClass, propertyStatusLabel } from '../shared/propertyApi';
import { ExportButton } from '../shared/ExportButton';
import { exportToExcel, formatCurrency } from '../shared/excelExport';
import { UpgradeModal } from '../shared/UpgradeModal';
import { SubscriptionRestrictions } from '../shared/subscriptionRestrictions';
import { PageHeader } from '../shared/ui/PageHeader';
import { QuickPropertyModal } from '../components/QuickPropertyModal';
import { Button } from '../shared/ui';

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
  const [quickModalOpen, setQuickModalOpen] = useState(false);

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

  function handleQuickCreate() {
    if (!restrictions.canCreate) {
      setUpgradeModalOpen(true);
    } else {
      setQuickModalOpen(true);
    }
  }

  function handlePropertyCreated() {
    listProperties()
      .then(setProperties)
      .catch(() => toast.error('Error al recargar propiedades'));
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
              <>
                <Button
                  onClick={handleQuickCreate}
                  variant="secondary"
                  icon={
                    <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  }
                >
                  Crear rápida
                </Button>
                <Link to="/app/propiedades/nueva">
                  <Button
                    variant="primary"
                    icon={
                      <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    }
                  >
                    Crear completa
                  </Button>
                </Link>
              </>
            ) : (
              <Button
                onClick={handleCreateProperty}
                variant="tertiary"
                disabled
              >
                🔒 Agregar propiedad
              </Button>
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

      <div className="grid gap-4 p-4 lg:grid-cols-2 xl:grid-cols-3 lg:p-6">
        {filteredProperties.map(property => (
          <article
            className="group flex flex-col overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-800/50 backdrop-blur-sm transition hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/10"
            key={property.id}
          >
            {/* Header con imagen y badges */}
            <div className="flex gap-4 p-5">
              {propertyImages(property)[0] ? (
                <div className="relative size-20 shrink-0">
                  <img alt={property.title} className="size-20 rounded-xl object-cover" src={propertyImages(property)[0]} />
                  {propertyImages(property).length > 1 && (
                    <div className="absolute bottom-1.5 right-1.5 flex items-center gap-1 rounded-full bg-slate-950/90 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
                      <svg className="size-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {propertyImages(property).length}
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid size-20 shrink-0 place-items-center rounded-xl bg-indigo-600 text-lg font-bold text-white">
                  <svg className="size-10" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h2 className="truncate font-bold text-white mb-1.5">{property.title}</h2>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold uppercase ${property.listingType === 'RENT' ? 'bg-violet-600/20 text-violet-300' : 'bg-cyan-600/20 text-cyan-300'}`}>
                    {listingLabel(property.listingType)}
                  </span>
                  <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold uppercase ${
                    property.status === 'AVAILABLE' ? 'bg-emerald-600/20 text-emerald-300' :
                    property.status === 'RESERVED' ? 'bg-amber-600/20 text-amber-300' :
                    property.status === 'SOLD' ? 'bg-blue-600/20 text-blue-300' :
                    property.status === 'RENTED' ? 'bg-purple-600/20 text-purple-300' :
                    'bg-slate-600/20 text-slate-300'
                  }`}>
                    {propertyStatusLabel(property.status)}
                  </span>
                  {property.published && (
                    <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold uppercase bg-indigo-600/20 text-indigo-300">
                      Publicada
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 flex items-center gap-1.5">
                  <span className="font-mono bg-slate-700/50 px-1.5 py-0.5 rounded">{property.code}</span>
                  <span>·</span>
                  <span>{property.city}, {property.stateCode}</span>
                </p>
              </div>
            </div>

            <div className="px-5 pb-3">
              <div className="text-2xl font-bold text-indigo-400">{formatApiPrice(property)}</div>
            </div>

            {/* Features grid */}
            <div className="grid grid-cols-5 gap-px bg-slate-900/50 text-center text-xs border-y border-slate-700/50">
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

            {/* Botones de acción */}
            <div className="flex flex-col gap-2.5 p-5 mt-auto">
              <Link to={`/app/propiedades/${property.id}/editar`}>
                <button className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700">
                  <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Editar propiedad
                </button>
              </Link>
            </div>
          </article>
        ))}
      </div>
      <QuickPropertyModal
        isOpen={quickModalOpen}
        onClose={() => setQuickModalOpen(false)}
        onSuccess={handlePropertyCreated}
      />

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
    <div className="bg-slate-800/50 px-2 py-2.5">
      <div className="flex items-center justify-center gap-1 mb-0.5 text-indigo-400">
        {icon}
        <strong className="text-base text-white">{value ?? '-'}</strong>
      </div>
      <span className="block text-[9px] text-slate-400 font-medium">{label}</span>
    </div>
  );
}
