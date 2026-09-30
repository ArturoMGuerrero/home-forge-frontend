import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CatalogItem, catalogLabels } from '../api/catalogs';
import { getJson } from '../../../shared/services/api';
import { getSubscription, Subscription } from '../api/subscriptionApi';

export function CatalogPage() {
  const { catalogName } = useParams();
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!catalogName) return;
    setLoading(true);
    Promise.all([
      getJson<CatalogItem[]>(`/catalogs/${catalogName}`),
      getSubscription()
    ])
      .then(([catalogItems, subscriptionResponse]) => {
        setItems(catalogItems);
        setSubscription(subscriptionResponse);
      })
      .catch(() => toast.error('No fue posible consultar este catálogo.'))
      .finally(() => setLoading(false));
  }, [catalogName]);

  if (!catalogName) return <Navigate to="/app/configuracion" replace />;
  if (!loading && subscription?.planCode === 'STARTER' && subscription.status !== 'TRIAL') return <Navigate to="/app/planes" replace />;
  const definition = catalogLabels[catalogName];

  return (
    <>
      <header className="mb-8">
        <Link className="text-sm font-semibold text-primary-fg" to="/app/configuracion">&lt;- Volver a configuración</Link>
        <p className="mb-1 mt-5 text-[11px] font-bold uppercase tracking-[0.16em] text-primary-fg">Catálogo</p>
        <h1 className="text-3xl font-bold">{definition?.es ?? catalogName}</h1>
        <p className="mt-2 text-sm text-fg-subtle">{definition?.description}</p>
      </header>

      {loading && <p className="rounded-2xl border border-border bg-surface p-8 text-center text-sm text-fg-subtle">Consultando catálogo...</p>}

      {!loading && (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
          <div className="grid grid-cols-[.7fr_1fr_1fr] gap-4 border-b border-border bg-surface-muted px-5 py-3 text-xs font-bold uppercase tracking-wide text-fg-subtle">
            <span>Código</span>
            <span>Español</span>
            <span>Inglés</span>
          </div>
          {items.map(item => (
            <article className="grid grid-cols-[.7fr_1fr_1fr] gap-4 border-b border-border px-5 py-4 text-sm last:border-0" key={item.code}>
              <code className="font-semibold text-primary-fg">{item.code}</code>
              <span>{item.labelEs}</span>
              <span className="text-fg-subtle">{item.labelEn}</span>
            </article>
          ))}
          {items.length === 0 && <p className="p-8 text-center text-sm text-fg-subtle">Este catálogo no contiene elementos.</p>}
        </div>
      )}
    </>
  );
}
