import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon, IconName } from '../../../shared/Icon';
import { getSession } from '../../auth';
import { getDashboardMetrics, DashboardMetrics } from '../../reports';
import { TrendAreaChart } from '../components/Charts';
import { LeadItem, listLeads } from '../../leads';
import { Avatar, Button, buttonClasses, Card, cardClass, CardWithHeader, cn, EmptyState, PageHeader, Skeleton, StatCard } from '../../../shared/ui';

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
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  if (loading) {
    return (
      <div aria-label="Cargando tu panel" role="status">
        <Skeleton className="mb-8 h-16 w-72" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map(item => <Skeleton className="h-32 rounded-2xl" key={item} />)}
        </div>
        <Skeleton className="mt-6 h-72 rounded-2xl" />
        <span className="sr-only">Cargando tu panel...</span>
      </div>
    );
  }

  if (loadError || !metrics) {
    return (
      <Card className="border-danger-line">
        <EmptyState
          actions={<Button onClick={loadDashboard} variant="tertiary">Reintentar</Button>}
          description="Revisa tu conexión e inténtalo nuevamente."
          icon={<Icon name="alert" />}
          title="No pudimos cargar tu panel"
        />
      </Card>
    );
  }

  const chartData = Object.values(metrics.dailyMetrics).map(day => ({
    name: new Date(day.date).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' }),
    'Valor Vendido': Math.round(day.salesValue)
  }));

  const now = new Date();
  const urgentLeads = leads
    .filter(l => l.nextFollowUpAt && new Date(l.nextFollowUpAt) <= now)
    .slice(0, 5);
  const firstName = getSession()?.name?.split(' ')[0];

  return (
    <>
      <PageHeader
        actions={
          <>
            <Link className={buttonClasses({ variant: 'tertiary' })} to="/app/reportes">
              <Icon className="size-4" name="reports" />
              Ver reportes
            </Link>
            <Link className={buttonClasses()} to="/app/propiedades/nueva">
              <Icon className="size-4" name="plus" />
              Nueva propiedad
            </Link>
          </>
        }
        eyebrow="Panel ejecutivo"
        subtitle="Resumen de tu operación · Últimos 30 días"
        title={firstName ? `Hola, ${firstName}` : 'Bienvenido de vuelta'}
      />

      <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard hint={`${metrics.soldProperties} propiedades vendidas`} icon={<Icon name="currency" />} label="Valor vendido" tone="primary" value={money.format(metrics.soldValue)} />
        <StatCard hint={`${metrics.closedLeads} cerrados este mes`} icon={<Icon name="workflow" />} label="Leads activos" to="/app/prospectos" tone="info" value={metrics.openLeads} />
        <StatCard hint={`${metrics.closedLeads} de ${metrics.totalLeads} leads`} icon={<Icon name="finance" />} label="Tasa de cierre" tone="accent" value={`${metrics.leadToClosedRate.toFixed(1)}%`} />
        <StatCard
          hint={metrics.dueFollowUps > 0 ? 'seguimientos vencidos' : 'todo al día'}
          icon={<Icon name="alert" />}
          label="Urgente hoy"
          to="/app/prospectos/tareas"
          tone={metrics.dueFollowUps > 0 ? 'danger' : 'success'}
          value={metrics.dueFollowUps}
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <CardWithHeader
          actions={<Link className="text-sm font-medium text-primary-fg hover:underline" to="/app/reportes">Ver más</Link>}
          subtitle="Valor vendido en los últimos 30 días"
          title="Tendencia de ventas"
        >
          <TrendAreaChart
            areas={[{ key: 'Valor Vendido', name: 'Valor vendido (MXN)', color: '#6366f1' }]}
            data={chartData}
            height={240}
          />
        </CardWithHeader>

        <CardWithHeader
          subtitle={metrics.dueFollowUps > 0 ? 'Requieren tu atención' : 'Sin pendientes vencidos'}
          title="Seguimientos"
        >
          {urgentLeads.length > 0 ? (
            <>
              <ul className="-mx-2 space-y-1">
                {urgentLeads.map(lead => {
                  const daysLate = Math.floor((now.getTime() - new Date(lead.nextFollowUpAt!).getTime()) / 86_400_000);
                  return (
                    <li key={lead.id}>
                      <Link className="flex items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-surface-muted" to={`/app/prospectos/${lead.id}`}>
                        <Avatar name={`${lead.firstName} ${lead.lastName}`} size="sm" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-fg">{lead.firstName} {lead.lastName}</span>
                          <span className="text-xs text-danger-fg">{daysLate <= 0 ? 'Vence hoy' : `Vencido hace ${daysLate} ${daysLate === 1 ? 'día' : 'días'}`}</span>
                        </span>
                        <Icon className="size-4 shrink-0 text-fg-subtle" name="arrow" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <Link className={buttonClasses({ variant: 'tertiary', size: 'sm', fullWidth: true, className: 'mt-4' })} to="/app/prospectos/tareas">
                Ver todos los seguimientos
              </Link>
            </>
          ) : (
            <EmptyState
              actions={<Link className={buttonClasses({ variant: 'tertiary', size: 'sm' })} to="/app/agenda">Ver agenda</Link>}
              className="py-6"
              description="Excelente trabajo manteniendo tu pipeline organizado."
              icon={<Icon name="check" />}
              title="Todo al día"
            />
          )}
        </CardWithHeader>
      </div>

      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        <QuickAccessCard description={`${metrics.activeSales} en venta · ${metrics.activeRentals} en renta`} icon="properties" link="/app/propiedades" title="Propiedades" />
        <QuickAccessCard description={`${metrics.openLeads} activos · ${metrics.highPriorityLeads} prioridad alta`} icon="leads" link="/app/prospectos" title="Prospectos" />
        <QuickAccessCard description={`${metrics.upcomingFollowUps} próximos seguimientos`} icon="calendar" link="/app/agenda" title="Agenda" />
      </section>
    </>
  );
}

type QuickAccessCardProps = {
  icon: IconName;
  title: string;
  description: string;
  link: string;
};

function QuickAccessCard({ icon, title, description, link }: QuickAccessCardProps) {
  return (
    <Link
      className={cn(cardClass, 'group flex items-center gap-4 p-4 transition hover:border-primary-line hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary')}
      to={link}
    >
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary-fg">
        <Icon className="size-5" name={icon} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold text-fg">{title}</span>
        <span className="block truncate text-sm text-fg-subtle">{description}</span>
      </span>
      <Icon className="size-4 shrink-0 text-fg-subtle transition group-hover:translate-x-0.5" name="arrow" />
    </Link>
  );
}
