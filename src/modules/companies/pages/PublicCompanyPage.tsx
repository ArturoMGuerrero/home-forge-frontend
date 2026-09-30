import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CompanyProfile, countryName, getPublicCompanyProfile } from '../../settings';
import { formatApiPrice, listPublishedProperties, propertyImages, PublicPropertyListing } from '../../properties';

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

  if (loading) return <PublicMessage text="Cargando perfil de la inmobiliaria..." />;
  if (error || !company) return <PublicMessage text={error || 'Empresa no encontrada.'} />;

  const phone = company.publicPhoneE164?.replace(/\D/g, '');
  const location = [company.address, company.city, company.stateCode, countryName(company.countryCode), company.postalCode].filter(Boolean).join(', ');

  return (
    <div className="min-h-screen bg-surface-muted text-fg">
      <PublicHeader />
      <section className="bg-inverse px-5 py-16 text-white">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-cyan-300">Perfil inmobiliario verificado</p>
          <h1 className="mt-3 text-4xl font-bold sm:text-6xl">{company.name}</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-border-strong">{company.publicDescription || 'Empresa inmobiliaria con propiedades disponibles en HomeForge.'}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            {phone && <a className="rounded-xl bg-success px-4 py-3 text-sm font-bold text-white hover:bg-success-hover" href={`https://wa.me/${phone}`} rel="noreferrer" target="_blank">Contactar por WhatsApp</a>}
            {company.publicEmail && <a className="rounded-xl bg-surface px-4 py-3 text-sm font-bold text-fg" href={`mailto:${company.publicEmail}`}>Enviar correo</a>}
            {company.websiteUrl && <a className="rounded-xl border border-slate-700 px-4 py-3 text-sm font-bold text-white hover:bg-inverse-hover" href={company.websiteUrl} rel="noreferrer" target="_blank">Visitar sitio web</a>}
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl space-y-10 px-5 py-12">
        <section className="grid gap-5 md:grid-cols-3">
          <TrustCard label="Experiencia" value={company.yearsExperience !== undefined ? `${company.yearsExperience} años` : 'No especificada'} />
          <TrustCard label="Registro profesional" value={company.professionalLicense || 'No especificado'} />
          <TrustCard label="Ubicación" value={location || 'No especificada'} />
        </section>

        {(company.mission || company.vision) && (
          <section className="grid gap-6 md:grid-cols-2">
            {company.mission && <InstitutionCard title="Nuestra misión" text={company.mission} />}
            {company.vision && <InstitutionCard title="Nuestra visión" text={company.vision} />}
          </section>
        )}

        <section>
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-[.16em] text-primary-fg">Inventario publicado</p>
            <h2 className="mt-1 text-2xl font-bold">{listings.length} propiedades de {company.name}</h2>
          </div>
          {listings.length === 0 && <p className="rounded-2xl border border-border bg-surface p-8 text-center text-sm text-fg-subtle">Esta empresa todavía no tiene propiedades públicas.</p>}
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {listings.map(({ property }) => (
              <Link className="group overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition hover:-translate-y-1 hover:shadow-lg" key={property.id} to={`/propiedades/${property.id}`}>
                <img alt={property.title} className="h-52 w-full object-cover transition group-hover:scale-105" src={propertyImages(property)[0] || fallbackImage} />
                <div className="p-5">
                  <small className="font-semibold text-primary-fg">{property.city}, {property.stateCode}</small>
                  <h3 className="mt-2 text-lg font-bold">{property.title}</h3>
                  <strong className="mt-3 block text-primary-fg">{formatApiPrice(property)}</strong>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function PublicHeader() {
  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <Link className="flex items-center gap-3" to="/propiedades">
          <img alt="HomeForge" className="size-10 rounded-xl object-cover" src="/favicon.png" />
          <div><strong className="block font-bold">HomeForge</strong><small className="text-fg-subtle">Propiedades</small></div>
        </Link>
        <Link className="text-sm font-semibold text-primary-fg" to="/propiedades">Ver todas las propiedades</Link>
      </div>
    </header>
  );
}

function TrustCard({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm"><span className="text-xs font-bold uppercase tracking-wider text-fg-subtle">{label}</span><strong className="mt-2 block text-base leading-6 text-fg">{value}</strong></div>;
}

function InstitutionCard({ title, text }: { title: string; text: string }) {
  return <article className="rounded-3xl border border-border bg-surface p-7 shadow-sm"><h2 className="text-xl font-bold">{title}</h2><p className="mt-4 whitespace-pre-line text-sm leading-7 text-fg-muted">{text}</p></article>;
}

function PublicMessage({ text }: { text: string }) {
  return <div className="grid min-h-screen place-items-center bg-surface-muted px-5"><div className="text-center"><img alt="HomeForge" className="mx-auto size-16 rounded-2xl" src="/favicon.png" /><p className="mt-5 text-sm text-fg-subtle">{text}</p><Link className="mt-4 inline-block font-semibold text-primary-fg" to="/propiedades">Volver al catálogo</Link></div></div>;
}
