// src/hooks/useAlerts.ts
import { useCallback, useEffect } from 'react';
import { useNotificationStore } from '@/store/notifications';
import useRanchOSStore from '@/store'; // Store principal del ganado
import { NotificationPriority, HealthNotification, ProductionNotification } from '@/lib/notification-types';

export function useAlerts() {
  const notificationStore = useNotificationStore();
  const mainStore = useRanchOSStore();

  // Función para crear alerta de salud
  const createHealthAlert = useCallback((cattleId: string, newStatus: string, previousStatus?: string) => {
    const cattle = mainStore.cattle.find(c => c.id === cattleId);
    if (!cattle) return;

    const riskScore = newStatus === 'poor' ? 90 : newStatus === 'fair' ? 60 : newStatus === 'good' ? 30 : 10;
    const priority: NotificationPriority = newStatus === 'poor' ? 'critical' : newStatus === 'fair' ? 'warning' : 'info';

    const healthNotification: Omit<HealthNotification, 'id' | 'createdAt' | 'updatedAt'> = {
      type: 'health',
      priority,
      title: `Alerta de Salud: ${cattle.tag}`,
      message: `El estado de salud de ${cattle.name || cattle.tag} ha cambiado a "${newStatus}"`,
      status: 'unread',
      ranchId: cattle.ranchId,
      cattleId: cattle.id,
      metadata: {
        cattleTag: cattle.tag,
        cattleName: cattle.name,
        healthStatus: newStatus as any,
        previousStatus,
        riskScore,
        recommendedActions: getHealthRecommendations(newStatus)
      }
    };

    notificationStore.addNotification(healthNotification);
  }, [mainStore.cattle, notificationStore]);

  // Función para crear alerta de producción
  const createProductionAlert = useCallback((cattleId: string, currentProduction: number, avgProduction: number) => {
    const cattle = mainStore.cattle.find(c => c.id === cattleId);
    if (!cattle) return;

    const changePercentage = ((currentProduction - avgProduction) / avgProduction) * 100;
    const priority: NotificationPriority = changePercentage < -30 ? 'critical' : changePercentage < -15 ? 'warning' : 'info';

    const productionNotification: Omit<ProductionNotification, 'id' | 'createdAt' | 'updatedAt'> = {
      type: 'production',
      priority,
      title: `Alerta de Producción: ${cattle.tag}`,
      message: `La producción de ${cattle.name || cattle.tag} ha ${changePercentage > 0 ? 'aumentado' : 'disminuido'} ${Math.abs(changePercentage).toFixed(1)}%`,
      status: 'unread',
      ranchId: cattle.ranchId,
      cattleId: cattle.id,
      metadata: {
        cattleTag: cattle.tag,
        currentProduction,
        previousProduction: avgProduction,
        changePercentage,
        avgProduction,
        daysBelow: 0, // TODO: calcular días consecutivos por debajo
        recommendedActions: getProductionRecommendations(changePercentage)
      }
    };

    notificationStore.addNotification(productionNotification);
  }, [mainStore.cattle, notificationStore]);

  // Función para verificar alertas automáticamente
  const checkAutoAlerts = useCallback(() => {
    // Verificar alertas de salud
    mainStore.cattle.forEach(cattle => {
      if (cattle.healthStatus === 'poor') {
        // Verificar si ya existe una alerta reciente para este animal
        const existingAlert = notificationStore.notifications.find(n => 
          n.type === 'health' && 
          n.cattleId === cattle.id && 
          n.status !== 'resolved' &&
          Date.now() - new Date(n.createdAt).getTime() < 24 * 60 * 60 * 1000 // Última 24h
        );

        if (!existingAlert) {
          createHealthAlert(cattle.id, cattle.healthStatus);
        }
      }
    });

    // Verificar alertas de producción
    const activeRanchCattle = mainStore.cattle.filter(c => 
      c.ranchId === mainStore.activeRanch?.id && c.sex === 'female'
    );

    activeRanchCattle.forEach(cattle => {
      const avgProduction = mainStore.getAverageMilkProduction(cattle.id, 30);
      const recentProduction = mainStore.getAverageMilkProduction(cattle.id, 3);
      
      if (avgProduction > 0 && recentProduction > 0) {
        const changePercentage = ((recentProduction - avgProduction) / avgProduction) * 100;
        
        if (changePercentage < -20) {
          // Verificar si ya existe una alerta reciente
          const existingAlert = notificationStore.notifications.find(n => 
            n.type === 'production' && 
            n.cattleId === cattle.id && 
            n.status !== 'resolved' &&
            Date.now() - new Date(n.createdAt).getTime() < 24 * 60 * 60 * 1000
          );

          if (!existingAlert) {
            createProductionAlert(cattle.id, recentProduction, avgProduction);
          }
        }
      }
    });
  }, [mainStore, notificationStore, createHealthAlert, createProductionAlert]);

  // Ejecutar verificación automática cada 5 minutos
  useEffect(() => {
    checkAutoAlerts(); // Verificación inicial
    
    const interval = setInterval(checkAutoAlerts, 5 * 60 * 1000); // 5 minutos
    
    return () => clearInterval(interval);
  }, [checkAutoAlerts]);

  return {
    createHealthAlert,
    createProductionAlert,
    checkAutoAlerts,
    alertRules: notificationStore.alertRules,
    addAlertRule: notificationStore.addAlertRule,
    updateAlertRule: notificationStore.updateAlertRule,
    removeAlertRule: notificationStore.removeAlertRule,
    toggleAlertRule: notificationStore.toggleAlertRule
  };
}

// Funciones auxiliares
function getHealthRecommendations(status: string): string[] {
  switch (status) {
    case 'poor':
      return [
        'Contactar veterinario inmediatamente',
        'Aislar el animal si es necesario',
        'Revisar síntomas y temperatura',
        'Documentar cambios observados'
      ];
    case 'fair':
      return [
        'Monitorear de cerca',
        'Revisar alimentación y agua',
        'Considerar examen veterinario',
        'Mejorar condiciones de alojamiento'
      ];
    case 'good':
      return [
        'Mantener rutina actual',
        'Continuar monitoreo regular'
      ];
    default:
      return ['Continuar con manejo estándar'];
  }
}

function getProductionRecommendations(changePercentage: number): string[] {
  if (changePercentage < -30) {
    return [
      'Revisión veterinaria urgente',
      'Evaluar calidad del alimento',
      'Verificar disponibilidad de agua',
      'Revisar condiciones de estrés'
    ];
  } else if (changePercentage < -15) {
    return [
      'Revisar dieta y nutrición',
      'Verificar rutina de ordeño',
      'Evaluar condiciones ambientales',
      'Monitorear más frecuentemente'
    ];
  } else if (changePercentage > 15) {
    return [
      'Documentar cambios positivos',
      'Mantener condiciones actuales',
      'Considerar extender prácticas'
    ];
  }
  return ['Continuar con manejo actual'];
}