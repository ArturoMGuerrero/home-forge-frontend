import { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ApiProperty, formatApiPrice, listingLabel, listProperties, propertyImages, propertyStatusLabel } from '../api/propertyApi';
import { ExportButton } from '../../../shared/ExportButton';
import { exportToExcel, formatCurrency } from '../../../shared/excelExport';
import { UpgradeModal } from '../../../shared/UpgradeModal';
import { SubscriptionRestrictions } from '../../../shared/subscriptionRestrictions';
import { Icon } from '../../../shared/Icon';
import { Badge, BadgeVariant, Button, buttonClasses, Card, EmptyState, LoadingState, PageHeader, SearchInput, Select } from '../../../shared/ui';
import { QuickPropertyModal } from '../components/QuickPropertyModal';

type SortOption = 'recent' | 'price-asc' | 'price-desc' | 'alpha';

const statusOptions = [
  { value: 'ALL', label: 'Todos los estados' },
  { value: 'AVAILABLE', label: 'Disponible' },
  { value: 'RESERVED', label: 'Apartada' },
  { value: 'SOLD', label: 'Vendida' },
  { value: 'RENTED', label: 'Rentada' },
  { value: 'UNAVAILABLE', label: 'No disponible' }
];
const listingOptions = [{ value: 'ALL', label: 'Venta y renta' }, { value: 'SALE', label: 'Venta' }, { value: 'RENT', label: 'Renta' }];
const propertyTypeOptions = [
  { value: 'ALL', label: 'Todos los tipos' },
  { value: 'HOUSE', label: 'Casa' },
  { value: 'APARTMENT', label: 'Departamento' },
  { value: 'LAND', label: 'Terreno' },
  { value: 'COMMERCIAL', label: 'Local comercial' },
  { value: 'OFFICE', label: 'Oficina' },
  { value: 'WAREHOUSE', label: 'Bodega' }
];
const sortOptions = [
  { value: 'recent', label: 'Más recientes' },
  { value: 'price-asc', label: 'Precio menor' },
  { value: 'price-desc', label: 'Precio mayor' },
  { value: 'alpha', label: 'Alfabético' }
];
const statusVariants: Record<string, BadgeVariant> = {
  AVAILABLE: 'success',
  RESERVED: 'warning',
  SOLD: 'info',
  RENTED: 'purple',
  UNAVAILABLE: 'neutral'
};

export function PropertiesPage() {
  const context = useOutletContext<{ restrictions: SubscriptionRestrictions }>();
  const restrictions = context?.restrictions || { canCreate: true, canExport: true, level: 'NONE' };
  const [properties, setProperties] = useState<ApiProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [listingTypeFilter, setListingTypeFilter] = useState<string>('ALL');
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
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

  const hasFilters = Boolean(searchQuery) || statusFilter !== 'ALL' || listingTypeFilter !== 'ALL' || propertyTypeFilter !== 'ALL';

  function clearFilters() {
    setSearchQuery('');
    setStatusFilter('ALL');
    setListingTypeFilter('ALL');
    setPropertyTypeFilter('ALL');
    setSortBy('recent');
  }

  return (
    <>
      <PageHeader
        actions={
          <>
            <ExportButton onExport={handleExport} variant="secondary" />
            {restrictions.canCreate ? (
              <>
                <Button
                  icon={<svg aria-hidden="true" className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                  onClick={handleQuickCreate}
                  variant="tertiary"
                >
                  Crear rápida
                </Button>
                <Link className={buttonClasses()} to="/app/propiedades/nueva">
                  <Icon className="size-4" name="plus" />
                  Nueva propiedad
                </Link>
              </>
            ) : (
              <Button icon={<Icon className="size-4" name="lock" />} onClick={() => setUpgradeModalOpen(true)} variant="tertiary">
                Agregar propiedad
              </Button>
            )}
          </>
        }
        badge={{ value: properties.length, label: 'propiedades' }}
        subtitle="Administra tu inventario de inmuebles en venta y renta."
        title="Propiedades"
      />

      {loading && <Card><LoadingState message="Consultando propiedades..." /></Card>}

      {!loading && properties.length > 0 && (
        <Card className="mb-6 space-y-4 p-4 sm:p-5">
          <div className="grid gap-3">
            <SearchInput
              aria-label="Buscar propiedades"
              
              onChange={e => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery('')}
              placeholder="Buscar por código, título o ciudad..."
              value={searchQuery}
            />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Select aria-label="Estado" onChange={e => setStatusFilter(e.target.value)} options={statusOptions} value={statusFilter} />
              <Select aria-label="Operación" onChange={e => setListingTypeFilter(e.target.value)} options={listingOptions} value={listingTypeFilter} />
              <Select aria-label="Tipo de inmueble" onChange={e => setPropertyTypeFilter(e.target.value)} options={propertyTypeOptions} value={propertyTypeFilter} />
              <Select aria-label="Ordenar por" onChange={e => setSortBy(e.target.value as SortOption)} options={sortOptions} value={sortBy} />
            </div>
          </div>
          {hasFilters && (
            <div className="flex items-center justify-between gap-3 border-t border-border pt-3 text-sm">
              <span className="text-fg-subtle">
                <strong className="font-semibold text-fg">{filteredProperties.length}</strong> {filteredProperties.length === 1 ? 'propiedad encontrada' : 'propiedades encontradas'}
              </span>
              <Button onClick={clearFilters} size="sm" variant="ghost">Limpiar filtros</Button>
            </div>
          )}
        </Card>
      )}

      {!loading && properties.length === 0 && (
        <Card className="border-dashed">
          <EmptyState
            actions={restrictions.canCreate ? <Link className={buttonClasses()} to="/app/propiedades/nueva">Registrar primera propiedad</Link> : undefined}
            description="Registra tus inmuebles para publicarlos y asignarlos a tus prospectos."
            icon={<Icon name="properties" />}
            title="Aún no hay propiedades registradas"
          />
        </Card>
      )}

      {!loading && properties.length > 0 && filteredProperties.length === 0 && (
        <EmptyState
          actions={<Button onClick={clearFilters} variant="tertiary">Limpiar filtros</Button>}
          description="Intenta ajustar los filtros de búsqueda."
          title="No se encontraron propiedades"
        />
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredProperties.map(property => {
          const images = propertyImages(property);
          return (
            <Card className="flex flex-col" key={property.id} noPadding truncate>
              <div className="flex gap-4 p-5">
                {images[0] ? (
                  <div className="relative size-20 shrink-0">
                    <img alt={property.title} className="size-20 rounded-xl object-cover" loading="lazy" src={images[0]} />
                    {images.length > 1 && (
                      <span className="absolute bottom-1 right-1 rounded-full bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold text-white">{images.length}</span>
                    )}
                  </div>
                ) : (
                  <div className="grid size-20 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary-fg">
                    <Icon className="size-8" name="properties" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h2 className="truncate font-semibold text-fg">{property.title}</h2>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    <Badge variant={property.listingType === 'RENT' ? 'purple' : 'primary'}>{listingLabel(property.listingType)}</Badge>
                    <Badge dot variant={statusVariants[property.status] ?? 'neutral'}>{propertyStatusLabel(property.status)}</Badge>
                    {property.published && <Badge variant="info">Publicada</Badge>}
                  </div>
                  <p className="mt-2 truncate text-xs text-fg-subtle">
                    <span className="font-mono">{property.code}</span> · {property.city}, {property.stateCode}
                  </p>
                </div>
              </div>

              <div className="px-5 pb-4 text-xl font-bold tracking-tight text-fg">{formatApiPrice(property)}</div>

              <dl className="grid grid-cols-5 divide-x divide-border border-y border-border text-center">
                <Feature label="Recám." value={property.bedrooms} />
                <Feature label="Baños" value={property.bathrooms} />
                <Feature label="Autos" value={property.parkingSpaces} />
                <Feature label="Terreno" value={property.landArea} />
                <Feature label="Constr." value={property.constructionArea} />
              </dl>

              <div className="mt-auto p-4">
                <Link className={buttonClasses({ variant: 'tertiary', size: 'sm', fullWidth: true })} to={`/app/propiedades/${property.id}/editar`}>
                  Editar propiedad
                </Link>
              </div>
            </Card>
          );
        })}
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

function Feature({ value, label }: { value?: number; label: string }) {
  return (
    <div className="px-1 py-2.5">
      <dd className="text-sm font-semibold tabular-nums text-fg">{value ?? '—'}</dd>
      <dt className="text-[11px] text-fg-subtle">{label}</dt>
    </div>
  );
}
