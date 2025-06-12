// src/store/notifications.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  NotificationState,
  NotificationActions,
  AnyNotification,
  NotificationSettings,
  AlertRule,
  NotificationType,
  NotificationPriority,
  NotificationStatus
} from '@/lib/notification-types';

// Configuración por defecto
const defaultSettings: NotificationSettings = {
  enabled: true,
  channels: {
    toast: true,
    panel: true,
    badge: true
  },
  priorities: {
    critical: true,
    warning: true,
    info: true,
    success: true
  },
  types: {
    health: true,
    production: true,
    maintenance: true,
    reminder: true,
    system: true
  },
  quietHours: {
    enabled: false,
    startTime: '22:00',
    endTime: '08:00'
  },
  ranchSpecific: {}
};

// Reglas de alerta por defecto
const defaultAlertRules: AlertRule[] = [
  {
    id: 'health-critical',
    name: 'Estado de Salud Crítico',
    description: 'Alerta cuando un animal tiene estado de salud "poor"',
    enabled: true,
    type: 'health',
    priority: 'critical',
    conditions: [
      {
        field: 'healthStatus',
        operator: 'eq',
        value: 'poor'
      }
    ],
    actions: [
      {
        type: 'notification',
        template: 'Animal {{cattleTag}} requiere atención veterinaria urgente'
      }
    ],
    cooldown: 60 // 1 hora
  },
  {
    id: 'production-drop',
    name: 'Caída de Producción',
    description: 'Alerta cuando la producción de leche baja más del 20%',
    enabled: true,
    type: 'production',
    priority: 'warning',
    conditions: [
      {
        field: 'productionChange',
        operator: 'lt',
        value: -20,
        duration: 180 // 3 días
      }
    ],
    actions: [
      {
        type: 'notification',
        template: 'Producción de {{cattleTag}} ha disminuido {{changePercentage}}%'
      }
    ],
    cooldown: 1440 // 24 horas
  }
];

type NotificationStore = NotificationState & NotificationActions;

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      // Estado inicial
      notifications: [],
      settings: defaultSettings,
      alertRules: defaultAlertRules,
      unreadCount: 0,
      lastChecked: new Date().toISOString(),
      isLoading: false,
      error: null,

      // === CRUD DE NOTIFICACIONES ===
      addNotification: (notificationData) => {
        const notification: AnyNotification = {
          ...notificationData,
          id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: 'unread'
        } as AnyNotification;

        set((state) => ({
          notifications: [notification, ...state.notifications],
          unreadCount: state.unreadCount + 1,
          lastChecked: new Date().toISOString()
        }));
      },

      updateNotification: (id, updates) => {
        set((state) => ({
          notifications: state.notifications.map(notif =>
            notif.id === id
              ? { ...notif, ...updates, updatedAt: new Date().toISOString() } as AnyNotification
              : notif
          )
        }));
      },

      removeNotification: (id) => {
        set((state) => {
          const notification = state.notifications.find(n => n.id === id);
          const wasUnread = notification?.status === 'unread';
          
          return {
            notifications: state.notifications.filter(notif => notif.id !== id),
            unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount
          };
        });
      },

      markAsRead: (id) => {
        set((state) => {
          const notification = state.notifications.find(n => n.id === id);
          const wasUnread = notification?.status === 'unread';
          
          return {
            notifications: state.notifications.map(notif =>
              notif.id === id
                ? { ...notif, status: 'read' as NotificationStatus, updatedAt: new Date().toISOString() } as AnyNotification
                : notif
            ),
            unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount
          };
        });
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map(notif => ({
            ...notif,
            status: 'read' as NotificationStatus,
            updatedAt: new Date().toISOString()
          } as AnyNotification)),
          unreadCount: 0
        }));
      },

      resolveNotification: (id) => {
        set((state) => {
          const notification = state.notifications.find(n => n.id === id);
          const wasUnread = notification?.status === 'unread';
          
          return {
            notifications: state.notifications.map(notif =>
              notif.id === id
                ? { ...notif, status: 'resolved' as NotificationStatus, updatedAt: new Date().toISOString() } as AnyNotification
                : notif
            ),
            unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount
          };
        });
      },

      snoozeNotification: (id, until) => {
        set((state) => ({
          notifications: state.notifications.map(notif =>
            notif.id === id
              ? { 
                  ...notif, 
                  status: 'snoozed' as NotificationStatus, 
                  expiresAt: until,
                  updatedAt: new Date().toISOString() 
                } as AnyNotification
              : notif
          )
        }));
      },

      // === FILTRADO Y BÚSQUEDA ===
      getNotificationsByType: (type: NotificationType) => {
        return get().notifications.filter(notif => notif.type === type);
      },

      getNotificationsByPriority: (priority: NotificationPriority) => {
        return get().notifications.filter(notif => notif.priority === priority);
      },

      getNotificationsByStatus: (status: NotificationStatus) => {
        return get().notifications.filter(notif => notif.status === status);
      },

      getNotificationsByRanch: (ranchId: string) => {
        return get().notifications.filter(notif => notif.ranchId === ranchId);
      },

      getUnreadNotifications: () => {
        return get().notifications.filter(notif => notif.status === 'unread');
      },

      getCriticalNotifications: () => {
        return get().notifications.filter(notif => 
          notif.priority === 'critical' && notif.status !== 'resolved'
        );
      },

      // === CONFIGURACIÓN ===
      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings }
        }));
      },

      resetSettings: () => {
        set({ settings: defaultSettings });
      },

      // === REGLAS DE ALERTA ===
      addAlertRule: (ruleData) => {
        const rule: AlertRule = {
          ...ruleData,
          id: `rule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        };

        set((state) => ({
          alertRules: [...state.alertRules, rule]
        }));
      },

      updateAlertRule: (id, updates) => {
        set((state) => ({
          alertRules: state.alertRules.map(rule =>
            rule.id === id ? { ...rule, ...updates } : rule
          )
        }));
      },

      removeAlertRule: (id) => {
        set((state) => ({
          alertRules: state.alertRules.filter(rule => rule.id !== id)
        }));
      },

      toggleAlertRule: (id, enabled) => {
        set((state) => ({
          alertRules: state.alertRules.map(rule =>
            rule.id === id ? { ...rule, enabled } : rule
          )
        }));
      },

      // === MOTOR DE ALERTAS ===
      processAlerts: async () => {
        const { checkHealthAlerts, checkProductionAlerts, checkMaintenanceAlerts, checkReminderAlerts } = get();
        
        set({ isLoading: true, error: null });
        
        try {
          checkHealthAlerts();
          checkProductionAlerts();
          checkMaintenanceAlerts();
          checkReminderAlerts();
        } catch (error) {
          set({ error: (error as Error).message });
        } finally {
          set({ isLoading: false });
        }
      },

      checkHealthAlerts: () => {
        // Esta función será implementada cuando integremos con el store principal
        // Por ahora es un placeholder
      },

      checkProductionAlerts: () => {
        // Placeholder para alertas de producción
      },

      checkMaintenanceAlerts: () => {
        // Placeholder para alertas de mantenimiento
      },

      checkReminderAlerts: () => {
        // Placeholder para recordatorios
      },

      // === UTILIDADES ===
      cleanupExpiredNotifications: () => {
        const now = new Date();
        set((state) => ({
          notifications: state.notifications.filter(notif => {
            if (!notif.expiresAt) return true;
            return new Date(notif.expiresAt) > now;
          })
        }));
      },

      exportNotifications: (format: 'json' | 'csv') => {
        const notifications = get().notifications;
        
        if (format === 'json') {
          return JSON.stringify(notifications, null, 2);
        } else {
          // CSV export
          const headers = ['ID', 'Type', 'Priority', 'Status', 'Title', 'Message', 'Created At'];
          const rows = notifications.map(n => [
            n.id, n.type, n.priority, n.status, n.title, n.message, n.createdAt
          ]);
          
          return [headers, ...rows].map(row => row.join(',')).join('\n');
        }
      },

      getNotificationStats: () => {
        const notifications = get().notifications;
        
        const byType = notifications.reduce((acc, notif) => {
          acc[notif.type] = (acc[notif.type] || 0) + 1;
          return acc;
        }, {} as Record<NotificationType, number>);

        const byPriority = notifications.reduce((acc, notif) => {
          acc[notif.priority] = (acc[notif.priority] || 0) + 1;
          return acc;
        }, {} as Record<NotificationPriority, number>);

        const byStatus = notifications.reduce((acc, notif) => {
          acc[notif.status] = (acc[notif.status] || 0) + 1;
          return acc;
        }, {} as Record<NotificationStatus, number>);

        // Calcular tiempo promedio de respuesta (placeholder)
        const avgResponseTime = 0; // TODO: implementar cálculo real

        return {
          total: notifications.length,
          byType,
          byPriority,
          byStatus,
          avgResponseTime
        };
      }
    }),
    {
      name: 'notifications-storage',
      // Limpiar notificaciones expiradas al cargar
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.cleanupExpiredNotifications();
        }
      }
    }
  )
);

export default useNotificationStore;