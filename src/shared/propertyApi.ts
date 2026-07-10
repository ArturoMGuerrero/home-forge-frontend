import { getCompanyId } from './leads';
import { deleteJson, getJson, postForm, postJson, putJson, resolveApiAsset } from './services/api';

export type ListingType = 'SALE' | 'RENT';
export type PropertyStatus = 'AVAILABLE' | 'RESERVED' | 'UNDER_CONTRACT' | 'SOLD' | 'RENTED' | 'INACTIVE';

export type ApiProperty = {
  id: string;
  companyId: string;
  code: string;
  title: string;
  propertyType: string;
  listingType: ListingType;
  status: PropertyStatus;
  price: number;
  currencyCode: string;
  countryCode: string;
  stateCode: string;
  city: string;
  address?: string;
  bedrooms?: number;
  bathrooms?: number;
  landArea?: number;
  constructionArea?: number;
  parkingSpaces?: number;
  description?: string;
  imageUrl?: string;
  images: Array<{
    id: string;
    imageUrl: string;
    sortOrder: number;
  }>;
  published: boolean;
  ownerName?: string;
  ownerEmail?: string;
  ownerPhone?: string;
  ownerPhoneSecondary?: string;
  ownerNotes?: string;
};

export type CreateApiProperty = Omit<ApiProperty, 'id' | 'companyId' | 'images'>;

export type PublicPropertyListing = {
  property: ApiProperty;
  seller: {
    companyId: string;
    companyName: string;
    email?: string;
    phoneE164?: string;
  };
};

export function listProperties(): Promise<ApiProperty[]> {
  return getJson<ApiProperty[]>(`/properties?companyId=${getCompanyId()}`);
}

export function getProperty(propertyId: string): Promise<ApiProperty> {
  return getJson<ApiProperty>(`/properties/${propertyId}?companyId=${getCompanyId()}`);
}

export function listPublishedProperties(): Promise<PublicPropertyListing[]> {
  return getJson<PublicPropertyListing[]>('/properties/public');
}

export function getPublishedProperty(propertyId: string): Promise<PublicPropertyListing> {
  return getJson<PublicPropertyListing>(`/properties/public/${propertyId}`);
}

export function createProperty(property: CreateApiProperty): Promise<ApiProperty> {
  return postJson<ApiProperty>('/properties', { companyId: getCompanyId(), ...property });
}

export function updateProperty(propertyId: string, property: CreateApiProperty): Promise<ApiProperty> {
  return putJson<ApiProperty>(`/properties/${propertyId}`, { companyId: getCompanyId(), ...property });
}

export function deleteProperty(propertyId: string): Promise<void> {
  return deleteJson(`/properties/${propertyId}?companyId=${getCompanyId()}`);
}

export function uploadPropertyImages(propertyId: string, files: File[]): Promise<ApiProperty> {
  const form = new FormData();
  files.forEach(file => form.append('files', file));
  return postForm<ApiProperty>(`/properties/${propertyId}/images?companyId=${getCompanyId()}`, form);
}

export function deletePropertyImage(propertyId: string, imageId: string): Promise<ApiProperty> {
  return deleteJson<ApiProperty>(`/properties/${propertyId}/images/${imageId}?companyId=${getCompanyId()}`);
}

export function setPropertyCover(propertyId: string, imageId: string): Promise<ApiProperty> {
  return putJson<ApiProperty>(`/properties/${propertyId}/images/${imageId}/cover?companyId=${getCompanyId()}`);
}

export function propertyImages(property: Pick<ApiProperty, 'images' | 'imageUrl'>): string[] {
  const ordered = [...(property.images ?? [])].sort((left, right) => {
    if (left.imageUrl === property.imageUrl) return -1;
    if (right.imageUrl === property.imageUrl) return 1;
    return left.sortOrder - right.sortOrder;
  });
  const images = ordered.map(image => resolveApiAsset(image.imageUrl)).filter(Boolean) as string[];
  if (images.length > 0) return images;
  const legacy = resolveApiAsset(property.imageUrl);
  return legacy ? [legacy] : [];
}

export function formatApiPrice(property: Pick<ApiProperty, 'price' | 'currencyCode' | 'listingType'>) {
  const amount = new Intl.NumberFormat(property.currencyCode === 'USD' ? 'en-US' : 'es-MX', {
    style: 'currency',
    currency: property.currencyCode,
    maximumFractionDigits: 0
  }).format(property.price);
  return property.listingType === 'RENT' ? `${amount}/mes` : amount;
}

export function listingLabel(listingType: ListingType) {
  return listingType === 'RENT' ? 'Renta' : 'Venta';
}

export function propertyStatusLabel(status: PropertyStatus) {
  const labels: Record<PropertyStatus, string> = {
    AVAILABLE: 'Disponible',
    RESERVED: 'Reservada',
    UNDER_CONTRACT: 'Bajo contrato',
    SOLD: 'Vendida',
    RENTED: 'Rentada',
    INACTIVE: 'No disponible'
  };
  return labels[status];
}

export function propertyStatusClass(status: PropertyStatus) {
  if (status === 'AVAILABLE') return 'bg-emerald-100 text-emerald-800';
  if (status === 'SOLD' || status === 'RENTED' || status === 'INACTIVE') return 'bg-slate-800 text-white';
  return 'bg-amber-100 text-amber-800';
}
