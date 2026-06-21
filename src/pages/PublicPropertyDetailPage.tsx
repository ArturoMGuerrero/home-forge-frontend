import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { countryName } from '../shared/companyApi';
import { ApiProperty, formatApiPrice, getPublishedProperty, listingLabel, propertyImages, propertyStatusClass, propertyStatusLabel, PublicPropertyListing } from '../shared/propertyApi';

const fallbackImage = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1600&q=80';

export function PublicPropertyDetailPage() {
  const { propertyId = '' } = useParams();
  const [listing, setListing] = useState<PublicPropertyListing | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    getPublishedProperty(propertyId)
      .then(setListing)
      .catch(requestError => setError(requestError instanceof Error ? requestError.message : 'No fue posible cargar la propiedad.'));
  }, [propertyId]);

  if (error) return <PageMessage text={error} />;
  if (!listing) return <PageMessage text="Cargando propiedad..." />;

  const { property, seller } = listing;
  const images = propertyImages(property);
  const currentImage = images[activeImage] || fallbackImage;
  const phone = seller.phoneE164?.replace(/\D/g, '');
  const message = encodeURIComponent(`Hola, me interesa la propiedad ${property.title} (${property.code}) publicada en HomeForge.`);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
          <Link className="flex items-center gap-3" to="/propiedades">
            <img alt="HomeForge" className="size-10 rounded-xl object-cover" src="/favicon.png" />
            <div><strong className="block font-bold">HomeForge</strong><small className="text-slate-500">Propiedades</small></div>
          </Link>
          <Link className="text-sm font-semibold text-indigo-600" to="/propiedades">&lt;- Volver al catálogo</Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-10">
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${property.listingType === 'RENT' ? 'bg-violet-100 text-violet-800' : 'bg-cyan-100 text-cyan-800'}`}>{listingLabel(property.listingType)}</span>
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${propertyStatusClass(property.status)}`}>{propertyStatusLabel(property.status)}</span>
            <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-bold text-slate-700">{countryName(property.countryCode)}</span>
            <span className="text-sm text-slate-500">{property.code}</span>
          </div>
          <h1 className="mt-4 max-w-4xl text-3xl font-bold sm:text-5xl">{property.title}</h1>
          <p className="mt-3 text-base text-slate-500">{[property.address, property.city, property.stateCode, countryName(property.countryCode)].filter(Boolean).join(', ')}</p>
        </div>

        <section className="grid gap-4 lg:grid-cols-[1fr_220px]">
          <img alt={property.title} className="h-[320px] w-full rounded-3xl object-cover sm:h-[520px]" src={currentImage} />
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-3 lg:max-h-[520px] lg:grid-cols-1 lg:overflow-y-auto">
              {images.map((image, index) => (
                <button className={`overflow-hidden rounded-2xl border-2 ${activeImage === index ? 'border-indigo-600' : 'border-transparent opacity-75 hover:opacity-100'}`} key={image} onClick={() => setActiveImage(index)} type="button">
                  <img alt={`Vista ${index + 1}`} className="h-20 w-full object-cover lg:h-28" src={image} />
                </button>
              ))}
            </div>
          )}
        </section>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-7">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div><span className="text-xs font-bold uppercase tracking-wider text-slate-400">Precio</span><strong className="mt-1 block text-3xl text-indigo-700">{formatApiPrice(property)}</strong></div>
                <span className="text-sm font-semibold text-slate-500">{property.propertyType}</span>
              </div>
              <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-5">
                <Feature value={property.bedrooms} label="Recámaras" />
                <Feature value={property.bathrooms} label="Baños" />
                <Feature value={property.parkingSpaces} label="Estacionamientos" />
                <Feature value={property.landArea} label="Terreno m²" />
                <Feature value={property.constructionArea} label="Construcción m²" />
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-2xl font-bold">Descripción completa</h2>
              <p className="mt-5 whitespace-pre-line text-base leading-8 text-slate-600">{property.description || 'Solicita a la inmobiliaria la descripción completa y condiciones de esta propiedad.'}</p>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-2xl font-bold">Ubicación</h2>
              <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                <Detail label="País" value={countryName(property.countryCode)} />
                <Detail label="Estado" value={property.stateCode} />
                <Detail label="Ciudad" value={property.city} />
                <Detail label="Dirección" value={property.address || 'Consultar con la inmobiliaria'} />
              </dl>
            </section>
          </div>

          <aside className="space-y-5 lg:sticky lg:top-6 lg:self-start">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
              <span className="text-xs font-bold uppercase tracking-[.14em] text-slate-400">Inmobiliaria responsable</span>
              <h2 className="mt-2 text-xl font-bold">{seller.companyName}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">Contacta directamente a la empresa que publicó esta propiedad.</p>
              <div className="mt-5 grid gap-3">
                {phone && <a className="rounded-xl bg-emerald-600 px-4 py-3 text-center text-sm font-bold text-white hover:bg-emerald-700" href={`https://wa.me/${phone}?text=${message}`} rel="noreferrer" target="_blank">Preguntar por WhatsApp</a>}
                {seller.email && <a className="rounded-xl border border-slate-200 px-4 py-3 text-center text-sm font-bold text-slate-700 hover:border-indigo-300 hover:text-indigo-700" href={`mailto:${seller.email}?subject=${encodeURIComponent(`Información sobre ${property.title}`)}`}>Enviar correo</a>}
                <Link className="rounded-xl bg-indigo-50 px-4 py-3 text-center text-sm font-bold text-indigo-700 hover:bg-indigo-100" to={`/empresas/${seller.companyId}`}>Conocer la inmobiliaria</Link>
              </div>
            </section>
            <p className="rounded-2xl bg-amber-50 p-4 text-xs leading-5 text-amber-800">Antes de realizar pagos, verifica documentación, identidad del asesor y condiciones de la operación directamente con la inmobiliaria.</p>
          </aside>
        </div>
      </main>
    </div>
  );
}

function Feature({ value, label }: { value?: number; label: string }) {
  return <div className="rounded-xl bg-slate-50 px-3 py-4 text-center"><strong className="block text-lg">{value ?? '-'}</strong><span className="mt-1 block text-xs text-slate-500">{label}</span></div>;
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-slate-50 p-4"><dt className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</dt><dd className="mt-1 text-sm font-semibold text-slate-700">{value}</dd></div>;
}

function PageMessage({ text }: { text: string }) {
  return <div className="grid min-h-screen place-items-center bg-slate-50 px-5"><div className="text-center"><img alt="HomeForge" className="mx-auto size-16 rounded-2xl" src="/favicon.png" /><p className="mt-5 text-sm text-slate-500">{text}</p><Link className="mt-4 inline-block font-semibold text-indigo-600" to="/propiedades">Volver al catálogo</Link></div></div>;
}
