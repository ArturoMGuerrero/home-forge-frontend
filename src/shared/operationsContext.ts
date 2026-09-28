import { LeadItem, listLeads } from '../modules/leads';
import { ApiProperty, listProperties } from '../modules/properties';

export function loadOperationsContext(): Promise<[LeadItem[], ApiProperty[]]> {
  return Promise.all([listLeads(), listProperties()]);
}
