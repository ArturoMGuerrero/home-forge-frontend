import { useState, useEffect } from 'react';
import { getDashboardMetrics, DashboardMetrics, DateRange, dateRangeLabels } from '../api/dashboardApi';
import { getSession } from '../../auth';
import { listProperties, ApiProperty } from '../../properties';
import { listLeads, LeadItem, LeadStatus, leadStatusLabels } from '../../leads';
import { exportToExcel } from '../../../shared/excelExport';
import toast from 'react-hot-toast';
import { Icon, IconName } from '../../../shared/Icon';
import { Alert, Button, Card, CardWithHeader, LoadingState, PageHeader, Select, StatCard } from '../../../shared/ui';

const money = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  maximumFractionDigits: 0
});

export function ReportsPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [properties, setProperties] = useState<ApiProperty[]>([]);
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [dateRange]);

  async function loadData() {
    const session = getSession();
    if (!session?.companyId) return;

    setLoading(true);
    try {
      const [metricsData, propertiesData, leadsData] = await Promise.all([
        getDashboardMetrics(session.companyId, dateRange),
        listProperties(),
        listLeads()
      ]);
      setMetrics(metricsData);
      setProperties(propertiesData);
      setLeads(leadsData);
    } catch (error) {
      toast.error('Error al cargar datos del reporte');
    } finally {
      setLoading(false);
    }
  }

  function exportSalesReport() {
    if (!metrics) return;

    const data = Object.values(metrics.dailyMetrics).map(day => ({
      'Fecha': day.date,
      'Propiedades Vendidas': day.soldProperties,
      'Valor Vendido (MXN)': day.salesValue,
      'Leads Cerrados': day.closedLeads
    }));

    exportToExcel(data, `Reporte_Ventas_${dateRangeLabels[dateRange]}.xlsx`);
    toast.success('Reporte de ventas exportado');
  }

  function exportPropertiesReport() {
    const data = properties.map(p => ({
      'ID': p.id,
      'Título': p.title,
      'Tipo': p.listingType === 'SALE' ? 'Venta' : 'Renta',
      'Estado': p.status,
      'Precio': p.price,
      'Moneda': p.currencyCode,
      'Ciudad': p.city,
      'Recámaras': p.bedrooms,
      'Baños': p.bathrooms,
      'Superficie (m²)': p.constructionArea,
      'Publicada': p.published ? 'Sí' : 'No',
      'Fecha Creación': new Date(p.createdAt).toLocaleDateString('es-MX')
    }));

    exportToExcel(data, `Reporte_Propiedades_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success(`${data.length} propiedades exportadas`);
  }

  function exportLeadsReport() {
    const data = leads.map(l => ({
      'ID': l.id,
      'Nombre': `${l.firstName} ${l.lastName}`,
      'Email': l.email || '',
      'Teléfono': l.phoneE164 || '',
      'Estado': l.status,
      'Prioridad': l.priority,
      'Ciudad': l.city || '',
      'Presupuesto mínimo': l.budgetMin || 0,
      'Presupuesto máximo': l.budgetMax || 0,
      'Tipo de Propiedad': l.propertyType || '',
      'Origen': l.source || '',
      'Asignado a': l.assignedTo || '',
      'Fecha Creación': new Date(l.createdAt).toLocaleDateString('es-MX'),
      'Próximo Seguimiento': l.nextFollowUpAt ? new Date(l.nextFollowUpAt).toLocaleDateString('es-MX') : ''
    }));

    exportToExcel(data, `Reporte_Leads_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success(`${data.length} leads exportados`);
  }

  function exportFullReport() {
    if (!metrics) return;

    const summary = [{
      'Reporte': 'Resumen Ejecutivo',
      'Período': `${new Date(metrics.startDate).toLocaleDateString()} - ${new Date(metrics.endDate).toLocaleDateString()}`,
      '': '',
      'PROPIEDADES': '',
      'Total Propiedades': metrics.totalProperties,
      'En Venta Activas': metrics.activeSales,
      'Vendidas': metrics.soldProperties,
      'En Renta Activas': metrics.activeRentals,
      'Rentadas': metrics.rentedProperties,
      'Valor Inventario Venta': money.format(metrics.saleInventoryValue),
      'Valor Total Vendido': money.format(metrics.soldValue),
      '  ': '',
      'LEADS': '',
      'Total Leads': metrics.totalLeads,
      'Leads Activos': metrics.openLeads,
      'Leads Cerrados': metrics.closedLeads,
      'Leads Perdidos': metrics.lostLeads,
      'Alta Prioridad': metrics.highPriorityLeads,
      'Seguimientos Vencidos': metrics.dueFollowUps,
      '   ': '',
      'CONVERSIÓN': '',
      'Tasa Lead a Cierre': `${metrics.leadToClosedRate.toFixed(2)}%`,
      'Tasa Propiedad Vendida': `${metrics.propertyToSoldRate.toFixed(2)}%`
    }];

    exportToExcel(summary, `Reporte_Completo_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Reporte completo exportado');
  }

  if (loading) {
    return <Card><LoadingState message="Cargando reportes..." /></Card>;
  }

  if (!metrics) {
    return <Alert variant="error">No se pudieron cargar los datos.</Alert>;
  }

  return (
    <>
      <PageHeader
        actions={
          <Select
            aria-label="Período del reporte"
            containerClassName="w-56"
            onChange={e => setDateRange(e.target.value as DateRange)}
            options={(Object.keys(dateRangeLabels) as DateRange[]).filter(key => key !== 'custom').map(key => ({ value: key, label: dateRangeLabels[key] }))}
            value={dateRange}
          />
        }
        subtitle={`Del ${new Date(metrics.startDate).toLocaleDateString('es-MX')} al ${new Date(metrics.endDate).toLocaleDateString('es-MX')}`}
        title="Reportes y análisis"
      />

      <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Icon name="currency" />} label="Valor vendido" tone="primary" value={money.format(metrics.soldValue)} />
        <StatCard icon={<Icon name="properties" />} label="Propiedades vendidas" tone="success" value={metrics.soldProperties} />
        <StatCard icon={<Icon name="leads" />} label="Leads cerrados" tone="info" value={metrics.closedLeads} />
        <StatCard icon={<Icon name="finance" />} label="Tasa de cierre" tone="accent" value={`${metrics.leadToClosedRate.toFixed(1)}%`} />
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <ReportCard
          description="Ventas diarias, valores y conversiones"
          icon="currency"
          onExport={exportSalesReport}
          stats={[
            { label: 'Propiedades vendidas', value: metrics.soldProperties },
            { label: 'Valor total', value: money.format(metrics.soldValue) }
          ]}
          title="Reporte de ventas"
        />
        <ReportCard
          description="Listado completo de inventario"
          icon="properties"
          onExport={exportPropertiesReport}
          stats={[
            { label: 'Total propiedades', value: properties.length },
            { label: 'Activas en venta', value: metrics.activeSales }
          ]}
          title="Reporte de propiedades"
        />
        <ReportCard
          description="Base de datos completa de prospectos"
          icon="leads"
          onExport={exportLeadsReport}
          stats={[
            { label: 'Total leads', value: leads.length },
            { label: 'Activos', value: metrics.openLeads }
          ]}
          title="Reporte de leads"
        />
        <ReportCard
          description="Resumen ejecutivo de todas las métricas"
          icon="reports"
          onExport={exportFullReport}
          stats={[
            { label: 'Período', value: dateRangeLabels[dateRange] },
            { label: 'Tasa de cierre', value: `${metrics.leadToClosedRate.toFixed(1)}%` }
          ]}
          title="Reporte completo"
        />
      </div>

      <CardWithHeader className="mt-6" subtitle="Distribución de prospectos en el período" title="Leads por etapa">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(metrics.leadsByStatus).map(([status, count]) => (
            <div className="rounded-xl bg-surface-muted p-3.5" key={status}>
              <strong className="block text-2xl font-bold tabular-nums text-fg">{count}</strong>
              <span className="text-sm text-fg-subtle">{leadStatusLabels[status as LeadStatus] ?? status}</span>
            </div>
          ))}
        </div>
      </CardWithHeader>
    </>
  );
}

type ReportCardProps = {
  icon: IconName;
  title: string;
  description: string;
  stats: { label: string; value: string | number }[];
  onExport: () => void;
};

function ReportCard({ icon, title, description, stats, onExport }: ReportCardProps) {
  return (
    <Card className="flex flex-col">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary-fg">
          <Icon className="size-5" name={icon} />
        </span>
        <div>
          <h3 className="font-semibold text-fg">{title}</h3>
          <p className="text-sm text-fg-subtle">{description}</p>
        </div>
      </div>

      <dl className="my-5 space-y-2 text-sm">
        {stats.map(stat => (
          <div className="flex justify-between gap-3" key={stat.label}>
            <dt className="text-fg-subtle">{stat.label}</dt>
            <dd className="font-semibold tabular-nums text-fg">{stat.value}</dd>
          </div>
        ))}
      </dl>

      <Button
        className="mt-auto"
        fullWidth
        icon={<svg aria-hidden="true" className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>}
        onClick={onExport}
        variant="tertiary"
      >
        Exportar a Excel
      </Button>
    </Card>
  );
}
