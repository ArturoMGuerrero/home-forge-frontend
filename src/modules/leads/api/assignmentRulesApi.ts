import { getCompanyId } from './leadsApi';
import { deleteVoid, getJson, patchJson, postJson } from '../../../shared/services/api';

export type AssignmentStrategy = 'ROUND_ROBIN' | 'LEAST_ASSIGNED' | 'RANDOM';

export type AssignmentRule = {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  active: boolean;
  priority: number;
  assignmentStrategy: AssignmentStrategy;
  criteriaSource?: string;
  criteriaListingType?: string;
  criteriaCity?: string;
  criteriaBudgetMin?: number;
  criteriaBudgetMax?: number;
  criteriaPropertyType?: string;
  assignedUserIds: string;
};

export type CreateAssignmentRulePayload = Omit<AssignmentRule, 'id' | 'companyId' | 'active'>;

export function listAssignmentRules() {
  return getJson<AssignmentRule[]>(`/assignment-rules?companyId=${getCompanyId()}`);
}

export function createAssignmentRule(payload: CreateAssignmentRulePayload) {
  return postJson<AssignmentRule>('/assignment-rules', { companyId: getCompanyId(), ...payload });
}

export function updateAssignmentRule(ruleId: string, payload: { active?: boolean; priority?: number }) {
  return patchJson<AssignmentRule>(`/assignment-rules/${ruleId}`, { companyId: getCompanyId(), ...payload });
}

export function deleteAssignmentRule(ruleId: string) {
  return deleteVoid(`/assignment-rules/${ruleId}?companyId=${getCompanyId()}`);
}
