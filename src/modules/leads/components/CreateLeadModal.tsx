import { FormEvent, useState } from 'react';
import toast from 'react-hot-toast';
import { getCompanyId, LeadItem } from '../api/leadsApi';
import { MoneyInput } from '../../../shared/MoneyInput';
import { postJson } from '../../../shared/services/api';
import { Button, fieldClass, fieldLabelClass, Input, Modal, Select } from '../../../shared/ui';

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: (lead: LeadItem) => void;
};

const emptyForm = { firstName: '', lastName: '', email: '', phoneE164: '', listingType: 'SALE', budgetMax: '', currencyCode: 'MXN', city: '' };
const FORM_ID = 'create-lead-form';

export function CreateLeadModal({ open, onClose, onCreated }: Props) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    const payload = {
      companyId: getCompanyId(),
      ...form,
      budgetMax: form.budgetMax === '' ? undefined : Number(form.budgetMax)
    };

    try {
      const created = await postJson<LeadItem>('/leads', payload);
      onCreated(created);
      setForm(emptyForm);
      toast.success('Prospecto creado correctamente');
      onClose();
    } catch (requestError) {
      toast.error(requestError instanceof Error ? requestError.message : 'No fue posible guardar el prospecto.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      footer={
        <>
          <Button onClick={onClose} variant="tertiary">Cancelar</Button>
          <Button form={FORM_ID} loading={saving} type="submit">{saving ? 'Guardando...' : 'Guardar prospecto'}</Button>
        </>
      }
      isOpen={open}
      maxWidth="lg"
      onClose={onClose}
      subtitle="Registra los datos de contacto y lo que busca."
      title="Nuevo prospecto"
    >
      <form className="grid gap-4 sm:grid-cols-2" id={FORM_ID} onSubmit={submit}>
        <Input label="Nombre" onChange={e => setForm({ ...form, firstName: e.target.value })} required value={form.firstName} />
        <Input label="Apellido" onChange={e => setForm({ ...form, lastName: e.target.value })} required value={form.lastName} />
        <Input containerClassName="sm:col-span-2" label="Correo" onChange={e => setForm({ ...form, email: e.target.value })} type="email" value={form.email} />
        <Input
          containerClassName="sm:col-span-2"
          helperText="Formato internacional, con lada del país."
          label="Teléfono"
          onChange={e => setForm({ ...form, phoneE164: e.target.value })}
          pattern="^\+[1-9][0-9]{1,14}$"
          placeholder="+524421234567"
          type="tel"
          value={form.phoneE164}
        />
        <Select
          label="Busca"
          onChange={e => setForm({ ...form, listingType: e.target.value })}
          options={[{ value: 'SALE', label: 'Comprar' }, { value: 'RENT', label: 'Rentar' }]}
          value={form.listingType}
        />
        <Input label="Ciudad" maxLength={120} onChange={e => setForm({ ...form, city: e.target.value })} value={form.city} />
        <div>
          <label className={fieldLabelClass} htmlFor="lead-budget">Presupuesto máximo</label>
          <MoneyInput
            className={fieldClass()}
            currency={form.currencyCode}
            id="lead-budget"
            maxLength={19}
            onChange={value => setForm({ ...form, budgetMax: value })}
            value={form.budgetMax}
          />
        </div>
        <Select
          label="Moneda"
          onChange={e => setForm({ ...form, currencyCode: e.target.value })}
          options={[{ value: 'MXN', label: 'MXN' }, { value: 'USD', label: 'USD' }]}
          value={form.currencyCode}
        />
      </form>
    </Modal>
  );
}
