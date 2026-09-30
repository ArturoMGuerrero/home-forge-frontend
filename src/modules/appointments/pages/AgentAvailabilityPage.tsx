import { FormEvent, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getSession } from '../../auth';
import { listAvailability, createAvailability, deleteAvailability, AgentAvailability, dayLabels } from '../api/availabilityApi';
import { ConfirmModal } from '../../../shared/ConfirmModal';
import { Icon } from '../../../shared/Icon';
import { Badge, Button, Card, Input, Modal, PageHeader, Select } from '../../../shared/ui';

const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];
const FORM_ID = 'availability-form';

export default function AgentAvailabilityPage() {
  const session = getSession();
  // Antes se leían claves 'userId'/'companyId' de localStorage que nadie escribe; la sesión es la fuente correcta.
  const userId = session?.userId ?? '';
  const companyId = session?.companyId ?? '';
  const [availabilities, setAvailabilities] = useState<AgentAvailability[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState({ dayOfWeek: 1, startTime: '09:00', endTime: '17:00' });

  const loadAvailabilities = async () => {
    if (!userId) return;
    try {
      setAvailabilities(await listAvailability({ userId }));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No fue posible cargar tu disponibilidad.');
    }
  };

  useEffect(() => {
    loadAvailabilities();
  }, [userId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (formData.endTime <= formData.startTime) {
      toast.error('La hora de fin debe ser posterior a la de inicio.');
      return;
    }
    setSaving(true);
    try {
      await createAvailability({ companyId, userId, ...formData });
      setShowAddForm(false);
      setFormData({ dayOfWeek: 1, startTime: '09:00', endTime: '17:00' });
      toast.success('Horario agregado.');
      loadAvailabilities();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al crear disponibilidad');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await deleteAvailability(toDelete);
      setAvailabilities(current => current.filter(item => item.id !== toDelete));
      toast.success('Horario eliminado.');
      setToDelete(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al eliminar disponibilidad');
    } finally {
      setDeleting(false);
    }
  };

  const groupedByDay = availabilities.reduce((acc, avail) => {
    (acc[avail.dayOfWeek] ??= []).push(avail);
    return acc;
  }, {} as Record<number, AgentAvailability[]>);

  return (
    <>
      <PageHeader
        actions={<Button icon={<Icon className="size-4" name="plus" />} onClick={() => setShowAddForm(true)}>Agregar horario</Button>}
        backLink={{ to: '/app/calendario', label: 'Calendario' }}
        subtitle="Configura los horarios en los que puedes recibir citas."
        title="Mi disponibilidad"
      />

      <Card noPadding truncate>
        <ul className="divide-y divide-border">
          {WEEK_ORDER.map(day => (
            <li className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center" key={day}>
              <h3 className="w-32 shrink-0 font-semibold text-fg">{dayLabels[day]}</h3>
              <div className="flex flex-1 flex-wrap gap-2">
                {groupedByDay[day]?.length ? groupedByDay[day].map(avail => (
                  <span className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface-muted py-1 pl-3 pr-1 text-sm" key={avail.id}>
                    <span className="font-medium tabular-nums text-fg">{avail.startTime} – {avail.endTime}</span>
                    {!avail.isAvailable && <Badge variant="error">No disponible</Badge>}
                    <button
                      aria-label={`Eliminar horario ${avail.startTime} a ${avail.endTime}`}
                      className="grid size-6 place-items-center rounded-md text-fg-subtle transition hover:bg-danger-soft hover:text-danger-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      onClick={() => setToDelete(avail.id)}
                      type="button"
                    >
                      <svg aria-hidden="true" className="size-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </span>
                )) : (
                  <span className="text-sm text-fg-subtle">Sin horarios configurados</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <Modal
        footer={
          <>
            <Button onClick={() => setShowAddForm(false)} variant="tertiary">Cancelar</Button>
            <Button form={FORM_ID} loading={saving} type="submit">Guardar</Button>
          </>
        }
        isOpen={showAddForm}
        maxWidth="md"
        onClose={() => setShowAddForm(false)}
        title="Agregar horario"
      >
        <form className="space-y-4" id={FORM_ID} onSubmit={handleSubmit}>
          <Select
            label="Día de la semana"
            onChange={e => setFormData({ ...formData, dayOfWeek: Number(e.target.value) })}
            options={WEEK_ORDER.map(day => ({ value: String(day), label: dayLabels[day] }))}
            value={String(formData.dayOfWeek)}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Hora inicio" onChange={e => setFormData({ ...formData, startTime: e.target.value })} required type="time" value={formData.startTime} />
            <Input label="Hora fin" onChange={e => setFormData({ ...formData, endTime: e.target.value })} required type="time" value={formData.endTime} />
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={toDelete !== null}
        loading={deleting}
        message="Se quitará este horario de tu disponibilidad."
        onCancel={() => setToDelete(null)}
        onConfirm={confirmDelete}
        title="¿Eliminar horario?"
      />
    </>
  );
}
