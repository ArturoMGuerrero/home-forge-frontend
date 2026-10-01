import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { AssignmentRule, AssignmentStrategy, createAssignmentRule, deleteAssignmentRule, listAssignmentRules, updateAssignmentRule } from '../api/assignmentRulesApi';
import { CompanyUser, listCompanyUsers } from '../../users';
import { Alert, Badge, Button, Card, cn, EmptyState, Input, LoadingState, Modal, PageHeader, Select, StatCard, Textarea } from '../../../shared/ui';
import { ConfirmModal } from '../../../shared/ConfirmModal';
import { Icon } from '../../../shared/Icon';

const strategyLabels: Record<AssignmentStrategy, string> = {
  ROUND_ROBIN: 'Turnos equilibrados',
  LEAST_ASSIGNED: 'Menor carga',
  RANDOM: 'Aleatoria'
};

const strategyOptions = Object.entries(strategyLabels).map(([value, label]) => ({ value, label }));
const listingTypeOptions = [{ value: 'SALE', label: 'Venta' }, { value: 'RENT', label: 'Renta' }];

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
  const [ruleToDelete, setRuleToDelete] = useState<AssignmentRule | null>(null);
  const [deleting, setDeleting] = useState(false);

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

  async function confirmRemove() {
    if (!ruleToDelete) return;
    setDeleting(true);
    try {
      await deleteAssignmentRule(ruleToDelete.id);
      setRules(current => current.filter(item => item.id !== ruleToDelete.id));
      toast.success('Regla eliminada.');
      setRuleToDelete(null);
    } catch (error) { toast.error(error instanceof Error ? error.message : 'No fue posible eliminar la regla.'); }
    finally { setDeleting(false); }
  }

  function toggleAgent(userId: string) {
    setForm(current => ({
      ...current,
      assignedUserIds: current.assignedUserIds.includes(userId)
        ? current.assignedUserIds.filter(id => id !== userId)
        : [...current.assignedUserIds, userId]
    }));
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        actions={<Button icon={<Icon className="size-4" name="plus" />} onClick={() => setOpen(true)}>Nueva regla</Button>}
        backLink={{ to: '/app/configuracion', label: 'Configuración' }}
        eyebrow="Automatización comercial"
        subtitle="Distribuye automáticamente cada prospecto nuevo entre los agentes disponibles."
        title="Asignación de prospectos"
      />

      <section className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard icon={<Icon name="check" />} label="Reglas activas" tone="success" value={rules.filter(rule => rule.active).length} />
        <StatCard icon={<Icon name="users" />} label="Agentes disponibles" tone="info" value={users.length} />
        <StatCard icon={<Icon name="leads" />} label="Estrategia recomendada" value={<span className="text-lg">Turnos equilibrados</span>} />
      </section>

      <Alert title="Cómo funciona">
        Las reglas se evalúan de menor a mayor prioridad. La primera que coincida con el prospecto selecciona un agente y registra la asignación.
      </Alert>

      <section className="mt-6 space-y-3">
        {loading && <Card><LoadingState message="Cargando reglas..." /></Card>}
        {!loading && !rules.length && (
          <Card className="border-dashed">
            <EmptyState
              actionLabel="Crear primera regla"
              description="Crea una regla general para empezar a repartir prospectos."
              icon={<Icon name="users" />}
              onAction={() => setOpen(true)}
              title="Aún no hay reglas"
            />
          </Card>
        )}
        {rules.map(rule => {
          const assignedNames = rule.assignedUserIds.split(',').map(id => userNames.get(id.trim())).filter(Boolean);
          const criteria = [rule.criteriaListingType === 'SALE' ? 'Venta' : rule.criteriaListingType === 'RENT' ? 'Renta' : '', rule.criteriaCity, rule.criteriaBudgetMin ? `Desde $${rule.criteriaBudgetMin.toLocaleString()}` : '', rule.criteriaBudgetMax ? `Hasta $${rule.criteriaBudgetMax.toLocaleString()}` : ''].filter(Boolean);
          return (
            <Card className={cn('p-4 sm:p-5', !rule.active && 'opacity-70')} key={rule.id}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-lg font-bold text-primary-fg" title="Prioridad">{rule.priority}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold text-fg">{rule.name}</h2>
                    <Badge dot variant={rule.active ? 'success' : 'neutral'}>{rule.active ? 'Activa' : 'Pausada'}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-fg-subtle">{strategyLabels[rule.assignmentStrategy]} · {assignedNames.join(', ') || 'Agentes no disponibles'}</p>
                  {criteria.length > 0 && <div className="mt-2 flex flex-wrap gap-1.5">{criteria.map(item => <Badge key={item}>{item}</Badge>)}</div>}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button aria-label="Subir prioridad" onClick={() => changePriority(rule, -1)} size="sm" variant="tertiary">↑</Button>
                  <Button aria-label="Bajar prioridad" onClick={() => changePriority(rule, 1)} size="sm" variant="tertiary">↓</Button>
                  <Button onClick={() => toggle(rule)} size="sm" variant="tertiary">{rule.active ? 'Pausar' : 'Activar'}</Button>
                  <Button onClick={() => setRuleToDelete(rule)} size="sm" variant="danger">Eliminar</Button>
                </div>
              </div>
            </Card>
          );
        })}
      </section>

      <Modal
        footer={
          <>
            <Button disabled={saving} onClick={() => setOpen(false)} variant="tertiary">Cancelar</Button>
            <Button loading={saving} onClick={save}>Crear regla</Button>
          </>
        }
        isOpen={open}
        maxWidth="2xl"
        onClose={() => !saving && setOpen(false)}
        subtitle="Define cuándo y entre quiénes se distribuyen los prospectos"
        title="Nueva regla de asignación"
      >
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Nombre" onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ej. Equipo de ventas general" required value={form.name} />
            <Input label="Prioridad" min="0" onChange={e => setForm({ ...form, priority: Number(e.target.value) })} type="number" value={form.priority} />
          </div>
          <Textarea className="min-h-20" label="Descripción" onChange={e => setForm({ ...form, description: e.target.value })} value={form.description} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Select label="Estrategia" onChange={e => setForm({ ...form, assignmentStrategy: e.target.value as AssignmentStrategy })} options={strategyOptions} value={form.assignmentStrategy} />
            <Select label="Operación" onChange={e => setForm({ ...form, criteriaListingType: e.target.value })} options={listingTypeOptions} placeholder="Cualquier operación" value={form.criteriaListingType} />
            <Input label="Ciudad" onChange={e => setForm({ ...form, criteriaCity: e.target.value })} placeholder="Cualquier ciudad" value={form.criteriaCity} />
            <div className="grid grid-cols-2 gap-2">
              <Input label="Presupuesto desde" min="0" onChange={e => setForm({ ...form, criteriaBudgetMin: e.target.value })} type="number" value={form.criteriaBudgetMin} />
              <Input label="Hasta" min="0" onChange={e => setForm({ ...form, criteriaBudgetMax: e.target.value })} type="number" value={form.criteriaBudgetMax} />
            </div>
          </div>
          <fieldset>
            <legend className="text-sm font-semibold text-fg-muted">Agentes participantes</legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {users.map(user => {
                const checked = form.assignedUserIds.includes(user.id);
                return (
                  <label className={cn('flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition', checked ? 'border-primary-line bg-primary-soft' : 'border-border hover:border-border-strong')} key={user.id}>
                    <input checked={checked} className="size-4" onChange={() => toggleAgent(user.id)} type="checkbox" />
                    <span className="min-w-0">
                      <strong className="block truncate text-sm font-medium text-fg">{user.fullName}</strong>
                      <small className="text-xs text-fg-subtle">{user.role === 'ADMIN' ? 'Administrador' : 'Agente'}</small>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={ruleToDelete !== null}
        loading={deleting}
        message={<>Se eliminará la regla <strong className="text-fg">“{ruleToDelete?.name}”</strong>. Esta acción no se puede deshacer.</>}
        onCancel={() => setRuleToDelete(null)}
        onConfirm={confirmRemove}
        title="¿Eliminar regla?"
      />
    </div>
  );
}
