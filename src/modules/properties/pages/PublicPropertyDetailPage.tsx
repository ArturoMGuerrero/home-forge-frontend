import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { countryName } from '../../settings';
import { formatApiPrice, getPublishedProperty, listingLabel, propertyImages, propertyStatusClass, propertyStatusLabel, propertyTypeLabel, PublicPropertyListing } from '../api/propertyApi';
import { Alert, Badge, buttonClasses, Card, Spinner } from '../../../shared/ui';
import { PublicHeader } from '../components/PublicHeader';
import { PublicFooter } from '../components/PublicFooter';
import { LikeButton } from '../components/LikeButton';
import { useLikedProperties } from '../likedProperties';

const fallbackImage = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1600&q=80';

export function PublicPropertyDetailPage() {
  const { propertyId = '' } = useParams();
  const [listing, setListing] = useState<PublicPropertyListing | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [error, setError] = useState('');
  const { isLiked, toggleLike } = useLikedProperties();

  useEffect(() => {
    getPublishedProperty(propertyId)
      .then(result => {
        setListing(result);
        document.title = `${result.property.title} | HomeForge`;
      })
      .catch(requestError => setError(requestError instanceof Error ? requestError.message : 'No fue posible cargar la propiedad.'));
  }, [propertyId]);

  if (error) return <PageMessage text={error} />;
  if (!listing) return <PageMessage loading text="Cargando propiedad..." />;

  const { property, seller } = listing;
  const images = propertyImages(property);
  const currentImage = images[activeImage] || fallbackImage;
  const phone = seller.phoneE164?.replace(/\D/g, '');
  const message = encodeURIComponent(`Hola, me interesa la propiedad ${property.title} (${property.code}) publicada en HomeForge.`);

  return (
    <div className="min-h-screen bg-app text-fg">
      <PublicHeader />

      <main className="mx-auto max-w-7xl px-5 py-8 sm:py-10">
        <Link className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-fg-subtle transition hover:text-fg" to="/propiedades">
          <svg aria-hidden="true" className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver al catálogo
        </Link>

        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={property.listingType === 'RENT' ? 'purple' : 'primary'}>{listingLabel(property.listingType)}</Badge>
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${propertyStatusClass(property.status)}`}>{propertyStatusLabel(property.status)}</span>
            <Badge>{countryName(property.countryCode)}</Badge>
            <span className="text-sm text-fg-subtle">{property.code}</span>
          </div>
          <div className="mt-4 flex items-start justify-between gap-4">
            <h1 className="max-w-4xl text-3xl font-bold tracking-tight sm:text-4xl">{property.title}</h1>
            <LikeButton className="shrink-0 border border-border" liked={isLiked(property.id)} onToggle={() => toggleLike(property.id)} propertyTitle={property.title} />
          </div>
          <p className="mt-2 text-base text-fg-subtle">{[property.address, property.city, property.stateCode, countryName(property.countryCode)].filter(Boolean).join(', ')}</p>
        </div>

        <section className="grid gap-3 lg:grid-cols-[1fr_260px]">
          <div className="relative overflow-hidden rounded-2xl bg-surface-sunken">
            <img alt={property.title} className="h-[300px] w-full object-cover sm:h-[500px]" src={currentImage} />
            {images.length > 1 && (
              <div className="absolute bottom-4 right-4 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                {activeImage + 1} / {images.length}
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="grid auto-rows-fr grid-cols-4 gap-2.5 lg:max-h-[500px] lg:grid-cols-2 lg:overflow-y-auto lg:pr-1">
              {images.map((image, index) => (
                <button
                  aria-label={`Ver foto ${index + 1}`}
                  className={`relative aspect-square overflow-hidden rounded-xl ring-2 transition ${activeImage === index ? 'ring-primary' : 'ring-transparent opacity-75 hover:opacity-100'}`}
                  key={image}
                  onClick={() => setActiveImage(index)}
                  type="button"
                >
                  <img alt="" className="size-full object-cover" src={image} />
                </button>
              ))}
            </div>
          )}
        </section>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <Card className="sm:p-8">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <span className="text-sm text-fg-subtle">Precio</span>
                  <strong className="mt-1 block text-3xl font-bold tracking-tight text-fg">{formatApiPrice(property)}</strong>
                </div>
                <Badge size="md">{propertyTypeLabel(property.propertyType)}</Badge>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
                <Feature value={property.bedrooms} label="Recámaras" />
                <Feature value={property.bathrooms} label="Baños" />
                <Feature value={property.parkingSpaces} label="Estacionamientos" />
                <Feature value={property.landArea} label="Terreno m²" />
                <Feature value={property.constructionArea} label="Construcción m²" />
              </div>
            </Card>

            <Card className="sm:p-8">
              <h2 className="text-xl font-semibold">Descripción</h2>
              <p className="mt-4 whitespace-pre-line text-base leading-7 text-fg-muted">{property.description || 'Solicita a la inmobiliaria la descripción completa y condiciones de esta propiedad.'}</p>
            </Card>

            <Card className="sm:p-8">
              <h2 className="text-xl font-semibold">Ubicación</h2>
              <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                <Detail label="País" value={countryName(property.countryCode)} />
                <Detail label="Estado" value={property.stateCode} />
                <Detail label="Ciudad" value={property.city} />
                <Detail label="Dirección" value={property.address || 'Consultar con la inmobiliaria'} />
              </dl>
            </Card>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
            <Card>
              <span className="text-sm text-fg-subtle">Inmobiliaria responsable</span>
              <h2 className="mt-1 text-lg font-semibold">{seller.companyName}</h2>
              <p className="mt-1.5 text-sm text-fg-subtle">Contacta directamente a la empresa que publicó esta propiedad.</p>
              <div className="mt-5 grid gap-2">
                {phone && <a className={buttonClasses({ variant: 'success', fullWidth: true })} href={`https://wa.me/${phone}?text=${message}`} rel="noreferrer" target="_blank">Preguntar por WhatsApp</a>}
                {seller.email && <a className={buttonClasses({ variant: 'tertiary', fullWidth: true })} href={`mailto:${seller.email}?subject=${encodeURIComponent(`Información sobre ${property.title}`)}`}>Enviar correo</a>}
                <Link className={buttonClasses({ variant: 'secondary', fullWidth: true })} to={`/empresas/${seller.companyId}`}>Conocer la inmobiliaria</Link>
              </div>
            </Card>
            <Alert variant="warning">
              <span className="text-xs">Antes de realizar pagos, verifica documentación, identidad del asesor y condiciones de la operación directamente con la inmobiliaria.</span>
            </Alert>
          </aside>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

function Feature({ value, label }: { value?: number; label: string }) {
  return (
    <div className="rounded-xl bg-surface-muted px-3 py-3.5 text-center">
      <strong className="block text-lg font-semibold tabular-nums text-fg">{value ?? '—'}</strong>
      <span className="mt-0.5 block text-xs text-fg-subtle">{label}</span>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface-muted p-4">
      <dt className="text-xs text-fg-subtle">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-fg">{value}</dd>
    </div>
  );
}

function PageMessage({ text, loading = false }: { text: string; loading?: boolean }) {
  return (
    <div className="grid min-h-screen place-items-center bg-app px-5">
      <div className="text-center">
        {loading ? <Spinner className="mx-auto text-primary" size="lg" /> : <img alt="HomeForge" className="mx-auto size-14 rounded-2xl" src="/favicon.png" />}
        <p className="mt-5 text-sm text-fg-subtle">{text}</p>
        {!loading && <Link className={buttonClasses({ variant: 'tertiary', size: 'sm', className: 'mt-4' })} to="/propiedades">Volver al catálogo</Link>}
      </div>
    </div>
  );
}
