import { DragEvent, FormEvent, ReactNode, useEffect, useState } from 'react';
import { useNavigate, useParams, useOutletContext } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { SubscriptionRestrictions } from '../../../shared/subscriptionRestrictions';
import {
  ApiProperty,
  createProperty,
  deleteProperty,
  deletePropertyImage,
  getProperty,
  ListingType,
  PropertyStatus,
  setPropertyCover,
  updateProperty,
  uploadPropertyImages
} from '../api/propertyApi';
import { getJson, resolveApiAsset } from '../../../shared/services/api';
import { MoneyInput } from '../../../shared/MoneyInput';
import { LocationPicker } from '../components/LocationPicker';
import { ConfirmModal } from '../../../shared/ConfirmModal';
import { Icon } from '../../../shared/Icon';
import { Badge, Button, Card, cn, fieldClass, fieldLabelClass, Input, LoadingState, PageHeader, RequiredMark, Select, Switch, Textarea } from '../../../shared/ui';

// TODO: i18n - Preparar textos para español e inglés
// Los catálogos ya soportan labelEs y labelEn
// Pendiente: Implementar selector de idioma y función t() para traducciones

type CatalogItem = {
  code: string;
  labelEs: string;
  labelEn: string;
};

const initialForm = {
  code: '',
  title: '',
  propertyType: 'HOUSE',
  listingType: 'SALE' as ListingType,
  status: 'AVAILABLE' as PropertyStatus,
  price: '',
  currencyCode: 'MXN',
  countryCode: 'MX',
  stateCode: '',
  city: '',
  address: '',
  latitude: '',
  longitude: '',
  bedrooms: '',
  bathrooms: '',
  landArea: '',
  constructionArea: '',
  parkingSpaces: '',
  description: '',
  imageUrl: '',
  published: true,
  ownerName: '',
  ownerEmail: '',
  ownerPhone: '',
  ownerPhoneSecondary: '',
  ownerNotes: ''
};

export function NewPropertyPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { propertyId } = useParams();
  const editing = Boolean(propertyId);
  const context = useOutletContext<{ restrictions: SubscriptionRestrictions }>();
  const restrictions = context?.restrictions || { canCreate: true, canEdit: true, canExport: true, canUploadMultiple: true, canInviteUsers: true, level: 'NONE' };
  const [form, setForm] = useState(initialForm);
  const [types, setTypes] = useState<CatalogItem[]>([]);
  const [currencies, setCurrencies] = useState<CatalogItem[]>([]);
  const [countries, setCountries] = useState<CatalogItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<ApiProperty['images']>([]);
  const [loading, setLoading] = useState(editing);
  const [isDragging, setIsDragging] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  useEffect(() => {
    Promise.all([
      getJson<CatalogItem[]>('/catalogs/property-types'),
      getJson<CatalogItem[]>('/catalogs/currencies'),
      getJson<CatalogItem[]>('/catalogs/countries')
    ])
      .then(([propertyTypes, currencyItems, countryItems]) => {
        setTypes(propertyTypes);
        setCurrencies(currencyItems);
        setCountries(countryItems);
      })
      .catch(() => toast.error('No se pudieron cargar los catálogos del backend.'));
  }, []);

  useEffect(() => {
    if (!propertyId) return;
    getProperty(propertyId)
      .then(property => {
        setForm({
          code: property.code,
          title: property.title,
          propertyType: property.propertyType,
          listingType: property.listingType,
          status: property.status,
          price: String(property.price),
          currencyCode: property.currencyCode,
          countryCode: property.countryCode,
          stateCode: property.stateCode,
          city: property.city,
          address: property.address ?? '',
          latitude: property.latitude === undefined ? '' : String(property.latitude),
          longitude: property.longitude === undefined ? '' : String(property.longitude),
          bedrooms: property.bedrooms === undefined ? '' : String(property.bedrooms),
          bathrooms: property.bathrooms === undefined ? '' : String(property.bathrooms),
          landArea: property.landArea === undefined ? '' : String(property.landArea),
          constructionArea: property.constructionArea === undefined ? '' : String(property.constructionArea),
          parkingSpaces: property.parkingSpaces === undefined ? '' : String(property.parkingSpaces),
          description: property.description ?? '',
          imageUrl: property.imageUrl ?? '',
          published: property.published,
          ownerName: property.ownerName ?? '',
          ownerEmail: property.ownerEmail ?? '',
          ownerPhone: property.ownerPhone ?? '',
          ownerPhoneSecondary: property.ownerPhoneSecondary ?? '',
          ownerNotes: property.ownerNotes ?? ''
        });
        setExistingImages(property.images ?? []);
      })
      .catch(requestError => toast.error(requestError instanceof Error ? requestError.message : 'No fue posible cargar la propiedad.'))
      .finally(() => setLoading(false));
  }, [propertyId]);

  useEffect(() => {
    const urls = photos.map(file => URL.createObjectURL(file));
    setPreviews(urls);
    return () => urls.forEach(URL.revokeObjectURL);
  }, [photos]);

  function update(name: string, value: string | boolean) {
    setForm(current => ({ ...current, [name]: value }));
  }

  function optionalNumber(value: string) {
    return value === '' ? undefined : Number(value);
  }

  function optionalDecimal(value: string) {
    const num = Number(value);
    return value === '' || isNaN(num) ? undefined : num;
  }

  function normalizeImageUrl(value: string) {
    const imageUrl = value.trim();
    if (!imageUrl) return undefined;
    if (imageUrl.startsWith('/uploads/') || /^https?:\/\//i.test(imageUrl)) return imageUrl;
    if (/^www\./i.test(imageUrl)) return `https://${imageUrl}`;
    throw new Error('La imagen principal debe usar una URL http(s), por ejemplo https://sitio.com/imagen.jpg.');
  }

  async function submit(event: FormEvent) {
    event.preventDefault();

    // Check edit permissions for editing mode
    if (editing && !restrictions.canEdit) {
      toast.error('Tu plan no permite editar propiedades. Actualiza tu suscripción para continuar.');
      return;
    }

    const price = Number(form.price);
    if (!Number.isFinite(price) || price <= 0) {
      toast.error('Captura un precio mayor a cero.');
      return;
    }
    setSaving(true);

    try {
      const payload = {
        code: form.code.trim(),
        title: form.title.trim(),
        propertyType: form.propertyType,
        listingType: form.listingType,
        status: form.status,
        price,
        currencyCode: form.currencyCode,
        countryCode: form.countryCode,
        stateCode: form.stateCode.trim(),
        city: form.city.trim(),
        address: form.address.trim() || undefined,
        latitude: optionalDecimal(form.latitude),
        longitude: optionalDecimal(form.longitude),
        bedrooms: optionalNumber(form.bedrooms),
        bathrooms: optionalNumber(form.bathrooms),
        landArea: optionalNumber(form.landArea),
        constructionArea: optionalNumber(form.constructionArea),
        parkingSpaces: optionalNumber(form.parkingSpaces),
        description: form.description.trim() || undefined,
        imageUrl: normalizeImageUrl(form.imageUrl),
        published: form.published,
        ownerName: form.ownerName.trim() || undefined,
        ownerEmail: form.ownerEmail.trim() || undefined,
        ownerPhone: form.ownerPhone.trim() || undefined,
        ownerPhoneSecondary: form.ownerPhoneSecondary.trim() || undefined,
        ownerNotes: form.ownerNotes.trim() || undefined
      };
      const saved = propertyId
        ? await updateProperty(propertyId, payload)
        : await createProperty(payload);
      if (photos.length > 0) {
        setUploadingImages(true);
        await uploadPropertyImages(saved.id, photos);
      }
      toast.success(editing ? 'Propiedad actualizada correctamente' : 'Propiedad creada correctamente');
      navigate('/app/propiedades');
    } catch (requestError) {
      toast.error(requestError instanceof Error ? requestError.message : 'No fue posible guardar la propiedad.');
    } finally {
      setSaving(false);
      setUploadingImages(false);
    }
  }

  async function handleDelete() {
    if (!propertyId) return;
    setDeleting(true);
    try {
      await deleteProperty(propertyId);
      toast.success('Propiedad eliminada correctamente');
      navigate('/app/propiedades');
    } catch (requestError) {
      toast.error(requestError instanceof Error ? requestError.message : 'No fue posible eliminar la propiedad.');
      setShowDeleteModal(false);
    } finally {
      setDeleting(false);
    }
  }

  function selectPhotos(files: FileList | null) {
    if (!files) return;
    const selected = Array.from(files);
    if (selected.some(file => !['image/jpeg', 'image/png', 'image/webp'].includes(file.type))) {
      toast.error(t('propertyForm.errorFormats'));
      return;
    }
    if (selected.some(file => file.size > 8 * 1024 * 1024)) {
      toast.error(t('propertyForm.errorSize'));
      return;
    }

    // Check multiple upload restriction
    if (!restrictions.canUploadMultiple && (existingImages.length + photos.length + selected.length) > 1) {
      toast.error('Tu plan solo permite subir 1 imagen por propiedad. Actualiza a PRO para subir hasta 12 imágenes.');
      return;
    }

    if (existingImages.length + photos.length + selected.length > 12) {
      toast.error(t('propertyForm.errorLimit'));
      return;
    }
    setPhotos(current => [...current, ...selected]);
  }

  function handleDragOver(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);
    selectPhotos(event.dataTransfer.files);
  }

  async function removeExistingImage(imageId: string) {
    if (!propertyId) return;
    try {
      const updated = await deletePropertyImage(propertyId, imageId);
      setExistingImages(updated.images);
      setForm(current => ({ ...current, imageUrl: updated.imageUrl ?? '' }));
      toast.success('Foto eliminada');
    } catch (requestError) {
      toast.error(requestError instanceof Error ? requestError.message : 'No fue posible eliminar la foto.');
    }
  }

  async function chooseCover(imageId: string) {
    if (!propertyId) return;
    try {
      const updated = await setPropertyCover(propertyId, imageId);
      setForm(current => ({ ...current, imageUrl: updated.imageUrl ?? '' }));
      toast.success('Portada actualizada');
    } catch (requestError) {
      toast.error(requestError instanceof Error ? requestError.message : 'No fue posible cambiar la portada.');
    }
  }

  if (loading) {
    return <Card><LoadingState message="Cargando propiedad..." /></Card>;
  }

  const photoCount = existingImages.length + photos.length;
  const editLocked = editing && !restrictions.canEdit;

  return (
    <>
      <PageHeader
        backLink={{ to: '/app/propiedades', label: 'Propiedades' }}
        eyebrow="Inventario"
        subtitle={editing ? 'Actualiza la información, publicación y galería del inmueble.' : 'Registra la información comercial, ubicación y características del inmueble.'}
        title={editing ? 'Editar propiedad' : 'Agregar propiedad'}
      />

      <form className="grid gap-6 xl:grid-cols-[1fr_300px]" onSubmit={submit}>
        <div className="space-y-6">
          <FormSection title="Información comercial">
            <div className="grid gap-5 sm:grid-cols-2">
              <Input containerClassName="sm:col-span-2" label="Título" maxLength={180} onChange={event => update('title', event.target.value)} placeholder="Casa moderna con jardín" required value={form.title} />
              <Input label="Código" maxLength={80} onChange={event => update('code', event.target.value)} placeholder="HF-400" required value={form.code} />
              <Select label="Tipo de inmueble" onChange={event => update('propertyType', event.target.value)} options={types.map(item => ({ value: item.code, label: item.labelEs }))} value={form.propertyType} />
              <Select
                label="Operación"
                onChange={event => {
                  const listingType = event.target.value as ListingType;
                  update('listingType', listingType);
                  if (listingType === 'SALE' && form.status === 'RENTED') update('status', 'AVAILABLE');
                  if (listingType === 'RENT' && form.status === 'SOLD') update('status', 'AVAILABLE');
                }}
                options={[{ value: 'SALE', label: 'Venta' }, { value: 'RENT', label: 'Renta' }]}
                value={form.listingType}
              />
              <Select
                label="Estado de la propiedad"
                onChange={event => update('status', event.target.value)}
                options={[
                  { value: 'AVAILABLE', label: 'Disponible' },
                  { value: 'RESERVED', label: 'Reservada' },
                  { value: 'UNDER_CONTRACT', label: 'Bajo contrato' },
                  ...(form.listingType === 'SALE' ? [{ value: 'SOLD', label: 'Vendida' }] : [{ value: 'RENTED', label: 'Rentada' }]),
                  { value: 'INACTIVE', label: 'No disponible' }
                ]}
                value={form.status}
              />
              <div>
                <label className={fieldLabelClass} htmlFor="property-price">{form.listingType === 'RENT' ? 'Renta mensual' : 'Precio de venta'}<RequiredMark /></label>
                <MoneyInput className={fieldClass()} currency={form.currencyCode} id="property-price" maxLength={19} onChange={value => update('price', value)} required value={form.price} />
              </div>
              <Select label="Moneda" onChange={event => update('currencyCode', event.target.value)} options={currencies.map(item => ({ value: item.code, label: `${item.code} - ${item.labelEs}` }))} value={form.currencyCode} />
            </div>
          </FormSection>

          <FormSection title="Ubicación">
            <div className="grid gap-5 sm:grid-cols-2">
              <Select label="País" onChange={event => update('countryCode', event.target.value)} options={countries.map(item => ({ value: item.code, label: item.labelEs }))} value={form.countryCode} />
              <Input label="Estado" maxLength={80} onChange={event => update('stateCode', event.target.value)} required value={form.stateCode} />
              <Input label="Ciudad" maxLength={120} onChange={event => update('city', event.target.value)} required value={form.city} />
              <Input label="Dirección" maxLength={255} onChange={event => update('address', event.target.value)} value={form.address} />
              <fieldset className="sm:col-span-2">
                <legend className={fieldLabelClass}>Coordenadas GPS</legend>
                <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
                  <Input aria-label="Latitud" max="90" min="-90" onChange={event => update('latitude', event.target.value)} placeholder="Latitud: 19.4326" step="0.000001" type="number" value={form.latitude} />
                  <Input aria-label="Longitud" max="180" min="-180" onChange={event => update('longitude', event.target.value)} placeholder="Longitud: -99.1332" step="0.000001" type="number" value={form.longitude} />
                  <Button
                    className="min-h-11"
                    icon={<svg aria-hidden="true" className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>}
                    onClick={() => setShowLocationPicker(true)}
                    variant="secondary"
                  >
                    Elegir en el mapa
                  </Button>
                </div>
                <p className="mt-1.5 text-xs text-fg-subtle">Usa el mapa para ubicar la propiedad o ingresa las coordenadas manualmente.</p>
              </fieldset>
            </div>
          </FormSection>

          <FormSection title="Características">
            <div className="grid gap-5 sm:grid-cols-3 lg:grid-cols-5">
              <Input label="Recámaras" max="100" min="0" onChange={event => update('bedrooms', event.target.value)} type="number" value={form.bedrooms} />
              <Input label="Baños" max="100" min="0" onChange={event => update('bathrooms', event.target.value)} step="0.5" type="number" value={form.bathrooms} />
              <Input label="Estacionamientos" max="100" min="0" onChange={event => update('parkingSpaces', event.target.value)} type="number" value={form.parkingSpaces} />
              <Input label="Terreno m²" max="99999999.99" min="0" onChange={event => update('landArea', event.target.value)} step="0.01" type="number" value={form.landArea} />
              <Input label="Construcción m²" max="99999999.99" min="0" onChange={event => update('constructionArea', event.target.value)} step="0.01" type="number" value={form.constructionArea} />
            </div>
          </FormSection>

          <FormSection title="Presentación">
            <div className="grid gap-5">
              <Input
                helperText="Puedes pegar una URL externa o elegir una foto guardada como portada."
                inputMode="url"
                label="URL de imagen principal"
                maxLength={1000}
                onChange={event => update('imageUrl', event.target.value)}
                placeholder="https://sitio.com/imagen.jpg"
                value={form.imageUrl}
              />
              <Textarea className="min-h-36" label="Descripción" maxLength={5000} onChange={event => update('description', event.target.value)} value={form.description} />

              <div className="grid gap-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-fg-muted">{t('propertyForm.photos')}</p>
                    <p className="mt-0.5 text-xs text-fg-subtle">{t('propertyForm.photosDescription')}</p>
                  </div>
                  <Badge variant={photoCount >= 12 ? 'error' : 'neutral'}>{t('propertyForm.photosCounter', { count: photoCount })}</Badge>
                </div>
                <label
                  className={cn(
                    'group flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-9 text-center transition',
                    'has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary',
                    isDragging ? 'border-primary bg-primary-soft' : 'border-border-strong bg-surface-muted hover:border-primary hover:bg-primary-soft'
                  )}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <span className={cn('grid size-12 place-items-center rounded-xl transition', isDragging ? 'bg-primary-muted text-primary-fg' : 'bg-surface-sunken text-fg-subtle group-hover:bg-primary-muted group-hover:text-primary-fg')}>
                    <svg aria-hidden="true" className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-fg">
                      {isDragging ? t('propertyForm.dropPhotosHere') : editing ? t('propertyForm.dragPhotosEdit') : t('propertyForm.dragPhotos')}
                    </span>
                    <span className="mt-1 block text-xs text-fg-subtle">{t('propertyForm.formatInfo')}</span>
                  </span>
                  <input accept="image/jpeg,image/png,image/webp" className="sr-only" multiple onChange={event => selectPhotos(event.target.files)} type="file" />
                </label>

                {existingImages.length > 0 && (
                  <div>
                    <p className="mb-2.5 text-xs font-semibold text-fg-subtle">{t('propertyForm.savedPhotos', { count: existingImages.length })}</p>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                      {existingImages.map(image => {
                        const cover = image.imageUrl === form.imageUrl;
                        return (
                          <PhotoTile cover={cover} coverLabel={t('propertyForm.coverBadge')} key={image.id} src={resolveApiAsset(image.imageUrl)}>
                            {!cover && (
                              <button className="flex-1 rounded-lg bg-white/95 px-2 py-1.5 text-xs font-semibold text-slate-900 transition hover:bg-white" onClick={() => chooseCover(image.id)} type="button">
                                {t('propertyForm.setCover')}
                              </button>
                            )}
                            <button className="rounded-lg bg-rose-600 px-2 py-1.5 text-xs font-semibold text-white transition hover:bg-rose-700" onClick={() => removeExistingImage(image.id)} type="button">
                              {t('propertyForm.remove')}
                            </button>
                          </PhotoTile>
                        );
                      })}
                    </div>
                  </div>
                )}

                {previews.length > 0 && (
                  <div>
                    <p className="mb-2.5 text-xs font-semibold text-fg-subtle">{t('propertyForm.newPhotos', { count: previews.length })}</p>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                      {previews.map((preview, index) => (
                        <PhotoTile
                          badge={t('propertyForm.newBadge')}
                          cover={index === 0 && !existingImages.length}
                          coverLabel={t('propertyForm.coverBadge')}
                          key={preview}
                          src={preview}
                        >
                          <button
                            aria-label={t('propertyForm.removePhoto')}
                            className="flex-1 rounded-lg bg-white/95 px-2 py-1.5 text-xs font-semibold text-slate-900 transition hover:bg-white"
                            onClick={() => setPhotos(current => current.filter((_, photoIndex) => photoIndex !== index))}
                            type="button"
                          >
                            {t('propertyForm.remove')}
                          </button>
                        </PhotoTile>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </FormSection>

          <FormSection description="Información interna; no se muestra en el sitio público." title="Contacto del propietario">
            <div className="grid gap-5 sm:grid-cols-2">
              <Input containerClassName="sm:col-span-2" label="Nombre del propietario" maxLength={150} onChange={event => update('ownerName', event.target.value)} placeholder="Juan Pérez" value={form.ownerName} />
              <Input label="Email" maxLength={100} onChange={event => update('ownerEmail', event.target.value)} placeholder="propietario@ejemplo.com" type="email" value={form.ownerEmail} />
              <Input label="Teléfono principal" maxLength={20} onChange={event => update('ownerPhone', event.target.value)} placeholder="+52 614 123 4567" type="tel" value={form.ownerPhone} />
              <Input containerClassName="sm:col-span-2" label="Teléfono secundario (opcional)" maxLength={20} onChange={event => update('ownerPhoneSecondary', event.target.value)} placeholder="+52 614 987 6543" type="tel" value={form.ownerPhoneSecondary} />
              <Textarea
                className="min-h-24"
                containerClassName="sm:col-span-2"
                label="Notas sobre el propietario"
                maxLength={5000}
                onChange={event => update('ownerNotes', event.target.value)}
                placeholder="Horarios de contacto, preferencias, etc."
                value={form.ownerNotes}
              />
            </div>
          </FormSection>
        </div>

        <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
          <Card>
            <h2 className="font-semibold text-fg">Publicación</h2>
            <Switch
              checked={form.published}
              className="mt-4"
              description="Mostrar esta propiedad en el catálogo público."
              label="Publicada"
              onChange={checked => update('published', checked)}
            />
          </Card>
          <Button disabled={editLocked} fullWidth icon={editLocked ? <Icon className="size-4" name="lock" /> : undefined} loading={saving} size="lg" type="submit">
            {uploadingImages
              ? t('propertyForm.uploading', { count: photos.length })
              : saving
              ? t('propertyForm.saving')
              : editing
              ? t('propertyForm.saveChanges')
              : t('propertyForm.saveProperty')}
          </Button>
          {editing && (
            <Button fullWidth onClick={() => setShowDeleteModal(true)} variant="danger">Eliminar propiedad</Button>
          )}
        </aside>
      </form>

      {showLocationPicker && (
        <LocationPicker
          latitude={form.latitude}
          longitude={form.longitude}
          onClose={() => setShowLocationPicker(false)}
          onLocationChange={(lat, lng) => {
            update('latitude', lat.toString());
            update('longitude', lng.toString());
            toast.success('Ubicación actualizada correctamente');
          }}
        />
      )}

      <ConfirmModal
        isOpen={showDeleteModal}
        loading={deleting}
        message={<>Se eliminará <strong className="text-fg">{form.title || 'esta propiedad'}</strong> ({form.code}) permanentemente. Las asignaciones a prospectos también se eliminarán.</>}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="¿Eliminar propiedad?"
      />
    </>
  );
}

function FormSection({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <Card>
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-fg">{title}</h2>
        {description && <p className="mt-0.5 text-sm text-fg-subtle">{description}</p>}
      </div>
      {children}
    </Card>
  );
}

/** Miniatura de foto con acciones visibles al pasar el cursor o al navegar con teclado. */
function PhotoTile({ src, cover, coverLabel, badge, children }: { src?: string; cover: boolean; coverLabel: string; badge?: string; children: ReactNode }) {
  return (
    <div className="group relative aspect-square overflow-hidden rounded-xl bg-surface-sunken ring-1 ring-border">
      <img alt="" className="size-full object-cover" src={src} />
      {cover && <span className="absolute left-2 top-2 rounded-full bg-indigo-600 px-2 py-0.5 text-[11px] font-semibold text-white shadow">{coverLabel}</span>}
      {badge && <span className="absolute right-2 top-2 rounded-full bg-emerald-600 px-2 py-0.5 text-[11px] font-semibold text-white shadow">{badge}</span>}
      <div className="absolute inset-x-0 bottom-0 flex gap-1.5 bg-gradient-to-t from-black/70 to-transparent p-2 pt-8 opacity-0 transition group-focus-within:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100">
        {children}
      </div>
    </div>
  );
}
