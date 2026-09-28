import { getCompanyId } from '../../leads';
import { apiUrl, deleteVoid, getJson, postForm } from '../../../shared/services/api';

export type StoredDocument = {
  id: string;
  leadId?: string;
  leadName?: string;
  propertyId?: string;
  propertyTitle?: string;
  documentType: string;
  fileName: string;
  status: string;
  contentType?: string;
  fileSize?: number;
  notes?: string;
  createdAt: string;
};

export function listStoredDocuments() {
  return getJson<StoredDocument[]>(`/documents?companyId=${getCompanyId()}`);
}

export function uploadStoredDocument(data: { leadId?: string; propertyId?: string; documentType: string; status: string; notes?: string; file: File }) {
  const form = new FormData();
  form.append('file', data.file, data.file.name);
  const query = new URLSearchParams({ companyId: getCompanyId(), documentType: data.documentType, status: data.status });
  if (data.leadId) query.set('leadId', data.leadId);
  if (data.propertyId) query.set('propertyId', data.propertyId);
  if (data.notes) query.set('notes', data.notes);
  return postForm<StoredDocument>(`/documents?${query.toString()}`, form);
}

export function deleteStoredDocument(id: string) {
  return deleteVoid(`/documents/${id}?companyId=${getCompanyId()}`);
}

export const storedDocumentDownloadUrl = (id: string) => apiUrl(`/documents/${id}/download?companyId=${getCompanyId()}`);
export const storedDocumentViewUrl = (id: string) => apiUrl(`/documents/${id}/view?companyId=${getCompanyId()}`);
