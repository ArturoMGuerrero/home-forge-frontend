import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CompanyProfilePayload, getCompanyProfile, updateCompanyProfile } from '../api/companyApi';
import { getCompanyId } from '../../leads';
import { getCompanyLogo, setCompanyLogo } from '../api/companyBranding';
import { Button, buttonClasses, Card, Input, LoadingState, PageHeader, Select, Textarea } from '../../../shared/ui';
import { Icon } from '../../../shared/Icon';


const emptyProfile: CompanyProfilePayload = {
  name: '',
  countryCode: 'MX',
  stateCode: '',
  city: '',
  address: '',
  postalCode: '',
  publicEmail: '',
  publicPhoneE164: '',
  websiteUrl: '',
  publicDescription: '',
  mission: '',
  vision: '',
  professionalLicense: '',
  yearsExperience: undefined
};

export function CompanyProfileSettingsPage() {
  const companyId = getCompanyId();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [logo, setLogo] = useState(() => getCompanyLogo(companyId));
  const [form, setForm] = useState<CompanyProfilePayload>(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getCompanyProfile()
      .then(({ id: _id, ...profile }) => setForm(profile))
      .catch(requestError => toast.error(requestError instanceof Error ? requestError.message : 'No fue posible cargar la empresa.'))
      .finally(() => setLoading(false));
  }, []);

  function update<K extends keyof CompanyProfilePayload>(name: K, value: CompanyProfilePayload[K]) {
    setForm(current => ({ ...current, [name]: value }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const saved = await updateCompanyProfile({
        ...form,
        yearsExperience: form.yearsExperience === undefined ? undefined : Number(form.yearsExperience)
      });
      const { id: _id, ...profile } = saved;
      setForm(profile);
      toast.success('Perfil empresarial actualizado. Los cambios ya aparecen en el sitio público.');
    } catch (requestError) {
      toast.error(requestError instanceof Error ? requestError.message : 'No fue posible guardar el perfil.');
    } finally {
      setSaving(false);
    }
  }

  function selectLogo(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return toast.error('Selecciona una imagen válida.');
    if (file.size > 2 * 1024 * 1024) return toast.error('El logo no debe superar 2 MB.');
    const reader = new FileReader();
    reader.onload = () => {
      const value = String(reader.result);
      setCompanyLogo(companyId, value);
      setLogo(value);
      toast.success('Logo empresarial actualizado.');
    };
    reader.readAsDataURL(file);
  }

  if (loading) {
    return <Card><LoadingState message="Cargando perfil empresarial..." /></Card>;
  }

  return (
    <>
      <PageHeader
        backLink={{ to: '/app/configuracion', label: 'Configuración' }}
        eyebrow="Identidad pública"
        subtitle="Esta información ayuda a que compradores y arrendatarios conozcan quién publica las propiedades y puedan confiar en tu operación."
        title="Perfil de la empresa"
      />

      <form className="grid gap-6 xl:grid-cols-[1fr_320px]" onSubmit={submit}>
        <div className="space-y-6">
          <Card>
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="grid size-24 shrink-0 place-items-center overflow-hidden rounded-2xl border border-border bg-surface-muted text-2xl font-bold text-primary-fg">
                {logo ? <img alt={`Logo de ${form.name || 'la empresa'}`} className="size-full object-contain p-2" src={logo} /> : (form.name || 'HF').slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-semibold text-fg">Logo de la empresa</h2>
                <p className="mt-1 text-sm text-fg-subtle">Es diferente al avatar personal y representa a la inmobiliaria en la navegación.</p>
                <input accept="image/png,image/jpeg,image/webp,image/svg+xml" className="hidden" onChange={selectLogo} ref={logoInputRef} type="file" />
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button icon={<Icon className="size-4" name="upload" />} onClick={() => logoInputRef.current?.click()} size="sm">{logo ? 'Cambiar logo' : 'Subir logo'}</Button>
                  {logo && <Button onClick={() => { setCompanyLogo(companyId, ''); setLogo(''); }} size="sm" variant="tertiary">Usar iniciales</Button>}
                </div>
                <p className="mt-2 text-xs text-fg-subtle">PNG, JPG, WebP o SVG. Máximo 2 MB. Se guarda en este dispositivo.</p>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="mb-5 text-lg font-semibold text-fg">Datos principales</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <Input containerClassName="sm:col-span-2" label="Nombre comercial" maxLength={180} onChange={event => update('name', event.target.value)} required value={form.name} />
              <Select label="País" onChange={event => update('countryCode', event.target.value)} options={[{ value: 'MX', label: 'México' }, { value: 'US', label: 'Estados Unidos' }]} value={form.countryCode} />
              <Input label="Estado" maxLength={80} onChange={event => update('stateCode', event.target.value)} required value={form.stateCode} />
              <Input label="Ciudad" maxLength={120} onChange={event => update('city', event.target.value)} value={form.city ?? ''} />
              <Input label="Código postal" maxLength={20} onChange={event => update('postalCode', event.target.value)} value={form.postalCode ?? ''} />
              <Input containerClassName="sm:col-span-2" label="Dirección" maxLength={255} onChange={event => update('address', event.target.value)} placeholder="Calle, número y colonia" value={form.address ?? ''} />
            </div>
          </Card>

          <Card>
            <h2 className="mb-5 text-lg font-semibold text-fg">Contacto y respaldo</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <Input label="Correo público" onChange={event => update('publicEmail', event.target.value)} type="email" value={form.publicEmail ?? ''} />
              <Input label="Teléfono / WhatsApp" onChange={event => update('publicPhoneE164', event.target.value)} pattern="^\+[1-9][0-9]{1,14}$" placeholder="+524421234567" type="tel" value={form.publicPhoneE164 ?? ''} />
              <Input containerClassName="sm:col-span-2" label="Sitio web" maxLength={500} onChange={event => update('websiteUrl', event.target.value)} placeholder="https://tuempresa.com" type="url" value={form.websiteUrl ?? ''} />
              <Input label="Registro o licencia profesional" maxLength={120} onChange={event => update('professionalLicense', event.target.value)} placeholder="Número de licencia o afiliación" value={form.professionalLicense ?? ''} />
              <Input label="Años de experiencia" max="300" min="0" onChange={event => update('yearsExperience', event.target.value === '' ? undefined : Number(event.target.value))} type="number" value={form.yearsExperience ?? ''} />
            </div>
          </Card>

          <Card>
            <h2 className="mb-5 text-lg font-semibold text-fg">Presentación institucional</h2>
            <div className="grid gap-5">
              <Textarea className="min-h-36" label="Acerca de la empresa" maxLength={5000} onChange={event => update('publicDescription', event.target.value)} placeholder="Historia, especialidad, zonas donde trabajan y aquello que los distingue." value={form.publicDescription ?? ''} />
              <Textarea className="min-h-28" label="Misión" maxLength={3000} onChange={event => update('mission', event.target.value)} value={form.mission ?? ''} />
              <Textarea className="min-h-28" label="Visión" maxLength={3000} onChange={event => update('vision', event.target.value)} value={form.vision ?? ''} />
            </div>
          </Card>
        </div>

        <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
          <Card>
            <h2 className="font-semibold text-fg">Vista pública</h2>
            <p className="mt-1.5 text-sm text-fg-subtle">Los clientes pueden abrir este perfil desde cualquier propiedad publicada y consultar tus datos institucionales.</p>
            <Link className={buttonClasses({ variant: 'tertiary', size: 'sm', className: 'mt-4' })} target="_blank" to={`/empresas/${getCompanyId()}`}>
              Ver perfil público
              <Icon className="size-3.5" name="external" />
            </Link>
          </Card>
          <Button fullWidth loading={saving} size="lg" type="submit">
            {saving ? 'Guardando...' : 'Guardar perfil empresarial'}
          </Button>
        </aside>
      </form>
    </>
  );
}
