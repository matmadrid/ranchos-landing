// src/hooks/useNotifications.ts
import { useMemo } from 'react';
import { useNotificationStore } from '@/store/notifications';
import { NotificationType, NotificationPriority, NotificationStatus } from '@/lib/notification-types';

export function useNotifications() {
  const store = useNotificationStore();

  // Selectores memoizados para evitar re-renders innecesarios
  const notifications = useMemo(() => store.notifications, [store.notifications]);
  const unreadCount = useMemo(() => store.unreadCount, [store.unreadCount]);
  const settings = useMemo(() => store.settings, [store.settings]);

  // Filtros memoizados
  const filteredNotifications = useMemo(() => ({
    all: notifications,
    unread: store.getUnreadNotifications(),
    critical: store.getCriticalNotifications(),
    byType: (type: NotificationType) => store.getNotificationsByType(type),
    byPriority: (priority: NotificationPriority) => store.getNotificationsByPriority(priority),
    byStatus: (status: NotificationStatus) => store.getNotificationsByStatus(status),
    byRanch: (ranchId: string) => store.getNotificationsByRanch(ranchId)
  }), [store, notifications]);

  // Estadísticas memoizadas
  const stats = useMemo(() => store.getNotificationStats(), [store]);

  return {
    // Estado
    notifications,
    unreadCount,
    settings,
    isLoading: store.isLoading,
    error: store.error,
    
    // Filtros
    ...filteredNotifications,
    
    // Estadísticas
    stats,
    
    // Acciones
    addNotification: store.addNotification,
    updateNotification: store.updateNotification,
    removeNotification: store.removeNotification,
    markAsRead: store.markAsRead,
    markAllAsRead: store.markAllAsRead,
    resolveNotification: store.resolveNotification,
    snoozeNotification: store.snoozeNotification,
    
    // Configuración
    updateSettings: store.updateSettings,
    resetSettings: store.resetSettings,
    
    // Utilidades
    cleanupExpiredNotifications: store.cleanupExpiredNotifications,
    exportNotifications: store.exportNotifications,
    processAlerts: store.processAlerts
  };
}