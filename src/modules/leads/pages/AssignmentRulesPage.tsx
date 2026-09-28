import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { AssignmentRule, AssignmentStrategy, createAssignmentRule, deleteAssignmentRule, listAssignmentRules, updateAssignmentRule } from '../api/assignmentRulesApi';
import { CompanyUser, listCompanyUsers } from '../../users';
import { Button } from '../../../shared/ui/Button';
import { Modal } from '../../../shared/ui/Modal';
import { Icon } from '../../../shared/Icon';

const strategyLabels: Record<AssignmentStrategy, string> = {
  ROUND_ROBIN: 'Turnos equilibrados',
  LEAST_ASSIGNED: 'Menor carga',
  RANDOM: 'Aleatoria'
};

const emptyForm = {
  name: '', description: '', priority: 10, assignmentStrategy: 'ROUND_ROBIN' as AssignmentStrategy,
  criteriaListingType: '', criteriaCity: '', criteriaBudgetMin: '', criteriaBudgetMax: '', assignedUserIds: [] as string[]
};

export function AssignmentRulesPage() {
  const [rules, setRules] = useState<AssignmentRule[]>([]);
  const [users, setUsers] = useState<CompanyUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    Promise.all([listAssignmentRules(), listCompanyUsers()])
      .then(([ruleItems, userResponse]) => { setRules(ruleItems); setUsers(userResponse.users.filter(user => user.active)); })
      .catch(error => toast.error(error instanceof Error ? error.message : 'No fue posible cargar las reglas.'))
      .finally(() => setLoading(false));
  }, []);

  const userNames = useMemo(() => new Map(users.map(user => [user.id, user.fullName])), [users]);

  async function save() {
    if (!form.name.trim()) return toast.error('Escribe un nombre para la regla.');
    if (!form.assignedUserIds.length) return toast.error('Selecciona por lo menos un agente.');
    if (form.criteriaBudgetMin && form.criteriaBudgetMax && Number(form.criteriaBudgetMin) > Number(form.criteriaBudgetMax)) return toast.error('El presupuesto mínimo no puede superar al máximo.');
    setSaving(true);
    try {
      const created = await createAssignmentRule({
        name: form.name.trim(), description: form.description.trim() || undefined, priority: Number(form.priority), assignmentStrategy: form.assignmentStrategy,
        criteriaListingType: form.criteriaListingType || undefined, criteriaCity: form.criteriaCity.trim() || undefined,
        criteriaBudgetMin: form.criteriaBudgetMin ? Number(form.criteriaBudgetMin) : undefined,
        criteriaBudgetMax: form.criteriaBudgetMax ? Number(form.criteriaBudgetMax) : undefined,
        assignedUserIds: form.assignedUserIds.join(',')
      });
      setRules(current => [...current, created].sort((a, b) => a.priority - b.priority));
      setForm(emptyForm); setOpen(false); toast.success('Regla de asignación creada.');
    } catch (error) { toast.error(error instanceof Error ? error.message : 'No fue posible crear la regla.'); }
    finally { setSaving(false); }
  }

  async function toggle(rule: AssignmentRule) {
    try {
      const updated = await updateAssignmentRule(rule.id, { active: !rule.active });
      setRules(current => current.map(item => item.id === rule.id ? updated : item));
      toast.success(updated.active ? 'Regla activada.' : 'Regla pausada.');
    } catch (error) { toast.error(error instanceof Error ? error.message : 'No fue posible actualizar la regla.'); }
  }

  async function changePriority(rule: AssignmentRule, direction: -1 | 1) {
    const priority = Math.max(0, rule.priority + direction);
    try {
      const updated = await updateAssignmentRule(rule.id, { priority });
      setRules(current => current.map(item => item.id === rule.id ? updated : item).sort((a, b) => a.priority - b.priority));
    } catch (error) { toast.error(error instanceof Error ? error.message : 'No fue posible cambiar la prioridad.'); }
  }

  async function remove(rule: AssignmentRule) {
    if (!window.confirm(`¿Eliminar la regla “${rule.name}”?`)) return;
    try { await deleteAssignmentRule(rule.id); setRules(current => current.filter(item => item.id !== rule.id)); toast.success('Regla eliminada.'); }
    catch (error) { toast.error(error instanceof Error ? error.message : 'No fue posible eliminar la regla.'); }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><Link className="text-sm font-semibold text-indigo-600" to="/app/configuracion">&lt;- Volver a configuración</Link><p className="mb-1 mt-5 text-[11px] font-bold uppercase tracking-[0.16em] text-indigo-600">Automatización comercial</p><h1 className="text-3xl font-bold">Asignación de prospectos</h1><p className="mt-2 max-w-2xl text-sm text-slate-500">Distribuye automáticamente cada prospecto nuevo entre los agentes disponibles.</p></div>
        <Button onClick={() => setOpen(true)}><Icon className="size-4" name="plus" />Nueva regla</Button>
      </header>

      <section className="mb-6 grid gap-4 sm:grid-cols-3">
        <Metric label="Reglas activas" value={rules.filter(rule => rule.active).length} />
        <Metric label="Agentes disponibles" value={users.length} />
        <Metric label="Estrategia recomendada" text="Turnos equilibrados" />
      </section>

      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-900"><strong>Cómo funciona:</strong> las reglas se evalúan de menor a mayor prioridad. La primera que coincida con el prospecto selecciona un agente y registra la asignación.</div>

      <section className="mt-6 space-y-3">
        {loading && <p className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">Cargando reglas...</p>}
        {!loading && !rules.length && <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-10 text-center"><Icon className="mx-auto size-9 text-slate-400" name="users" /><h2 className="mt-3 font-bold">Aún no hay reglas</h2><p className="mt-1 text-sm text-slate-500">Crea una regla general para empezar a repartir prospectos.</p><Button className="mt-5" onClick={() => setOpen(true)}>Crear primera regla</Button></div>}
        {rules.map(rule => {
          const assignedNames = rule.assignedUserIds.split(',').map(id => userNames.get(id.trim())).filter(Boolean);
          const criteria = [rule.criteriaListingType === 'SALE' ? 'Venta' : rule.criteriaListingType === 'RENT' ? 'Renta' : '', rule.criteriaCity, rule.criteriaBudgetMin ? `Desde $${rule.criteriaBudgetMin.toLocaleString()}` : '', rule.criteriaBudgetMax ? `Hasta $${rule.criteriaBudgetMax.toLocaleString()}` : ''].filter(Boolean);
          return <article className={`rounded-2xl border bg-white p-5 shadow-sm transition ${rule.active ? 'border-slate-200' : 'border-slate-200 opacity-65'}`} key={rule.id}>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-indigo-100 font-black text-indigo-700">{rule.priority}</span>
              <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="font-bold">{rule.name}</h2><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${rule.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{rule.active ? 'ACTIVA' : 'PAUSADA'}</span></div><p className="mt-1 text-sm text-slate-500">{strategyLabels[rule.assignmentStrategy]} · {assignedNames.join(', ') || 'Agentes no disponibles'}</p>{criteria.length > 0 && <div className="mt-2 flex flex-wrap gap-2">{criteria.map(item => <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600" key={item}>{item}</span>)}</div>}</div>
              <div className="flex flex-wrap gap-2"><Button aria-label="Subir prioridad" onClick={() => changePriority(rule, -1)} size="sm" variant="tertiary">↑</Button><Button aria-label="Bajar prioridad" onClick={() => changePriority(rule, 1)} size="sm" variant="tertiary">↓</Button><Button onClick={() => toggle(rule)} size="sm" variant="tertiary">{rule.active ? 'Pausar' : 'Activar'}</Button><Button onClick={() => remove(rule)} size="sm" variant="danger">Eliminar</Button></div>
            </div>
          </article>;
        })}
      </section>

      <Modal isOpen={open} maxWidth="2xl" noPadding onClose={() => !saving && setOpen(false)} subtitle="Define cuándo y entre quiénes se distribuyen los prospectos" title="Nueva regla de asignación">
        <div className="space-y-5 p-5 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2"><Field label="Nombre"><input className={inputClass} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ej. Equipo de ventas general" value={form.name} /></Field><Field label="Prioridad"><input className={inputClass} min="0" onChange={e => setForm({ ...form, priority: Number(e.target.value) })} type="number" value={form.priority} /></Field></div>
          <Field label="Descripción"><textarea className={`${inputClass} min-h-20`} onChange={e => setForm({ ...form, description: e.target.value })} value={form.description} /></Field>
          <div className="grid gap-4 sm:grid-cols-2"><Field label="Estrategia"><select className={inputClass} onChange={e => setForm({ ...form, assignmentStrategy: e.target.value as AssignmentStrategy })} value={form.assignmentStrategy}>{Object.entries(strategyLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field><Field label="Operación"><select className={inputClass} onChange={e => setForm({ ...form, criteriaListingType: e.target.value })} value={form.criteriaListingType}><option value="">Cualquier operación</option><option value="SALE">Venta</option><option value="RENT">Renta</option></select></Field><Field label="Ciudad"><input className={inputClass} onChange={e => setForm({ ...form, criteriaCity: e.target.value })} placeholder="Cualquier ciudad" value={form.criteriaCity} /></Field><div className="grid grid-cols-2 gap-2"><Field label="Presupuesto desde"><input className={inputClass} min="0" onChange={e => setForm({ ...form, criteriaBudgetMin: e.target.value })} type="number" value={form.criteriaBudgetMin} /></Field><Field label="Hasta"><input className={inputClass} min="0" onChange={e => setForm({ ...form, criteriaBudgetMax: e.target.value })} type="number" value={form.criteriaBudgetMax} /></Field></div></div>
          <div><p className="text-sm font-semibold text-slate-700">Agentes participantes</p><div className="mt-2 grid gap-2 sm:grid-cols-2">{users.map(user => <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-3 hover:border-indigo-300" key={user.id}><input checked={form.assignedUserIds.includes(user.id)} className="size-4 accent-indigo-600" onChange={() => setForm(current => ({ ...current, assignedUserIds: current.assignedUserIds.includes(user.id) ? current.assignedUserIds.filter(id => id !== user.id) : [...current.assignedUserIds, user.id] }))} type="checkbox" /><span className="min-w-0"><strong className="block truncate text-sm">{user.fullName}</strong><small className="text-slate-500">{user.role === 'ADMIN' ? 'Administrador' : 'Agente'}</small></span></label>)}</div></div>
          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end"><Button disabled={saving} onClick={() => setOpen(false)} variant="ghost">Cancelar</Button><Button loading={saving} onClick={save}>Crear regla</Button></div>
        </div>
      </Modal>
    </div>
  );
}

const inputClass = 'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100';
function Field({ children, label }: { children: React.ReactNode; label: string }) { return <label className="grid gap-2 text-sm font-semibold text-slate-700">{label}{children}</label>; }
function Metric({ label, text, value }: { label: string; text?: string; value?: number }) { return <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs font-semibold text-slate-500">{label}</p><strong className="mt-1 block text-xl text-slate-900">{text ?? value}</strong></div>; }
