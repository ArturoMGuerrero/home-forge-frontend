import { getSession } from './auth';
import { deleteVoid, getJson, patchJson, postJson } from './services/api';

const DEMO_COMPANY_ID = '00000000-0000-0000-0000-000000000001';

export function getCompanyId(): string {
  return getSession()?.companyId ?? DEMO_COMPANY_ID;
}

export type DocumentType =
  | 'CONTRACT'
  | 'AGREEMENT'
  | 'OFFER'
  | 'LEASE'
  | 'PURCHASE'
  | 'DISCLOSURE'
  | 'ADDENDUM'
  | 'AUTHORIZATION'
  | 'RECEIPT'
  | 'INVOICE'
  | 'OTHER';

export type DocumentStatus =
  | 'DRAFT'
  | 'PENDING_SIGNATURE'
  | 'PARTIALLY_SIGNED'
  | 'SIGNED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'EXPIRED';

export type SignatureStatus =
  | 'PENDING'
  | 'SENT'
  | 'VIEWED'
  | 'SIGNED'
  | 'DECLINED'
  | 'EXPIRED';

export type DocumentTemplate = {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  documentType: DocumentType;
  category?: string;
  content: string;
  variables?: string;
  isDefault: boolean;
  active: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
};

export type Document = {
  id: string;
  companyId: string;
  templateId?: string;
  name: string;
  documentType: DocumentType;
  status: DocumentStatus;
  content?: string;
  fileUrl?: string;
  fileSize?: number;
  mimeType?: string;
  version: number;
  leadId?: string;
  propertyId?: string;
  createdByUserId?: string;
  metadata?: string;
  createdAt: string;
  updatedAt: string;
};

export type DocumentSignature = {
  id: string;
  companyId: string;
  documentId: string;
  signerName: string;
  signerEmail: string;
  signerRole?: string;
  status: SignatureStatus;
  signatureData?: string;
  ipAddress?: string;
  userAgent?: string;
  signedAt?: string;
  sentAt?: string;
  expiresAt?: string;
  createdAt: string;
};

export type CreateTemplatePayload = {
  name: string;
  description?: string;
  documentType: DocumentType;
  category?: string;
  content: string;
  variables?: string;
  isDefault?: boolean;
};

export type CreateDocumentPayload = {
  templateId?: string;
  name: string;
  documentType: DocumentType;
  createdByUserId: string;
  leadId?: string;
  propertyId?: string;
  variables?: Record<string, string>;
  metadata?: string;
};

export type CreateSignaturePayload = {
  documentId: string;
  signerName: string;
  signerEmail: string;
  signerRole?: string;
};

// Document Templates API
export function listDocumentTemplates(active?: boolean): Promise<DocumentTemplate[]> {
  const params = new URLSearchParams({ companyId: getCompanyId() });
  if (active !== undefined) params.append('active', String(active));
  return getJson<DocumentTemplate[]>(`/document-templates?${params}`);
}

export function getDocumentTemplate(templateId: string): Promise<DocumentTemplate> {
  return getJson<DocumentTemplate>(`/document-templates/${templateId}?companyId=${getCompanyId()}`);
}

export function createDocumentTemplate(payload: CreateTemplatePayload): Promise<DocumentTemplate> {
  return postJson<DocumentTemplate>('/document-templates', {
    companyId: getCompanyId(),
    ...payload
  });
}

export function updateDocumentTemplate(templateId: string, content: string): Promise<DocumentTemplate> {
  return patchJson<DocumentTemplate>(`/document-templates/${templateId}?companyId=${getCompanyId()}`, { content });
}

export function deleteDocumentTemplate(templateId: string): Promise<void> {
  return deleteVoid(`/document-templates/${templateId}?companyId=${getCompanyId()}`);
}

export function toggleTemplateActive(templateId: string): Promise<DocumentTemplate> {
  return patchJson<DocumentTemplate>(
    `/document-templates/${templateId}/toggle-active?companyId=${getCompanyId()}`,
    {}
  );
}

// Documents API
export function listDocuments(status?: DocumentStatus): Promise<Document[]> {
  const params = new URLSearchParams({ companyId: getCompanyId() });
  if (status) params.append('status', status);
  return getJson<Document[]>(`/documents?${params}`);
}

export function listDocumentsByLead(leadId: string): Promise<Document[]> {
  return getJson<Document[]>(`/documents/lead/${leadId}?companyId=${getCompanyId()}`);
}

export function listDocumentsByProperty(propertyId: string): Promise<Document[]> {
  return getJson<Document[]>(`/documents/property/${propertyId}?companyId=${getCompanyId()}`);
}

export function getDocument(documentId: string): Promise<Document> {
  return getJson<Document>(`/documents/${documentId}?companyId=${getCompanyId()}`);
}

export function createDocument(payload: CreateDocumentPayload): Promise<Document> {
  return postJson<Document>('/documents', {
    companyId: getCompanyId(),
    ...payload
  });
}

export function updateDocumentStatus(documentId: string, status: DocumentStatus): Promise<Document> {
  return patchJson<Document>(`/documents/${documentId}/status?companyId=${getCompanyId()}`, { status });
}

export function sendDocumentForSignature(documentId: string): Promise<Document> {
  return postJson<Document>(`/documents/${documentId}/send-for-signature?companyId=${getCompanyId()}`, {});
}

export function deleteDocument(documentId: string): Promise<void> {
  return deleteVoid(`/documents/${documentId}?companyId=${getCompanyId()}`);
}

// Document Signatures API
export function listDocumentSignatures(documentId: string): Promise<DocumentSignature[]> {
  return getJson<DocumentSignature[]>(`/document-signatures/document/${documentId}`);
}

export function listPendingSignatures(documentId: string): Promise<DocumentSignature[]> {
  return getJson<DocumentSignature[]>(`/document-signatures/document/${documentId}/pending`);
}

export function createDocumentSignature(payload: CreateSignaturePayload): Promise<DocumentSignature> {
  return postJson<DocumentSignature>('/document-signatures', {
    companyId: getCompanyId(),
    ...payload
  });
}

export function signDocument(signatureId: string, signatureData: string): Promise<DocumentSignature> {
  return postJson<DocumentSignature>(
    `/document-signatures/${signatureId}/sign?companyId=${getCompanyId()}`,
    { signatureData }
  );
}

export function deleteDocumentSignature(signatureId: string): Promise<void> {
  return deleteVoid(`/document-signatures/${signatureId}?companyId=${getCompanyId()}`);
}

// Labels
export const documentTypeLabels: Record<DocumentType, string> = {
  CONTRACT: 'Contrato',
  AGREEMENT: 'Acuerdo',
  OFFER: 'Oferta',
  LEASE: 'Arrendamiento',
  PURCHASE: 'Compraventa',
  DISCLOSURE: 'Divulgación',
  ADDENDUM: 'Adenda',
  AUTHORIZATION: 'Autorización',
  RECEIPT: 'Recibo',
  INVOICE: 'Factura',
  OTHER: 'Otro'
};

export const documentStatusLabels: Record<DocumentStatus, string> = {
  DRAFT: 'Borrador',
  PENDING_SIGNATURE: 'Pendiente de firma',
  PARTIALLY_SIGNED: 'Parcialmente firmado',
  SIGNED: 'Firmado',
  COMPLETED: 'Completado',
  CANCELLED: 'Cancelado',
  EXPIRED: 'Expirado'
};

export const signatureStatusLabels: Record<SignatureStatus, string> = {
  PENDING: 'Pendiente',
  SENT: 'Enviado',
  VIEWED: 'Visto',
  SIGNED: 'Firmado',
  DECLINED: 'Rechazado',
  EXPIRED: 'Expirado'
};
