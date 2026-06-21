import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon, IconName } from '../shared/Icon';
import { buildDashboardMetrics } from '../shared/dashboardMetrics';
import { LeadItem, LeadStatus, leadStatusLabels, listLeads } from '../shared/leads';
import {
  ApiProperty,
  formatApiPrice,
  listProperties,
  propertyStatusClass,
  propertyStatusLabel
} from '../shared/propertyApi';

const money = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  maximumFractionDigits: 0
});

const leadStages: LeadStatus[] = ['NEW', 'CONTACTED', 'QUALIFIED', 'TOUR_SCHEDULED', 'TOUR_COMPLETED', 'OFFER_MADE', 'UNDER_CONTRACT', 'CLOSED'];

export function DashboardPage() {
  const [properties, setProperties] = useState<ApiProperty[]>([]);
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const metrics = useMemo(() => buildDashboardMetrics(properties, leads), [properties, leads]);

  useEffect(() => {
    Promise.all([listProperties(), listLeads()])
      .then(([propertyItems, leadItems]) => {
        setProperties(propertyItems);
        setLeads(leadItems);
      })
      .catch(requestError => setError(requestError instanceof Error ? requestError.message : 'No fue posible cargar el dashboard.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500 shadow-sm">Calculando indicadores del negocio...</div>;
  }

  return (
    <>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.16em] text-indigo-600">Panel ejecutivo</p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Resumen de tu operación inmobiliaria</h1>
          <p className="mt-2 text-sm text-slate-500">Información calculada en tiempo real con propiedades y prospectos registrados.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-indigo-300 hover:bg-indigo-50" to="/app/prospectos">Ver prospectos</Link>
          <Link className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700" to="/app/propiedades/nueva">+ Nueva propiedad</Link>
        </div>
      </header>

      {error && <p className="mb-5 rounded-xl bg-rose-50 p-4 text-sm font-medium text-rose-700">{error}</p>}

      <section className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MoneyCard color="indigo" icon="currency" label="Inventario en venta" note={`${metrics.activeSales} propiedades activas`} value={money.format(metrics.saleInventoryMxn)} />
        <MoneyCard color="cyan" icon="finance" label="Valor vendido registrado" note={`${metrics.sold} propiedades vendidas`} value={money.format(metrics.soldValueMxn)} />
        <MoneyCard color="violet" icon="properties" label="Renta mensual ofertada" note={`${metrics.activeRentals} propiedades activas`} value={money.format(metrics.monthlyRentInventoryMxn)} />
        <MoneyCard color="emerald" icon="workflow" label="Renta mensual colocada" note={`${metrics.rented} propiedades rentadas`} value={money.format(metrics.rentedMonthlyValueMxn)} />
      </section>

      {metrics.nonMxnProperties > 0 && (
        <p className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {metrics.nonMxnProperties} {metrics.nonMxnProperties === 1 ? 'propiedad usa' : 'propiedades usan'} otra moneda y no se incluyen en los totales MXN.
        </p>
      )}

      <section className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <CountCard label="En venta" tone="cyan" value={metrics.activeSales} />
        <CountCard label="Vendidas" tone="emerald" value={metrics.sold} />
        <CountCard label="En renta" tone="violet" value={metrics.activeRentals} />
        <CountCard label="Rentadas" tone="indigo" value={metrics.rented} />
        <CountCard label="No disponibles" tone="slate" value={metrics.unavailable} />
        <CountCard label="Publicadas" tone="amber" value={metrics.published} />
      </section>

      <div className="mb-5 grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div><p className="text-[11px] font-bold uppercase tracking-[0.16em] text-indigo-600">CRM</p><h2 className="mt-1 text-xl font-bold">Embudo de prospectos</h2></div>
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-bold text-indigo-700">{metrics.leadCount} totales</span>
          </div>
          <div className="space-y-4">
            {leadStages.map(status => {
              const count = metrics.leadStatusCounts[status] ?? 0;
              const percentage = metrics.leadCount ? Math.max((count / metrics.leadCount) * 100, count ? 4 : 0) : 0;
              return (
                <div key={status}>
                  <div className="mb-1.5 flex justify-between text-sm"><span className="font-medium text-slate-600">{leadStatusLabels[status]}</span><strong>{count}</strong></div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400" style={{ width: `${percentage}%` }} /></div>
                </div>
              );
            })}
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MiniMetric label="Activos" value={metrics.openLeads} />
            <MiniMetric label="Prioridad alta" value={metrics.highPriorityLeads} />
            <MiniMetric label="Cerrados" value={metrics.closedLeads} />
            <MiniMetric label="Perdidos" value={metrics.lostLeads} />
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-slate-950 p-5 text-white shadow-sm sm:p-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-cyan-300">Seguimiento</p>
          <h2 className="mt-1 text-xl font-bold">Agenda comercial</h2>
          <div className="mt-5 rounded-2xl bg-rose-500/15 p-4">
            <span className="text-sm text-rose-100">Seguimientos vencidos</span>
            <strong className="mt-1 block text-4xl">{metrics.dueFollowUps.length}</strong>
          </div>
          <div className="mt-5 space-y-3">
            {metrics.upcomingFollowUps.slice(0, 4).map(lead => (
              <Link className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 hover:border-indigo-400" key={lead.id} to={`/app/prospectos/${lead.id}`}>
                <div className="min-w-0"><strong className="block truncate text-sm">{lead.firstName} {lead.lastName}</strong><span className="text-xs text-slate-400">{new Date(lead.nextFollowUpAt!).toLocaleString('es-MX')}</span></div>
                <Icon className="size-4 shrink-0 text-cyan-300" name="arrow" />
              </Link>
            ))}
            {metrics.upcomingFollowUps.length === 0 && <p className="rounded-xl border border-dashed border-slate-700 p-5 text-center text-sm text-slate-400">No hay seguimientos próximos programados.</p>}
          </div>
        </section>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <RecentProperties properties={properties.slice(0, 5)} />
        <RecentLeads leads={leads.slice(0, 5)} />
      </div>
    </>
  );
}

function MoneyCard({ color, icon, label, note, value }: { color: string; icon: IconName; label: string; note: string; value: string }) {
  const tones: Record<string, string> = { indigo: 'bg-indigo-600', cyan: 'bg-cyan-600', violet: 'bg-violet-600', emerald: 'bg-emerald-600' };
  return <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><span className={`mb-4 grid size-10 place-items-center rounded-xl text-white ${tones[color]}`}><Icon className="size-5" name={icon} /></span><span className="text-sm text-slate-500">{label}</span><strong className="mt-1 block text-2xl font-bold tracking-tight">{value}</strong><small className="mt-2 block text-xs font-medium text-slate-500">{note}</small></article>;
}

function CountCard({ label, tone, value }: { label: string; tone: string; value: number }) {
  const tones: Record<string, string> = { cyan: 'border-cyan-200 bg-cyan-50 text-cyan-800', emerald: 'border-emerald-200 bg-emerald-50 text-emerald-800', violet: 'border-violet-200 bg-violet-50 text-violet-800', indigo: 'border-indigo-200 bg-indigo-50 text-indigo-800', slate: 'border-slate-200 bg-white text-slate-700', amber: 'border-amber-200 bg-amber-50 text-amber-800' };
  return <article className={`rounded-2xl border p-4 shadow-sm ${tones[tone]}`}><strong className="block text-3xl">{value}</strong><span className="text-xs font-bold uppercase tracking-wide">{label}</span></article>;
}

function MiniMetric({ label, value }: { label: string; value: number }) {
  return <div className="rounded-xl bg-slate-50 p-3 text-center"><strong className="block text-xl">{value}</strong><span className="text-[11px] text-slate-500">{label}</span></div>;
}

function RecentProperties({ properties }: { properties: ApiProperty[] }) {
  return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-bold">Propiedades recientes</h2><Link className="text-sm font-semibold text-indigo-600" to="/app/propiedades">Ver todas</Link></div>{properties.map(property => <Link className="flex items-center gap-3 border-t border-slate-100 py-4 first:border-0 hover:bg-slate-50" key={property.id} to={`/app/propiedades/${property.id}/editar`}><span className="grid size-10 place-items-center rounded-xl bg-indigo-50"><Icon className="size-5 text-indigo-600" name="properties" /></span><div className="min-w-0 flex-1"><strong className="block truncate text-sm">{property.title}</strong><span className="text-xs text-slate-500">{formatApiPrice(property)}</span></div><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${propertyStatusClass(property.status)}`}>{propertyStatusLabel(property.status)}</span></Link>)}{properties.length === 0 && <EmptyState text="No hay propiedades registradas." />}</section>;
}

function RecentLeads({ leads }: { leads: LeadItem[] }) {
  return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-bold">Prospectos recientes</h2><Link className="text-sm font-semibold text-indigo-600" to="/app/prospectos">Ver todos</Link></div>{leads.map(lead => <Link className="flex items-center gap-3 border-t border-slate-100 py-4 first:border-0 hover:bg-slate-50" key={lead.id} to={`/app/prospectos/${lead.id}`}><span className="grid size-10 place-items-center rounded-full bg-cyan-50 text-xs font-bold text-cyan-700">{lead.firstName[0]}{lead.lastName[0]}</span><div className="min-w-0 flex-1"><strong className="block truncate text-sm">{lead.firstName} {lead.lastName}</strong><span className="text-xs text-slate-500">{lead.city || lead.email || 'Sin ubicación'}</span></div><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-700">{leadStatusLabels[lead.status]}</span></Link>)}{leads.length === 0 && <EmptyState text="No hay prospectos registrados." />}</section>;
}

function EmptyState({ text }: { text: string }) {
  return <p className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">{text}</p>;
}
