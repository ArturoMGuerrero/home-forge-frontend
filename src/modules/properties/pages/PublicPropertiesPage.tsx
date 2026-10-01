import { FormEvent, useEffect, useMemo, useState } from 'react';
import { listPublishedProperties, propertyImages, propertyTypeLabel, PublicPropertyListing } from '../api/propertyApi';
import { Alert, Button, Card, cn, EmptyState, Select, Skeleton } from '../../../shared/ui';
import { Icon } from '../../../shared/Icon';
import { PublicHeader } from '../components/PublicHeader';
import { PublicFooter } from '../components/PublicFooter';
import { PublicPropertyCard } from '../components/PublicPropertyCard';
import { useLikedProperties } from '../likedProperties';

type Operation = 'ALL' | 'SALE' | 'RENT';
type SortOrder = 'RECENT' | 'PRICE_ASC' | 'PRICE_DESC';

const OPERATIONS: Array<{ value: Operation; label: string }> = [
  { value: 'ALL', label: 'Todas' },
  { value: 'SALE', label: 'Comprar' },
  { value: 'RENT', label: 'Rentar' }
];

// Topes de precio según la operación: la escala de una renta mensual no es la de una venta.
const PRICE_LIMITS: Record<Exclude<Operation, 'ALL'>, number[]> = {
  SALE: [1_000_000, 2_000_000, 3_000_000, 5_000_000, 8_000_000],
  RENT: [8_000, 15_000, 25_000, 40_000, 70_000]
};

const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });

/** Minúsculas y sin acentos, para que "queretaro" encuentre "Querétaro". */
function normalize(value: string) {
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

export function PublicPropertiesPage() {
  const [listings, setListings] = useState<PublicPropertyListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [operation, setOperation] = useState<Operation>('ALL');
  const [locationInput, setLocationInput] = useState('');
  const [location, setLocation] = useState('');
  const [propertyType, setPropertyType] = useState('ALL');
  const [maxPrice, setMaxPrice] = useState('ALL');
  const [minBedrooms, setMinBedrooms] = useState('ALL');
  const [sort, setSort] = useState<SortOrder>('RECENT');
  const [onlyLiked, setOnlyLiked] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const { likedIds, isLiked, toggleLike } = useLikedProperties();

  useEffect(() => {
    document.title = 'Casas y departamentos en venta y renta | HomeForge';
    listPublishedProperties()
      .then(setListings)
      .catch(() => setError('No fue posible cargar las propiedades. Intenta de nuevo en unos minutos.'))
      .finally(() => setLoading(false));
  }, []);

  const locations = useMemo(
    () => [...new Set(listings.map(({ property }) => `${property.city}, ${property.stateCode}`))].sort((a, b) => a.localeCompare(b)),
    [listings]
  );
  const propertyTypes = useMemo(
    () => [...new Set(listings.map(({ property }) => property.propertyType))].sort(),
    [listings]
  );

  const visible = useMemo(() => {
    const query = normalize(location);
    const result = listings.filter(({ property }) => {
      if (onlyLiked && !likedIds.includes(property.id)) return false;
      if (operation !== 'ALL' && property.listingType !== operation) return false;
      if (propertyType !== 'ALL' && property.propertyType !== propertyType) return false;
      if (maxPrice !== 'ALL' && property.price > Number(maxPrice)) return false;
      if (minBedrooms !== 'ALL' && (property.bedrooms ?? 0) < Number(minBedrooms)) return false;
      if (query) {
        const haystack = normalize([property.city, property.stateCode, property.address, property.title].filter(Boolean).join(' '));
        if (!query.split(/[\s,]+/).every(word => haystack.includes(word))) return false;
      }
      return true;
    });
    if (sort === 'PRICE_ASC') return [...result].sort((a, b) => a.property.price - b.property.price);
    if (sort === 'PRICE_DESC') return [...result].sort((a, b) => b.property.price - a.property.price);
    return result; // El API ya las entrega de la más reciente a la más antigua.
  }, [listings, onlyLiked, likedIds, operation, propertyType, maxPrice, minBedrooms, location, sort]);

  const hasFilters = operation !== 'ALL' || location !== '' || propertyType !== 'ALL' || maxPrice !== 'ALL' || minBedrooms !== 'ALL';
  const heroImage = listings.length > 0 ? propertyImages(listings[0].property)[0] : undefined;

  function changeOperation(next: Operation) {
    setOperation(next);
    setMaxPrice('ALL'); // los topes de precio dependen de la operación
  }

  function search(event: FormEvent) {
    event.preventDefault();
    setLocation(locationInput);
    setOnlyLiked(false);
    document.getElementById('resultados')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function clearFilters() {
    setOperation('ALL');
    setLocationInput('');
    setLocation('');
    setPropertyType('ALL');
    setMaxPrice('ALL');
    setMinBedrooms('ALL');
  }

  const heading = onlyLiked
    ? 'Propiedades que te gustaron'
    : location
      ? `Propiedades en ${location}`
      : 'Propiedades disponibles';

  return (
    <div className="min-h-screen bg-app">
      <PublicHeader />

      <section className="relative overflow-hidden bg-slate-950 px-5 pb-32 pt-14 sm:pb-36 sm:pt-20">
        {heroImage ? (
          <>
            <img alt="" aria-hidden="true" className="absolute inset-0 size-full object-cover" src={heroImage} />
            <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/75 to-slate-950/35" />
          </>
        ) : (
          <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgb(79_70_229/0.45),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgb(16_185_129/0.18),transparent_50%)]" />
        )}
        <div className="relative mx-auto max-w-7xl">
          {listings.length > 0 && (
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
              <span className="size-1.5 rounded-full bg-emerald-400" />
              {listings.length} {listings.length === 1 ? 'propiedad publicada' : 'propiedades publicadas'}
            </span>
          )}
          <h1 className="mt-5 max-w-2xl text-4xl font-bold leading-tight tracking-tight text-white sm:text-6xl">
            Encuentra tu próximo <span className="text-indigo-300">hogar</span>.
          </h1>
          <p className="mt-4 max-w-xl text-lg text-slate-200">
            Casas, departamentos y terrenos para <span className="text-indigo-200">comprar</span> o <span className="text-emerald-300">rentar</span>, publicados directamente por las inmobiliarias.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-5">
        <form className="relative -mt-24 rounded-2xl border border-border bg-surface p-4 shadow-lg sm:p-5" onSubmit={search} role="search">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div aria-label="Tipo de operación" className="inline-flex rounded-xl bg-surface-sunken p-1" role="radiogroup">
              {OPERATIONS.map(option => (
                <button
                  aria-checked={operation === option.value}
                  className={cn(
                    'rounded-lg px-4 py-1.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                    operation === option.value ? 'bg-surface text-fg shadow-sm' : 'text-fg-subtle hover:text-fg'
                  )}
                  key={option.value}
                  onClick={() => changeOperation(option.value)}
                  role="radio"
                  type="button"
                >
                  {option.label}
                </button>
              ))}
            </div>
            {hasFilters && <Button onClick={clearFilters} size="sm" type="button" variant="ghost">Limpiar</Button>}
          </div>

          <div className="grid gap-3 lg:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))_auto] lg:items-end">
            <div className="flex gap-2 lg:contents">
              <label className="relative min-w-0 flex-1">
                <span className="sr-only">Ciudad, estado o colonia</span>
                <svg aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-fg-subtle" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s-7-6.2-7-11.5A7 7 0 0119 9.5C19 14.8 12 21 12 21z" />
                  <circle cx="12" cy="9.5" r="2.5" />
                </svg>
                <input
                  className="h-11 w-full rounded-xl border border-border-strong bg-surface pl-10 pr-3 text-sm text-fg placeholder:text-fg-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                  list="public-locations"
                  onChange={event => setLocationInput(event.target.value)}
                  placeholder="Ciudad, estado o colonia"
                  value={locationInput}
                />
                <datalist id="public-locations">
                  {locations.map(value => <option key={value} value={value} />)}
                </datalist>
              </label>
              <Button className="lg:hidden" onClick={() => setShowMobileFilters(value => !value)} type="button" variant="secondary">
                Filtros
              </Button>
            </div>

            <div className={cn('grid gap-3 sm:grid-cols-3 lg:contents', !showMobileFilters && 'hidden lg:contents')}>
              <Select aria-label="Tipo de propiedad" onChange={event => setPropertyType(event.target.value)} value={propertyType}>
                <option value="ALL">Cualquier tipo</option>
                {propertyTypes.map(type => <option key={type} value={type}>{propertyTypeLabel(type)}</option>)}
              </Select>
              <Select aria-label="Precio máximo" disabled={operation === 'ALL'} onChange={event => setMaxPrice(event.target.value)} value={maxPrice}>
                <option value="ALL">{operation === 'ALL' ? 'Precio (elige operación)' : 'Cualquier precio'}</option>
                {operation !== 'ALL' && PRICE_LIMITS[operation].map(limit => (
                  <option key={limit} value={limit}>Hasta {money.format(limit)}{operation === 'RENT' ? '/mes' : ''}</option>
                ))}
              </Select>
              <Select aria-label="Recámaras" onChange={event => setMinBedrooms(event.target.value)} value={minBedrooms}>
                <option value="ALL">Recámaras</option>
                {[1, 2, 3, 4].map(count => <option key={count} value={count}>{count}+ recámaras</option>)}
              </Select>
            </div>

            <Button className="h-11" type="submit">Buscar</Button>
          </div>
        </form>

        <div className="mb-6 mt-10 flex scroll-mt-24 flex-wrap items-end justify-between gap-4" id="resultados">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-fg">{heading}</h2>
            {!loading && <p className="mt-1 text-sm text-fg-subtle">{visible.length} {visible.length === 1 ? 'resultado' : 'resultados'}</p>}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              aria-pressed={onlyLiked}
              className={cn(
                'inline-flex h-10 items-center gap-2 rounded-xl border px-3.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                onlyLiked ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-border bg-surface text-fg-muted hover:text-fg'
              )}
              onClick={() => setOnlyLiked(value => !value)}
              type="button"
            >
              <svg aria-hidden="true" className="size-4" fill={onlyLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.5s-7.5-4.6-9.3-9.2C1.4 7.9 3.6 4.5 7 4.5c2 0 3.6 1.1 5 3 1.4-1.9 3-3 5-3 3.4 0 5.6 3.4 4.3 6.8-1.8 4.6-9.3 9.2-9.3 9.2z" />
              </svg>
              Te gustaron{likedIds.length > 0 && ` (${likedIds.length})`}
            </button>
            <Select aria-label="Ordenar" containerClassName="w-auto" onChange={event => setSort(event.target.value as SortOrder)} value={sort}>
              <option value="RECENT">Más recientes</option>
              <option value="PRICE_ASC">Menor precio</option>
              <option value="PRICE_DESC">Mayor precio</option>
            </Select>
          </div>
        </div>

        {error && <Alert variant="error">{error}</Alert>}

        {loading && (
          <div aria-label="Cargando propiedades" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => <Skeleton className="aspect-[4/5] rounded-2xl" key={index} />)}
          </div>
        )}

        {!loading && !error && visible.length === 0 && (
          <Card className="border-dashed">
            {onlyLiked ? (
              <EmptyState
                actions={<Button onClick={() => setOnlyLiked(false)} variant="tertiary">Ver todas las propiedades</Button>}
                description="Toca el corazón de una propiedad para guardarla aquí y compararla después."
                icon={<Icon name="properties" />}
                title="Aún no marcas propiedades"
              />
            ) : (
              <EmptyState
                actions={hasFilters ? <Button onClick={clearFilters} variant="tertiary">Limpiar filtros</Button> : undefined}
                description={hasFilters ? 'Prueba con otra ubicación, precio o tipo de propiedad.' : 'Vuelve pronto: las inmobiliarias publican propiedades nuevas cada semana.'}
                icon={<Icon name="properties" />}
                title={hasFilters ? 'No encontramos propiedades con esos filtros' : 'Todavía no hay propiedades publicadas'}
              />
            )}
          </Card>
        )}

        {!loading && visible.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visible.map(listing => (
              <PublicPropertyCard
                key={listing.property.id}
                liked={isLiked(listing.property.id)}
                listing={listing}
                onToggleLike={() => toggleLike(listing.property.id)}
              />
            ))}
          </div>
        )}
      </main>

      <PublicFooter />
    </div>
  );
}

