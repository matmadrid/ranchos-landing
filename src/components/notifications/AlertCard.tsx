// src/components/notifications/AlertCard.tsx
'use client';

import React from 'react';
import { 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  Clock,
  MoreHorizontal,
  Eye,
  X,
  AlarmClock  // ✅ CAMBIO 1: Snooze → AlarmClock
} from 'lucide-react';
import { AnyNotification, NotificationPriority } from '@/lib/notification-types';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface AlertCardProps {
  notification: AnyNotification;
  onMarkAsRead?: (id: string) => void;
  onResolve?: (id: string) => void;
  onSnooze?: (id: string, until: string) => void;
  onRemove?: (id: string) => void;
  compact?: boolean;
}

export function AlertCard({ 
  notification, 
  onMarkAsRead, 
  onResolve, 
  onSnooze, 
  onRemove,
  compact = false 
}: AlertCardProps) {
  const [showActions, setShowActions] = React.useState(false);

  const getPriorityIcon = (priority: NotificationPriority) => {
    switch (priority) {
      case 'critical':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getPriorityStyles = (priority: NotificationPriority) => {
    switch (priority) {
      case 'critical':
        return 'border-l-red-500 bg-red-50';
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'success':
        return 'border-l-green-500 bg-green-50';
      case 'info':
      default:
        return 'border-l-blue-500 bg-blue-50';
    }
  };

  const getTypeEmoji = (type: string) => {
    switch (type) {
      case 'health':
        return '🏥';
      case 'production':
        return '🥛';
      case 'maintenance':
        return '🔧';
      case 'reminder':
        return '📅';
      case 'system':
        return '⚙️';
      default:
        return '📢';
    }
  };

  const isUnread = notification.status === 'unread';
  const cardClass = `
    border-l-4 ${getPriorityStyles(notification.priority)} 
    ${isUnread ? 'shadow-md' : 'shadow-sm'} 
    rounded-lg p-4 mb-3 transition-all hover:shadow-lg
    ${compact ? 'py-2' : ''}
  `;

  const handleSnooze = () => {
    if (onSnooze) {
      const until = new Date();
      until.setHours(until.getHours() + 1); // Snooze por 1 hora
      onSnooze(notification.id, until.toISOString());
    }
  };

  return (
    <div className={cardClass}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <div className="flex-shrink-0 mt-1">
            {getPriorityIcon(notification.priority)}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <span className="text-lg">{getTypeEmoji(notification.type)}</span>
              <h4 className={`text-sm font-medium ${isUnread ? 'text-gray-900' : 'text-gray-700'}`}>
                {notification.title}
              </h4>
              {isUnread && (
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              )}
            </div>
            
            <p className={`mt-1 text-sm ${isUnread ? 'text-gray-800' : 'text-gray-600'} ${compact ? 'truncate' : ''}`}>
              {notification.message}
            </p>
            
            {!compact && notification.metadata && 'recommendedActions' in notification.metadata && (
              <div className="mt-2">
                <h5 className="text-xs font-medium text-gray-700 mb-1">Acciones recomendadas:</h5>
                <ul className="text-xs text-gray-600 space-y-1">
                  {notification.metadata.recommendedActions.slice(0, 2).map((action, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-500 mr-1">•</span>
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
              <span className="flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {formatDistanceToNow(new Date(notification.createdAt), { 
                  addSuffix: true, 
                  locale: es 
                })}
              </span>
              {notification.cattleId && notification.metadata && 'cattleTag' in notification.metadata && (
                <span className="text-blue-600 font-medium">
                  {notification.metadata.cattleTag}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex-shrink-0 ml-4">
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            
            {showActions && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border z-10">
                <div className="py-1">
                  {isUnread && onMarkAsRead && (
                    <button
                      onClick={() => {
                        onMarkAsRead(notification.id);
                        setShowActions(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Marcar como leído
                    </button>
                  )}
                  
                  {notification.status !== 'resolved' && onResolve && (
                    <button
                      onClick={() => {
                        onResolve(notification.id);
                        setShowActions(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Resolver
                    </button>
                  )}
                  
                  {notification.status !== 'snoozed' && onSnooze && (
                    <button
                      onClick={() => {
                        handleSnooze();
                        setShowActions(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <AlarmClock className="w-4 h-4 mr-2" />
                      {/* ✅ CAMBIO 2: <Snooze> → <AlarmClock> */}
                      Posponer 1h
                    </button>
                  )}
                  
                  {onRemove && (
                    <button
                      onClick={() => {
                        onRemove(notification.id);
                        setShowActions(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Eliminar
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}