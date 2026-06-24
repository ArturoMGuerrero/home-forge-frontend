import { getJson } from './services/api';

export type DashboardMetrics = {
  // Métricas de propiedades
  totalProperties: number;
  activeSales: number;
  activeRentals: number;
  soldProperties: number;
  rentedProperties: number;
  saleInventoryValue: number;
  soldValue: number;
  monthlyRentInventory: number;
  monthlyRentValue: number;

  // Métricas de leads
  totalLeads: number;
  openLeads: number;
  closedLeads: number;
  lostLeads: number;
  highPriorityLeads: number;
  leadsByStatus: Record<string, number>;

  // Métricas de seguimiento
  dueFollowUps: number;
  upcomingFollowUps: number;

  // Métricas de tiempo (para gráficas)
  dailyMetrics: Record<string, DailyMetric>;

  // Tasas de conversión
  leadToClosedRate: number;
  propertyToSoldRate: number;

  // Período consultado
  startDate: string;
  endDate: string;
};

export type DailyMetric = {
  date: string;
  newLeads: number;
  newProperties: number;
  closedLeads: number;
  soldProperties: number;
  salesValue: number;
};

export type DateRange = '7d' | '30d' | '90d' | 'thisMonth' | 'thisYear' | 'custom';

export function getDashboardMetrics(
  companyId: string,
  range: DateRange = '30d',
  customStart?: number,
  customEnd?: number
): Promise<DashboardMetrics> {
  const params = new URLSearchParams({ companyId });

  if (range === 'custom' && customStart && customEnd) {
    params.append('startDate', customStart.toString());
    params.append('endDate', customEnd.toString());
  } else {
    const days = getRangeDays(range);
    if (days) {
      params.append('days', days.toString());
    }
  }

  return getJson<DashboardMetrics>(`/dashboard/metrics?${params.toString()}`);
}

function getRangeDays(range: DateRange): number | null {
  switch (range) {
    case '7d': return 7;
    case '30d': return 30;
    case '90d': return 90;
    case 'thisMonth': return new Date().getDate();
    case 'thisYear': return Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 1).getTime()) / (1000 * 60 * 60 * 24));
    default: return null;
  }
}

export const dateRangeLabels: Record<DateRange, string> = {
  '7d': 'Últimos 7 días',
  '30d': 'Últimos 30 días',
  '90d': 'Últimos 90 días',
  'thisMonth': 'Este mes',
  'thisYear': 'Este año',
  'custom': 'Personalizado'
};
