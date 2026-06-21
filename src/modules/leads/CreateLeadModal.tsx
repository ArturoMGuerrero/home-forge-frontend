import { FormEvent, useEffect, useRef, useState } from 'react';
import { getCompanyId, LeadItem } from '../../shared/leads';
import { MoneyInput } from '../../shared/MoneyInput';
import { postJson } from '../../shared/services/api';

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: (lead: LeadItem) => void;
};

export function CreateLeadModal({ open, onClose, onCreated }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phoneE164: '', listingType: 'SALE', budgetMax: '', currencyCode: 'MXN', city: '' });

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  function close() {
    setError('');
    onClose();
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError('');
    const payload = {
      companyId: getCompanyId(),
      ...form,
      budgetMax: form.budgetMax === '' ? undefined : Number(form.budgetMax)
    };

    try {
      const created = await postJson<LeadItem>('/leads', payload);
      onCreated(created);
      setForm({ firstName: '', lastName: '', email: '', phoneE164: '', listingType: 'SALE', budgetMax: '', currencyCode: 'MXN', city: '' });
      close();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'No fue posible guardar el prospecto.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <dialog className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-3xl bg-white p-0 shadow-2xl backdrop:bg-slate-950/60" onCancel={close} ref={dialogRef}>
      <form className="p-6 sm:p-7" onSubmit={submit}>
        <div className="mb-6 flex items-start justify-between gap-4">
          <div><p className="mb-1 text-[11px] font-bold uppercase tracking-[0.16em] text-indigo-600">CRM</p><h2 className="text-2xl font-bold">Nuevo prospecto</h2></div>
          <button aria-label="Cerrar" className="grid size-9 place-items-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200" onClick={close} type="button">X</button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-semibold text-slate-700">Nombre<input autoFocus className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-normal text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" required value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} /></label>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">Apellido<input className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-normal text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" required value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} /></label>
          <label className="grid gap-2 text-sm font-semibold text-slate-700 sm:col-span-2">Correo<input className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-normal text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></label>
          <label className="grid gap-2 text-sm font-semibold text-slate-700 sm:col-span-2">Teléfono E.164<input className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-normal text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" pattern="^\+[1-9][0-9]{1,14}$" placeholder="+524421234567" value={form.phoneE164} onChange={e => setForm({ ...form, phoneE164: e.target.value })} /></label>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">Busca
            <select className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-normal" value={form.listingType} onChange={e => setForm({ ...form, listingType: e.target.value })}>
              <option value="SALE">Comprar</option>
              <option value="RENT">Rentar</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">Ciudad<input className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-normal" maxLength={120} value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} /></label>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">Presupuesto máximo<MoneyInput className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-normal outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" currency={form.currencyCode} maxLength={19} value={form.budgetMax} onChange={value => setForm({ ...form, budgetMax: value })} /></label>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">Moneda
            <select className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-normal" value={form.currencyCode} onChange={e => setForm({ ...form, currencyCode: e.target.value })}>
              <option value="MXN">MXN</option>
              <option value="USD">USD</option>
            </select>
          </label>
        </div>
        {error && <p className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
        <div className="mt-7 flex justify-end gap-3">
          <button className="shrink-0 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-cyan-300 hover:bg-cyan-50 focus:outline-none focus:ring-2 focus:ring-cyan-500" onClick={close} type="button">Cancelar</button>
          <button className="shrink-0 rounded-xl bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60" disabled={saving} type="submit">{saving ? 'Guardando...' : 'Guardar prospecto'}</button>
        </div>
      </form>
    </dialog>
  );
}
