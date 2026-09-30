import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CompanyProfile, countryName, getPublicCompanyProfile } from '../../settings';
import { formatApiPrice, listPublishedProperties, propertyImages, PublicHeader, PublicPropertyListing } from '../../properties';
import { buttonClasses, Card, EmptyState, Spinner } from '../../../shared/ui';
import { Icon } from '../../../shared/Icon';

const fallbackImage = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80';

export function PublicCompanyPage() {
  const { companyId = '' } = useParams();
  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [listings, setListings] = useState<PublicPropertyListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getPublicCompanyProfile(companyId), listPublishedProperties()])
      .then(([profile, published]) => {
        setCompany(profile);
        setListings(published.filter(item => item.seller.companyId === companyId));
      })
      .catch(requestError => setError(requestError instanceof Error ? requestError.message : 'No fue posible cargar la empresa.'))
      .finally(() => setLoading(false));
  }, [companyId]);

  if (loading) return <PublicMessage loading text="Cargando perfil de la inmobiliaria..." />;
  if (error || !company) return <PublicMessage text={error || 'Empresa no encontrada.'} />;

  const phone = company.publicPhoneE164?.replace(/\D/g, '');
  const location = [company.address, company.city, company.stateCode, countryName(company.countryCode), company.postalCode].filter(Boolean).join(', ');

  return (
    <div className="min-h-screen bg-app text-fg">
      <PublicHeader />
      <section className="relative overflow-hidden bg-slate-950 px-5 pb-24 pt-14 text-white">
        <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgb(79_70_229/0.45),transparent_55%)]" />
        <div className="relative mx-auto max-w-6xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Perfil inmobiliario</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">{company.name}</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">{company.publicDescription || 'Empresa inmobiliaria con propiedades disponibles en HomeForge.'}</p>
          <div className="mt-7 flex flex-wrap gap-2">
            {phone && <a className={buttonClasses({ variant: 'success' })} href={`https://wa.me/${phone}`} rel="noreferrer" target="_blank">Contactar por WhatsApp</a>}
            {company.publicEmail && <a className={buttonClasses({ className: 'bg-white text-slate-900 hover:bg-slate-100' })} href={`mailto:${company.publicEmail}`}>Enviar correo</a>}
            {company.websiteUrl && <a className={buttonClasses({ variant: 'ghost', className: 'text-white ring-1 ring-white/20 hover:bg-white/10 hover:text-white' })} href={company.websiteUrl} rel="noreferrer" target="_blank">Visitar sitio web</a>}
          </div>
        </div>
      </section>

      <main className="relative mx-auto -mt-12 max-w-6xl space-y-10 px-5 pb-16">
        <section className="grid gap-4 md:grid-cols-3">
          <TrustCard label="Experiencia" value={company.yearsExperience !== undefined ? `${company.yearsExperience} años` : 'No especificada'} />
          <TrustCard label="Registro profesional" value={company.professionalLicense || 'No especificado'} />
          <TrustCard label="Ubicación" value={location || 'No especificada'} />
        </section>

        {(company.mission || company.vision) && (
          <section className="grid gap-4 md:grid-cols-2">
            {company.mission && <InstitutionCard title="Nuestra misión" text={company.mission} />}
            {company.vision && <InstitutionCard title="Nuestra visión" text={company.vision} />}
          </section>
        )}

        <section>
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-fg">Inventario publicado</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight">{listings.length} {listings.length === 1 ? 'propiedad' : 'propiedades'} de {company.name}</h2>
          </div>
          {listings.length === 0 && (
            <Card className="border-dashed">
              <EmptyState icon={<Icon name="properties" />} title="Esta empresa todavía no tiene propiedades públicas" />
            </Card>
          )}
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {listings.map(({ property }) => (
              <Link className="group overflow-hidden rounded-2xl border border-border bg-surface shadow-card transition hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" key={property.id} to={`/propiedades/${property.id}`}>
                <div className="aspect-[4/3] overflow-hidden bg-surface-sunken">
                  <img alt={property.title} className="size-full object-cover transition duration-500 group-hover:scale-[1.03]" loading="lazy" src={propertyImages(property)[0] || fallbackImage} />
                </div>
                <div className="p-5">
                  <small className="text-sm font-medium text-primary-fg">{property.city}, {property.stateCode}</small>
                  <h3 className="mt-1.5 text-lg font-semibold text-fg">{property.title}</h3>
                  <strong className="mt-3 block text-lg font-bold tracking-tight text-fg">{formatApiPrice(property)}</strong>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function TrustCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-5">
      <span className="text-sm text-fg-subtle">{label}</span>
      <strong className="mt-1 block text-base font-semibold leading-6 text-fg">{value}</strong>
    </Card>
  );
}

function InstitutionCard({ title, text }: { title: string; text: string }) {
  return (
    <Card className="sm:p-7">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-3 whitespace-pre-line text-sm leading-7 text-fg-muted">{text}</p>
    </Card>
  );
}

function PublicMessage({ text, loading = false }: { text: string; loading?: boolean }) {
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
