// src/components/notifications/NotificationCenter.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { 
  Bell, 
  Filter, 
  Search, 
  Settings, 
  CheckCheck, 
  Download,
  X,
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle
} from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { AlertCard } from './AlertCard';
import { NotificationSettings as NotificationSettingsComponent } from './NotificationSettings';
import { NotificationType, NotificationPriority, NotificationStatus } from '@/lib/notification-types';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    resolveNotification,
    snoozeNotification,
    removeNotification,
    exportNotifications,
    stats
  } = useNotifications();

  // Estados del componente
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'critical'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<NotificationType | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<NotificationPriority | 'all'>('all');
  const [showSettings, setShowSettings] = useState(false);

  // Filtrar notificaciones
  const filteredNotifications = useMemo(() => {
    let filtered = notifications;

    // Filtro por tab
    switch (activeTab) {
      case 'unread':
        filtered = filtered.filter(n => n.status === 'unread');
        break;
      case 'critical':
        filtered = filtered.filter(n => n.priority === 'critical' && n.status !== 'resolved');
        break;
      // 'all' no necesita filtro adicional
    }

    // Filtro por tipo
    if (filterType !== 'all') {
      filtered = filtered.filter(n => n.type === filterType);
    }

    // Filtro por prioridad
    if (filterPriority !== 'all') {
      filtered = filtered.filter(n => n.priority === filterPriority);
    }

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (n.metadata && 'cattleTag' in n.metadata &&
         typeof n.metadata.cattleTag === 'string' && 
         n.metadata.cattleTag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Ordenar por fecha (más recientes primero)
    return filtered.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [notifications, activeTab, filterType, filterPriority, searchTerm]);

  const handleExport = () => {
    const csvData = exportNotifications('csv');
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notificaciones_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="bg-gray-50 px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Bell className="w-6 h-6 text-blue-600" />
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Notificaciones
                  </h2>
                  <p className="text-sm text-gray-600">
                    {unreadCount} sin leer • {stats.total} total
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowSettings(true)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                  title="Configuración"
                >
                  <Settings className="w-5 h-5" />
                </button>
                
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 mt-4">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'all'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Todas ({stats.total})
              </button>
              
              <button
                onClick={() => setActiveTab('unread')}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'unread'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Sin leer ({unreadCount})
              </button>
              
              <button
                onClick={() => setActiveTab('critical')}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'critical'
                    ? 'bg-red-100 text-red-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Críticas ({stats.byPriority.critical || 0})
              </button>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="px-6 py-4 border-b bg-white">
            {/* Search */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar notificaciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filters */}
            <div className="flex space-x-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as NotificationType | 'all')}
                className="flex-1 px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">Todos los tipos</option>
                <option value="health">🏥 Salud</option>
                <option value="production">🥛 Producción</option>
                <option value="maintenance">🔧 Mantenimiento</option>
                <option value="reminder">📅 Recordatorios</option>
                <option value="system">⚙️ Sistema</option>
              </select>
              
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value as NotificationPriority | 'all')}
                className="flex-1 px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">Todas las prioridades</option>
                <option value="critical">🔴 Crítica</option>
                <option value="warning">🟡 Advertencia</option>
                <option value="info">🔵 Información</option>
                <option value="success">🟢 Éxito</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center mt-3">
              <div className="flex space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-sm"
                  >
                    <CheckCheck className="w-4 h-4" />
                    <span>Marcar todas como leídas</span>
                  </button>
                )}
              </div>
              
              <button
                onClick={handleExport}
                className="flex items-center space-x-1 px-3 py-1 text-gray-600 hover:text-gray-800 text-sm"
                title="Exportar notificaciones"
              >
                <Download className="w-4 h-4" />
                <span>Exportar</span>
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No hay notificaciones
                </h3>
                <p className="text-gray-600">
                  {searchTerm || filterType !== 'all' || filterPriority !== 'all'
                    ? 'No se encontraron notificaciones con los filtros aplicados'
                    : 'Todas las notificaciones están al día'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredNotifications.map((notification) => (
                  <AlertCard
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={markAsRead}
                    onResolve={resolveNotification}
                    onSnooze={snoozeNotification}
                    onRemove={removeNotification}
                    compact={false}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer con estadísticas */}
          {filteredNotifications.length > 0 && (
            <div className="border-t bg-gray-50 px-6 py-3">
              <div className="flex justify-between text-sm text-gray-600">
                <span>
                  Mostrando {filteredNotifications.length} de {stats.total}
                </span>
                <div className="flex space-x-4">
                  <span className="flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1 text-red-500" />
                    {stats.byPriority.critical || 0}
                  </span>
                  <span className="flex items-center">
                    <AlertTriangle className="w-3 h-3 mr-1 text-yellow-500" />
                    {stats.byPriority.warning || 0}
                  </span>
                  <span className="flex items-center">
                    <Info className="w-3 h-3 mr-1 text-blue-500" />
                    {stats.byPriority.info || 0}
                  </span>
                  <span className="flex items-center">
                    <CheckCircle className="w-3 h-3 mr-1 text-green-500" />
                    {stats.byPriority.success || 0}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <NotificationSettingsComponent
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}