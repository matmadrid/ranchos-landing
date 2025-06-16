// src/components/debug/StorageDebugPanel.tsx
/**
 * @version 1.0.0
 * @author TorresLaveaga
 * @cosmovision SpaceRanch Sistemas Dinámicos Universales
 * 
 * Panel de debug para monitoreo y gestión del storage
 * Solo visible en desarrollo para administradores
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useStorageCleanup } from '@/hooks/useStorageCleanup';
import { storageManager } from '@/services/storage/StorageManager';
import { cleanupService } from '@/services/storage/CleanupService';
import { STORAGE_KEYS } from '@/constants/storageKeys';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Trash2, 
  HardDrive, 
  Activity, 
  Clock, 
  AlertCircle,
  RefreshCw,
  Database,
  FileText,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface StorageInfo {
  totalKeys: number;
  usedSpace: number;
  totalSpace: number;
  percentage: number;
  keysByType: Record<string, number>;
}

interface CleanupHistoryItem {
  type: string;
  timestamp: Date;
  itemsCleaned: number;
  spaceSaved: number;
  duration?: number;
}

export function StorageDebugPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null);
  const [history, setHistory] = useState<CleanupHistoryItem[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [keyDetails, setKeyDetails] = useState<Record<string, any>>({});
  const [activeTab, setActiveTab] = useState('overview');

  const {
    cleanDemoData,
    cleanExpiredData,
    cleanOrphanedData,
    cleanAll,
    isLoading,
    stats,
    getCleanupHistory,
    getCleanupStats
  } = useStorageCleanup({
    showNotifications: true,
    confirmBeforeClean: true
  });

  // Cargar información del storage
  // Cargar información del storage
  const loadStorageInfo = useCallback(() => {
    const keys = storageManager.getAllKeys();
    const sizeInfo = storageManager.getStorageSize();
   
    // Categorizar claves
    const keysByType: Record<string, number> = {
      user: 0,
      ranch: 0,
      animal: 0,
      system: 0,
      cache: 0,
      other: 0
    };

    const details: any[] = [];
   
    keys.forEach(key => {
      const value = storageManager.get(key);
      const size = JSON.stringify(value).length;
      const metadata = storageManager.getItemMetadata(key);
      
      // Categorizar
      if (key.includes('user') || key.includes('auth')) keysByType.user++;
      else if (key.includes('ranch')) keysByType.ranch++;
      else if (key.includes('animal') || key.includes('cattle')) keysByType.animal++;
      else if (key.startsWith('__')) keysByType.system++;
      else if (key.includes('cache')) keysByType.cache++;
      else keysByType.other++;

      details.push({
        key,
        size,
        type: typeof value,
        hasMetadata: !!metadata,
        lastModified: metadata?.timestamp ? new Date(metadata.timestamp) : null
      });
    });

    setStorageInfo({
      totalKeys: keys.length,
      usedSpace: sizeInfo.used,
      totalSpace: sizeInfo.total,
      percentage: sizeInfo.percentage,
      keysByType
    });
    setKeyDetails(details);
  }, []);

  // Cargar historial
  const loadHistory = useCallback(() => {
    const cleanupHistory = getCleanupHistory();
    const formattedHistory = cleanupHistory.map(item => ({
      type: item.type,
      timestamp: new Date(item.timestamp),
      itemsCleaned: item.itemsCleaned,
      spaceSaved: item.spaceSaved
    }));
    setHistory(formattedHistory);
  }, [getCleanupHistory]);

  useEffect(() => {
    if (isOpen) {
      loadStorageInfo();
      loadHistory();
    }
  }, [isOpen, stats, loadStorageInfo, loadHistory]);
  // Solo mostrar en desarrollo
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  // Botón flotante para abrir el panel
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 bg-gray-900 text-white p-3 rounded-full shadow-lg hover:bg-gray-800 transition-colors"
        title="Storage Debug Panel"
      >
        <Database className="w-5 h-5" />
      </button>
    );
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden bg-white">
        <CardHeader className="flex flex-row items-center justify-between border-b">
          <div className="flex items-center gap-3">
            <Database className="w-6 h-6" />
            <CardTitle>Storage Debug Panel</CardTitle>
            <Badge variant="outline">Development Only</Badge>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
          >
            <XCircle className="w-5 h-5" />
          </Button>
        </CardHeader>

        <CardContent className="p-0 overflow-auto max-h-[calc(90vh-80px)]">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start rounded-none border-b">
              <TabsTrigger value="overview">Vista General</TabsTrigger>
              <TabsTrigger value="cleanup">Limpieza</TabsTrigger>
              <TabsTrigger value="keys">Claves</TabsTrigger>
              <TabsTrigger value="history">Historial</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="p-6 space-y-6">
              {storageInfo && (
                <>
                  {/* Estadísticas principales */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Total Claves</p>
                            <p className="text-2xl font-bold">{storageInfo.totalKeys}</p>
                          </div>
                          <FileText className="w-8 h-8 text-gray-400" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Espacio Usado</p>
                            <p className="text-2xl font-bold">{formatBytes(storageInfo.usedSpace)}</p>
                          </div>
                          <HardDrive className="w-8 h-8 text-gray-400" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Items Limpiados</p>
                            <p className="text-2xl font-bold">{stats.itemsCleaned}</p>
                          </div>
                          <Trash2 className="w-8 h-8 text-gray-400" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Espacio Liberado</p>
                            <p className="text-2xl font-bold">{formatBytes(stats.spaceSaved)}</p>
                          </div>
                          <CheckCircle className="w-8 h-8 text-green-500" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Distribución por tipo */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Distribución de Claves</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {Object.entries(storageInfo.keysByType).map(([type, count]) => (
                          <div key={type} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant={type === 'temp' ? 'destructive' : 'secondary'}>
                                {type}
                              </Badge>
                              <span className="text-sm text-gray-600">{count} claves</span>
                            </div>
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  type === 'temp' ? 'bg-red-500' : 'bg-blue-500'
                                }`}
                                style={{ width: `${(count / storageInfo.totalKeys) * 100}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Barra de uso */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Uso del Storage</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{formatBytes(storageInfo.usedSpace)} usado</span>
                          <span>{formatBytes(storageInfo.totalSpace)} total</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-4">
                          <div 
                            className={`h-4 rounded-full transition-all ${
                              storageInfo.percentage > 80 ? 'bg-red-500' : 
                              storageInfo.percentage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${storageInfo.percentage}%` }}
                          />
                        </div>
                        <p className="text-sm text-gray-600 text-center">
                          {storageInfo.percentage.toFixed(1)}% usado
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>

            <TabsContent value="cleanup" className="p-6 space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Las operaciones de limpieza son irreversibles. Úsalas con precaución.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Trash2 className="w-5 h-5" />
                      Limpiar Datos Demo
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      Elimina todos los ranchos, animales y datos relacionados que sean demo.
                    </p>
                    <Button 
                      onClick={() => cleanDemoData()}
                      disabled={isLoading}
                      variant="destructive"
                      className="w-full"
                    >
                      {isLoading ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4 mr-2" />
                      )}
                      Limpiar Datos Demo
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Limpiar Datos Expirados
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      Elimina cache y datos temporales que han excedido su tiempo de vida.
                    </p>
                    <Button 
                      onClick={() => cleanExpiredData()}
                      disabled={isLoading}
                      variant="outline"
                      className="w-full"
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      Limpiar Expirados
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      Limpiar Datos Huérfanos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      Elimina referencias a entidades que ya no existen en el sistema.
                    </p>
                    <Button 
                      onClick={() => cleanOrphanedData()}
                      disabled={isLoading}
                      variant="outline"
                      className="w-full"
                    >
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Limpiar Huérfanos
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      Limpieza Completa
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      Ejecuta todas las operaciones de limpieza de forma secuencial.
                    </p>
                    <Button 
                      onClick={() => cleanAll()}
                      disabled={isLoading}
                      variant="destructive"
                      className="w-full"
                    >
                      <Activity className="w-4 h-4 mr-2" />
                      Limpieza Completa
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Estadísticas de la última limpieza */}
              {stats.itemsCleaned > 0 && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-lg">Última Limpieza</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Items eliminados</p>
                        <p className="text-xl font-semibold">{stats.itemsCleaned}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Espacio liberado</p>
                        <p className="text-xl font-semibold">{formatBytes(stats.spaceSaved)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="keys" className="p-6">
              <Alert className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Vista de todas las claves en localStorage. Ten cuidado al modificar valores.
                </AlertDescription>
              </Alert>

              <div className="space-y-2 max-h-96 overflow-auto border rounded-lg p-4">
                {storageManager.getAllKeys().map(key => (
                  <div 
                    key={key}
                    className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer"
                    onClick={() => {
                      if (selectedKeys.includes(key)) {
                        setSelectedKeys(selectedKeys.filter(k => k !== key));
                      } else {
                        setSelectedKeys([...selectedKeys, key]);
                      }
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedKeys.includes(key)}
                        onChange={() => {}}
                        className="rounded"
                      />
                      <code className="text-sm">{key}</code>
                      {key.includes('demo') && (
                        <Badge variant="destructive" className="text-xs">demo</Badge>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`¿Eliminar la clave "${key}"?`)) {
                          storageManager.remove(key);
                          loadStorageInfo();
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Detalles de claves seleccionadas */}
              {selectedKeys.length > 0 && (
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Detalles de {selectedKeys.length} clave(s) seleccionada(s)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 max-h-64 overflow-auto">
                      {selectedKeys.map(key => (
                        <div key={key} className="border rounded p-3">
                          <h4 className="font-mono text-sm font-semibold mb-2">{key}</h4>
                          <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                            {JSON.stringify(keyDetails[key]?.value, null, 2)}
                          </pre>
                          {keyDetails[key]?.metadata && (
                            <div className="mt-2 text-xs text-gray-600">
                              <p>Timestamp: {new Date(keyDetails[key].metadata.timestamp).toLocaleString()}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="history" className="p-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Historial de Limpiezas</CardTitle>
                </CardHeader>
                <CardContent>
                  {history.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">
                      No hay limpiezas registradas aún
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {history.map((item, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2">
                                <Badge>{item.type}</Badge>
                                <span className="text-sm text-gray-600">
                                  {formatTime(item.timestamp)}
                                </span>
                              </div>
                              <p className="text-sm mt-1">
                                {item.itemsCleaned} items eliminados • {formatBytes(item.spaceSaved)} liberados
                              </p>
                            </div>
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Estadísticas globales */}
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-lg">Estadísticas Globales</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold">{history.length}</p>
                      <p className="text-sm text-gray-600">Total Limpiezas</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">
                        {history.reduce((sum, item) => sum + item.itemsCleaned, 0)}
                      </p>
                      <p className="text-sm text-gray-600">Items Totales</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">
                        {formatBytes(history.reduce((sum, item) => sum + item.spaceSaved, 0))}
                      </p>
                      <p className="text-sm text-gray-600">Espacio Total</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">
                        {history.filter(item => item.type === 'demo-data').length}
                      </p>
                      <p className="text-sm text-gray-600">Limpiezas Demo</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}