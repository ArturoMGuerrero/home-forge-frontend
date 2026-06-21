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
} from '../shared/propertyApi';

const fallbackImage = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80';
const selectClass = 'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100';

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

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
          <Link className="flex items-center gap-3" to="/">
            <img alt="HomeForge" className="size-10 rounded-xl object-cover" src="/favicon.png" />
            <div><strong className="block font-bold">HomeForge</strong><small className="text-slate-500">Propiedades</small></div>
          </Link>
          <Link className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50" to="/login">Acceso administradores</Link>
        </div>
      </header>

      <section className="bg-slate-950 px-5 py-16 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-[.2em] text-cyan-300">Encuentra tu próximo espacio</p>
          <h1 className="max-w-3xl text-4xl font-bold sm:text-6xl">Propiedades para comprar o rentar.</h1>
          <p className="mt-5 max-w-xl text-slate-300">Busca por país, estado y ciudad, y contacta directamente a la inmobiliaria que publica cada propiedad.</p>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-5 py-12">
        <section className="mb-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.16em] text-indigo-600">Buscar por ubicación</p>
              <h2 className="mt-1 text-xl font-bold">Encuentra propiedades cerca de ti</h2>
            </div>
            <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-800" onClick={clearFilters} type="button">Limpiar filtros</button>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="grid gap-2 text-sm font-semibold text-slate-700">País
              <select className={selectClass} onChange={event => selectCountry(event.target.value)} value={country}>
                <option value="ALL">Todos los países</option>
                {countries.map(code => <option key={code} value={code}>{countryName(code)}</option>)}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-semibold text-slate-700">Estado
              <select className={selectClass} onChange={event => selectState(event.target.value)} value={state}>
                <option value="ALL">Todos los estados</option>
                {states.map(value => <option key={value} value={value}>{value}</option>)}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-semibold text-slate-700">Ciudad
              <select className={selectClass} onChange={event => setCity(event.target.value)} value={city}>
                <option value="ALL">Todas las ciudades</option>
                {cities.map(value => <option key={value} value={value}>{value}</option>)}
              </select>
            </label>
          </div>
        </section>

        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div><p className="mb-1 text-[11px] font-bold uppercase tracking-[0.16em] text-indigo-600">Inventario</p><h2 className="text-2xl font-bold">{visible.length} propiedades</h2></div>
          <div className="flex rounded-xl border border-slate-200 bg-white p-1">
            {([['ALL', 'Todas'], ['SALE', 'Venta'], ['RENT', 'Renta']] as const).map(([value, label]) => (
              <button className={`rounded-lg px-4 py-2 text-sm font-semibold ${filter === value ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`} key={value} onClick={() => setFilter(value)} type="button">{label}</button>
            ))}
          </div>
        </div>

        {loading && <p className="py-12 text-center text-sm text-slate-500">Cargando propiedades...</p>}
        {error && <p className="rounded-xl bg-rose-50 p-4 text-sm font-medium text-rose-700">{error}</p>}
        {!loading && !error && visible.length === 0 && <p className="py-12 text-center text-sm text-slate-500">No hay propiedades publicadas con estos filtros.</p>}

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {visible.map(({ property, seller }) => (
            <article className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl" key={property.id}>
              <PropertyGallery property={property} />
              <div className="p-6">
                <div className="flex items-center justify-between gap-3">
                  <small className="font-semibold text-indigo-600">{property.city}, {property.stateCode}</small>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600">{countryName(property.countryCode)}</span>
                </div>
                <h3 className="mt-2 text-xl font-bold">{property.title}</h3>
                <p className="mt-3 line-clamp-2 min-h-10 text-sm text-slate-500">{property.description || 'Propiedad disponible. Solicita más información.'}</p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-600">
                  {property.bedrooms !== undefined && <span className="rounded-full bg-slate-100 px-2.5 py-1">{property.bedrooms} recámaras</span>}
                  {property.bathrooms !== undefined && <span className="rounded-full bg-slate-100 px-2.5 py-1">{property.bathrooms} baños</span>}
                  {property.constructionArea !== undefined && <span className="rounded-full bg-slate-100 px-2.5 py-1">{property.constructionArea} m² construcción</span>}
                </div>
                <div className="mt-5 border-t border-slate-100 pt-5">
                  <strong className="block text-xl text-indigo-700">{formatApiPrice(property)}</strong>
                  <small className="text-slate-500">{property.propertyType} · {property.code}</small>
                  <Link className="mt-4 block rounded-xl bg-indigo-600 px-4 py-3 text-center text-sm font-bold text-white hover:bg-indigo-700" to={`/propiedades/${property.id}`}>Ver todos los detalles</Link>
                </div>
                <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                  <span className="text-[10px] font-bold uppercase tracking-[.14em] text-slate-400">Publicada por</span>
                  <Link className="mt-1 block text-sm font-bold text-slate-800 hover:text-indigo-700" to={`/empresas/${seller.companyId}`}>{seller.companyName}</Link>
                  <ContactActions listing={{ property, seller }} />
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
    return <p className="mt-2 text-xs text-slate-500">La inmobiliaria aún no ha publicado sus datos de contacto.</p>;
  }

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {phone && (
        <a className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700" href={`https://wa.me/${phone}?text=${whatsappMessage}`} rel="noreferrer" target="_blank">
          WhatsApp
        </a>
      )}
      {seller.email && (
        <a className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:border-indigo-300 hover:text-indigo-700" href={`mailto:${seller.email}?subject=${subject}`}>
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
    <div>
      <div className="relative h-60 overflow-hidden">
        <img alt={property.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" src={current} />
        <span className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-bold backdrop-blur ${property.listingType === 'RENT' ? 'bg-violet-600/90 text-white' : 'bg-cyan-300/90 text-slate-950'}`}>{listingLabel(property.listingType)}</span>
        {property.status !== 'AVAILABLE' && <span className={`absolute bottom-4 left-4 rounded-full px-3 py-1 text-xs font-bold ${propertyStatusClass(property.status)}`}>{propertyStatusLabel(property.status)}</span>}
        {images.length > 1 && <span className="absolute right-4 top-4 rounded-full bg-slate-950/70 px-2.5 py-1 text-xs font-semibold text-white">{active + 1}/{images.length}</span>}
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto border-b border-slate-100 bg-white p-3">
          {images.map((image, index) => (
            <button className={`size-12 shrink-0 overflow-hidden rounded-lg border-2 ${active === index ? 'border-indigo-600' : 'border-transparent opacity-70 hover:opacity-100'}`} key={image} onClick={() => setActive(index)} type="button">
              <img alt="" className="size-full object-cover" src={image} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
