import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  FollowUpTask,
  listFollowUpTasks,
  updateFollowUpTask,
  deleteFollowUpTask,
  taskTypeLabels,
  taskPriorityLabels,
  FollowUpTaskStatus
} from '../api/followUpTasksApi';
import { LeadsNav } from '../components/LeadsNav';
import { ConfirmModal } from '../../../shared/ConfirmModal';
import { Icon } from '../../../shared/Icon';
import { Badge, BadgeVariant, Button, Card, cn, EmptyState, LoadingState, PageHeader, Select, Tabs } from '../../../shared/ui';

type TaskFilter = 'ALL' | 'PENDING' | 'OVERDUE' | 'COMPLETED';

const statusOptions = [
  { value: 'PENDING', label: 'Pendiente' },
  { value: 'IN_PROGRESS', label: 'En progreso' },
  { value: 'COMPLETED', label: 'Completada' },
  { value: 'CANCELLED', label: 'Cancelada' }
];

const priorityVariants: Record<string, BadgeVariant> = {
  URGENT: 'error',
  HIGH: 'warning',
  MEDIUM: 'warning',
  LOW: 'neutral'
};

function isOverdue(task: FollowUpTask) {
  return (task.status === 'PENDING' || task.status === 'OVERDUE') && new Date(task.scheduledFor) < new Date();
}

export default function FollowUpTasksPage() {
  const [tasks, setTasks] = useState<FollowUpTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<TaskFilter>('ALL');
  const [taskToDelete, setTaskToDelete] = useState<FollowUpTask | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    listFollowUpTasks()
      .then(setTasks)
      .catch(error => toast.error(error instanceof Error ? error.message : 'No fue posible cargar las tareas.'))
      .finally(() => setLoading(false));
  }, []);

  async function handleStatusChange(taskId: string, status: FollowUpTaskStatus) {
    try {
      await updateFollowUpTask(taskId, { status });
      setTasks(prev => prev.map(t => (t.id === taskId ? { ...t, status } : t)));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al actualizar la tarea');
    }
  }

  async function confirmDelete() {
    if (!taskToDelete) return;
    setDeleting(true);
    try {
      await deleteFollowUpTask(taskToDelete.id);
      setTasks(prev => prev.filter(t => t.id !== taskToDelete.id));
      toast.success('Tarea eliminada.');
      setTaskToDelete(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al eliminar la tarea');
    } finally {
      setDeleting(false);
    }
  }

  const counts = {
    ALL: tasks.length,
    PENDING: tasks.filter(t => t.status === 'PENDING').length,
    OVERDUE: tasks.filter(isOverdue).length,
    COMPLETED: tasks.filter(t => t.status === 'COMPLETED').length
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'PENDING') return task.status === 'PENDING';
    if (filter === 'OVERDUE') return isOverdue(task);
    if (filter === 'COMPLETED') return task.status === 'COMPLETED';
    return true;
  });

  return (
    <>
      <PageHeader
        subtitle="Tareas automáticas creadas al cambiar la etapa de los prospectos."
        title="Tareas de seguimiento"
      >
        <LeadsNav />
      </PageHeader>

      {loading ? (
        <Card><LoadingState message="Cargando tareas..." /></Card>
      ) : (
        <>
          <Tabs
            activeTab={filter}
            className="mb-5"
            onChange={id => setFilter(id as TaskFilter)}
            tabs={[
              { id: 'ALL', label: 'Todas', count: counts.ALL },
              { id: 'PENDING', label: 'Pendientes', count: counts.PENDING },
              { id: 'OVERDUE', label: 'Vencidas', count: counts.OVERDUE },
              { id: 'COMPLETED', label: 'Completadas', count: counts.COMPLETED }
            ]}
            variant="pills"
          />

          {filteredTasks.length === 0 ? (
            <Card className="border-dashed">
              <EmptyState icon={<Icon name="check" />} title={filter === 'ALL' ? 'No hay tareas de seguimiento' : 'No hay tareas en este filtro'} />
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredTasks.map(task => {
                const overdue = isOverdue(task);
                return (
                  <Card className={cn('p-4', overdue && 'border-danger-line', task.status === 'COMPLETED' && 'opacity-75')} key={task.id}>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className={cn('font-semibold text-fg', task.status === 'COMPLETED' && 'line-through decoration-fg-subtle')}>{task.title}</h3>
                          <Badge variant={priorityVariants[task.priority] ?? 'neutral'}>{taskPriorityLabels[task.priority]}</Badge>
                          <Badge variant="info">{taskTypeLabels[task.taskType]}</Badge>
                        </div>
                        {task.description && <p className="mt-1 text-sm text-fg-muted">{task.description}</p>}
                        <p className={cn('mt-2 text-xs', overdue ? 'font-medium text-danger-fg' : 'text-fg-subtle')}>
                          {overdue ? 'Vencida · ' : 'Programada · '}
                          {new Date(task.scheduledFor).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' })}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Select
                          aria-label={`Estado de ${task.title}`}
                          containerClassName="w-40"
                          onChange={e => handleStatusChange(task.id, e.target.value as FollowUpTaskStatus)}
                          options={statusOptions}
                          value={task.status}
                        />
                        <Button aria-label={`Eliminar ${task.title}`} onClick={() => setTaskToDelete(task)} size="icon" variant="danger-ghost">
                          <svg aria-hidden="true" className="size-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}

      <ConfirmModal
        isOpen={taskToDelete !== null}
        loading={deleting}
        message={<>Se eliminará la tarea <strong className="text-fg">{taskToDelete?.title}</strong>.</>}
        onCancel={() => setTaskToDelete(null)}
        onConfirm={confirmDelete}
        title="¿Eliminar tarea?"
      />
    </>
  );
}
