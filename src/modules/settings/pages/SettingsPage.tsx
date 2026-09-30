import { ReactNode, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CatalogIndex, catalogLabels, primaryCatalogs, workflowCatalogs } from '../api/catalogs';
import { Icon, IconName } from '../../../shared/Icon';
import { getJson } from '../../../shared/services/api';
import { getSubscription, Subscription } from '../api/subscriptionApi';
import { Badge, buttonClasses, Card, cardClass, cn, LoadingState, PageHeader } from '../../../shared/ui';

const catalogIcons: Record<string, IconName> = {
  'lead-sources': 'leads',
  'property-types': 'properties',
  'listing-types': 'tags',
  'document-types': 'document',
  'mortgage-types': 'finance',
  countries: 'globe',
  currencies: 'currency'
};

export function SettingsPage() {
  const [catalogs, setCatalogs] = useState<string[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getJson<CatalogIndex>('/catalogs'), getSubscription()])
      .then(([response, subscriptionResponse]) => {
        setCatalogs(response.catalogs);
        setSubscription(subscriptionResponse);
      })
      .catch(() => toast.error('No fue posible consultar la configuración.'))
      .finally(() => setLoading(false));
  }, []);

  const starter = subscription?.planCode === 'STARTER' && subscription.status !== 'TRIAL';
  const primary = primaryCatalogs.filter(name => catalogs.includes(name));
  const workflows = workflowCatalogs.filter(name => catalogs.includes(name));

  return (
    <>
      <PageHeader
        eyebrow="Administración"
        subtitle="Administra la empresa, el equipo, tu cuenta, el plan y los catálogos desde un solo lugar."
        title="Configuración"
      />

      <section className="mb-10">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SettingsLink description="Logo, datos comerciales y perfil público." icon="properties" label="Empresa" to="/app/configuracion/empresa" />
          <SettingsLink description="Usuarios, equipos, roles y actividad." icon="users" label="Equipo y usuarios" to="/app/usuarios" />
          <SettingsLink description="Avatar, seguridad y apariencia personal." icon="user" label="Mi cuenta" to="/app/cuenta" />
          <SettingsLink description="Suscripción, límites y estado de pago." icon="plans" label="Plan y facturación" to="/app/planes" />
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <AutomationLink description="Distribuye prospectos por turnos, carga, ciudad, operación y presupuesto." title="Asignación automática" to="/app/configuracion/asignacion" />
          <AutomationLink
            badge={<Badge dot variant="success">Activos</Badge>}
            description="Primer contacto, alerta a las 24 horas y seguimiento posterior a visitas."
            title="Seguimientos automáticos"
            to="/app/prospectos/tareas"
          />
        </div>
      </section>

      {loading && <Card><LoadingState message="Cargando configuración..." /></Card>}

      {!loading && (
        <>
          <section>
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-fg">Catálogos principales</h2>
                <p className="mt-0.5 text-sm text-fg-subtle">Opciones que se usan al registrar prospectos, propiedades y expedientes.</p>
              </div>
              {starter && <Link className={buttonClasses({ variant: 'secondary', size: 'sm' })} to="/app/planes">Disponible desde Pro</Link>}
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {primary.map(name => <CatalogCard key={name} locked={starter} name={name} />)}
            </div>
          </section>

          <details className={cn(cardClass, 'group mt-8', starter && 'opacity-75')}>
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 [&::-webkit-details-marker]:hidden">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-surface-sunken text-fg-muted"><Icon className="size-5" name="workflow" /></span>
                <div>
                  <h2 className="font-semibold text-fg">Flujos del sistema</h2>
                  <p className="mt-0.5 text-sm text-fg-subtle">Estados internos usados por los procesos de HomeForge.</p>
                </div>
              </div>
              <span className="flex items-center gap-2 text-xs font-medium text-fg-subtle">
                {starter ? 'Plan Pro' : `${workflows.length} catálogos`}
                <svg aria-hidden="true" className="size-4 transition group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </span>
            </summary>
            <div className="grid gap-2 border-t border-border p-5 sm:grid-cols-2 xl:grid-cols-3">
              {workflows.map(name => (
                <Link className="flex items-center justify-between rounded-xl border border-border px-4 py-3 text-sm font-medium text-fg-muted transition hover:border-primary-line hover:bg-primary-soft hover:text-primary-fg" key={name} to={starter ? '/app/planes' : `/app/configuracion/catalogos/${name}`}>
                  {catalogLabels[name]?.es ?? name}
                  <Icon className="size-4 text-fg-subtle" name="arrow" />
                </Link>
              ))}
            </div>
          </details>
        </>
      )}
    </>
  );
}

const linkCardClass = cn(cardClass, 'group block min-w-0 p-5 transition hover:border-primary-line hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary');

function SettingsLink({ description, icon, label, to }: { description: string; icon: IconName; label: string; to: string }) {
  return (
    <Link className={linkCardClass} to={to}>
      <div className="flex items-start justify-between gap-4">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary-fg"><Icon className="size-5" name={icon} /></span>
        <Icon className="size-4 text-fg-subtle transition group-hover:translate-x-0.5 group-hover:text-primary-fg" name="arrow" />
      </div>
      <h3 className="mt-4 font-semibold text-fg">{label}</h3>
      <p className="mt-1 text-sm text-fg-subtle">{description}</p>
    </Link>
  );
}

function AutomationLink({ title, description, to, badge }: { title: string; description: string; to: string; badge?: ReactNode }) {
  return (
    <Link className={cn(linkCardClass, 'flex items-center justify-between gap-4')} to={to}>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-semibold text-fg">{title}</h3>
          {badge}
        </div>
        <p className="mt-1 text-sm text-fg-subtle">{description}</p>
      </div>
      <Icon className="size-4 shrink-0 text-fg-subtle transition group-hover:translate-x-0.5 group-hover:text-primary-fg" name="arrow" />
    </Link>
  );
}

function CatalogCard({ name, locked }: { name: string; locked: boolean }) {
  const definition = catalogLabels[name];
  return (
    <Link className={cn(linkCardClass, locked && 'opacity-75')} to={locked ? '/app/planes' : `/app/configuracion/catalogos/${name}`}>
      <div className="flex items-start justify-between gap-4">
        <span className="grid size-10 place-items-center rounded-xl bg-surface-sunken text-fg-muted"><Icon className="size-5" name={catalogIcons[name] ?? 'settings'} /></span>
        {locked ? <Badge variant="warning">Pro</Badge> : <Icon className="size-4 text-fg-subtle transition group-hover:translate-x-0.5 group-hover:text-primary-fg" name="arrow" />}
      </div>
      <h2 className="mt-4 font-semibold text-fg">{definition?.es ?? name}</h2>
      <p className="mt-1 text-sm text-fg-subtle">{definition?.description}</p>
    </Link>
  );
}
