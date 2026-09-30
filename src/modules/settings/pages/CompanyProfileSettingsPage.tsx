import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CompanyProfilePayload, getCompanyProfile, updateCompanyProfile } from '../api/companyApi';
import { getCompanyId } from '../../leads';
import { getCompanyLogo, setCompanyLogo } from '../api/companyBranding';

const inputClass = 'w-full rounded-xl border border-border bg-surface px-3.5 py-3 text-sm font-normal text-fg outline-none transition placeholder:text-fg-subtle focus:border-primary focus:ring-2 focus:ring-primary-line';
const labelClass = 'grid gap-2 text-sm font-semibold text-fg-muted';

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
    return <p className="rounded-2xl border border-border bg-surface p-8 text-center text-sm text-fg-subtle">Cargando perfil empresarial...</p>;
  }

  return (
    <>
      <header className="mb-8">
        <Link className="text-sm font-semibold text-primary-fg" to="/app/configuracion">&lt;- Volver a configuración</Link>
        <p className="mb-1 mt-5 text-[11px] font-bold uppercase tracking-[0.16em] text-primary-fg">Identidad pública</p>
        <h1 className="text-3xl font-bold">Perfil de la empresa</h1>
        <p className="mt-2 max-w-3xl text-sm text-fg-subtle">Esta información ayuda a que los compradores y arrendatarios conozcan quién publica las propiedades y puedan confiar en tu operación.</p>
      </header>

      <form className="grid gap-6 xl:grid-cols-[1fr_340px]" onSubmit={submit}>
        <div className="space-y-6">
          <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="grid size-24 shrink-0 place-items-center overflow-hidden rounded-2xl border border-border bg-surface-muted text-2xl font-black text-primary-fg">
                {logo ? <img alt={`Logo de ${form.name || 'la empresa'}`} className="size-full object-contain p-2" src={logo} /> : (form.name || 'HF').slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary-fg">Identidad empresarial</p>
                <h2 className="mt-1 text-lg font-bold">Logo de la empresa</h2>
                <p className="mt-1 text-sm text-fg-subtle">Es diferente al avatar personal y representa a la inmobiliaria en la navegación.</p>
                <input accept="image/png,image/jpeg,image/webp,image/svg+xml" className="hidden" onChange={selectLogo} ref={logoInputRef} type="file" />
                <div className="mt-4 flex flex-wrap gap-2">
                  <button className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover" onClick={() => logoInputRef.current?.click()} type="button">{logo ? 'Cambiar logo' : 'Subir logo'}</button>
                  {logo && <button className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-fg-muted hover:bg-surface-muted" onClick={() => { setCompanyLogo(companyId, ''); setLogo(''); }} type="button">Usar iniciales</button>}
                </div>
                <p className="mt-2 text-xs text-fg-subtle">PNG, JPG, WebP o SVG. Máximo 2 MB. Se guarda en este dispositivo.</p>
              </div>
            </div>
          </section>

          <section className="grid gap-5 rounded-2xl border border-border bg-surface p-5 shadow-sm sm:grid-cols-2 sm:p-6">
            <div className="sm:col-span-2"><h2 className="text-lg font-bold">Datos principales</h2></div>
            <label className={`${labelClass} sm:col-span-2`}>Nombre comercial
              <input className={inputClass} maxLength={180} onChange={event => update('name', event.target.value)} required value={form.name} />
            </label>
            <label className={labelClass}>País
              <select className={inputClass} onChange={event => update('countryCode', event.target.value)} value={form.countryCode}>
                <option value="MX">México</option>
                <option value="US">Estados Unidos</option>
              </select>
            </label>
            <label className={labelClass}>Estado
              <input className={inputClass} maxLength={80} onChange={event => update('stateCode', event.target.value)} required value={form.stateCode} />
            </label>
            <label className={labelClass}>Ciudad
              <input className={inputClass} maxLength={120} onChange={event => update('city', event.target.value)} value={form.city ?? ''} />
            </label>
            <label className={labelClass}>Código postal
              <input className={inputClass} maxLength={20} onChange={event => update('postalCode', event.target.value)} value={form.postalCode ?? ''} />
            </label>
            <label className={`${labelClass} sm:col-span-2`}>Dirección
              <input className={inputClass} maxLength={255} onChange={event => update('address', event.target.value)} placeholder="Calle, número y colonia" value={form.address ?? ''} />
            </label>
          </section>

          <section className="grid gap-5 rounded-2xl border border-border bg-surface p-5 shadow-sm sm:grid-cols-2 sm:p-6">
            <div className="sm:col-span-2"><h2 className="text-lg font-bold">Contacto y respaldo</h2></div>
            <label className={labelClass}>Correo público
              <input className={inputClass} onChange={event => update('publicEmail', event.target.value)} type="email" value={form.publicEmail ?? ''} />
            </label>
            <label className={labelClass}>Teléfono / WhatsApp
              <input className={inputClass} onChange={event => update('publicPhoneE164', event.target.value)} pattern="^\+[1-9][0-9]{1,14}$" placeholder="+524421234567" value={form.publicPhoneE164 ?? ''} />
            </label>
            <label className={`${labelClass} sm:col-span-2`}>Sitio web
              <input className={inputClass} maxLength={500} onChange={event => update('websiteUrl', event.target.value)} placeholder="https://tuempresa.com" type="url" value={form.websiteUrl ?? ''} />
            </label>
            <label className={labelClass}>Registro o licencia profesional
              <input className={inputClass} maxLength={120} onChange={event => update('professionalLicense', event.target.value)} placeholder="Número de licencia o afiliación" value={form.professionalLicense ?? ''} />
            </label>
            <label className={labelClass}>Años de experiencia
              <input className={inputClass} max="300" min="0" onChange={event => update('yearsExperience', event.target.value === '' ? undefined : Number(event.target.value))} type="number" value={form.yearsExperience ?? ''} />
            </label>
          </section>

          <section className="grid gap-5 rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-bold">Presentación institucional</h2>
            <label className={labelClass}>Acerca de la empresa
              <textarea className={`${inputClass} min-h-36 resize-y`} maxLength={5000} onChange={event => update('publicDescription', event.target.value)} placeholder="Historia, especialidad, zonas donde trabajan y aquello que los distingue." value={form.publicDescription ?? ''} />
            </label>
            <label className={labelClass}>Misión
              <textarea className={`${inputClass} min-h-28 resize-y`} maxLength={3000} onChange={event => update('mission', event.target.value)} value={form.mission ?? ''} />
            </label>
            <label className={labelClass}>Visión
              <textarea className={`${inputClass} min-h-28 resize-y`} maxLength={3000} onChange={event => update('vision', event.target.value)} value={form.vision ?? ''} />
            </label>
          </section>
        </div>

        <aside className="space-y-5">
          <section className="rounded-2xl border border-primary-line bg-primary-soft p-5">
            <h2 className="font-bold text-primary-fg">Vista pública</h2>
            <p className="mt-2 text-sm leading-6 text-primary-fg">Los clientes podrán abrir este perfil desde cualquier propiedad publicada y consultar tus datos institucionales.</p>
            <Link className="mt-4 inline-flex rounded-xl bg-surface px-3.5 py-2.5 text-sm font-semibold text-primary-fg shadow-sm" target="_blank" to={`/empresas/${getCompanyId()}`}>Ver perfil público</Link>
          </section>
          <button className="w-full rounded-xl bg-primary px-3.5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover disabled:opacity-60" disabled={saving} type="submit">
            {saving ? 'Guardando...' : 'Guardar perfil empresarial'}
          </button>
        </aside>
      </form>
    </>
  );
}
