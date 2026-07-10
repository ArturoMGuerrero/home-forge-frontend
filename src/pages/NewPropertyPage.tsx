import { DragEvent, FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useOutletContext } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { SubscriptionRestrictions } from '../shared/subscriptionRestrictions';
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
} from '../shared/propertyApi';
import { getJson } from '../shared/services/api';
import { resolveApiAsset } from '../shared/services/api';
import { MoneyInput } from '../shared/MoneyInput';
import { LocationPicker } from '../components/LocationPicker';

// TODO: i18n - Preparar textos para español e inglés
// Los catálogos ya soportan labelEs y labelEn
// Pendiente: Implementar selector de idioma y función t() para traducciones

type CatalogItem = {
  code: string;
  labelEs: string;
  labelEn: string;
};

const inputClass = 'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-normal text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100';
const labelClass = 'grid gap-2 text-sm font-semibold text-slate-700';

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
        published: form.published
      };
      const saved = propertyId
        ? await updateProperty(propertyId, payload)
        : await createProperty(payload);
      if (photos.length > 0) {
        setUploadingImages(true);
        await uploadPropertyImages(saved.id, photos);
        setUploadingImages(false);
      }
      toast.success(editing ? 'Propiedad actualizada correctamente' : 'Propiedad creada correctamente');
      navigate('/app/propiedades');
    } catch (requestError) {
      toast.error(requestError instanceof Error ? requestError.message : 'No fue posible guardar la propiedad.');
    } finally {
      setSaving(false);
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
    return <p className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">Cargando propiedad...</p>;
  }

  return (
    <>
      <header className="mb-8">
        <div className="flex items-center gap-6 mb-6">
          <Link
            to="/app/propiedades"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition font-medium"
          >
            <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver
          </Link>
          <div>
            <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.16em] text-indigo-600">Inventario</p>
            <h1 className="text-3xl font-bold">{editing ? 'Editar propiedad' : 'Agregar propiedad'}</h1>
            <p className="mt-2 text-sm text-slate-500">{editing ? 'Actualiza la información, publicación y galería del inmueble.' : 'Registra la información comercial, ubicación y características del inmueble.'}</p>
          </div>
        </div>
      </header>

      <form className="grid gap-6 xl:grid-cols-[1fr_320px]" onSubmit={submit}>
        <div className="space-y-6">
          <section className="grid gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2 sm:p-6">
            <div className="sm:col-span-2"><p className="text-xs font-bold uppercase tracking-wider text-indigo-600">Información comercial</p></div>
            <label className={`${labelClass} sm:col-span-2`}>Título
              <input className={inputClass} maxLength={180} placeholder="Casa moderna con jardín" required value={form.title} onChange={event => update('title', event.target.value)} />
            </label>
            <label className={labelClass}>Código
              <input className={inputClass} maxLength={80} placeholder="HF-400" required value={form.code} onChange={event => update('code', event.target.value)} />
            </label>
            <label className={labelClass}>Tipo de inmueble
              <select className={inputClass} value={form.propertyType} onChange={event => update('propertyType', event.target.value)}>
                {types.map(item => <option key={item.code} value={item.code}>{item.labelEs}</option>)}
              </select>
            </label>
            <label className={labelClass}>Operación
              <select className={inputClass} value={form.listingType} onChange={event => {
                const listingType = event.target.value as ListingType;
                update('listingType', listingType);
                if (listingType === 'SALE' && form.status === 'RENTED') update('status', 'AVAILABLE');
                if (listingType === 'RENT' && form.status === 'SOLD') update('status', 'AVAILABLE');
              }}>
                <option value="SALE">Venta</option>
                <option value="RENT">Renta</option>
              </select>
            </label>
            <label className={labelClass}>Estado de la propiedad
              <select className={inputClass} value={form.status} onChange={event => update('status', event.target.value)}>
                <option value="AVAILABLE">Disponible</option>
                <option value="RESERVED">Reservada</option>
                <option value="UNDER_CONTRACT">Bajo contrato</option>
                {form.listingType === 'SALE' && <option value="SOLD">Vendida</option>}
                {form.listingType === 'RENT' && <option value="RENTED">Rentada</option>}
                <option value="INACTIVE">No disponible</option>
              </select>
            </label>
            <label className={labelClass}>{form.listingType === 'RENT' ? 'Renta mensual' : 'Precio de venta'}
              <MoneyInput className={inputClass} currency={form.currencyCode} maxLength={19} required value={form.price} onChange={value => update('price', value)} />
            </label>
            <label className={labelClass}>Moneda
              <select className={inputClass} value={form.currencyCode} onChange={event => update('currencyCode', event.target.value)}>
                {currencies.map(item => <option key={item.code} value={item.code}>{item.code} - {item.labelEs}</option>)}
              </select>
            </label>
          </section>

          <section className="grid gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2 sm:p-6">
            <div className="sm:col-span-2"><p className="text-xs font-bold uppercase tracking-wider text-indigo-600">Ubicación</p></div>
            <label className={labelClass}>País
              <select className={inputClass} value={form.countryCode} onChange={event => update('countryCode', event.target.value)}>
                {countries.map(item => <option key={item.code} value={item.code}>{item.labelEs}</option>)}
              </select>
            </label>
            <label className={labelClass}>Estado
              <input className={inputClass} maxLength={80} required value={form.stateCode} onChange={event => update('stateCode', event.target.value)} />
            </label>
            <label className={labelClass}>Ciudad
              <input className={inputClass} maxLength={120} required value={form.city} onChange={event => update('city', event.target.value)} />
            </label>
            <label className={labelClass}>Dirección
              <input className={inputClass} maxLength={255} value={form.address} onChange={event => update('address', event.target.value)} />
            </label>
            <div className="sm:col-span-2">
              <label className={labelClass}>
                Coordenadas GPS
                <div className="mt-2 grid gap-3 sm:grid-cols-2">
                  <input
                    className={inputClass}
                    max="90"
                    min="-90"
                    placeholder="Latitud: 19.4326"
                    step="0.000001"
                    type="number"
                    value={form.latitude}
                    onChange={event => update('latitude', event.target.value)}
                  />
                  <input
                    className={inputClass}
                    max="180"
                    min="-180"
                    placeholder="Longitud: -99.1332"
                    step="0.000001"
                    type="number"
                    value={form.longitude}
                    onChange={event => update('longitude', event.target.value)}
                  />
                </div>
                <button
                  className="mt-3 inline-flex items-center gap-2 rounded-lg border-2 border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100"
                  onClick={() => setShowLocationPicker(true)}
                  type="button"
                >
                  <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  🗺️ Seleccionar en el mapa
                </button>
                <span className="mt-2 block text-xs font-normal text-slate-500">
                  Usa el mapa para ubicar la propiedad o ingresa las coordenadas manualmente
                </span>
              </label>
            </div>
          </section>

          <section className="grid gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-3 sm:p-6">
            <div className="sm:col-span-2 lg:col-span-3"><p className="text-xs font-bold uppercase tracking-wider text-indigo-600">Características</p></div>
            <label className={labelClass}>Recámaras
              <input className={inputClass} max="100" min="0" type="number" value={form.bedrooms} onChange={event => update('bedrooms', event.target.value)} />
            </label>
            <label className={labelClass}>Baños
              <input className={inputClass} max="100" min="0" step="0.5" type="number" value={form.bathrooms} onChange={event => update('bathrooms', event.target.value)} />
            </label>
            <label className={labelClass}>Estacionamientos
              <input className={inputClass} max="100" min="0" type="number" value={form.parkingSpaces} onChange={event => update('parkingSpaces', event.target.value)} />
            </label>
            <label className={labelClass}>Terreno m²
              <input className={inputClass} max="99999999.99" min="0" step="0.01" type="number" value={form.landArea} onChange={event => update('landArea', event.target.value)} />
            </label>
            <label className={labelClass}>Construcción m²
              <input className={inputClass} max="99999999.99" min="0" step="0.01" type="number" value={form.constructionArea} onChange={event => update('constructionArea', event.target.value)} />
            </label>
          </section>

          <section className="grid gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">Presentación</p>
            <label className={labelClass}>URL de imagen principal
              <input className={inputClass} inputMode="url" maxLength={1000} placeholder="https://sitio.com/imagen.jpg" type="text" value={form.imageUrl} onChange={event => update('imageUrl', event.target.value)} />
              <span className="text-xs font-normal text-slate-500">Puedes pegar una URL externa o elegir una foto guardada como portada.</span>
            </label>
            <label className={labelClass}>Descripción
              <textarea className={`${inputClass} min-h-36 resize-y`} maxLength={5000} value={form.description} onChange={event => update('description', event.target.value)} />
            </label>
            <div className="grid gap-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-sm font-semibold text-slate-700">{t('propertyForm.photos')}</span>
                  <p className="mt-1 text-xs text-slate-500">{t('propertyForm.photosDescription')}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold ${existingImages.length + photos.length >= 12 ? 'text-rose-600' : 'text-slate-900'}`}>
                    {t('propertyForm.photosCounter', { count: existingImages.length + photos.length })}
                  </span>
                </div>
              </div>
              <label
                className={`group relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-all ${
                  isDragging
                    ? 'border-indigo-500 bg-indigo-100 scale-[1.02]'
                    : 'border-slate-300 bg-slate-50 hover:border-indigo-400 hover:bg-indigo-50'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className={`rounded-full p-4 transition-all ${isDragging ? 'bg-indigo-200' : 'bg-slate-200 group-hover:bg-indigo-100'}`}>
                  <svg className={`size-8 transition-colors ${isDragging ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className={`text-sm font-semibold transition-colors ${isDragging ? 'text-indigo-700' : 'text-slate-700'}`}>
                    {isDragging ? t('propertyForm.dropPhotosHere') : editing ? t('propertyForm.dragPhotosEdit') : t('propertyForm.dragPhotos')}
                  </p>
                  <p className={`mt-1 text-xs transition-colors ${isDragging ? 'text-indigo-600' : 'text-slate-500'}`}>
                    {t('propertyForm.formatInfo')}
                  </p>
                </div>
                <input accept="image/jpeg,image/png,image/webp" className="sr-only" multiple onChange={event => selectPhotos(event.target.files)} type="file" />
              </label>
              {existingImages.length > 0 && (
                <div>
                  <p className="mb-3 text-xs font-semibold text-slate-600">{t('propertyForm.savedPhotos', { count: existingImages.length })}</p>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {existingImages.map(image => {
                      const url = resolveApiAsset(image.imageUrl);
                      const cover = image.imageUrl === form.imageUrl;
                      return (
                        <div className="group relative aspect-square overflow-hidden rounded-xl bg-slate-100 ring-2 ring-transparent transition hover:ring-indigo-200" key={image.id}>
                          <img alt="" className="size-full object-cover transition group-hover:scale-105" src={url} />
                          {cover && (
                            <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-2.5 py-1 shadow-lg">
                              <svg className="size-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              <span className="text-[10px] font-bold text-white">{t('propertyForm.coverBadge')}</span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
                          <div className="absolute inset-x-2 bottom-2 flex gap-2 opacity-0 transition group-hover:opacity-100">
                            {!cover && (
                              <button className="flex-1 rounded-lg bg-white/95 backdrop-blur-sm px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-white transition" onClick={() => chooseCover(image.id)} type="button">
                                {t('propertyForm.setCover')}
                              </button>
                            )}
                            <button className="rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white hover:bg-rose-700 transition shadow-lg" onClick={() => removeExistingImage(image.id)} type="button">
                              {t('propertyForm.remove')}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {previews.length > 0 && (
                <div>
                  <p className="mb-3 text-xs font-semibold text-slate-600">{t('propertyForm.newPhotos', { count: previews.length })}</p>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {previews.map((preview, index) => (
                      <div className="group relative aspect-square overflow-hidden rounded-xl bg-slate-100 ring-2 ring-transparent transition hover:ring-green-200" key={preview}>
                        <img alt={`Vista previa ${index + 1}`} className="size-full object-cover transition group-hover:scale-105" src={preview} />
                        {index === 0 && !existingImages.length && (
                          <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-2.5 py-1 shadow-lg">
                            <svg className="size-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="text-[10px] font-bold text-white">{t('propertyForm.coverBadge')}</span>
                          </div>
                        )}
                        <span className="absolute right-2 top-2 rounded-full bg-green-500 px-2 py-1 text-[10px] font-bold text-white shadow-lg">{t('propertyForm.newBadge')}</span>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
                        <button
                          aria-label={t('propertyForm.removePhoto')}
                          className="absolute inset-x-2 bottom-2 rounded-lg bg-slate-900/95 backdrop-blur-sm px-3 py-2 text-xs font-semibold text-white opacity-0 transition hover:bg-slate-900 group-hover:opacity-100"
                          onClick={() => setPhotos(current => current.filter((_, photoIndex) => photoIndex !== index))}
                          type="button"
                        >
                          {t('propertyForm.remove')}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Owner Contact Information */}
          <section className="grid gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">Información de Contacto del Propietario</p>
            <label className={labelClass}>Nombre del Propietario
              <input
                className={inputClass}
                maxLength={150}
                placeholder="Juan Pérez"
                type="text"
                value={form.ownerName}
                onChange={event => update('ownerName', event.target.value)}
              />
            </label>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className={labelClass}>Email
                <input
                  className={inputClass}
                  maxLength={100}
                  placeholder="propietario@ejemplo.com"
                  type="email"
                  value={form.ownerEmail}
                  onChange={event => update('ownerEmail', event.target.value)}
                />
              </label>
              <label className={labelClass}>Teléfono Principal
                <input
                  className={inputClass}
                  maxLength={20}
                  placeholder="+52 614 123 4567"
                  type="tel"
                  value={form.ownerPhone}
                  onChange={event => update('ownerPhone', event.target.value)}
                />
              </label>
            </div>

            <label className={labelClass}>Teléfono Secundario (Opcional)
              <input
                className={inputClass}
                maxLength={20}
                placeholder="+52 614 987 6543"
                type="tel"
                value={form.ownerPhoneSecondary}
                onChange={event => update('ownerPhoneSecondary', event.target.value)}
              />
              <span className="text-xs font-normal text-slate-500">Teléfono alternativo de contacto</span>
            </label>

            <label className={labelClass}>Notas sobre el Propietario
              <textarea
                className={`${inputClass} min-h-24 resize-y`}
                maxLength={5000}
                placeholder="Información adicional sobre el propietario, horarios de contacto, preferencias, etc."
                value={form.ownerNotes}
                onChange={event => update('ownerNotes', event.target.value)}
              />
              <span className="text-xs font-normal text-slate-500">Información interna que te ayudará a contactar al propietario</span>
            </label>
          </section>
        </div>

        <aside className="space-y-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold">Publicación</h2>
            <label className="mt-4 flex items-start gap-3 text-sm text-slate-600">
              <input checked={form.published} className="mt-1 size-4 accent-indigo-600" onChange={event => update('published', event.target.checked)} type="checkbox" />
              Mostrar esta propiedad en el catálogo público.
            </label>
          </section>
          <button className="w-full rounded-xl bg-indigo-600 px-3.5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60" disabled={saving || (editing && !restrictions.canEdit)} type="submit">
            {uploadingImages
              ? t('propertyForm.uploading', { count: photos.length })
              : saving
              ? t('propertyForm.saving')
              : editing && !restrictions.canEdit
              ? '🔒 ' + t('propertyForm.saveChanges')
              : editing
              ? t('propertyForm.saveChanges')
              : t('propertyForm.saveProperty')}
          </button>
          {editing && (
            <button
              className="w-full rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
              onClick={() => setShowDeleteModal(true)}
              type="button"
            >
              Eliminar propiedad
            </button>
          )}
        </aside>
      </form>

      {/* Selector de ubicación en mapa */}
      {showLocationPicker && (
        <LocationPicker
          latitude={form.latitude}
          longitude={form.longitude}
          onLocationChange={(lat, lng) => {
            update('latitude', lat.toString());
            update('longitude', lng.toString());
            toast.success('Ubicación actualizada correctamente');
          }}
          onClose={() => setShowLocationPicker(false)}
        />
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="grid size-12 place-items-center rounded-full bg-rose-100">
                <svg className="size-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-slate-900">¿Eliminar propiedad?</h3>
                <p className="text-sm text-slate-500">Esta acción no se puede deshacer</p>
              </div>
            </div>
            <p className="mb-6 text-sm text-slate-600">
              Se eliminará <strong>{form.title || 'esta propiedad'}</strong> ({form.code}) permanentemente. Las asignaciones a prospectos también se eliminarán.
            </p>
            <div className="flex gap-3">
              <button
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                disabled={deleting}
                onClick={() => setShowDeleteModal(false)}
                type="button"
              >
                Cancelar
              </button>
              <button
                className="flex-1 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={deleting}
                onClick={handleDelete}
                type="button"
              >
                {deleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
