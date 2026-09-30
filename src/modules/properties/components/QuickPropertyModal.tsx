import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Alert, Button, fieldClass, fieldLabelClass, Input, Modal, RequiredMark, Select } from '../../../shared/ui';
import { createProperty, ListingType } from '../api/propertyApi';
import { MoneyInput } from '../../../shared/MoneyInput';
import { getJson } from '../../../shared/services/api';

type CatalogItem = {
  code: string;
  labelEs: string;
  labelEn: string;
};

interface QuickPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const initialForm = {
  code: '',
  title: '',
  propertyType: 'HOUSE',
  listingType: 'SALE' as ListingType,
  price: '',
  currencyCode: 'MXN',
  city: '',
  stateCode: ''
};

export function QuickPropertyModal({ isOpen, onClose, onSuccess }: QuickPropertyModalProps) {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [types, setTypes] = useState<CatalogItem[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      getJson<CatalogItem[]>('/catalogs/property-types')
        .then(setTypes)
        .catch(() => toast.error('No se pudieron cargar los tipos de propiedad'));
    }
  }, [isOpen]);

  function update(name: string, value: string) {
    setForm(current => ({ ...current, [name]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const created = await createProperty({
        code: form.code,
        title: form.title,
        propertyType: form.propertyType,
        listingType: form.listingType,
        status: 'AVAILABLE',
        price: Number(form.price),
        currencyCode: form.currencyCode,
        countryCode: 'MX',
        stateCode: form.stateCode,
        city: form.city,
        address: undefined,
        latitude: undefined,
        longitude: undefined,
        bedrooms: undefined,
        bathrooms: undefined,
        landArea: undefined,
        constructionArea: undefined,
        parkingSpaces: undefined,
        description: undefined,
        imageUrl: undefined,
        published: false
      });

      toast.success('Propiedad creada. Ahora agrega más detalles y fotos.');
      onSuccess();
      handleClose();

      // Redirigir a la página de edición completa
      navigate(`/app/propiedades/${created.id}/editar`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al crear la propiedad');
    } finally {
      setSaving(false);
    }
  }

  function handleClose() {
    setForm(initialForm);
    onClose();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Crear propiedad rápida"
      subtitle="Completa la información básica, luego agrega fotos y detalles"
      maxWidth="2xl"
      footer={
        <>
          <Button onClick={handleClose} variant="tertiary">Cancelar</Button>
          <Button form="quick-property-form" loading={saving} type="submit">Crear y continuar</Button>
        </>
      }
    >
      <form className="space-y-5" id="quick-property-form" onSubmit={handleSubmit}>
        {/* Título */}
        <Input
          label="Título de la propiedad"
          required
          value={form.title}
          onChange={e => update('title', e.target.value)}
          placeholder="Ej: Casa moderna en zona residencial"
        />

        {/* Código (opcional) */}
        <Input
          label="Código (opcional)"
          value={form.code}
          onChange={e => update('code', e.target.value)}
          placeholder="Ej: PROP-001"
        />

        {/* Tipo y Operación */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Tipo de propiedad"
            required
            value={form.propertyType}
            onChange={e => update('propertyType', e.target.value)}
            options={types.map(type => ({
              value: type.code,
              label: type.labelEs
            }))}
          />

          <Select
            label="Operación"
            required
            value={form.listingType}
            onChange={e => update('listingType', e.target.value as ListingType)}
            options={[
              { value: 'SALE', label: 'Venta' },
              { value: 'RENT', label: 'Renta' }
            ]}
          />
        </div>

        {/* Precio */}
        <div>
          <label className={fieldLabelClass} htmlFor="quick-property-price">Precio<RequiredMark /></label>
          <MoneyInput
            className={fieldClass()}
            currency={form.currencyCode}
            id="quick-property-price"
            onChange={value => update('price', value)}
            required
            value={form.price}
          />
        </div>

        {/* Ubicación */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Estado"
            value={form.stateCode}
            onChange={e => update('stateCode', e.target.value)}
            placeholder="Ej: Chihuahua"
          />

          <Input
            label="Ciudad"
            required
            value={form.city}
            onChange={e => update('city', e.target.value)}
            placeholder="Ej: Chihuahua"
          />
        </div>

        {/* Info */}
        <Alert variant="info" title="Creación rápida">
          Después de crear la propiedad, podrás agregar fotos, descripción detallada, amenidades y más información en la página de edición.
        </Alert>

      </form>
    </Modal>
  );
}
