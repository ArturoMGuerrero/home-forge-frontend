import { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CatalogItem, catalogLabels } from '../api/catalogs';
import { getJson } from '../../../shared/services/api';
import { getSubscription, Subscription } from '../api/subscriptionApi';
import { Card, EmptyState, LoadingState, PageHeader, Table, TBody, TD, TH, THead, TR } from '../../../shared/ui';

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
      <PageHeader
        backLink={{ to: '/app/configuracion', label: 'Configuración' }}
        badge={loading ? undefined : { value: items.length, label: 'elementos' }}
        eyebrow="Catálogo"
        subtitle={definition?.description}
        title={definition?.es ?? catalogName}
      />

      <Card noPadding truncate>
        {loading ? (
          <LoadingState message="Consultando catálogo..." />
        ) : items.length === 0 ? (
          <EmptyState title="Este catálogo no contiene elementos" />
        ) : (
          <Table>
            <THead>
              <tr>
                <TH>Código</TH>
                <TH>Español</TH>
                <TH>Inglés</TH>
              </tr>
            </THead>
            <TBody>
              {items.map(item => (
                <TR key={item.code}>
                  <TD><code className="rounded bg-surface-sunken px-1.5 py-0.5 text-xs font-semibold text-fg">{item.code}</code></TD>
                  <TD className="text-fg">{item.labelEs}</TD>
                  <TD className="text-fg-subtle">{item.labelEn}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </Card>
    </>
  );
}
