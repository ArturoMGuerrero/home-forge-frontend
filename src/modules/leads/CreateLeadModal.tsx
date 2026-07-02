import { FormEvent, useState } from 'react';
import toast from 'react-hot-toast';
import { getCompanyId, LeadItem } from '../../shared/leads';
import { MoneyInput } from '../../shared/MoneyInput';
import { postJson } from '../../shared/services/api';
import { Modal } from '../../shared/ui/Modal';

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: (lead: LeadItem) => void;
};

export function CreateLeadModal({ open, onClose, onCreated }: Props) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phoneE164: '', listingType: 'SALE', budgetMax: '', currencyCode: 'MXN', city: '' });

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
      setForm({ firstName: '', lastName: '', email: '', phoneE164: '', listingType: 'SALE', budgetMax: '', currencyCode: 'MXN', city: '' });
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
      isOpen={open}
      onClose={onClose}
      title="Nuevo prospecto"
      subtitle="CRM"
      maxWidth="lg"
    >
      <form className="p-6" onSubmit={submit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Nombre
            <input
              autoFocus
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-normal text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              required
              value={form.firstName}
              onChange={e => setForm({ ...form, firstName: e.target.value })}
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Apellido
            <input
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-normal text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              required
              value={form.lastName}
              onChange={e => setForm({ ...form, lastName: e.target.value })}
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-700 sm:col-span-2">
            Correo
            <input
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-normal text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-700 sm:col-span-2">
            Teléfono E.164
            <input
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-normal text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              pattern="^\+[1-9][0-9]{1,14}$"
              placeholder="+524421234567"
              value={form.phoneE164}
              onChange={e => setForm({ ...form, phoneE164: e.target.value })}
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Busca
            <select
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-normal"
              value={form.listingType}
              onChange={e => setForm({ ...form, listingType: e.target.value })}
            >
              <option value="SALE">Comprar</option>
              <option value="RENT">Rentar</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Ciudad
            <input
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-normal"
              maxLength={120}
              value={form.city}
              onChange={e => setForm({ ...form, city: e.target.value })}
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Presupuesto máximo
            <MoneyInput
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-normal outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              currency={form.currencyCode}
              maxLength={19}
              value={form.budgetMax}
              onChange={value => setForm({ ...form, budgetMax: value })}
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">
            Moneda
            <select
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-normal"
              value={form.currencyCode}
              onChange={e => setForm({ ...form, currencyCode: e.target.value })}
            >
              <option value="MXN">MXN</option>
              <option value="USD">USD</option>
            </select>
          </label>
        </div>
        <div className="mt-7 flex justify-end gap-3 border-t border-slate-200 pt-6">
          <button
            className="shrink-0 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500"
            onClick={onClose}
            type="button"
          >
            Cancelar
          </button>
          <button
            className="shrink-0 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
            disabled={saving}
            type="submit"
          >
            {saving ? 'Guardando...' : 'Guardar prospecto'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
