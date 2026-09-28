import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon, IconName } from '../../../shared/Icon';
import { getSession } from '../../auth';
import { getDashboardMetrics, DashboardMetrics } from '../../reports';
import { TrendAreaChart } from '../components/Charts';
import { LeadItem, listLeads } from '../../leads';
import { Button } from '../../../shared/ui';

const money = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  maximumFractionDigits: 0
});

export function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const loadDashboard = useCallback(() => {
    const session = getSession();
    if (!session?.companyId) {
      setLoadError(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    setLoadError(false);
    Promise.all([
      getDashboardMetrics(session.companyId, '30d'),
      listLeads()
    ])
      .then(([metricsData, leadsData]) => {
        setMetrics(metricsData);
        setLeads(leadsData);
      })
      .catch(err => {
        console.error('Error cargando dashboard:', err);
        setLoadError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  if (loading) {
    return (
      <div aria-label="Cargando tu panel" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" role="status">
        {[0, 1, 2, 3].map(item => (
          <div className="h-36 animate-pulse rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" key={item}>
            <div className="size-10 rounded-xl bg-slate-200" />
            <div className="mt-4 h-3 w-24 rounded bg-slate-200" />
            <div className="mt-3 h-7 w-32 rounded bg-slate-200" />
          </div>
        ))}
        <span className="sr-only">Cargando tu panel...</span>
      </div>
    );
  }

  if (loadError || !metrics) {
    return (
      <div className="rounded-3xl border border-rose-200 bg-rose-50 p-10 text-center text-rose-800" role="alert">
        <Icon className="mx-auto size-8" name="alert" />
        <h1 className="mt-3 text-lg font-bold">No pudimos cargar tu panel</h1>
        <p className="mt-1 text-sm text-rose-700">Revisa tu conexión e inténtalo nuevamente.</p>
        <Button className="mt-5" onClick={loadDashboard} variant="danger">
          Reintentar
        </Button>
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
            Bienvenido de vuelta
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Resumen de tu operación • Últimos 30 días
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/app/reportes">
            <Button variant="secondary" size="md">
              <Icon className="size-4" name="reports" />
              Ver reportes
            </Button>
          </Link>
          <Link to="/app/propiedades/nueva">
            <Button variant="primary" size="md">
              + Nueva propiedad
            </Button>
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
                {metrics.dueFollowUps} seguimiento{metrics.dueFollowUps > 1 ? 's' : ''} vencido{metrics.dueFollowUps > 1 ? 's' : ''}
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

          <Link to="/app/prospectos" className="mt-4 block">
            <Button variant="danger" fullWidth>
              Ver todos los seguimientos
            </Button>
          </Link>
        </section>
      )}

      {/* Todo al día - Mensaje positivo */}
      {metrics.dueFollowUps === 0 && (
        <section className="mb-6 rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-cyan-50 p-6 text-center shadow-sm">
          <div className="mx-auto mb-3 grid size-16 place-items-center rounded-full bg-emerald-600 text-white">
            <Icon className="size-8" name="workflow" />
          </div>
          <h2 className="text-xl font-bold text-emerald-900">Todo al día</h2>
          <p className="mt-2 text-sm text-emerald-700">
            No tienes seguimientos vencidos. Excelente trabajo manteniendo tu pipeline organizado.
          </p>
          <div className="mt-4 flex justify-center gap-3">
            <Link to="/app/prospectos">
              <Button variant="success">
                Ver leads
              </Button>
            </Link>
            <Link to="/app/agenda">
              <Button variant="success">
                Ver agenda
              </Button>
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

  const trendLabels = {
    up: 'Estado favorable',
    down: 'Requiere atención',
    neutral: 'Sin cambios relevantes'
  };

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="mb-4 flex items-center justify-between">
        <span className={`grid size-10 place-items-center rounded-xl text-white ${iconColor}`}>
          <Icon className="size-5" name={icon} />
        </span>
        <span className={`size-2.5 rounded-full ${trendColors[trend]} bg-current`} title={trendLabels[trend]}>
          <span className="sr-only">{trendLabels[trend]}</span>
        </span>
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
