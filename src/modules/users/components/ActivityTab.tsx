import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Button, Card, cn, EmptyState, LoadingState, SearchInput, Select } from '../../../shared/ui';
import { UserActivity, listUserActivity } from '../api/usersApi';

const ACTIVITY_ICONS: Record<string, string> = {
  LOGIN: '🔐',
  LOGOUT: '👋',
  USER_CREATED: '👤',
  USER_UPDATED: '✏️',
  LEAD_CREATED: '🎯',
  LEAD_UPDATED: '📝',
  PROPERTY_CREATED: '🏠',
  PROPERTY_UPDATED: '🔧',
  DOCUMENT_UPLOADED: '📄',
  APPOINTMENT_CREATED: '📅',
  TEAM_CREATED: '👥',
  TEAM_MEMBER_ADDED: '➕',
  REPORT_EXPORTED: '📊'
};

const CATEGORY_COLORS: Record<string, string> = {
  AUTH: 'bg-info-soft text-info-fg',
  USER_MANAGEMENT: 'bg-accent-soft text-accent-fg',
  LEAD_MANAGEMENT: 'bg-success-soft text-success-fg',
  PROPERTY_MANAGEMENT: 'bg-warning-soft text-warning-fg',
  DOCUMENT_MANAGEMENT: 'bg-warning-soft text-warning-fg',
  AGENDA: 'bg-danger-soft text-danger-fg',
  TEAM_MANAGEMENT: 'bg-primary-soft text-primary-fg',
  REPORTS: 'bg-info-soft text-info-fg'
};

const categoryOptions = [
  { value: 'AUTH', label: 'Autenticación' },
  { value: 'USER_MANAGEMENT', label: 'Gestión de usuarios' },
  { value: 'LEAD_MANAGEMENT', label: 'Gestión de leads' },
  { value: 'PROPERTY_MANAGEMENT', label: 'Gestión de propiedades' },
  { value: 'DOCUMENT_MANAGEMENT', label: 'Documentos' },
  { value: 'AGENDA', label: 'Agenda' },
  { value: 'TEAM_MANAGEMENT', label: 'Equipos' },
  { value: 'REPORTS', label: 'Reportes' }
];

export function ActivityTab() {
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filter, setFilter] = useState<string>('');
  const [category, setCategory] = useState<string>('');

  useEffect(() => {
    load();
  }, [page]);

  async function load() {
    try {
      const data = await listUserActivity(page, 50);
      setActivities(data.content);
      setTotalPages(data.totalPages);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al cargar actividad.');
    } finally {
      setLoading(false);
    }
  }

  const query = filter.trim().toLowerCase();
  const filteredActivities = activities.filter(a =>
    (!category || a.activityCategory === category) &&
    (!query ||
      a.activityCategory.toLowerCase().includes(query) ||
      a.activityType.toLowerCase().includes(query) ||
      a.descriptionEs.toLowerCase().includes(query))
  );

  if (loading) return <Card><LoadingState message="Cargando actividad..." /></Card>;

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-3 sm:flex-row">
        <SearchInput
          containerClassName="flex-1"
          onChange={e => setFilter(e.target.value)}
          onClear={() => setFilter('')}
          placeholder="Buscar actividad..."
          value={filter}
        />
        <Select
          aria-label="Categoría"
          containerClassName="sm:w-64"
          onChange={e => setCategory(e.target.value)}
          options={categoryOptions}
          placeholder="Todas las categorías"
          value={category}
        />
      </div>

      <Card noPadding truncate>
        <div className="border-b border-border px-5 py-4">
          <h2 className="font-semibold text-fg">Registro de actividad <span className="font-normal text-fg-subtle">({filteredActivities.length})</span></h2>
        </div>
        <div className="divide-y divide-border">
          {filteredActivities.length === 0 ? (
            <EmptyState title="No hay actividad para mostrar" />
          ) : (
            filteredActivities.map(activity => (
              <ActivityRow key={activity.id} activity={activity} />
            ))
          )}
        </div>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button disabled={page === 0} onClick={() => setPage(Math.max(0, page - 1))} size="sm" variant="tertiary">Anterior</Button>
          <span className="text-sm text-fg-muted">
            Página {page + 1} de {totalPages}
          </span>
          <Button disabled={page >= totalPages - 1} onClick={() => setPage(Math.min(totalPages - 1, page + 1))} size="sm" variant="tertiary">Siguiente</Button>
        </div>
      )}
    </div>
  );
}

function ActivityRow({ activity }: { activity: UserActivity }) {
  const icon = ACTIVITY_ICONS[activity.activityType] || '📌';
  const categoryColor = CATEGORY_COLORS[activity.activityCategory] || 'bg-surface-sunken text-fg-muted';
  const date = new Date(activity.createdAt);
  const timeAgo = formatTimeAgo(date);

  return (
    <div className="flex items-start gap-4 px-5 py-4">
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-surface-sunken text-lg">
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-fg">{activity.descriptionEs}</p>
        <div className="mt-1 flex items-center gap-2">
          <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', categoryColor)}>
            {formatCategory(activity.activityCategory)}
          </span>
          <span className="text-xs text-fg-subtle">{timeAgo}</span>
        </div>
      </div>
    </div>
  );
}

function formatCategory(category: string): string {
  const labels: Record<string, string> = {
    AUTH: 'Autenticación',
    USER_MANAGEMENT: 'Usuarios',
    LEAD_MANAGEMENT: 'Leads',
    PROPERTY_MANAGEMENT: 'Propiedades',
    DOCUMENT_MANAGEMENT: 'Documentos',
    AGENDA: 'Agenda',
    TEAM_MANAGEMENT: 'Equipos',
    REPORTS: 'Reportes',
    SETTINGS: 'Configuración'
  };
  return labels[category] || category;
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'hace unos segundos';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `hace ${days}d`;
  return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
}
