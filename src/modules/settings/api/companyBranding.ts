const logoKey = (companyId: string) => `homeforge_company_logo_${companyId}`;
export const COMPANY_BRANDING_EVENT = 'homeforge-company-branding';

export function getCompanyLogo(companyId?: string) {
  return companyId ? localStorage.getItem(logoKey(companyId)) ?? '' : '';
}

export function setCompanyLogo(companyId: string, value: string) {
  if (value) localStorage.setItem(logoKey(companyId), value);
  else localStorage.removeItem(logoKey(companyId));
  window.dispatchEvent(new Event(COMPANY_BRANDING_EVENT));
}
