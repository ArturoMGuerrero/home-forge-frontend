import { useState, useEffect } from 'react';
import { getDashboardMetrics, DashboardMetrics, DateRange, dateRangeLabels } from '../shared/dashboardApi';
import { getSession } from '../shared/auth';
import { listProperties, ApiProperty } from '../shared/propertyApi';
import { listLeads, LeadItem } from '../shared/leads';
import { exportToExcel } from '../shared/excelExport';
import toast from 'react-hot-toast';
import { Button, Select, Spinner } from '../shared/ui';

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
      'Superficie (m²)': p.areaSqm,
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
      'Presupuesto': l.budgetAmount || 0,
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
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!metrics) {
    return <div className="rounded-3xl border border-rose-200 bg-rose-50 p-12 text-center text-sm text-rose-700">No se pudieron cargar los datos</div>;
  }

  return (
    <>
      <header className="mb-8">
        <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.16em] text-indigo-600">Reportes</p>
        <h1 className="text-3xl font-bold">Reportes y Análisis</h1>
        <p className="mt-2 text-sm text-slate-500">Exporta y analiza datos de tu operación inmobiliaria</p>
      </header>

      {/* Selector de rango */}
      <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <Select
          label="Período del reporte"
          value={dateRange}
          onChange={e => setDateRange(e.target.value as DateRange)}
        >
          {(Object.keys(dateRangeLabels) as DateRange[]).filter(key => key !== 'custom').map(key => (
            <option key={key} value={key}>{dateRangeLabels[key]}</option>
          ))}
        </Select>
        <p className="mt-2 text-xs text-slate-500">
          Del {new Date(metrics.startDate).toLocaleDateString('es-MX')} al {new Date(metrics.endDate).toLocaleDateString('es-MX')}
        </p>
      </section>

      {/* Resumen ejecutivo */}
      <section className="mb-6 rounded-2xl border border-slate-200 bg-gradient-to-br from-indigo-600 to-violet-600 p-8 text-white shadow-lg">
        <h2 className="text-2xl font-bold">Resumen Ejecutivo</h2>
        <p className="mt-1 text-sm text-indigo-100">Indicadores clave de tu negocio</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Valor vendido" value={money.format(metrics.soldValue)} />
          <StatCard label="Propiedades vendidas" value={metrics.soldProperties.toString()} />
          <StatCard label="Leads cerrados" value={metrics.closedLeads.toString()} />
          <StatCard label="Tasa de cierre" value={`${metrics.leadToClosedRate.toFixed(1)}%`} />
        </div>
      </section>

      {/* Reportes disponibles */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ReportCard
          icon="📊"
          title="Reporte de Ventas"
          description="Ventas diarias, valores y conversiones"
          stats={[
            { label: 'Propiedades vendidas', value: metrics.soldProperties },
            { label: 'Valor total', value: money.format(metrics.soldValue) }
          ]}
          onExport={exportSalesReport}
        />

        <ReportCard
          icon="🏠"
          title="Reporte de Propiedades"
          description="Listado completo de inventario"
          stats={[
            { label: 'Total propiedades', value: properties.length },
            { label: 'Activas en venta', value: metrics.activeSales }
          ]}
          onExport={exportPropertiesReport}
        />

        <ReportCard
          icon="👥"
          title="Reporte de Leads"
          description="Base de datos completa de prospectos"
          stats={[
            { label: 'Total leads', value: leads.length },
            { label: 'Activos', value: metrics.openLeads }
          ]}
          onExport={exportLeadsReport}
        />

        <ReportCard
          icon="📈"
          title="Reporte Completo"
          description="Resumen ejecutivo de todas las métricas"
          stats={[
            { label: 'Período', value: dateRangeLabels[dateRange] },
            { label: 'Tasa de cierre', value: `${metrics.leadToClosedRate.toFixed(1)}%` }
          ]}
          onExport={exportFullReport}
        />
      </div>

      {/* Métricas detalladas */}
      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-bold">Desglose por Estado</h2>

        <div className="mb-6">
          <h3 className="mb-3 text-sm font-semibold text-slate-700">Leads por Estado</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(metrics.leadsByStatus).map(([status, count]) => (
              <div key={status} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <strong className="block text-2xl">{count}</strong>
                <span className="text-xs text-slate-600">{status}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/10 p-4 backdrop-blur">
      <span className="text-sm text-indigo-100">{label}</span>
      <strong className="mt-1 block text-2xl">{value}</strong>
    </div>
  );
}

type ReportCardProps = {
  icon: string;
  title: string;
  description: string;
  stats: { label: string; value: string | number }[];
  onExport: () => void;
};

function ReportCard({ icon, title, description, stats, onExport }: ReportCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <span className="text-3xl">{icon}</span>
          <h3 className="mt-2 text-lg font-bold">{title}</h3>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
      </div>

      <div className="mb-4 space-y-2">
        {stats.map(stat => (
          <div key={stat.label} className="flex justify-between text-sm">
            <span className="text-slate-600">{stat.label}</span>
            <strong className="text-slate-900">{stat.value}</strong>
          </div>
        ))}
      </div>

      <Button
        onClick={onExport}
        variant="primary"
        fullWidth
        icon={
          <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        }
      >
        Exportar a Excel
      </Button>
    </article>
  );
}
