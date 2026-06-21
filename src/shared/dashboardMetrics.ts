import { LeadItem, LeadStatus } from './leads';
import { ApiProperty, PropertyStatus } from './propertyApi';

const activeStatuses: PropertyStatus[] = ['AVAILABLE', 'RESERVED', 'UNDER_CONTRACT'];
const openLeadStatuses: LeadStatus[] = ['NEW', 'CONTACTED', 'QUALIFIED', 'TOUR_SCHEDULED', 'TOUR_COMPLETED', 'OFFER_MADE', 'UNDER_CONTRACT'];

export function buildDashboardMetrics(properties: ApiProperty[], leads: LeadItem[], now = new Date()) {
  const mxnProperties = properties.filter(property => property.currencyCode === 'MXN');
  const sumPrice = (items: ApiProperty[]) => items.reduce((total, property) => total + Number(property.price || 0), 0);
  const activeSales = properties.filter(property => property.listingType === 'SALE' && activeStatuses.includes(property.status));
  const activeRentals = properties.filter(property => property.listingType === 'RENT' && activeStatuses.includes(property.status));
  const sold = properties.filter(property => property.status === 'SOLD');
  const rented = properties.filter(property => property.status === 'RENTED');
  const dueFollowUps = leads.filter(lead => lead.nextFollowUpAt && new Date(lead.nextFollowUpAt) <= now && openLeadStatuses.includes(lead.status));
  const upcomingFollowUps = leads
    .filter(lead => lead.nextFollowUpAt && new Date(lead.nextFollowUpAt) > now && openLeadStatuses.includes(lead.status))
    .sort((left, right) => new Date(left.nextFollowUpAt!).getTime() - new Date(right.nextFollowUpAt!).getTime());

  return {
    propertyCount: properties.length,
    activeSales: activeSales.length,
    activeRentals: activeRentals.length,
    sold: sold.length,
    rented: rented.length,
    unavailable: properties.filter(property => property.status === 'INACTIVE').length,
    published: properties.filter(property => property.published).length,
    saleInventoryMxn: sumPrice(activeSales.filter(property => property.currencyCode === 'MXN')),
    soldValueMxn: sumPrice(sold.filter(property => property.currencyCode === 'MXN')),
    monthlyRentInventoryMxn: sumPrice(activeRentals.filter(property => property.currencyCode === 'MXN')),
    rentedMonthlyValueMxn: sumPrice(rented.filter(property => property.currencyCode === 'MXN')),
    nonMxnProperties: properties.length - mxnProperties.length,
    leadCount: leads.length,
    openLeads: leads.filter(lead => openLeadStatuses.includes(lead.status)).length,
    closedLeads: leads.filter(lead => lead.status === 'CLOSED').length,
    lostLeads: leads.filter(lead => lead.status === 'LOST').length,
    highPriorityLeads: leads.filter(lead => lead.priority === 'HIGH' && openLeadStatuses.includes(lead.status)).length,
    dueFollowUps,
    upcomingFollowUps,
    leadStatusCounts: leads.reduce<Partial<Record<LeadStatus, number>>>((counts, lead) => {
      counts[lead.status] = (counts[lead.status] ?? 0) + 1;
      return counts;
    }, {})
  };
}

export type DashboardMetrics = ReturnType<typeof buildDashboardMetrics>;
