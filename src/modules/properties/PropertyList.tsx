import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ApiProperty, formatApiPrice, listingLabel, listProperties, propertyImages } from '../../shared/propertyApi';

export function PropertyList() {
  const [properties, setProperties] = useState<ApiProperty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listProperties()
      .then(data => setProperties(data.slice(0, 3)))
      .catch(() => toast.error('No se pudo consultar el inventario.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div><p className="mb-1 text-[11px] font-bold uppercase tracking-[0.16em] text-indigo-600">Inventario</p><h2 className="text-xl font-bold">Propiedades recientes</h2></div>
        <Link className="shrink-0 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-cyan-300 hover:bg-cyan-50" to="/app/propiedades">Ver todas</Link>
      </div>

      <div>
        {loading && <p className="py-8 text-center text-sm text-slate-500">Consultando inventario...</p>}
        {!loading && properties.length === 0 && <p className="py-8 text-center text-sm text-slate-500">Aún no hay propiedades.</p>}
        {properties.map(property => (
          <article className="flex items-center gap-3 border-t border-slate-100 py-4 first:border-0" key={property.id}>
            {propertyImages(property)[0] ? <img alt="" className="size-11 shrink-0 rounded-xl object-cover" src={propertyImages(property)[0]} /> : <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-indigo-50 text-xs font-bold text-indigo-700">{property.propertyType.slice(0, 2)}</span>}
            <div className="min-w-0 flex-1">
              <strong className="block truncate text-sm">{property.title}</strong>
              <small className="block truncate text-slate-500">{listingLabel(property.listingType)} · {property.city}</small>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <strong className="text-sm">{formatApiPrice(property)}</strong>
              <span className="text-[11px] text-slate-500">{property.bedrooms ?? 0} rec · {property.bathrooms ?? 0} baños</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
