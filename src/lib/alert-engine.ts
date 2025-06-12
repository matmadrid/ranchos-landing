// src/lib/alert-engine.ts
import { 
  AnyNotification, 
  AlertRule, 
  NotificationPriority, 
  HealthNotification,
  ProductionNotification,
  ReminderNotification,
  MaintenanceNotification
} from '@/lib/notification-types';

// Tipos para el contexto de evaluación
interface AlertContext {
  cattle: Array<{
    id: string;
    tag: string;
    name?: string;
    breed: string;
    sex: 'male' | 'female';
    birthDate: string;
    weight?: number;
    healthStatus: 'excellent' | 'good' | 'fair' | 'poor';
    ranchId: string;
  }>;
  milkProductions: Array<{
    id: string;
    cattleId: string;
    ranchId: string;
    date: string;
    liters: number;
  }>;
  ranches: Array<{
    id: string;
    name: string;
    location: string;
    isActive: boolean;
  }>;
  activeRanchId: string | null;
  getAverageMilkProduction: (cattleId: string, days: number) => number;
}

export class AlertEngine {
  private context: AlertContext;
  private alertRules: AlertRule[];
  private lastProcessed: Date;

  constructor(context: AlertContext, alertRules: AlertRule[]) {
    this.context = context;
    this.alertRules = alertRules.filter(rule => rule.enabled);
    this.lastProcessed = new Date();
  }

  // Procesar todas las alertas
  async processAlerts(): Promise<AnyNotification[]> {
    const alerts: AnyNotification[] = [];

    // Procesar cada tipo de alerta
    alerts.push(...this.checkHealthAlerts());
    alerts.push(...this.checkProductionAlerts());
    alerts.push(...this.checkMaintenanceAlerts());
    alerts.push(...this.checkReminderAlerts());

    this.lastProcessed = new Date();
    return alerts;
  }

  // Alertas de salud
  private checkHealthAlerts(): HealthNotification[] {
    const alerts: HealthNotification[] = [];
    
    // Filtrar animales del rancho activo
    const activeCattle = this.context.cattle.filter(c => 
      c.ranchId === this.context.activeRanchId
    );

    activeCattle.forEach(cattle => {
      // Alerta crítica: estado de salud "poor"
      if (cattle.healthStatus === 'poor') {
        alerts.push(this.createHealthAlert({
          cattle,
          priority: 'critical',
          title: `⚠️ Salud Crítica: ${cattle.tag}`,
          message: `${cattle.name || cattle.tag} requiere atención veterinaria inmediata`,
          riskScore: 90,
          recommendedActions: [
            'Contactar veterinario inmediatamente',
            'Aislar el animal si es necesario',
            'Revisar síntomas y temperatura',
            'Documentar cambios observados'
          ]
        }));
      }
      
      // Alerta de advertencia: estado "fair"
      else if (cattle.healthStatus === 'fair') {
        alerts.push(this.createHealthAlert({
          cattle,
          priority: 'warning',
          title: `⚠️ Monitoreo Requerido: ${cattle.tag}`,
          message: `${cattle.name || cattle.tag} presenta estado de salud regular`,
          riskScore: 60,
          recommendedActions: [
            'Monitorear de cerca',
            'Revisar alimentación y agua',
            'Considerar examen veterinario',
            'Mejorar condiciones de alojamiento'
          ]
        }));
      }

      // Verificar peso anormal (si tiene peso registrado)
      if (cattle.weight) {
        const avgWeightForBreed = this.getAverageWeightForBreed(cattle.breed, cattle.sex);
        const weightDeviation = ((cattle.weight - avgWeightForBreed) / avgWeightForBreed) * 100;
        
        if (Math.abs(weightDeviation) > 30) {
          alerts.push(this.createHealthAlert({
            cattle,
            priority: 'warning',
            title: `📊 Peso Anormal: ${cattle.tag}`,
            message: `Peso de ${cattle.weight}kg está ${weightDeviation > 0 ? 'por encima' : 'por debajo'} del promedio`,
            riskScore: 40,
            recommendedActions: [
              'Revisar dieta y alimentación',
              'Evaluar estado de salud general',
              'Considerar examen veterinario'
            ]
          }));
        }
      }
    });

    return alerts;
  }

  // Alertas de producción
  private checkProductionAlerts(): ProductionNotification[] {
    const alerts: ProductionNotification[] = [];
    
    // Solo vacas del rancho activo
    const femaleCattle = this.context.cattle.filter(c => 
      c.ranchId === this.context.activeRanchId && c.sex === 'female'
    );

    femaleCattle.forEach(cattle => {
      const currentProduction = this.context.getAverageMilkProduction(cattle.id, 3); // Últimos 3 días
      const historicalProduction = this.context.getAverageMilkProduction(cattle.id, 30); // Últimos 30 días
      
      if (historicalProduction > 0 && currentProduction > 0) {
        const changePercentage = ((currentProduction - historicalProduction) / historicalProduction) * 100;
        
        // Alerta crítica: caída >30%
        if (changePercentage < -30) {
          alerts.push(this.createProductionAlert({
            cattle,
            priority: 'critical',
            title: `📉 Caída Crítica de Producción: ${cattle.tag}`,
            message: `Producción de ${cattle.name || cattle.tag} ha disminuido ${Math.abs(changePercentage).toFixed(1)}%`,
            currentProduction,
            previousProduction: historicalProduction,
            changePercentage,
            avgProduction: historicalProduction,
            daysBelow: this.getDaysBelowThreshold(cattle.id, historicalProduction * 0.8),
            recommendedActions: [
              'Revisión veterinaria urgente',
              'Evaluar calidad del alimento',
              'Verificar disponibilidad de agua',
              'Revisar condiciones de estrés'
            ]
          }));
        }
        
        // Alerta de advertencia: caída >15%
        else if (changePercentage < -15) {
          alerts.push(this.createProductionAlert({
            cattle,
            priority: 'warning',
            title: `📊 Disminución de Producción: ${cattle.tag}`,
            message: `Producción de ${cattle.name || cattle.tag} ha disminuido ${Math.abs(changePercentage).toFixed(1)}%`,
            currentProduction,
            previousProduction: historicalProduction,
            changePercentage,
            avgProduction: historicalProduction,
            daysBelow: this.getDaysBelowThreshold(cattle.id, historicalProduction * 0.9),
            recommendedActions: [
              'Revisar dieta y nutrición',
              'Verificar rutina de ordeño',
              'Evaluar condiciones ambientales',
              'Monitorear más frecuentemente'
            ]
          }));
        }
        
        // Alerta positiva: aumento >20%
        else if (changePercentage > 20) {
          alerts.push(this.createProductionAlert({
            cattle,
            priority: 'success',
            title: `📈 Mejora en Producción: ${cattle.tag}`,
            message: `Producción de ${cattle.name || cattle.tag} ha aumentado ${changePercentage.toFixed(1)}%`,
            currentProduction,
            previousProduction: historicalProduction,
            changePercentage,
            avgProduction: historicalProduction,
            daysBelow: 0,
            recommendedActions: [
              'Documentar cambios positivos',
              'Mantener condiciones actuales',
              'Considerar extender prácticas a otros animales'
            ]
          }));
        }
      }
      
      // Alerta por falta de registros de producción
      else if (historicalProduction === 0 && cattle.sex === 'female') {
        const age = this.calculateAge(cattle.birthDate);
        if (age >= 2) { // Vacas maduras sin producción
          alerts.push(this.createProductionAlert({
            cattle,
            priority: 'warning',
            title: `📝 Sin Registros de Producción: ${cattle.tag}`,
            message: `${cattle.name || cattle.tag} no tiene registros recientes de producción`,
            currentProduction: 0,
            previousProduction: 0,
            changePercentage: 0,
            avgProduction: 0,
            daysBelow: 30,
            recommendedActions: [
              'Verificar si está en período de lactancia',
              'Revisar registros de ordeño',
              'Evaluar estado reproductivo',
              'Actualizar datos de producción'
            ]
          }));
        }
      }
    });

    return alerts;
  }

  // Alertas de mantenimiento
  private checkMaintenanceAlerts(): MaintenanceNotification[] {
    const alerts: MaintenanceNotification[] = [];
    
    // Ejemplo de alertas de mantenimiento (pueden expandirse)
    const maintenanceItems = [
      {
        type: 'Equipo de Ordeño',
        lastMaintenance: '2024-05-01',
        frequency: 30, // días
        urgency: 'medium' as const
      },
      {
        type: 'Comederos',
        lastMaintenance: '2024-04-15',
        frequency: 60,
        urgency: 'low' as const
      },
      {
        type: 'Bebederos',
        lastMaintenance: '2024-05-15',
        frequency: 14,
        urgency: 'high' as const
      }
    ];

    maintenanceItems.forEach(item => {
      const daysSinceLastMaintenance = this.daysBetween(
        new Date(item.lastMaintenance),
        new Date()
      );
      
      if (daysSinceLastMaintenance > item.frequency) {
        const overdueBy = daysSinceLastMaintenance - item.frequency;
        const priority: NotificationPriority = 
          overdueBy > 14 ? 'critical' :
          overdueBy > 7 ? 'warning' : 'info';

        alerts.push({
          id: `maint-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'maintenance',
          priority,
          status: 'unread',
          title: `🔧 Mantenimiento Requerido: ${item.type}`,
          message: `${item.type} requiere mantenimiento (${overdueBy} días de retraso)`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ranchId: this.context.activeRanchId || undefined,
          metadata: {
            equipmentType: item.type,
            lastMaintenance: item.lastMaintenance,
            overdueBy,
            urgencyLevel: item.urgency
          }
        });
      }
    });

    return alerts;
  }

  // Recordatorios
  private checkReminderAlerts(): ReminderNotification[] {
    const alerts: ReminderNotification[] = [];
    
    // Generar recordatorios basados en fechas importantes
    const activeCattle = this.context.cattle.filter(c => 
      c.ranchId === this.context.activeRanchId
    );

    activeCattle.forEach(cattle => {
      const age = this.calculateAge(cattle.birthDate);
      
      // Recordatorio de vacunación (cada 6 meses)
      if (this.shouldRemindVaccination(cattle.birthDate)) {
        alerts.push({
          id: `reminder-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'reminder',
          priority: 'info',
          status: 'unread',
          title: `💉 Recordatorio de Vacunación: ${cattle.tag}`,
          message: `${cattle.name || cattle.tag} necesita vacunación de rutina`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ranchId: cattle.ranchId,
          cattleId: cattle.id,
          metadata: {
            reminderType: 'vaccination',
            cattleTag: cattle.tag,
            cattleName: cattle.name,
            dueDate: this.getNextVaccinationDate(cattle.birthDate),
            frequency: 'yearly'
          }
        });
      }
      
      // Recordatorio de desparasitación (cada 3 meses)
      if (this.shouldRemindDeworming(cattle.birthDate)) {
        alerts.push({
          id: `reminder-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'reminder',
          priority: 'info',
          status: 'unread',
          title: `🐛 Recordatorio de Desparasitación: ${cattle.tag}`,
          message: `${cattle.name || cattle.tag} necesita desparasitación`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ranchId: cattle.ranchId,
          cattleId: cattle.id,
          metadata: {
            reminderType: 'deworming',
            cattleTag: cattle.tag,
            cattleName: cattle.name,
            dueDate: this.getNextDewormingDate(cattle.birthDate),
            frequency: 'monthly'
          }
        });
      }
    });

    return alerts;
  }

  // === MÉTODOS AUXILIARES ===

  private createHealthAlert(params: {
    cattle: any;
    priority: NotificationPriority;
    title: string;
    message: string;
    riskScore: number;
    recommendedActions: string[];
  }): HealthNotification {
    return {
      id: `health-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'health',
      priority: params.priority,
      status: 'unread',
      title: params.title,
      message: params.message,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ranchId: params.cattle.ranchId,
      cattleId: params.cattle.id,
      metadata: {
        cattleTag: params.cattle.tag,
        cattleName: params.cattle.name,
        healthStatus: params.cattle.healthStatus,
        riskScore: params.riskScore,
        recommendedActions: params.recommendedActions
      }
    };
  }

  private createProductionAlert(params: {
    cattle: any;
    priority: NotificationPriority;
    title: string;
    message: string;
    currentProduction: number;
    previousProduction: number;
    changePercentage: number;
    avgProduction: number;
    daysBelow: number;
    recommendedActions: string[];
  }): ProductionNotification {
    return {
      id: `production-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'production',
      priority: params.priority,
      status: 'unread',
      title: params.title,
      message: params.message,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ranchId: params.cattle.ranchId,
      cattleId: params.cattle.id,
      metadata: {
        cattleTag: params.cattle.tag,
        currentProduction: params.currentProduction,
        previousProduction: params.previousProduction,
        changePercentage: params.changePercentage,
        avgProduction: params.avgProduction,
        daysBelow: params.daysBelow,
        recommendedActions: params.recommendedActions
      }
    };
  }

  private getAverageWeightForBreed(breed: string, sex: string): number {
    // Pesos promedio por raza (kg) - valores aproximados
    const breedWeights: Record<string, { male: number; female: number }> = {
      'Holstein': { male: 800, female: 600 },
      'Jersey': { male: 600, female: 400 },
      'Brown Swiss': { male: 900, female: 650 },
      'Angus': { male: 850, female: 550 },
      'Hereford': { male: 800, female: 500 },
      'Brahman': { male: 900, female: 600 },
      'Zebu': { male: 700, female: 450 },
      'Criollo': { male: 650, female: 400 }
    };

    return breedWeights[breed]?.[sex as 'male' | 'female'] || (sex === 'male' ? 750 : 500);
  }

  private getDaysBelowThreshold(cattleId: string, threshold: number): number {
    const recentProductions = this.context.milkProductions
      .filter(p => p.cattleId === cattleId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 30); // Últimos 30 registros

    let consecutiveDays = 0;
    for (const production of recentProductions) {
      if (production.liters < threshold) {
        consecutiveDays++;
      } else {
        break;
      }
    }

    return consecutiveDays;
  }

  private calculateAge(birthDate: string): number {
    const birth = new Date(birthDate);
    const now = new Date();
    return Math.floor((now.getTime() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  }

  private daysBetween(date1: Date, date2: Date): number {
    return Math.floor((date2.getTime() - date1.getTime()) / (24 * 60 * 60 * 1000));
  }

  private shouldRemindVaccination(birthDate: string): boolean {
    // Lógica simple: recordar cada 6 meses
    const birth = new Date(birthDate);
    const now = new Date();
    const monthsSinceBirth = (now.getFullYear() - birth.getFullYear()) * 12 + 
                           (now.getMonth() - birth.getMonth());
    return monthsSinceBirth % 6 === 0 && now.getDate() === birth.getDate();
  }

  private shouldRemindDeworming(birthDate: string): boolean {
    // Lógica simple: recordar cada 3 meses
    const birth = new Date(birthDate);
    const now = new Date();
    const monthsSinceBirth = (now.getFullYear() - birth.getFullYear()) * 12 + 
                           (now.getMonth() - birth.getMonth());
    return monthsSinceBirth % 3 === 0 && now.getDate() === birth.getDate();
  }

  private getNextVaccinationDate(birthDate: string): string {
    const birth = new Date(birthDate);
    const next = new Date(birth);
    next.setFullYear(next.getFullYear() + 1);
    return next.toISOString().split('T')[0];
  }

  private getNextDewormingDate(birthDate: string): string {
    const birth = new Date(birthDate);
    const next = new Date(birth);
    next.setMonth(next.getMonth() + 3);
    return next.toISOString().split('T')[0];
  }
}