import { Link } from 'react-router-dom';
import {
  formatApiPrice,
  listingLabel,
  propertyImages,
  propertyStatusClass,
  propertyStatusLabel,
  propertyTypeLabel,
  PublicPropertyListing
} from '../api/propertyApi';
import { LikeButton } from './LikeButton';

const fallbackImage = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80';

interface PublicPropertyCardProps {
  listing: PublicPropertyListing;
  liked: boolean;
  onToggleLike: () => void;
}

/** Tarjeta del catálogo público: toda la tarjeta lleva al detalle, donde están los datos de contacto. */
export function PublicPropertyCard({ listing, liked, onToggleLike }: PublicPropertyCardProps) {
  const { property } = listing;
  const image = propertyImages(property)[0] || fallbackImage;
  const area = property.constructionArea ?? property.landArea;

  return (
    <Link
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-card transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      to={`/propiedades/${property.id}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-sunken">
        <img alt={property.title} className="size-full object-cover transition duration-500 group-hover:scale-[1.04]" loading="lazy" src={image} />
        <span className={`absolute left-3 top-3 rounded-lg px-2.5 py-1 text-xs font-semibold shadow-sm ${property.listingType === 'RENT' ? 'bg-emerald-50 text-emerald-800' : 'bg-white text-indigo-800'}`}>
          {listingLabel(property.listingType)}
        </span>
        <LikeButton className="absolute right-3 top-3" liked={liked} onToggle={onToggleLike} propertyTitle={property.title} />
        {property.status !== 'AVAILABLE' && (
          <span className={`absolute bottom-3 left-3 rounded-full px-2.5 py-1 text-xs font-semibold ${propertyStatusClass(property.status)}`}>
            {propertyStatusLabel(property.status)}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <strong className="text-xl font-bold tracking-tight text-fg tabular-nums">{formatApiPrice(property)}</strong>
        <h3 className="mt-1 line-clamp-1 font-semibold text-fg group-hover:text-primary-fg">{property.title}</h3>
        <p className="mt-0.5 line-clamp-1 text-sm text-fg-subtle">
          {propertyTypeLabel(property.propertyType)} · {property.city}, {property.stateCode}
        </p>
        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-border pt-3 text-sm text-fg-muted">
          {property.bedrooms != null && <Fact icon="bed" label={`${property.bedrooms} ${property.bedrooms === 1 ? 'recámara' : 'recámaras'}`} />}
          {property.bathrooms != null && <Fact icon="bath" label={`${property.bathrooms} ${property.bathrooms === 1 ? 'baño' : 'baños'}`} />}
          {area != null && <Fact icon="area" label={`${area} m²`} />}
        </ul>
      </div>
    </Link>
  );
}

const factIcons = {
  bed: 'M3 18v-6a2 2 0 012-2h14a2 2 0 012 2v6M3 18h18M3 18v2m18-2v2M6 10V7a1 1 0 011-1h4a1 1 0 011 1v3m0 0V7a1 1 0 011-1h4a1 1 0 011 1v3',
  bath: 'M4 12h16v3a4 4 0 01-4 4H8a4 4 0 01-4-4v-3zm2 0V6a2 2 0 014 0M7 19l-1 2m11-2l1 2',
  area: 'M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5'
};

function Fact({ icon, label }: { icon: keyof typeof factIcons; label: string }) {
  return (
    <li className="flex items-center gap-1.5">
      <svg aria-hidden="true" className="size-4 text-fg-subtle" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d={factIcons[icon]} />
      </svg>
      {label}
    </li>
  );
}
