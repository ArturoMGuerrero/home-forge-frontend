import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CatalogIndex, catalogLabels, primaryCatalogs, workflowCatalogs } from '../api/catalogs';
import { Icon, IconName } from '../../../shared/Icon';
import { getJson } from '../../../shared/services/api';
import { getSubscription, Subscription } from '../api/subscriptionApi';

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
      .catch(() => toast.error('No fue posible consultar la configuración del backend.'))
      .finally(() => setLoading(false));
  }, []);

  const starter = subscription?.planCode === 'STARTER' && subscription.status !== 'TRIAL';
  const primary = primaryCatalogs.filter(name => catalogs.includes(name));
  const workflows = workflowCatalogs.filter(name => catalogs.includes(name));

  return (
    <>
      <header className="mb-8">
        <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.16em] text-primary-fg">Administración</p>
        <h1 className="text-3xl font-bold">Configuración</h1>
        <p className="mt-2 text-sm text-fg-subtle">Administra la empresa, el equipo, tu cuenta, el plan y los catálogos desde un solo lugar.</p>
      </header>

      <section className="mb-10">
        <div className="mb-5"><h2 className="text-xl font-bold">Centro de configuración</h2><p className="mt-1 text-sm text-fg-subtle">Elige qué área deseas administrar.</p></div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SettingsLink description="Logo, datos comerciales y perfil público." icon="properties" label="Empresa" to="/app/configuracion/empresa" />
          <SettingsLink description="Usuarios, equipos, roles y actividad." icon="users" label="Equipo y usuarios" to="/app/usuarios" />
          <SettingsLink description="Avatar, seguridad y apariencia personal." icon="user" label="Mi cuenta" to="/app/cuenta" />
          <SettingsLink description="Suscripción, límites y estado de pago." icon="plans" label="Plan y facturación" to="/app/planes" />
        </div>
        <Link className="mt-4 flex items-center justify-between rounded-2xl border border-primary-line bg-primary-soft p-5 text-primary-fg transition hover:border-primary hover:shadow-sm" to="/app/configuracion/asignacion"><div><h3 className="font-bold">Asignación automática</h3><p className="mt-1 text-sm text-primary-fg">Distribuye prospectos por turnos, carga, ciudad, operación y presupuesto.</p></div><Icon className="size-5 shrink-0" name="arrow" /></Link>
        <Link className="mt-3 flex items-center justify-between rounded-2xl border border-success-line bg-success-soft p-5 text-success-fg transition hover:border-success hover:shadow-sm" to="/app/prospectos/tareas"><div><div className="flex flex-wrap items-center gap-2"><h3 className="font-bold">Seguimientos automáticos</h3><span className="rounded-full bg-success-muted px-2 py-0.5 text-[10px] font-bold text-success-fg">ACTIVOS</span></div><p className="mt-1 text-sm text-success-fg">Primer contacto, alerta a las 24 horas y seguimiento posterior a visitas.</p></div><Icon className="size-5 shrink-0" name="arrow" /></Link>
      </section>

      {loading && <p className="rounded-2xl border border-border bg-surface p-8 text-center text-sm text-fg-subtle">Cargando configuración...</p>}

      {!loading && (
        <>
          <section>
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold">Catálogos principales</h2>
                <p className="mt-1 text-sm text-fg-subtle">Opciones que se usan al registrar prospectos, propiedades y expedientes.</p>
              </div>
              {starter && <Link className="rounded-xl bg-warning-muted px-3 py-2 text-xs font-bold text-warning-fg" to="/app/planes">Disponible desde Pro</Link>}
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {primary.map(name => <CatalogCard key={name} locked={starter} name={name} />)}
            </div>
          </section>

          <details className={`mt-10 rounded-2xl border bg-surface shadow-sm ${starter ? 'border-warning-line opacity-75' : 'border-border'}`}>
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5">
              <div className="flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-xl bg-surface-sunken text-fg-muted"><Icon className="size-5" name="workflow" /></span>
                <div><h2 className="font-bold">Flujos del sistema</h2><p className="mt-1 text-sm text-fg-subtle">Estados internos usados por los procesos de HomeForge.</p></div>
              </div>
              <span className="text-xs font-semibold text-fg-subtle">{starter ? 'Plan Pro' : `${workflows.length} catálogos`}</span>
            </summary>
            <div className="grid gap-3 border-t border-border p-5 sm:grid-cols-2 xl:grid-cols-3">
              {workflows.map(name => (
                <Link className="flex items-center justify-between rounded-xl border border-border px-4 py-3 text-sm font-semibold text-fg-muted hover:border-primary-line hover:bg-primary-soft" key={name} to={starter ? '/app/planes' : `/app/configuracion/catalogos/${name}`}>
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

function SettingsLink({ description, icon, label, to }: { description: string; icon: IconName; label: string; to: string }) {
  return (
    <Link className="group min-w-0 rounded-2xl border border-border bg-surface p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary-line hover:shadow-md" to={to}>
      <div className="flex items-start justify-between gap-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary-muted text-primary-fg"><Icon className="size-5" name={icon} /></span>
        <Icon className="size-5 text-border-strong transition group-hover:translate-x-1 group-hover:text-primary-fg" name="arrow" />
      </div>
      <h3 className="mt-4 font-bold text-fg">{label}</h3>
      <p className="mt-1 text-sm leading-5 text-fg-subtle">{description}</p>
    </Link>
  );
}

function CatalogCard({ name, locked }: { name: string; locked: boolean }) {
  const definition = catalogLabels[name];
  return (
    <Link className={`group rounded-2xl border bg-surface p-5 shadow-sm transition ${locked ? 'border-warning-line opacity-75' : 'border-border hover:-translate-y-0.5 hover:border-primary-line hover:shadow-md'}`} to={locked ? '/app/planes' : `/app/configuracion/catalogos/${name}`}>
      <div className="flex items-start justify-between gap-4">
        <span className="grid size-11 place-items-center rounded-xl bg-primary-muted text-primary-fg"><Icon className="size-5" name={catalogIcons[name] ?? 'settings'} /></span>
        <span className={`text-xs font-bold ${locked ? 'text-warning-fg' : 'text-border-strong'}`}>{locked ? 'PRO' : <Icon className="size-5 transition group-hover:translate-x-1 group-hover:text-primary-fg" name="arrow" />}</span>
      </div>
      <h2 className="mt-5 text-lg font-bold">{definition?.es ?? name}</h2>
      <p className="mt-2 text-sm leading-6 text-fg-subtle">{definition?.description}</p>
    </Link>
  );
}
