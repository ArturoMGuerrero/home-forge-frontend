import { deleteVoid, getJson, postJson, putJson } from '../../../shared/services/api';
import { getCompanyId } from './leadsApi';

export type PropertyMatch = {
  id: string;
  leadId: string;
  leadName: string;
  propertyId: string;
  propertyTitle: string;
  propertyCode: string;
  status: 'SUGGESTED' | 'SENT' | 'INTERESTED' | 'VISIT_SCHEDULED' | 'REJECTED';
  notes?: string;
  createdAt: string;
};

export function listMatches() {
  return getJson<PropertyMatch[]>(`/property-matches?companyId=${getCompanyId()}`);
}

export function createMatch(payload: { leadId: string; propertyId: string; status?: string; notes?: string }) {
  return postJson<PropertyMatch>('/property-matches', { companyId: getCompanyId(), ...payload });
}

export function updateMatch(match: PropertyMatch) {
  return putJson<PropertyMatch>(`/property-matches/${match.id}`, { companyId: getCompanyId(), leadId: match.leadId, propertyId: match.propertyId, status: match.status, notes: match.notes });
}

export function deleteMatch(id: string) {
  return deleteVoid(`/property-matches/${id}?companyId=${getCompanyId()}`);
}
