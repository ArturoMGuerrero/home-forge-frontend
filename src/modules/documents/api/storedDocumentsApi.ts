import { getCompanyId } from '../../leads';
import { deleteVoid, getBlob, getJson, postForm } from '../../../shared/services/api';

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

/** Contenido del documento (requiere sesión, por eso se descarga con fetch y no con un enlace directo). */
export function fetchStoredDocument(id: string, mode: 'view' | 'download' = 'view') {
  return getBlob(`/documents/${id}/${mode}?companyId=${getCompanyId()}`);
}

export async function downloadStoredDocument(doc: Pick<StoredDocument, 'id' | 'fileName'>) {
  const url = URL.createObjectURL(await fetchStoredDocument(doc.id, 'download'));
  const link = document.createElement('a');
  link.href = url;
  link.download = doc.fileName;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
