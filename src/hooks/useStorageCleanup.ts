// src/hooks/useStorageCleanup.ts
/**
 * @version 1.0.0
 * @author TorresLaveaga
 * @cosmovision SpaceRanch Sistemas Dinámicos Universales
 * 
 * Hook personalizado para integración de limpieza de storage con React
 * Proporciona una interfaz elegante para usar CleanupService en componentes
 */

import { useState, useCallback } from 'react';
import { cleanupService, CleanupType } from '@/services/storage/CleanupService';
import type { CleanupOptions } from '@/services/storage/CleanupService';
import { storageManager } from '@/services/storage/StorageManager';
import { useToast } from '@/hooks/useToast';
import { useNotifications } from '@/hooks/useNotifications';

/**
 * Opciones para el hook
 */
interface UseStorageCleanupOptions {
  showNotifications?: boolean;
  confirmBeforeClean?: boolean;
  onSuccess?: (result: any) => void;
  onError?: (error: Error) => void;
}

/**
 * Estado del hook
 */
interface CleanupState {
  isLoading: boolean;
  error: Error | null;
  lastCleanup: Date | null;
  stats: {
    itemsCleaned: number;
    spaceSaved: number;
  };
}

/**
 * Hook useStorageCleanup
 * Proporciona funciones de limpieza con manejo de estado y notificaciones
 */
export function useStorageCleanup(options: UseStorageCleanupOptions = {}) {
  const {
    showNotifications = true,
    confirmBeforeClean = false,
    onSuccess,
    onError
  } = options;

  const { addToast, success: toastSuccess, error: toastError } = useToast();
  const { addNotification } = useNotifications();
  
  const [state, setState] = useState<CleanupState>({
    isLoading: false,
    error: null,
    lastCleanup: null,
    stats: {
      itemsCleaned: 0,
      spaceSaved: 0
    }
  });

  /**
   * Mostrar notificación de éxito
   */
  const showSuccessNotification = useCallback((message: string, details?: string) => {
    if (!showNotifications) return;

    toastSuccess(message.includes("Limpieza completa") ? message : "✅ Limpieza exitosa", message.includes("Limpieza completa") ? details : message);

    if (details) {
      addNotification({
  type: 'system',
  title: 'Limpieza completada',
  message: details,
  priority: 'info',
  status: 'unread',
  metadata: {
    systemEvent: 'maintenance',
    actionRequired: false,
    affectedFeatures: ['storage', 'cache']
  }
});
    }
  }, [showNotifications, toastSuccess, addNotification]);

  /**
   * Mostrar notificación de error
   */
  const showErrorNotification = useCallback((error: string) => {
    if (!showNotifications) return;

    toastError("❌ Error en limpieza", error);
  }, [showNotifications, toastError]);

  /**
   * Confirmar antes de limpiar
   */
  const confirmAction = useCallback(async (message: string): Promise<boolean> => {
    if (!confirmBeforeClean) return true;

    return new Promise((resolve) => {
      const confirmed = window.confirm(message);
      resolve(confirmed);
    });
  }, [confirmBeforeClean]);

  /**
   * Limpiar datos demo
   */
  const cleanDemoData = useCallback(async (cleanupOptions?: CleanupOptions) => {
    try {
      const confirmed = await confirmAction(
        '¿Estás seguro de que quieres eliminar todos los datos demo?\n\n' +
        'Esta acción no se puede deshacer.'
      );

      if (!confirmed) return null;

      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Ejecutar limpieza
      const result = await cleanupService.cleanDemoData({
        ...cleanupOptions,
        verbose: true
      });

      // Actualizar estado
      setState(prev => ({
        ...prev,
        isLoading: false,
        lastCleanup: new Date(),
        stats: {
          itemsCleaned: prev.stats.itemsCleaned + result.itemsCleaned,
          spaceSaved: prev.stats.spaceSaved + result.spaceSaved
        }
      }));

      // Notificar éxito
      const message = `Se eliminaron ${result.itemsCleaned} elementos demo`;
      const details = result.spaceSaved > 0 
        ? `Espacio liberado: ${(result.spaceSaved / 1024).toFixed(2)} KB`
        : undefined;

      showSuccessNotification(message, details);
      onSuccess?.(result);

      return result;
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      
      setState(prev => ({ ...prev, isLoading: false, error: errorObj }));
      showErrorNotification(errorObj.message);
      onError?.(errorObj);
      
      return null;
    }
  }, [confirmAction, showSuccessNotification, showErrorNotification, onSuccess, onError]);

  /**
   * Limpiar al cerrar sesión
   */
  const cleanOnLogout = useCallback(async (preserveUserData = false) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // No confirmar en logout - debe ser transparente
      const result = await cleanupService.cleanOnLogout({
        preserveUserData,
        dryRun: false
      });

      setState(prev => ({
        ...prev,
        isLoading: false,
        lastCleanup: new Date(),
        stats: {
          itemsCleaned: prev.stats.itemsCleaned + result.itemsCleaned,
          spaceSaved: prev.stats.spaceSaved + result.spaceSaved
        }
      }));

      // Notificación silenciosa
      if (result.itemsCleaned > 0) {
        console.log(`🧹 Limpieza de logout: ${result.itemsCleaned} elementos eliminados`);
      }

      onSuccess?.(result);
      return result;
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      
      setState(prev => ({ ...prev, isLoading: false, error: errorObj }));
      console.error('Error en limpieza de logout:', errorObj);
      onError?.(errorObj);
      
      return null;
    }
  }, [onSuccess, onError]);

  /**
   * Limpiar datos expirados
   */
  const cleanExpiredData = useCallback(async () => {
    try {
      const confirmed = await confirmAction(
        '¿Quieres limpiar todos los datos expirados del sistema?'
      );

      if (!confirmed) return null;

      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const result = await cleanupService.cleanExpiredData();

      setState(prev => ({
        ...prev,
        isLoading: false,
        lastCleanup: new Date(),
        stats: {
          itemsCleaned: prev.stats.itemsCleaned + result.itemsCleaned,
          spaceSaved: prev.stats.spaceSaved + result.spaceSaved
        }
      }));

      showSuccessNotification(
        `Se eliminaron ${result.itemsCleaned} elementos expirados`
      );

      onSuccess?.(result);
      return result;
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      
      setState(prev => ({ ...prev, isLoading: false, error: errorObj }));
      showErrorNotification(errorObj.message);
      onError?.(errorObj);
      
      return null;
    }
  }, [confirmAction, showSuccessNotification, showErrorNotification, onSuccess, onError]);

  /**
   * Limpiar datos huérfanos
   */
  const cleanOrphanedData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const result = await cleanupService.cleanOrphanedData();

      setState(prev => ({
        ...prev,
        isLoading: false,
        lastCleanup: new Date(),
        stats: {
          itemsCleaned: prev.stats.itemsCleaned + result.itemsCleaned,
          spaceSaved: prev.stats.spaceSaved + result.spaceSaved
        }
      }));

      if (result.itemsCleaned > 0) {
        showSuccessNotification(
          `Se eliminaron ${result.itemsCleaned} elementos huérfanos`
        );
      }

      onSuccess?.(result);
      return result;
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      
      setState(prev => ({ ...prev, isLoading: false, error: errorObj }));
      showErrorNotification(errorObj.message);
      onError?.(errorObj);
      
      return null;
    }
  }, [showSuccessNotification, showErrorNotification, onSuccess, onError]);

  /**
   * Limpieza completa del sistema
   */
  const cleanAll = useCallback(async () => {
    try {
      const confirmed = await confirmAction(
        '⚠️ LIMPIEZA COMPLETA DEL SISTEMA\n\n' +
        'Esta acción eliminará:\n' +
        '• Todos los datos demo\n' +
        '• Datos expirados\n' +
        '• Datos huérfanos\n\n' +
        '¿Estás seguro de continuar?'
      );

      if (!confirmed) return null;

      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const results = await cleanupService.cleanAll();
      
      const totalCleaned = results.reduce((sum, r) => sum + r.itemsCleaned, 0);
      const totalSaved = results.reduce((sum, r) => sum + r.spaceSaved, 0);

      setState(prev => ({
        ...prev,
        isLoading: false,
        lastCleanup: new Date(),
        stats: {
          itemsCleaned: prev.stats.itemsCleaned + totalCleaned,
          spaceSaved: prev.stats.spaceSaved + totalSaved
        }
      }));

      showSuccessNotification(
        `Limpieza completa: ${totalCleaned} elementos eliminados`,
        `Se liberaron ${(totalSaved / 1024).toFixed(2)} KB de espacio`
      );

      onSuccess?.(results);
      return results;
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      
      setState(prev => ({ ...prev, isLoading: false, error: errorObj }));
      showErrorNotification(errorObj.message);
      onError?.(errorObj);
      
      return null;
    }
  }, [confirmAction, showSuccessNotification, showErrorNotification, onSuccess, onError]);

  /**
   * Obtener estadísticas de limpieza
   */
  const getCleanupStats = useCallback(() => {
    return cleanupService.getStats();
  }, []);

  /**
   * Obtener historial de limpiezas
   */
  const getCleanupHistory = useCallback(() => {
    return cleanupService.getHistory();
  }, []);

  /**
   * Resetear estado del hook
   */
  const resetState = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      lastCleanup: null,
      stats: {
        itemsCleaned: 0,
        spaceSaved: 0
      }
    });
  }, []);

  return {
    // Estado
    isLoading: state.isLoading,
    error: state.error,
    lastCleanup: state.lastCleanup,
    stats: state.stats,

    // Funciones de limpieza
    cleanDemoData,
    cleanOnLogout,
    cleanExpiredData,
    cleanOrphanedData,
    cleanAll,

    // Utilidades
    getCleanupStats,
    getCleanupHistory,
    resetState,

    // Acceso directo a servicios (para casos avanzados)
    cleanupService,
    storageManager
  };
}