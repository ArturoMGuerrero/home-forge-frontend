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
} from '../shared/notifications';
import { PageHeader } from '../shared/ui/PageHeader';
import { Tabs, Tab } from '../shared/ui/Tabs';
import { NewNotificationModal } from '../components/NewNotificationModal';
import { ConfirmModal } from '../shared/ConfirmModal';
import { Button, Spinner } from '../shared/ui';

const STATUS_FILTERS: (NotificationStatus | 'ALL')[] = [
  'ALL',
  'PENDING',
  'SENT',
  'DELIVERED',
  'READ',
  'FAILED'
];

const NOTIFICATION_ICONS: Record<string, string> = {
  EMAIL: '📧',
  WHATSAPP: '💬',
  PUSH: '🔔',
  SMS: '📱'
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
      console.error('Error loading notifications:', error);
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

  function getStatusColor(status: NotificationStatus): string {
    switch (status) {
      case 'PENDING':
        return 'bg-gray-100 text-gray-800';
      case 'SENT':
        return 'bg-blue-100 text-blue-800';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'READ':
        return 'bg-emerald-100 text-emerald-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      case 'CANCELLED':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  function getPriorityColor(priority: string): string {
    switch (priority) {
      case 'URGENT':
        return 'border-l-4 border-red-500';
      case 'HIGH':
        return 'border-l-4 border-orange-400';
      case 'MEDIUM':
        return 'border-l-4 border-blue-400';
      case 'LOW':
        return 'border-l-4 border-gray-300';
      default:
        return '';
    }
  }

  async function handleDeleteNotification() {
    if (!notificationToDelete) return;

    setDeleting(true);
    try {
      await deleteNotification(notificationToDelete);
      setNotifications(prev => prev.filter(n => n.id !== notificationToDelete));
      toast.success('Notificación eliminada');
      setNotificationToDelete(null);
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Error al eliminar la notificación');
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <PageHeader
        title="Notificaciones"
        subtitle="Gestiona emails, WhatsApp, notificaciones push y SMS"
        badge={{ value: notifications.length, label: 'notificaciones' }}
        actions={
          <div className="flex gap-3">
            <Button
              as={Link}
              to="/app/notificaciones/plantillas"
              variant="secondary"
              icon={
                <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
            >
              Plantillas
            </Button>
            <Button
              variant="primary"
              onClick={() => setShowNewModal(true)}
              icon={
                <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              }
            >
              Nueva Notificación
            </Button>
          </div>
        }
      >
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={id => setActiveTab(id as NotificationStatus | 'ALL')}
          variant="pills"
          size="sm"
        />
      </PageHeader>

      <div className="p-4 lg:p-6">
        {filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="rounded-full bg-slate-100 p-6 mb-4">
              <svg className="size-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </div>
            <p className="text-slate-600 font-medium">
              No hay notificaciones {activeTab !== 'ALL' && notificationStatusLabels[activeTab as NotificationStatus]}
            </p>
            <p className="text-sm text-slate-500 mt-1">
              Crea tu primera notificación para comunicarte con tus prospectos
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map(notification => (
              <div
                key={notification.id}
                className={`bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-all ${getPriorityColor(
                  notification.priority
                )}`}
              >
                <div className="flex items-start gap-4">
                  <div className="size-10 rounded-lg bg-indigo-100 flex items-center justify-center text-xl flex-shrink-0">
                    {NOTIFICATION_ICONS[notification.notificationType]}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-slate-900">
                            {notification.subject || notificationTypeLabels[notification.notificationType]}
                          </h3>
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                              notification.status
                            )}`}
                          >
                            {notificationStatusLabels[notification.status]}
                          </span>
                          <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                            {notificationPriorityLabels[notification.priority]}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-sm text-slate-600 mb-2">
                          <span>
                            Para: <span className="font-medium">{notification.recipientName || notification.recipientEmail || notification.recipientPhone}</span>
                          </span>
                          <span>•</span>
                          <span>{new Date(notification.createdAt).toLocaleString('es-MX')}</span>
                        </div>

                        <p className="text-sm text-slate-600 line-clamp-2">{notification.content}</p>
                      </div>

                      {/* Botón de eliminar */}
                      <Button
                        onClick={() => setNotificationToDelete(notification.id)}
                        variant="danger-ghost"
                        size="sm"
                        icon={
                          <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        }
                      >
                        Eliminar
                      </Button>
                    </div>

                    {notification.sentAt && (
                      <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
                        <span>Enviado: {new Date(notification.sentAt).toLocaleString('es-MX')}</span>
                        {notification.deliveredAt && (
                          <>
                            <span>•</span>
                            <span>Entregado: {new Date(notification.deliveredAt).toLocaleString('es-MX')}</span>
                          </>
                        )}
                        {notification.readAt && (
                          <>
                            <span>•</span>
                            <span className="text-green-600 font-medium">
                              Leído: {new Date(notification.readAt).toLocaleString('es-MX')}
                            </span>
                          </>
                        )}
                      </div>
                    )}

                    {notification.status === 'FAILED' && notification.errorMessage && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                        <span className="font-semibold">Error:</span> {notification.errorMessage}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <NewNotificationModal
        isOpen={showNewModal}
        onClose={() => setShowNewModal(false)}
        onSuccess={() => loadNotifications()}
      />

      <ConfirmModal
        isOpen={notificationToDelete !== null}
        onClose={() => setNotificationToDelete(null)}
        onConfirm={handleDeleteNotification}
        title="¿Eliminar notificación?"
        message="Esta acción no se puede deshacer. La notificación será eliminada permanentemente."
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        loading={deleting}
        danger={true}
      />
    </div>
  );
}
