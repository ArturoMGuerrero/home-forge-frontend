import { useState, useEffect } from 'react';
import {
  FollowUpTask,
  listFollowUpTasks,
  updateFollowUpTask,
  deleteFollowUpTask,
  taskTypeLabels,
  taskStatusLabels,
  taskPriorityLabels,
  FollowUpTaskStatus
} from '../shared/followUpTasks';
import { Button, Select, Spinner, Badge } from '../shared/ui';

export default function FollowUpTasksPage() {
  const [tasks, setTasks] = useState<FollowUpTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'OVERDUE' | 'COMPLETED'>('ALL');

  useEffect(() => {
    loadTasks();
  }, []);

  async function loadTasks() {
    try {
      const data = await listFollowUpTasks();
      setTasks(data);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(taskId: string, status: FollowUpTaskStatus) {
    try {
      await updateFollowUpTask(taskId, { status });
      setTasks(prev =>
        prev.map(t => (t.id === taskId ? { ...t, status } : t))
      );
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Error al actualizar la tarea');
    }
  }

  async function handleDelete(taskId: string) {
    if (!confirm('¿Eliminar esta tarea?')) return;

    try {
      await deleteFollowUpTask(taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Error al eliminar la tarea');
    }
  }

  function getFilteredTasks() {
    const now = new Date();
    switch (filter) {
      case 'PENDING':
        return tasks.filter(t => t.status === 'PENDING');
      case 'OVERDUE':
        return tasks.filter(
          t =>
            (t.status === 'PENDING' || t.status === 'OVERDUE') &&
            new Date(t.scheduledFor) < now
        );
      case 'COMPLETED':
        return tasks.filter(t => t.status === 'COMPLETED');
      default:
        return tasks;
    }
  }

  const filteredTasks = getFilteredTasks();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tareas de Seguimiento</h1>
        <p className="text-sm text-gray-500 mt-1">
          Tareas automáticas creadas al cambiar el estado de los leads
        </p>
      </div>

      <div className="flex gap-2 mb-6">
        <Button
          onClick={() => setFilter('ALL')}
          variant={filter === 'ALL' ? 'primary' : 'secondary'}
          size="sm"
        >
          Todas ({tasks.length})
        </Button>
        <Button
          onClick={() => setFilter('PENDING')}
          variant={filter === 'PENDING' ? 'primary' : 'secondary'}
          size="sm"
        >
          Pendientes ({tasks.filter(t => t.status === 'PENDING').length})
        </Button>
        <Button
          onClick={() => setFilter('OVERDUE')}
          variant={filter === 'OVERDUE' ? 'primary' : 'secondary'}
          size="sm"
        >
          Vencidas (
          {
            tasks.filter(
              t =>
                (t.status === 'PENDING' || t.status === 'OVERDUE') &&
                new Date(t.scheduledFor) < new Date()
            ).length
          }
          )
        </Button>
        <Button
          onClick={() => setFilter('COMPLETED')}
          variant={filter === 'COMPLETED' ? 'primary' : 'secondary'}
          size="sm"
        >
          Completadas ({tasks.filter(t => t.status === 'COMPLETED').length})
        </Button>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No hay tareas {filter !== 'ALL' ? taskStatusLabels[filter] : ''}.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map(task => {
            const isOverdue =
              (task.status === 'PENDING' || task.status === 'OVERDUE') &&
              new Date(task.scheduledFor) < new Date();

            return (
              <div
                key={task.id}
                className={`bg-white rounded-lg border-2 p-4 ${
                  isOverdue
                    ? 'border-red-300 bg-red-50'
                    : task.status === 'COMPLETED'
                    ? 'border-green-200 bg-green-50'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{task.title}</h3>
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                          task.priority === 'URGENT'
                            ? 'bg-red-100 text-red-800'
                            : task.priority === 'HIGH'
                            ? 'bg-orange-100 text-orange-800'
                            : task.priority === 'MEDIUM'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {taskPriorityLabels[task.priority]}
                      </span>
                      <span className="inline-block px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-800">
                        {taskTypeLabels[task.taskType]}
                      </span>
                    </div>
                    {task.description && (
                      <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                    )}
                    <div className="text-xs text-gray-500 mt-2">
                      Programada:{' '}
                      {new Date(task.scheduledFor).toLocaleString('es-MX', {
                        dateStyle: 'short',
                        timeStyle: 'short'
                      })}
                      {isOverdue && (
                        <span className="ml-2 text-red-600 font-medium">
                          ¡Vencida!
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Select
                      value={task.status}
                      onChange={e =>
                        handleStatusChange(task.id, e.target.value as FollowUpTaskStatus)
                      }
                      size="sm"
                    >
                      <option value="PENDING">Pendiente</option>
                      <option value="IN_PROGRESS">En progreso</option>
                      <option value="COMPLETED">Completada</option>
                      <option value="CANCELLED">Cancelada</option>
                    </Select>
                    <Button
                      onClick={() => handleDelete(task.id)}
                      variant="danger-ghost"
                      size="sm"
                    >
                      Eliminar
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
