// src/lib/notification-types.ts

export type NotificationPriority = 'critical' | 'warning' | 'info' | 'success';
export type NotificationType = 'health' | 'production' | 'maintenance' | 'reminder' | 'system';
export type NotificationStatus = 'unread' | 'read' | 'resolved' | 'snoozed';

export interface BaseNotification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  status: NotificationStatus;
  title: string;
  message: string;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  ranchId?: string;
  cattleId?: string;
  metadata?: Record<string, any>;
}

export interface HealthNotification extends BaseNotification {
  type: 'health';
  metadata: {
    cattleTag: string;
    cattleName?: string;
    healthStatus: 'excellent' | 'good' | 'fair' | 'poor';
    previousStatus?: string;
    riskScore: number; // 0-100
    recommendedActions: string[];
  };
}

export interface ProductionNotification extends BaseNotification {
  type: 'production';
  metadata: {
    cattleTag?: string;
    currentProduction: number;
    previousProduction: number;
    changePercentage: number;
    avgProduction: number;
    daysBelow: number;
    recommendedActions: string[];
  };
}

export interface MaintenanceNotification extends BaseNotification {
  type: 'maintenance';
  metadata: {
    equipmentType: string;
    lastMaintenance?: string;
    overdueBy: number; // días
    urgencyLevel: 'low' | 'medium' | 'high';
    scheduledDate?: string;
  };
}

export interface ReminderNotification extends BaseNotification {
  type: 'reminder';
  metadata: {
    reminderType: 'vaccination' | 'deworming' | 'weighing' | 'breeding' | 'custom';
    cattleTag?: string;
    cattleName?: string;
    dueDate: string;
    overdueBy?: number;
    frequency?: 'once' | 'daily' | 'weekly' | 'monthly' | 'yearly';
    nextDueDate?: string;
  };
}

export interface SystemNotification extends BaseNotification {
  type: 'system';
  metadata: {
    systemEvent: 'backup' | 'update' | 'maintenance' | 'error' | 'info';
    affectedFeatures?: string[];
    actionRequired: boolean;
    documentationUrl?: string;
  };
}

export type AnyNotification = 
  | HealthNotification 
  | ProductionNotification 
  | MaintenanceNotification 
  | ReminderNotification 
  | SystemNotification;

// Configuración de notificaciones por usuario
export interface NotificationSettings {
  enabled: boolean;
  channels: {
    toast: boolean;
    panel: boolean;
    badge: boolean;
  };
  priorities: {
    critical: boolean;
    warning: boolean;
    info: boolean;
    success: boolean;
  };
  types: {
    health: boolean;
    production: boolean;
    maintenance: boolean;
    reminder: boolean;
    system: boolean;
  };
  quietHours: {
    enabled: boolean;
    startTime: string; // HH:mm
    endTime: string;   // HH:mm
  };
  ranchSpecific: Record<string, {
    enabled: boolean;
    thresholds: {
      healthRiskScore: number;
      productionDropPercentage: number;
      maintenanceOverdueDays: number;
    };
  }>;
}

// Configuración de alertas automáticas
export interface AlertRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  type: NotificationType;
  priority: NotificationPriority;
  conditions: {
    field: string;
    operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains';
    value: any;
    duration?: number; // minutos que debe mantenerse la condición
  }[];
  actions: {
    type: 'notification' | 'email' | 'sms';
    template: string;
    recipients?: string[];
  }[];
  cooldown: number; // minutos antes de poder disparar otra vez
  lastTriggered?: string;
  ranchId?: string; // Si es específica para un rancho
}

// Estado del store de notificaciones
export interface NotificationState {
  notifications: AnyNotification[];
  settings: NotificationSettings;
  alertRules: AlertRule[];
  unreadCount: number;
  lastChecked: string;
  isLoading: boolean;
  error: string | null;
}

// Acciones del store
export interface NotificationActions {
  // CRUD de notificaciones
  addNotification: (notification: Omit<AnyNotification, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNotification: (id: string, updates: Partial<AnyNotification>) => void;
  removeNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  resolveNotification: (id: string) => void;
  snoozeNotification: (id: string, until: string) => void;
  
  // Filtrado y búsqueda
  getNotificationsByType: (type: NotificationType) => AnyNotification[];
  getNotificationsByPriority: (priority: NotificationPriority) => AnyNotification[];
  getNotificationsByStatus: (status: NotificationStatus) => AnyNotification[];
  getNotificationsByRanch: (ranchId: string) => AnyNotification[];
  getUnreadNotifications: () => AnyNotification[];
  getCriticalNotifications: () => AnyNotification[];
  
  // Configuración
  updateSettings: (settings: Partial<NotificationSettings>) => void;
  resetSettings: () => void;
  
  // Reglas de alerta
  addAlertRule: (rule: Omit<AlertRule, 'id' | 'lastTriggered'>) => void;
  updateAlertRule: (id: string, updates: Partial<AlertRule>) => void;
  removeAlertRule: (id: string) => void;
  toggleAlertRule: (id: string, enabled: boolean) => void;
  
  // Motor de alertas
  processAlerts: () => Promise<void>;
  checkHealthAlerts: () => void;
  checkProductionAlerts: () => void;
  checkMaintenanceAlerts: () => void;
  checkReminderAlerts: () => void;
  
  // Utilidades
  cleanupExpiredNotifications: () => void;
  exportNotifications: (format: 'json' | 'csv') => string;
  getNotificationStats: () => {
    total: number;
    byType: Record<NotificationType, number>;
    byPriority: Record<NotificationPriority, number>;
    byStatus: Record<NotificationStatus, number>;
    avgResponseTime: number;
  };
}