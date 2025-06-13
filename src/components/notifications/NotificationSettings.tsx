// src/components/notifications/NotificationSettings.tsx
'use client';

import React, { useState } from 'react';
import { X, Save, RotateCcw, Clock, Bell } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import useRanchOSStore from '@/store'; // Para obtener ranchos

interface NotificationSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationSettings({ isOpen, onClose }: NotificationSettingsProps) {
  const { settings, updateSettings, resetSettings } = useNotifications();
  const { ranches } = useRanchOSStore();
  
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSave = () => {
    updateSettings(localSettings);
    onClose();
  };

  const handleReset = () => {
    resetSettings();
    setLocalSettings({
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
    });
  };

  const updateRanchSettings = (ranchId: string, field: string, value: any) => {
    setLocalSettings(prev => ({
      ...prev,
      ranchSpecific: {
        ...prev.ranchSpecific,
        [ranchId]: {
          ...prev.ranchSpecific[ranchId],
          [field]: value
        }
      }
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      <div className="absolute right-0 top-0 h-full w-full max-w-lg bg-white shadow-xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="bg-gray-50 px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Bell className="w-6 h-6 text-blue-600" />
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Configuración de Notificaciones
                  </h2>
                  <p className="text-sm text-gray-600">
                    Personaliza cómo y cuándo recibir alertas
                  </p>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {/* General Settings */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Configuración General</h3>
              
              <div className="space-y-4">
                {/* Notificaciones habilitadas */}
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Notificaciones habilitadas
                    </label>
                    <p className="text-sm text-gray-500">
                      Activar o desactivar todas las notificaciones
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localSettings.enabled}
                      onChange={(e) => setLocalSettings(prev => ({
                        ...prev,
                        enabled: e.target.checked
                      }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {/* Canales de notificación */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Canales de notificación
                  </label>
                  <div className="space-y-2">
                    {Object.entries(localSettings.channels).map(([channel, enabled]) => (
                      <div key={channel} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`channel-${channel}`}
                          checked={enabled}
                          onChange={(e) => setLocalSettings(prev => ({
                            ...prev,
                            channels: {
                              ...prev.channels,
                              [channel]: e.target.checked
                            }
                          }))}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor={`channel-${channel}`} className="ml-2 text-sm text-gray-700 capitalize">
                          {channel === 'toast' ? 'Notificaciones emergentes' :
                           channel === 'panel' ? 'Panel de notificaciones' :
                           'Badges en navegación'}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Prioridades */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Prioridades</h3>
              <div className="space-y-2">
                {Object.entries(localSettings.priorities).map(([priority, enabled]) => (
                  <div key={priority} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-2 ${
                        priority === 'critical' ? 'bg-red-500' :
                        priority === 'warning' ? 'bg-yellow-500' :
                        priority === 'success' ? 'bg-green-500' : 'bg-blue-500'
                      }`} />
                      <label className="text-sm text-gray-700 capitalize">
                        {priority === 'critical' ? 'Crítica' :
                         priority === 'warning' ? 'Advertencia' :
                         priority === 'success' ? 'Éxito' : 'Información'}
                      </label>
                    </div>
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={(e) => setLocalSettings(prev => ({
                        ...prev,
                        priorities: {
                          ...prev.priorities,
                          [priority]: e.target.checked
                        }
                      }))}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Tipos de notificación */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Tipos de Notificación</h3>
              <div className="space-y-2">
                {Object.entries(localSettings.types).map(([type, enabled]) => (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="mr-2">
                        {type === 'health' ? '🏥' :
                         type === 'production' ? '🥛' :
                         type === 'maintenance' ? '🔧' :
                         type === 'reminder' ? '📅' : '⚙️'}
                      </span>
                      <label className="text-sm text-gray-700">
                        {type === 'health' ? 'Salud del ganado' :
                         type === 'production' ? 'Producción de leche' :
                         type === 'maintenance' ? 'Mantenimiento' :
                         type === 'reminder' ? 'Recordatorios' : 'Sistema'}
                      </label>
                    </div>
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={(e) => setLocalSettings(prev => ({
                        ...prev,
                        types: {
                          ...prev.types,
                          [type]: e.target.checked
                        }
                      }))}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Horarios silenciosos */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Horarios Silenciosos
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Activar horarios silenciosos
                  </label>
                  <input
                    type="checkbox"
                    checked={localSettings.quietHours.enabled}
                    onChange={(e) => setLocalSettings(prev => ({
                      ...prev,
                      quietHours: {
                        ...prev.quietHours,
                        enabled: e.target.checked
                      }
                    }))}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>

                {localSettings.quietHours.enabled && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Inicio
                      </label>
                      <input
                        type="time"
                        value={localSettings.quietHours.startTime}
                        onChange={(e) => setLocalSettings(prev => ({
                          ...prev,
                          quietHours: {
                            ...prev.quietHours,
                            startTime: e.target.value
                          }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fin
                      </label>
                      <input
                        type="time"
                        value={localSettings.quietHours.endTime}
                        onChange={(e) => setLocalSettings(prev => ({
                          ...prev,
                          quietHours: {
                            ...prev.quietHours,
                            endTime: e.target.value
                          }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Configuración por rancho */}
            {ranches.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Configuración por Rancho
                </h3>
                <div className="space-y-4">
                  {ranches.map((ranch) => (
                    <div key={ranch.id} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">{ranch.name}</h4>
                      
                      <div className="space-y-3">
                        {/* Habilitar notificaciones para este rancho */}
                        <div className="flex items-center justify-between">
                          <label className="text-sm text-gray-700">
                            Notificaciones habilitadas
                          </label>
                          <input
                            type="checkbox"
                            checked={localSettings.ranchSpecific[ranch.id]?.enabled !== false}
                            onChange={(e) => updateRanchSettings(ranch.id, 'enabled', e.target.checked)}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </div>

                        {/* Umbrales específicos */}
                        <div className="grid grid-cols-1 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Umbral de riesgo de salud (0-100)
                            </label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={localSettings.ranchSpecific[ranch.id]?.thresholds?.healthRiskScore || 60}
                              onChange={(e) => updateRanchSettings(ranch.id, 'thresholds', {
                                ...localSettings.ranchSpecific[ranch.id]?.thresholds,
                                healthRiskScore: parseInt(e.target.value)
                              })}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Caída de producción para alerta (%)
                            </label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={localSettings.ranchSpecific[ranch.id]?.thresholds?.productionDropPercentage || 20}
                              onChange={(e) => updateRanchSettings(ranch.id, 'thresholds', {
                                ...localSettings.ranchSpecific[ranch.id]?.thresholds,
                                productionDropPercentage: parseInt(e.target.value)
                              })}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Días de retraso mantenimiento
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={localSettings.ranchSpecific[ranch.id]?.thresholds?.maintenanceOverdueDays || 7}
                              onChange={(e) => updateRanchSettings(ranch.id, 'thresholds', {
                                ...localSettings.ranchSpecific[ranch.id]?.thresholds,
                                maintenanceOverdueDays: parseInt(e.target.value)
                              })}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t bg-gray-50 px-6 py-4">
            <div className="flex justify-between">
              <button
                onClick={handleReset}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Restablecer</span>
              </button>
              
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}