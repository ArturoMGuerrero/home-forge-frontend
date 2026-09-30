import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Notification,
  NotificationStatus,
  listNotifications,
  deleteNotification,
  notificationTypeLabels,
  notificationStatusLabels,
  notificationPriorityLabels
} from '../api/notificationsApi';
import { Icon, IconName } from '../../../shared/Icon';
import { Alert, Badge, BadgeVariant, Button, buttonClasses, Card, cn, EmptyState, LoadingState, PageHeader, Tab, Tabs } from '../../../shared/ui';
import { NewNotificationModal } from '../components/NewNotificationModal';
import { ConfirmModal } from '../../../shared/ConfirmModal';

const STATUS_FILTERS: (NotificationStatus | 'ALL')[] = [
  'ALL',
  'PENDING',
  'SENT',
  'DELIVERED',
  'READ',
  'FAILED'
];

const channelIcons: Record<string, IconName> = { EMAIL: 'envelope', WHATSAPP: 'leads', PUSH: 'alert', SMS: 'user' };
const channelStyles: Record<string, string> = {
  EMAIL: 'bg-primary-soft text-primary-fg',
  WHATSAPP: 'bg-success-soft text-success-fg',
  PUSH: 'bg-warning-soft text-warning-fg',
  SMS: 'bg-info-soft text-info-fg'
};
const statusVariants: Record<string, BadgeVariant> = {
  PENDING: 'neutral',
  SENT: 'info',
  DELIVERED: 'success',
  READ: 'success',
  FAILED: 'error',
  CANCELLED: 'warning'
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<NotificationStatus | 'ALL'>('ALL');
  const [showNewModal, setShowNewModal] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
    try {
      const data = await listNotifications();
      setNotifications(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No fue posible cargar las notificaciones.');
    } finally {
      setLoading(false);
    }
  }

  function getFilteredNotifications() {
    if (activeTab === 'ALL') return notifications;
    return notifications.filter(n => n.status === activeTab);
  }

  const filteredNotifications = getFilteredNotifications();

  const tabs: Tab[] = STATUS_FILTERS.map(status => ({
    id: status,
    label: status === 'ALL' ? 'Todas' : notificationStatusLabels[status],
    count: status === 'ALL' ? notifications.length : notifications.filter(n => n.status === status).length
  }));

  async function handleDeleteNotification() {
    if (!notificationToDelete) return;

    setDeleting(true);
    try {
      await deleteNotification(notificationToDelete);
      setNotifications(prev => prev.filter(n => n.id !== notificationToDelete));
      toast.success('Notificación eliminada');
      setNotificationToDelete(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al eliminar la notificación');
    } finally {
      setDeleting(false);
    }
  }

  const dateTime = (value: string) => new Date(value).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' });

  return (
    <>
      <PageHeader
        actions={
          <>
            <Link className={buttonClasses({ variant: 'tertiary' })} to="/app/notificaciones/plantillas">
              <Icon className="size-4" name="document" />
              Plantillas
            </Link>
            <Button icon={<Icon className="size-4" name="plus" />} onClick={() => setShowNewModal(true)}>Nueva notificación</Button>
          </>
        }
        badge={{ value: notifications.length, label: 'notificaciones' }}
        subtitle="Gestiona emails, WhatsApp, notificaciones push y SMS."
        title="Notificaciones"
      >
        <Tabs activeTab={activeTab} onChange={id => setActiveTab(id as NotificationStatus | 'ALL')} tabs={tabs} variant="pills" />
      </PageHeader>

      {loading ? (
        <Card><LoadingState message="Cargando notificaciones..." /></Card>
      ) : filteredNotifications.length === 0 ? (
        <Card className="border-dashed">
          <EmptyState
            actionLabel={activeTab === 'ALL' ? 'Nueva notificación' : undefined}
            description="Crea tu primera notificación para comunicarte con tus prospectos."
            icon={<Icon name="envelope" />}
            onAction={() => setShowNewModal(true)}
            title={activeTab === 'ALL' ? 'No hay notificaciones' : `No hay notificaciones "${notificationStatusLabels[activeTab]}"`}
          />
        </Card>
      ) : (
        <Card noPadding truncate>
          <ul className="divide-y divide-border">
            {filteredNotifications.map(notification => (
              <li className="flex items-start gap-4 p-4 sm:px-5" key={notification.id}>
                <span className={cn('mt-0.5 grid size-10 shrink-0 place-items-center rounded-xl', channelStyles[notification.notificationType] ?? 'bg-surface-sunken text-fg-muted')}>
                  <Icon className="size-5" name={channelIcons[notification.notificationType] ?? 'envelope'} />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-fg">{notification.subject || notificationTypeLabels[notification.notificationType]}</h3>
                    <Badge dot variant={statusVariants[notification.status] ?? 'neutral'}>{notificationStatusLabels[notification.status]}</Badge>
                    {(notification.priority === 'URGENT' || notification.priority === 'HIGH') && (
                      <Badge variant={notification.priority === 'URGENT' ? 'error' : 'warning'}>{notificationPriorityLabels[notification.priority]}</Badge>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-fg-subtle">
                    Para <span className="font-medium text-fg-muted">{notification.recipientName || notification.recipientEmail || notification.recipientPhone}</span> · {dateTime(notification.createdAt)}
                  </p>
                  <p className="mt-1.5 line-clamp-2 text-sm text-fg-muted">{notification.content}</p>

                  {notification.sentAt && (
                    <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-fg-subtle">
                      <span>Enviado {dateTime(notification.sentAt)}</span>
                      {notification.deliveredAt && <span>Entregado {dateTime(notification.deliveredAt)}</span>}
                      {notification.readAt && <span className="font-medium text-success-fg">Leído {dateTime(notification.readAt)}</span>}
                    </p>
                  )}

                  {notification.status === 'FAILED' && notification.errorMessage && (
                    <Alert className="mt-2 p-2.5" variant="error">{notification.errorMessage}</Alert>
                  )}
                </div>

                <Button aria-label="Eliminar notificación" onClick={() => setNotificationToDelete(notification.id)} size="icon" variant="danger-ghost">
                  <svg aria-hidden="true" className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </Button>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <NewNotificationModal
        isOpen={showNewModal}
        onClose={() => setShowNewModal(false)}
        onSuccess={() => loadNotifications()}
      />

      <ConfirmModal
        isOpen={notificationToDelete !== null}
        loading={deleting}
        message="La notificación será eliminada permanentemente."
        onCancel={() => setNotificationToDelete(null)}
        onConfirm={handleDeleteNotification}
        title="¿Eliminar notificación?"
      />
    </>
  );
}
