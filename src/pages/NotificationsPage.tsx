import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Notification,
  NotificationStatus,
  listNotifications,
  notificationTypeLabels,
  notificationStatusLabels,
  notificationPriorityLabels
} from '../shared/notifications';
import { PageHeader } from '../shared/ui/PageHeader';
import { Tabs, Tab } from '../shared/ui/Tabs';
import { NewNotificationModal } from '../components/NewNotificationModal';

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-slate-500">Cargando notificaciones...</div>
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
          <div className="flex gap-2">
            <Link
              to="/app/notificaciones/plantillas"
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              📝 Plantillas
            </Link>
            <button
              onClick={() => setShowNewModal(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
            >
              + Nueva Notificación
            </button>
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
    </div>
  );
}
