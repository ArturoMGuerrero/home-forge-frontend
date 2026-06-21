import { describe, expect, it } from 'vitest';
import { formatMoneyInput, normalizeMoneyInput } from '../shared/MoneyInput';
import { buildDashboardMetrics } from '../shared/dashboardMetrics';
import { isValidPhone } from '../shared/validation/validation';
describe('phone validation', () => {
  it('accepts E.164 phones', () => expect(isValidPhone('+19155551234')).toBe(true));
  it('rejects local phones', () => expect(isValidPhone('9155551234')).toBe(false));
});

describe('money input formatting', () => {
  it('adds thousands separators', () => expect(formatMoneyInput('1250000.50')).toBe('1,250,000.50'));
  it('normalizes pasted currency values', () => expect(normalizeMoneyInput('$1,250,000.50 MXN')).toBe('1250000.50'));
  it('keeps at most two decimal digits', () => expect(normalizeMoneyInput('125.99')).toBe('125.99'));
});

describe('dashboard metrics', () => {
  it('separates sales, rentals and MXN amounts', () => {
    const properties = [
      { listingType: 'SALE', status: 'AVAILABLE', price: 2000000, currencyCode: 'MXN', published: true },
      { listingType: 'SALE', status: 'SOLD', price: 150000, currencyCode: 'USD', published: false },
      { listingType: 'RENT', status: 'RENTED', price: 18000, currencyCode: 'MXN', published: true }
    ] as never;
    const result = buildDashboardMetrics(properties, []);
    expect(result.activeSales).toBe(1);
    expect(result.sold).toBe(1);
    expect(result.rented).toBe(1);
    expect(result.saleInventoryMxn).toBe(2000000);
    expect(result.soldValueMxn).toBe(0);
    expect(result.rentedMonthlyValueMxn).toBe(18000);
    expect(result.nonMxnProperties).toBe(1);
  });
});
