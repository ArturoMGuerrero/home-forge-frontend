import { getCompanyId } from './leads';
import { getJson, putJson } from './services/api';

export type CompanyProfile = {
  id: string;
  name: string;
  countryCode: string;
  stateCode: string;
  city?: string;
  address?: string;
  postalCode?: string;
  publicEmail?: string;
  publicPhoneE164?: string;
  websiteUrl?: string;
  publicDescription?: string;
  mission?: string;
  vision?: string;
  professionalLicense?: string;
  yearsExperience?: number;
};

export type CompanyProfilePayload = Omit<CompanyProfile, 'id'>;

export function getCompanyProfile(): Promise<CompanyProfile> {
  return getJson<CompanyProfile>(`/companies/${getCompanyId()}`);
}

export function updateCompanyProfile(profile: CompanyProfilePayload): Promise<CompanyProfile> {
  return putJson<CompanyProfile>(`/companies/${getCompanyId()}`, profile);
}

export function getPublicCompanyProfile(companyId: string): Promise<CompanyProfile> {
  return getJson<CompanyProfile>(`/companies/public/${companyId}`);
}

export function countryName(code: string) {
  if (code === 'MX') return 'México';
  if (code === 'US') return 'Estados Unidos';
  return code;
}
