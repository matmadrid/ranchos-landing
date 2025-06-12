// src/components/notifications/index.ts

// Componentes principales
export { NotificationCenter } from './NotificationCenter';
export { NotificationBadge } from './NotificationBadge';
export { AlertCard } from './AlertCard';
export { NotificationSettings } from './NotificationSettings';

// Sistema de toast
export { ToastComponent, ToastContainer } from '../ui/toast';
export { NotificationProvider, useNotificationContext } from '../ui/notification-provider';

// Re-exportar hooks para facilitar imports
export { useNotifications } from '@/hooks/useNotifications';
export { useAlerts } from '@/hooks/useAlerts';
export { useToast } from '@/hooks/useToast';

// Re-exportar store
export { useNotificationStore } from '@/store/notifications';

// Re-exportar tipos principales
export type {
  AnyNotification,
  NotificationSettings as NotificationSettingsType,
  NotificationPriority,
  NotificationType,
  NotificationStatus
} from '@/lib/notification-types';