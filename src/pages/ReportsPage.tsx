import { useEffect, useMemo, useState } from 'react';
import { buildDashboardMetrics } from '../shared/dashboardMetrics';
import { LeadItem, listLeads } from '../shared/leads';
import { Appointment, listAppointments, listDocuments, listMatches, PropertyMatch, StoredDocument } from '../shared/operationsApi';
import { ApiProperty, listProperties, propertyStatusLabel } from '../shared/propertyApi';

const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });

export function ReportsPage() {
  const [properties, setProperties] = useState<ApiProperty[]>([]);
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [matches, setMatches] = useState<PropertyMatch[]>([]);
  const [documents, setDocuments] = useState<StoredDocument[]>([]);
  const [error, setError] = useState('');
  const metrics = useMemo(() => buildDashboardMetrics(properties, leads), [properties, leads]);

  useEffect(() => { Promise.all([listProperties(), listLeads(), listAppointments(), listMatches(), listDocuments()]).then(([p, l, a, m, d]) => { setProperties(p); setLeads(l); setAppointments(a); setMatches(m); setDocuments(d); }).catch(e => setError(e.message)); }, []);

  function exportCsv() {
    const rows = [
      ['Indicador', 'Valor'],
      ['Propiedades', properties.length],
      ['Propiedades en venta', metrics.activeSales],
      ['Propiedades vendidas', metrics.sold],
      ['Propiedades en renta', metrics.activeRentals],
      ['Propiedades rentadas', metrics.rented],
      ['Inventario venta MXN', metrics.saleInventoryMxn],
      ['Valor vendido MXN', metrics.soldValueMxn],
      ['Prospectos', leads.length],
      ['Prospectos activos', metrics.openLeads],
      ['Citas', appointments.length],
      ['Asignaciones', matches.length],
      ['Documentos', documents.length]
    ];
    const csv = rows.map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `reporte-homeforge-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const statusCounts = properties.reduce<Record<string, number>>((result, property) => { result[property.status] = (result[property.status] ?? 0) + 1; return result; }, {});
  return <><header className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="text-[11px] font-bold uppercase tracking-[.16em] text-indigo-600">Análisis</p><h1 className="mt-1 text-3xl font-bold">Reportes</h1><p className="mt-2 text-sm text-slate-500">Indicadores operativos consolidados desde la información registrada.</p></div><button className="rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white" onClick={exportCsv}>Exportar CSV</button></header>{error && <p className="mb-5 rounded-xl bg-rose-50 p-4 text-sm text-rose-700">{error}</p>}<section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><ReportCard label="Inventario de venta" value={money.format(metrics.saleInventoryMxn)} /><ReportCard label="Valor vendido" value={money.format(metrics.soldValueMxn)} /><ReportCard label="Renta mensual ofertada" value={money.format(metrics.monthlyRentInventoryMxn)} /><ReportCard label="Renta mensual colocada" value={money.format(metrics.rentedMonthlyValueMxn)} /></section><div className="mt-6 grid gap-6 lg:grid-cols-2"><ReportBlock title="Inventario por estado" values={statusCounts} translateStatus /><ReportBlock title="Actividad comercial" values={{ 'Prospectos activos': metrics.openLeads, 'Seguimientos vencidos': metrics.dueFollowUps.length, 'Citas programadas': appointments.filter(item => item.status === 'SCHEDULED').length, 'Propiedades asignadas': matches.length, 'Documentos guardados': documents.length }} /></div><section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-xl font-bold">Conversión comercial</h2><div className="mt-5 grid gap-4 sm:grid-cols-3"><ReportCard label="Prospectos totales" value={String(metrics.leadCount)} /><ReportCard label="Operaciones cerradas" value={String(metrics.closedLeads)} /><ReportCard label="Tasa de cierre" value={`${metrics.leadCount ? ((metrics.closedLeads / metrics.leadCount) * 100).toFixed(1) : '0.0'}%`} /></div></section></>;
}

function ReportCard({ label, value }: { label: string; value: string }) {
  return <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><span className="text-sm text-slate-500">{label}</span><strong className="mt-2 block text-2xl font-bold">{value}</strong></article>;
}

function ReportBlock({ title, values, translateStatus }: { title: string; values: Record<string, number>; translateStatus?: boolean }) {
  const max = Math.max(1, ...Object.values(values));
  return <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-xl font-bold">{title}</h2><div className="mt-5 space-y-4">{Object.entries(values).map(([label, value]) => <div key={label}><div className="mb-1 flex justify-between text-sm"><span className="text-slate-600">{translateStatus ? propertyStatusLabel(label as any) : label}</span><strong>{value}</strong></div><div className="h-2.5 rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400" style={{ width: `${(value / max) * 100}%` }} /></div></div>)}</div></section>;
}
