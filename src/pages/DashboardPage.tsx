import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon, IconName } from '../shared/Icon';
import { getSession } from '../shared/auth';
import { getDashboardMetrics, DashboardMetrics } from '../shared/dashboardApi';
import { TrendAreaChart } from '../components/Charts';
import { LeadItem, listLeads } from '../shared/leads';

const money = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  maximumFractionDigits: 0
});

export function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getSession();
    if (!session?.companyId) {
      setLoading(false);
      return;
    }

    Promise.all([
      getDashboardMetrics(session.companyId, '30d'),
      listLeads()
    ])
      .then(([metricsData, leadsData]) => {
        setMetrics(metricsData);
        setLeads(leadsData);
      })
      .catch(err => console.error('Error cargando dashboard:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500 shadow-sm">
        Cargando tu panel...
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="rounded-3xl border border-rose-200 bg-rose-50 p-12 text-center text-sm text-rose-700">
        No se pudieron cargar las métricas
      </div>
    );
  }

  // Preparar datos para la gráfica (últimos 30 días)
  const chartData = Object.values(metrics.dailyMetrics).map(day => ({
    name: new Date(day.date).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' }),
    'Valor Vendido': Math.round(day.salesValue)
  }));

  // Seguimientos urgentes (vencidos hoy)
  const now = new Date();
  const urgentLeads = leads
    .filter(l => l.nextFollowUpAt && new Date(l.nextFollowUpAt) <= now)
    .slice(0, 5);

  return (
    <>
      {/* Header */}
      <header className="mb-8 flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.16em] text-indigo-600">
            Panel ejecutivo
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            ¡Bienvenido de vuelta! 👋
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Resumen de tu operación • Últimos 30 días
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-indigo-300 hover:bg-indigo-50"
            to="/app/reportes"
          >
            📊 Ver reportes
          </Link>
          <Link
            className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
            to="/app/propiedades/nueva"
          >
            + Nueva propiedad
          </Link>
        </div>
      </header>

      {/* 4 KPIs Principales */}
      <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          icon="currency"
          iconColor="bg-indigo-600"
          label="Valor vendido"
          value={money.format(metrics.soldValue)}
          sublabel={`${metrics.soldProperties} propiedades vendidas`}
          trend={metrics.soldProperties > 0 ? 'up' : 'neutral'}
        />

        <KpiCard
          icon="workflow"
          iconColor="bg-cyan-600"
          label="Leads activos"
          value={metrics.openLeads.toString()}
          sublabel={`${metrics.closedLeads} cerrados este mes`}
          trend={metrics.openLeads > metrics.closedLeads ? 'up' : 'neutral'}
        />

        <KpiCard
          icon="finance"
          iconColor="bg-violet-600"
          label="Tasa de cierre"
          value={`${metrics.leadToClosedRate.toFixed(1)}%`}
          sublabel={`${metrics.closedLeads} de ${metrics.totalLeads} leads`}
          trend={metrics.leadToClosedRate > 20 ? 'up' : metrics.leadToClosedRate > 10 ? 'neutral' : 'down'}
        />

        <KpiCard
          icon="alert"
          iconColor={metrics.dueFollowUps > 0 ? 'bg-rose-600' : 'bg-emerald-600'}
          label="Urgente hoy"
          value={metrics.dueFollowUps.toString()}
          sublabel={metrics.dueFollowUps > 0 ? 'seguimientos vencidos' : 'todo al día'}
          trend={metrics.dueFollowUps > 0 ? 'down' : 'up'}
        />
      </section>

      {/* Gráfica de Tendencia */}
      <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold">Tendencia de Ventas</h2>
            <p className="text-sm text-slate-500">Valor vendido en los últimos 30 días</p>
          </div>
          <Link
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
            to="/app/reportes"
          >
            Ver más →
          </Link>
        </div>
        <TrendAreaChart
          data={chartData}
          areas={[
            { key: 'Valor Vendido', name: 'Valor Vendido (MXN)', color: '#10b981' }
          ]}
          height={200}
        />
      </section>

      {/* Seguimientos Urgentes */}
      {metrics.dueFollowUps > 0 && (
        <section className="mb-6 rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-50 to-orange-50 p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-rose-600 text-white">
              <Icon className="size-5" name="alert" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-rose-900">
                ⚠️ {metrics.dueFollowUps} seguimiento{metrics.dueFollowUps > 1 ? 's' : ''} vencido{metrics.dueFollowUps > 1 ? 's' : ''}
              </h2>
              <p className="text-sm text-rose-700">Requieren tu atención inmediata</p>
            </div>
          </div>

          <div className="space-y-2">
            {urgentLeads.map(lead => (
              <Link
                key={lead.id}
                to={`/app/prospectos/${lead.id}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-rose-200 bg-white px-4 py-3 hover:border-rose-300 hover:bg-rose-50"
              >
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-full bg-rose-100 text-xs font-bold text-rose-700">
                    {lead.firstName[0]}{lead.lastName[0]}
                  </span>
                  <div className="min-w-0">
                    <strong className="block truncate text-sm text-rose-900">
                      {lead.firstName} {lead.lastName}
                    </strong>
                    <span className="text-xs text-rose-600">
                      {lead.nextFollowUpAt
                        ? `Vencido hace ${Math.floor((now.getTime() - new Date(lead.nextFollowUpAt).getTime()) / (1000 * 60 * 60 * 24))} días`
                        : 'Sin fecha'
                      }
                    </span>
                  </div>
                </div>
                <Icon className="size-4 shrink-0 text-rose-600" name="arrow" />
              </Link>
            ))}
          </div>

          <Link
            to="/app/prospectos"
            className="mt-4 block rounded-xl bg-rose-600 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-rose-700"
          >
            Ver todos los seguimientos
          </Link>
        </section>
      )}

      {/* Todo al día - Mensaje positivo */}
      {metrics.dueFollowUps === 0 && (
        <section className="mb-6 rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-cyan-50 p-6 text-center shadow-sm">
          <div className="mx-auto mb-3 grid size-16 place-items-center rounded-full bg-emerald-600 text-white">
            <Icon className="size-8" name="workflow" />
          </div>
          <h2 className="text-xl font-bold text-emerald-900">¡Todo al día! 🎉</h2>
          <p className="mt-2 text-sm text-emerald-700">
            No tienes seguimientos vencidos. Excelente trabajo manteniendo tu pipeline organizado.
          </p>
          <div className="mt-4 flex justify-center gap-3">
            <Link
              to="/app/prospectos"
              className="rounded-xl border border-emerald-600 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
            >
              Ver leads
            </Link>
            <Link
              to="/app/agenda"
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Ver agenda
            </Link>
          </div>
        </section>
      )}

      {/* Accesos Rápidos */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <QuickAccessCard
          icon="properties"
          title="Propiedades"
          description={`${metrics.activeSales} en venta • ${metrics.activeRentals} en renta`}
          link="/app/propiedades"
          color="indigo"
        />

        <QuickAccessCard
          icon="workflow"
          title="CRM de Leads"
          description={`${metrics.openLeads} activos • ${metrics.highPriorityLeads} prioridad alta`}
          link="/app/prospectos"
          color="cyan"
        />

        <QuickAccessCard
          icon="calendar"
          title="Agenda"
          description={`${metrics.upcomingFollowUps} próximos seguimientos`}
          link="/app/agenda"
          color="violet"
        />
      </section>
    </>
  );
}

// Componente KPI Card
type KpiCardProps = {
  icon: IconName;
  iconColor: string;
  label: string;
  value: string;
  sublabel: string;
  trend: 'up' | 'down' | 'neutral';
};

function KpiCard({ icon, iconColor, label, value, sublabel, trend }: KpiCardProps) {
  const trendColors = {
    up: 'text-emerald-600',
    down: 'text-rose-600',
    neutral: 'text-slate-500'
  };

  const trendIcons = {
    up: '↗',
    down: '↘',
    neutral: '→'
  };

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="mb-4 flex items-center justify-between">
        <span className={`grid size-10 place-items-center rounded-xl text-white ${iconColor}`}>
          <Icon className="size-5" name={icon} />
        </span>
        <span className={`text-2xl ${trendColors[trend]}`}>{trendIcons[trend]}</span>
      </div>
      <span className="text-sm text-slate-500">{label}</span>
      <strong className="mt-1 block text-2xl font-bold tracking-tight">{value}</strong>
      <small className="mt-2 block text-xs font-medium text-slate-500">{sublabel}</small>
    </article>
  );
}

// Componente Quick Access Card
type QuickAccessCardProps = {
  icon: IconName;
  title: string;
  description: string;
  link: string;
  color: 'indigo' | 'cyan' | 'violet';
};

function QuickAccessCard({ icon, title, description, link, color }: QuickAccessCardProps) {
  const colors = {
    indigo: 'border-indigo-200 bg-indigo-50 text-indigo-600 hover:bg-indigo-100',
    cyan: 'border-cyan-200 bg-cyan-50 text-cyan-600 hover:bg-cyan-100',
    violet: 'border-violet-200 bg-violet-50 text-violet-600 hover:bg-violet-100'
  };

  return (
    <Link
      to={link}
      className={`rounded-2xl border p-5 shadow-sm transition-all hover:shadow-md ${colors[color]}`}
    >
      <Icon className="mb-3 size-8" name={icon} />
      <h3 className="font-bold">{title}</h3>
      <p className="mt-1 text-sm opacity-80">{description}</p>
    </Link>
  );
}
