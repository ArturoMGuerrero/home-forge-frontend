import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ApiProperty,
  formatApiPrice,
  listingLabel,
  listPublishedProperties,
  propertyImages,
  propertyStatusClass,
  propertyStatusLabel,
  PublicPropertyListing
} from '../api/propertyApi';
import { Alert, Badge, Button, buttonClasses, Card, EmptyState, LoadingState, Select, Tabs } from '../../../shared/ui';
import { Icon } from '../../../shared/Icon';
import { PublicHeader } from '../components/PublicHeader';

const fallbackImage = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80';

export function PublicPropertiesPage() {
  const [listings, setListings] = useState<PublicPropertyListing[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'SALE' | 'RENT'>('ALL');
  const [country, setCountry] = useState('ALL');
  const [state, setState] = useState('ALL');
  const [city, setCity] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    listPublishedProperties()
      .then(setListings)
      .catch(() => setError('No fue posible cargar las propiedades publicadas.'))
      .finally(() => setLoading(false));
  }, []);

  const countries = unique(listings.map(({ property }) => property.countryCode));
  const states = unique(listings
    .filter(({ property }) => country === 'ALL' || property.countryCode === country)
    .map(({ property }) => property.stateCode));
  const cities = unique(listings
    .filter(({ property }) =>
      (country === 'ALL' || property.countryCode === country)
      && (state === 'ALL' || property.stateCode === state)
    )
    .map(({ property }) => property.city));
  const visible = listings.filter(({ property }) =>
    (filter === 'ALL' || property.listingType === filter)
    && (country === 'ALL' || property.countryCode === country)
    && (state === 'ALL' || property.stateCode === state)
    && (city === 'ALL' || property.city === city)
  );

  function selectCountry(value: string) {
    setCountry(value);
    setState('ALL');
    setCity('ALL');
  }

  function selectState(value: string) {
    setState(value);
    setCity('ALL');
  }

  function clearFilters() {
    setFilter('ALL');
    setCountry('ALL');
    setState('ALL');
    setCity('ALL');
  }

  const hasFilters = filter !== 'ALL' || country !== 'ALL' || state !== 'ALL' || city !== 'ALL';

  return (
    <div className="min-h-screen bg-app">
      <PublicHeader />

      <section className="relative overflow-hidden bg-slate-950 px-5 pb-28 pt-16 sm:pt-20">
        <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgb(79_70_229/0.45),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgb(16_185_129/0.18),transparent_50%)]" />
        <div className="relative mx-auto max-w-7xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-300">
            <span className="size-1.5 rounded-full bg-emerald-400" />
            Encuentra tu próximo espacio
          </span>
          <h1 className="mt-5 max-w-3xl text-4xl font-bold leading-tight tracking-tight text-white sm:text-6xl">
            Propiedades para <span className="text-indigo-300">comprar</span> o <span className="text-emerald-300">rentar</span>.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-slate-300">
            Busca por país, estado y ciudad, y contacta directamente a la inmobiliaria que publica cada propiedad.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-5 pb-16">
        <Card className="relative -mt-16 mb-10">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-fg">Buscar por ubicación</h2>
            {hasFilters && <Button onClick={clearFilters} size="sm" variant="ghost">Limpiar filtros</Button>}
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Select label="País" onChange={event => selectCountry(event.target.value)} value={country}>
              <option value="ALL">Todos los países</option>
              {countries.map(code => <option key={code} value={code}>{countryName(code)}</option>)}
            </Select>
            <Select label="Estado" onChange={event => selectState(event.target.value)} value={state}>
              <option value="ALL">Todos los estados</option>
              {states.map(value => <option key={value} value={value}>{value}</option>)}
            </Select>
            <Select label="Ciudad" onChange={event => setCity(event.target.value)} value={city}>
              <option value="ALL">Todas las ciudades</option>
              {cities.map(value => <option key={value} value={value}>{value}</option>)}
            </Select>
          </div>
        </Card>

        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary-fg">Inventario</p>
            <h2 className="text-2xl font-bold tracking-tight text-fg">{visible.length} {visible.length === 1 ? 'propiedad' : 'propiedades'}</h2>
          </div>
          <Tabs
            activeTab={filter}
            onChange={value => setFilter(value as 'ALL' | 'SALE' | 'RENT')}
            tabs={[{ id: 'ALL', label: 'Todas' }, { id: 'SALE', label: 'Venta' }, { id: 'RENT', label: 'Renta' }]}
            variant="pills"
          />
        </div>

        {loading && <LoadingState message="Cargando propiedades..." />}
        {error && <Alert variant="error">{error}</Alert>}
        {!loading && !error && visible.length === 0 && (
          <Card className="border-dashed">
            <EmptyState
              actions={hasFilters ? <Button onClick={clearFilters} variant="tertiary">Limpiar filtros</Button> : undefined}
              description="Prueba con otra ubicación o tipo de operación."
              icon={<Icon name="properties" />}
              title="No hay propiedades publicadas con estos filtros"
            />
          </Card>
        )}

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {visible.map(({ property, seller }) => (
            <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-card transition hover:shadow-lg" key={property.id}>
              <PropertyGallery property={property} />
              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-center justify-between gap-3">
                  <small className="truncate text-sm font-medium text-primary-fg">{property.city}, {property.stateCode}</small>
                  <Badge>{countryName(property.countryCode)}</Badge>
                </div>
                <h3 className="mt-2 text-lg font-semibold text-fg">
                  <Link className="hover:text-primary-fg" to={`/propiedades/${property.id}`}>{property.title}</Link>
                </h3>
                <p className="mt-2 line-clamp-2 text-sm text-fg-subtle">{property.description || 'Propiedad disponible. Solicita más información.'}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {property.bedrooms !== undefined && <Badge>{property.bedrooms} recámaras</Badge>}
                  {property.bathrooms !== undefined && <Badge>{property.bathrooms} baños</Badge>}
                  {property.constructionArea !== undefined && <Badge>{property.constructionArea} m²</Badge>}
                </div>
                <div className="mt-auto pt-5">
                  <div className="flex items-end justify-between gap-3 border-t border-border pt-4">
                    <div className="min-w-0">
                      <strong className="block text-xl font-bold tracking-tight text-fg">{formatApiPrice(property)}</strong>
                      <small className="text-xs text-fg-subtle">{property.propertyType} · {property.code}</small>
                    </div>
                    <Link className={buttonClasses({ size: 'sm' })} to={`/propiedades/${property.id}`}>Ver detalles</Link>
                  </div>
                  <div className="mt-4 rounded-xl bg-surface-muted p-3.5">
                    <span className="text-xs text-fg-subtle">Publicada por</span>
                    <Link className="block truncate text-sm font-semibold text-fg hover:text-primary-fg" to={`/empresas/${seller.companyId}`}>{seller.companyName}</Link>
                    <ContactActions listing={{ property, seller }} />
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}

function ContactActions({ listing }: { listing: PublicPropertyListing }) {
  const { property, seller } = listing;
  const phone = seller.phoneE164?.replace(/\D/g, '');
  const subject = encodeURIComponent(`Información sobre ${property.title} (${property.code})`);
  const whatsappMessage = encodeURIComponent(`Hola, me interesa la propiedad ${property.title} (${property.code}) publicada en HomeForge.`);

  if (!seller.email && !phone) {
    return <p className="mt-2 text-xs text-fg-subtle">La inmobiliaria aún no ha publicado sus datos de contacto.</p>;
  }

  return (
    <div className="relative z-10 mt-3 flex flex-wrap gap-2">
      {phone && (
        <a className={buttonClasses({ variant: 'success', size: 'sm' })} href={`https://wa.me/${phone}?text=${whatsappMessage}`} rel="noreferrer" target="_blank">
          WhatsApp
        </a>
      )}
      {seller.email && (
        <a className={buttonClasses({ variant: 'tertiary', size: 'sm' })} href={`mailto:${seller.email}?subject=${subject}`}>
          Enviar correo
        </a>
      )}
    </div>
  );
}

function unique(values: string[]) {
  return [...new Set(values)].sort((left, right) => left.localeCompare(right));
}

function countryName(code: string) {
  if (code === 'MX') return 'México';
  if (code === 'US') return 'Estados Unidos';
  return code;
}

function PropertyGallery({ property }: { property: ApiProperty }) {
  const images = propertyImages(property);
  const [active, setActive] = useState(0);
  const current = images[active] || fallbackImage;

  return (
    <div className="relative">
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-sunken">
        <img alt={property.title} className="size-full object-cover transition duration-500 group-hover:scale-[1.03]" loading="lazy" src={current} />
        <span className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold text-white shadow-sm ${property.listingType === 'RENT' ? 'bg-violet-600' : 'bg-indigo-600'}`}>{listingLabel(property.listingType)}</span>
        {property.status !== 'AVAILABLE' && <span className={`absolute bottom-3 left-3 rounded-full px-2.5 py-1 text-xs font-semibold ${propertyStatusClass(property.status)}`}>{propertyStatusLabel(property.status)}</span>}
        {images.length > 1 && <span className="absolute right-3 top-3 rounded-full bg-black/55 px-2 py-0.5 text-xs font-medium text-white">{active + 1}/{images.length}</span>}
      </div>
      {images.length > 1 && (
        <div className="relative z-10 flex gap-1.5 overflow-x-auto border-b border-border bg-surface p-2.5">
          {images.map((image, index) => (
            <button aria-label={`Ver foto ${index + 1}`} className={`size-11 shrink-0 overflow-hidden rounded-lg ring-2 transition ${active === index ? 'ring-primary' : 'ring-transparent opacity-70 hover:opacity-100'}`} key={image} onClick={() => setActive(index)} type="button">
              <img alt="" className="size-full object-cover" src={image} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
