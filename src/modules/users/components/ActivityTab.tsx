import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
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
  AUTH: 'bg-info-muted text-info-fg',
  USER_MANAGEMENT: 'bg-accent-muted text-accent-fg',
  LEAD_MANAGEMENT: 'bg-success-muted text-success-fg',
  PROPERTY_MANAGEMENT: 'bg-warning-muted text-warning-fg',
  DOCUMENT_MANAGEMENT: 'bg-warning-muted text-warning-fg',
  AGENDA: 'bg-danger-muted text-danger-fg',
  TEAM_MANAGEMENT: 'bg-primary-muted text-primary-fg',
  REPORTS: 'bg-info-muted text-info-fg'
};

export function ActivityTab() {
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filter, setFilter] = useState<string>('');

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

  const filteredActivities = filter
    ? activities.filter(a =>
        a.activityCategory.toLowerCase().includes(filter.toLowerCase()) ||
        a.activityType.toLowerCase().includes(filter.toLowerCase()) ||
        a.descriptionEs.toLowerCase().includes(filter.toLowerCase())
      )
    : activities;

  if (loading) return <p className="rounded-2xl border border-border bg-surface p-8 text-center text-sm text-fg-subtle">Cargando actividad...</p>;

  return (
    <div className="grid gap-6">
      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="Buscar actividad..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="flex-1 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary-line"
        />
        <select
          className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-primary"
          onChange={e => setFilter(e.target.value)}
        >
          <option value="">Todas las categorías</option>
          <option value="AUTH">Autenticación</option>
          <option value="USER_MANAGEMENT">Gestión de usuarios</option>
          <option value="LEAD_MANAGEMENT">Gestión de leads</option>
          <option value="PROPERTY_MANAGEMENT">Gestión de propiedades</option>
          <option value="DOCUMENT_MANAGEMENT">Documentos</option>
          <option value="AGENDA">Agenda</option>
          <option value="TEAM_MANAGEMENT">Equipos</option>
          <option value="REPORTS">Reportes</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
        <div className="border-b border-border px-5 py-4">
          <h2 className="font-bold">Registro de actividad ({filteredActivities.length})</h2>
        </div>
        <div className="divide-y divide-border">
          {filteredActivities.length === 0 ? (
            <div className="p-12 text-center text-sm text-fg-subtle">
              No hay actividad para mostrar.
            </div>
          ) : (
            filteredActivities.map(activity => (
              <ActivityRow key={activity.id} activity={activity} />
            ))
          )}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-fg-muted hover:bg-surface-sunken disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          <span className="text-sm text-fg-muted">
            Página {page + 1} de {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
            disabled={page >= totalPages - 1}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-fg-muted hover:bg-surface-sunken disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Siguiente
          </button>
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
          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${categoryColor}`}>
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
