import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CatalogIndex, catalogLabels, primaryCatalogs, workflowCatalogs } from '../shared/catalogs';
import { Icon, IconName } from '../shared/Icon';
import { getJson } from '../shared/services/api';
import { getSubscription, Subscription } from '../shared/subscriptionApi';

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
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getJson<CatalogIndex>('/catalogs'), getSubscription()])
      .then(([response, subscriptionResponse]) => {
        setCatalogs(response.catalogs);
        setSubscription(subscriptionResponse);
      })
      .catch(() => setError('No fue posible consultar la configuración del backend.'))
      .finally(() => setLoading(false));
  }, []);

  const starter = subscription?.planCode === 'STARTER' && subscription.status !== 'TRIAL';
  const primary = primaryCatalogs.filter(name => catalogs.includes(name));
  const workflows = workflowCatalogs.filter(name => catalogs.includes(name));

  return (
    <>
      <header className="mb-8">
        <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.16em] text-indigo-600">Administración</p>
        <h1 className="text-3xl font-bold">Configuración</h1>
        <p className="mt-2 text-sm text-slate-500">Catálogos de uso cotidiano y opciones técnicas del flujo de trabajo.</p>
      </header>

      {loading && <p className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">Cargando configuración...</p>}
      {error && <p className="rounded-xl bg-rose-50 p-4 text-sm font-medium text-rose-700">{error}</p>}

      {!loading && !error && (
        <>
          <section className="mb-10">
            <div className="mb-5">
              <h2 className="text-xl font-bold">Empresa</h2>
              <p className="mt-1 text-sm text-slate-500">Información institucional y de contacto que verán tus clientes.</p>
            </div>
            <Link className="group block max-w-xl rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-600 to-slate-950 p-6 text-white shadow-lg shadow-indigo-100 transition hover:-translate-y-0.5" to="/app/configuracion/empresa">
              <div className="flex items-start justify-between gap-4">
                <span className="grid size-11 place-items-center rounded-xl bg-white/10"><Icon className="size-5" name="properties" /></span>
                <Icon className="size-5 text-indigo-200 transition group-hover:translate-x-1" name="arrow" />
              </div>
              <h2 className="mt-5 text-lg font-bold">Perfil público de la empresa</h2>
              <p className="mt-2 text-sm leading-6 text-indigo-100">Configura dirección, misión, visión, experiencia, licencia profesional y datos de contacto.</p>
            </Link>
          </section>

          <section>
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold">Catálogos principales</h2>
                <p className="mt-1 text-sm text-slate-500">Opciones que se usan al registrar prospectos, propiedades y expedientes.</p>
              </div>
              {starter && <Link className="rounded-xl bg-amber-100 px-3 py-2 text-xs font-bold text-amber-800" to="/app/planes">Disponible desde Pro</Link>}
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {primary.map(name => <CatalogCard key={name} locked={starter} name={name} />)}
            </div>
          </section>

          <details className={`mt-10 rounded-2xl border bg-white shadow-sm ${starter ? 'border-amber-200 opacity-75' : 'border-slate-200'}`}>
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5">
              <div className="flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-xl bg-slate-100 text-slate-600"><Icon className="size-5" name="workflow" /></span>
                <div><h2 className="font-bold">Flujos del sistema</h2><p className="mt-1 text-sm text-slate-500">Estados internos usados por los procesos de HomeForge.</p></div>
              </div>
              <span className="text-xs font-semibold text-slate-400">{starter ? 'Plan Pro' : `${workflows.length} catálogos`}</span>
            </summary>
            <div className="grid gap-3 border-t border-slate-100 p-5 sm:grid-cols-2 xl:grid-cols-3">
              {workflows.map(name => (
                <Link className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:border-indigo-300 hover:bg-indigo-50" key={name} to={starter ? '/app/planes' : `/app/configuracion/catalogos/${name}`}>
                  {catalogLabels[name]?.es ?? name}
                  <Icon className="size-4 text-slate-400" name="arrow" />
                </Link>
              ))}
            </div>
          </details>
        </>
      )}
    </>
  );
}

function CatalogCard({ name, locked }: { name: string; locked: boolean }) {
  const definition = catalogLabels[name];
  return (
    <Link className={`group rounded-2xl border bg-white p-5 shadow-sm transition ${locked ? 'border-amber-200 opacity-75' : 'border-slate-200 hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md'}`} to={locked ? '/app/planes' : `/app/configuracion/catalogos/${name}`}>
      <div className="flex items-start justify-between gap-4">
        <span className="grid size-11 place-items-center rounded-xl bg-indigo-100 text-indigo-700"><Icon className="size-5" name={catalogIcons[name] ?? 'settings'} /></span>
        <span className={`text-xs font-bold ${locked ? 'text-amber-600' : 'text-slate-300'}`}>{locked ? 'PRO' : <Icon className="size-5 transition group-hover:translate-x-1 group-hover:text-indigo-600" name="arrow" />}</span>
      </div>
      <h2 className="mt-5 text-lg font-bold">{definition?.es ?? name}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-500">{definition?.description}</p>
    </Link>
  );
}
