// src/store/slices/weighingSlice.ts
/**
 * @version 1.0.0
 * @author TorresLaveaga
 * @cosmovision SpaceRanch Sistemas Dinámicos Universales
 * 
 * BATALLA 7: WeightTracker Pro - Sistema de Monitoreo de Peso
 * Slice de Zustand para manejo de pesaje - Integración con LivestockCore
 */

import type { StateCreator } from 'zustand';
import type { ProcessingResult } from '@/types';

// Importar valores y tipos de weighing
import {
  type WeighingRecord,
  type WeightAlert,
  type GrowthAnalysis,
  type CategoryWeightStats,
  type WeighingFilters,
  type WeighingSortOptions,
  type MonthlyWeighingReport,
  type GrowthProjection,
  type WeighingSystemConfig,
  type AnimalWeighingConfig,
  WeighingStatus,
  WeightAlertType,
  AlertSeverity,
  WeighingFrequency,
  validateWeighingRecord,
  calculateGMD,
  calculateEfficiencyScore,
  needsWeighing,
  projectWeight,
  STANDARD_GMD_RANGES,
  DEFAULT_ALERT_CONFIG
} from '@/types/weighing';

// ===== INTERFACES DEL SLICE =====

/**
 * Estado del slice de pesaje
 */
interface WeighingState {
  // === DATOS PRINCIPALES ===
  weighingRecords: WeighingRecord[];
  weighingAlerts: WeightAlert[]; // Renombrado para evitar conflicto con InventorySlice
  growthAnalyses: Map<string, GrowthAnalysis>; // key: animalId
  categoryStats: Map<string, CategoryWeightStats>; // key: categoriaId
  animalConfigs: Map<string, AnimalWeighingConfig>; // key: animalId
  systemConfig: WeighingSystemConfig | null;
  
  // === ESTADO DE UI ===
  isLoading: boolean;
  isProcessing: boolean;
  error: string | null;
  
  // === CACHE Y PERFORMANCE ===
  lastCalculationTimestamp: number;
  projectionCache: Map<string, GrowthProjection>; // key: animalId
  
  // === FILTROS Y BÚSQUEDA ===
  currentFilters: WeighingFilters;
  currentSort: WeighingSortOptions;
  
  // === ESTADÍSTICAS GLOBALES ===
  globalStats: {
    totalRecords: number;
    animalesMonitoreados: number;
    animalesPendientesPesaje: number;
    alertasActivas: number;
    alertasCriticas: number;
    gmdPromedioGlobal: number;
    ultimaActualizacion: string | null;
  };
  
  // === REPORTES ===
  weighingMonthlyReports: Map<string, MonthlyWeighingReport>; // key: "YYYY-MM" - Renombrado
  lastReportGenerated: string | null;
}

/**
 * Acciones del slice de pesaje
 */
interface WeighingActions {
  // === GESTIÓN DE REGISTROS DE PESAJE ===
  addWeighingRecord: (
    record: Omit<WeighingRecord, 'id' | 'createdAt' | 'gananciaPromedioDiaria' | 'eficienciaCrecimiento' | 'isReconciled'>
  ) => Promise<ProcessingResult<WeighingRecord>>;
  
  updateWeighingRecord: (
    id: string,
    updates: Partial<WeighingRecord>
  ) => Promise<ProcessingResult<WeighingRecord>>;
  
  deleteWeighingRecord: (id: string) => Promise<ProcessingResult<void>>;
  
  bulkImportWeighingRecords: (
    records: Partial<WeighingRecord>[]
  ) => Promise<ProcessingResult<{ imported: number; errors: number; }>>;
  
  // === CONSULTAS DE PESAJE ===
  getWeighingRecordsByAnimal: (animalId: string) => WeighingRecord[];
  getWeighingRecordsByDateRange: (startDate: string, endDate: string) => WeighingRecord[];
  getWeighingRecordsByCategory: (categoria: string) => WeighingRecord[];
  getFilteredWeighingRecords: (filters: WeighingFilters, sort?: WeighingSortOptions) => WeighingRecord[];
  getLatestWeighingByAnimal: (animalId: string) => WeighingRecord | null;
  
  // === ANÁLISIS DE CRECIMIENTO ===
  generateGrowthAnalysis: (animalId: string) => Promise<ProcessingResult<GrowthAnalysis>>;
  getGrowthAnalysis: (animalId: string) => GrowthAnalysis | null;
  refreshAllGrowthAnalyses: () => Promise<ProcessingResult<void>>;
  
  // === PROYECCIONES ===
  generateProjection: (animalId: string, days: number[]) => Promise<ProcessingResult<GrowthProjection>>;
  getProjection: (animalId: string) => GrowthProjection | null;
  
  // === SISTEMA DE ALERTAS ===
  checkWeighingAlerts: () => Promise<ProcessingResult<WeightAlert[]>>;
  markAlertAsRead: (alertId: string) => void;
  markAlertAsResolved: (alertId: string, notes?: string) => void;
  clearAllAlerts: () => void;
  getAlertsByAnimal: (animalId: string) => WeightAlert[];
  getAlertsByType: (tipo: WeightAlertType) => WeightAlert[];
  
  // === ESTADÍSTICAS Y KPIs ===
  getCategoryStats: (categoriaId: string) => CategoryWeightStats | null;
  generateCategoryStats: (categoriaId: string) => Promise<ProcessingResult<CategoryWeightStats>>;
  getGlobalStats: () => WeighingState['globalStats'];
  recalculateAllStats: () => Promise<ProcessingResult<void>>;
  
  // === ANIMALES PENDIENTES ===
  getAnimalsPendingWeighing: () => Promise<ProcessingResult<{ animalId: string; animalTag: string; daysSinceLastWeighing: number; }[]>>;
  markAnimalAsWeighed: (animalId: string) => void;
  
  // === REPORTES ===
  generateMonthlyReport: (year: number, month: number) => Promise<ProcessingResult<MonthlyWeighingReport>>;
  getMonthlyReport: (year: number, month: number) => MonthlyWeighingReport | null;
  
  // === CONFIGURACIÓN ===
  updateSystemConfig: (config: Partial<WeighingSystemConfig>) => Promise<ProcessingResult<WeighingSystemConfig>>;
  updateAnimalConfig: (animalId: string, config: Partial<AnimalWeighingConfig>) => Promise<ProcessingResult<AnimalWeighingConfig>>;
  getAnimalConfig: (animalId: string) => AnimalWeighingConfig | null;
  
  // === INTEGRACIÓN CON LIVESTOCKCORE ===
  syncWithInventory: () => Promise<ProcessingResult<{ synced: number; conflicts: number; }>>;
  checkInventoryConsistency: () => Promise<ProcessingResult<{ consistent: boolean; issues: string[]; }>>;
  suggestCategoryChanges: () => Promise<ProcessingResult<{ animalId: string; currentCategory: string; suggestedCategory: string; reason: string; }[]>>;
  
  // === EXPORTACIÓN Y UTILIDADES ===
  exportWeighingData: (filters: WeighingFilters, format: 'csv' | 'excel') => Promise<ProcessingResult<Blob>>;
  resetFilters: () => void;
  setFilters: (filters: Partial<WeighingFilters>) => void;
  setSort: (sort: WeighingSortOptions) => void;
  
  // === INICIALIZACIÓN ===
  initializeWeighingSystem: (ranchId: string) => Promise<ProcessingResult<void>>;
}

/**
 * Slice completo de pesaje
 */
export interface WeighingSlice extends WeighingState, WeighingActions {}

// ===== HELPER PARA PROCESSING RESULT =====
function createWeighingProcessingResult<T>(
  success: boolean,
  data?: T,
  error?: string,
  traceId?: string
): ProcessingResult<T> {
  return {
    success,
    data,
    errors: error ? [{ message: error, code: 'WEIGHING_ERROR', field: '', severity: 'error' as const }] : [],
    warnings: [],
    metadata: {
      id: 'weight-tracker-pro',
      version: '1.0.0',
      name: 'WeightTracker Pro System',
      description: 'Sistema de monitoreo de peso integrado',
      supportedCountries: ['MX', 'CO', 'BR', 'ES'],
      lastUpdated: new Date().toISOString()
    },
    processingTime: Date.now(),
    traceId: traceId || `wtp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  };
}

// ===== IMPLEMENTACIÓN DEL SLICE =====

export const createWeighingSlice: StateCreator<
  WeighingSlice,
  [],
  [],
  WeighingSlice
> = (set, get) => ({
  // === ESTADO INICIAL ===
  weighingRecords: [],
  weighingAlerts: [], // Renombrado para evitar conflicto
  growthAnalyses: new Map(),
  categoryStats: new Map(),
  animalConfigs: new Map(),
  systemConfig: null,
  isLoading: false,
  isProcessing: false,
  error: null,
  lastCalculationTimestamp: 0,
  projectionCache: new Map(),
  currentFilters: {},
  currentSort: { campo: 'fecha', orden: 'desc' },
  globalStats: {
    totalRecords: 0,
    animalesMonitoreados: 0,
    animalesPendientesPesaje: 0,
    alertasActivas: 0,
    alertasCriticas: 0,
    gmdPromedioGlobal: 0,
    ultimaActualizacion: null
  },
  weighingMonthlyReports: new Map(),
  lastReportGenerated: null,

  // === IMPLEMENTACIÓN DE ACCIONES ===

  /**
   * Agregar un nuevo registro de pesaje
   */
  addWeighingRecord: async (recordData) => {
    const traceId = `addWeighing-${Date.now()}`;
    
    try {
      set({ isProcessing: true, error: null });
      
      // Validar registro
      const validation = validateWeighingRecord(recordData);
      if (!validation.isValid) {
        const errorMessage = validation.errors.map(e => e.message).join(', ');
        throw new Error(`Validación fallida: ${errorMessage}`);
      }
      
      // Buscar pesaje anterior del animal
      const state = get();
      const previousRecords = state.weighingRecords
        .filter(r => r.animalId === recordData.animalId)
        .sort((a, b) => b.fecha.localeCompare(a.fecha));
      
      const previousRecord = previousRecords[0];
      
      // Calcular métricas automáticamente
      let gananciaTotal = 0;
      let diasTranscurridos = 0;
      let gananciaPromedioDiaria = 0;
      
      if (previousRecord) {
        const fechaAnterior = new Date(previousRecord.fecha);
        const fechaActual = new Date(recordData.fecha);
        diasTranscurridos = Math.floor((fechaActual.getTime() - fechaAnterior.getTime()) / (1000 * 60 * 60 * 24));
        gananciaTotal = recordData.peso - previousRecord.peso;
        gananciaPromedioDiaria = diasTranscurridos > 0 ? gananciaTotal / diasTranscurridos : 0;
      }
      
      // Calcular eficiencia basada en categoría
      const categoriaConfig = STANDARD_GMD_RANGES[recordData.categoriaActual as keyof typeof STANDARD_GMD_RANGES];
      const gmdEsperada = categoriaConfig?.optima || 0.5;
      const eficienciaCrecimiento = calculateEfficiencyScore(gananciaPromedioDiaria, gmdEsperada);
      
      // Determinar si es valor atípico (simplificado)
      const avgGMDCategory = previousRecords.length > 0 
        ? previousRecords.reduce((sum, r) => sum + r.gananciaPromedioDiaria, 0) / previousRecords.length 
        : gmdEsperada;
      const esValorAtipico = Math.abs(gananciaPromedioDiaria - avgGMDCategory) > (avgGMDCategory * 0.5);
      
      // Crear registro completo
      const record: WeighingRecord = {
        ...recordData,
        id: `wr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        pesoAnterior: previousRecord?.peso,
        diasTranscurridos,
        gananciaTotal,
        gananciaPromedioDiaria,
        eficienciaCrecimiento,
        esValorAtipico,
        confiabilidadDatos: esValorAtipico ? 75 : 95,
        tendenciaCrecimiento: gananciaPromedioDiaria > 0.1 ? 'ascending' : 
                             gananciaPromedioDiaria < -0.1 ? 'descending' : 'stable',
        proyeccionPeso30Dias: projectWeight(recordData.peso, gananciaPromedioDiaria, 30),
        proyeccionPeso60Dias: projectWeight(recordData.peso, gananciaPromedioDiaria, 60),
        requiereCambioCategoria: false, // Se calculará en análisis posterior
        isReconciled: false,
        status: WeighingStatus.CONFIRMED,
        createdAt: new Date().toISOString()
      };
      
      // Actualizar estado
      set(state => ({
        weighingRecords: [...state.weighingRecords, record],
        isProcessing: false,
        lastCalculationTimestamp: 0 // Forzar recálculo de stats
      }));
      
      // Recalcular estadísticas y verificar alertas
      await get().recalculateAllStats();
      await get().checkWeighingAlerts();
      
      return createWeighingProcessingResult(true, record, undefined, traceId);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      set({ isProcessing: false, error: errorMessage });
      return createWeighingProcessingResult<WeighingRecord>(false, undefined, errorMessage, traceId);
    }
  },

  /**
   * Actualizar un registro de pesaje existente
   */
  updateWeighingRecord: async (id, updates) => {
    const traceId = `updateWeighing-${id}-${Date.now()}`;
    
    try {
      set({ isProcessing: true, error: null });
      
      const state = get();
      const record = state.weighingRecords.find(r => r.id === id);
      
      if (!record) {
        throw new Error(`Registro de pesaje no encontrado: ${id}`);
      }
      
      // Crear registro actualizado
      const updatedRecord = {
        ...record,
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      // Validar registro actualizado
      const validation = validateWeighingRecord(updatedRecord);
      if (!validation.isValid) {
        const errorMessage = validation.errors.map(e => e.message).join(', ');
        throw new Error(`Validación fallida: ${errorMessage}`);
      }
      
      // Actualizar en el estado
      set(state => ({
        weighingRecords: state.weighingRecords.map(r => r.id === id ? updatedRecord : r),
        isProcessing: false,
        lastCalculationTimestamp: 0
      }));
      
      // Recalcular estadísticas si el peso cambió
      if (updates.peso !== undefined) {
        await get().recalculateAllStats();
      }
      
      return createWeighingProcessingResult(true, updatedRecord, undefined, traceId);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      set({ isProcessing: false, error: errorMessage });
      return createWeighingProcessingResult<WeighingRecord>(false, undefined, errorMessage, traceId);
    }
  },

  /**
   * Eliminar un registro de pesaje
   */
  deleteWeighingRecord: async (id) => {
    const traceId = `deleteWeighing-${id}-${Date.now()}`;
    
    try {
      set({ isProcessing: true, error: null });
      
      const state = get();
      const record = state.weighingRecords.find(r => r.id === id);
      
      if (!record) {
        throw new Error(`Registro de pesaje no encontrado: ${id}`);
      }
      
      // Verificar dependencias
      const hasAlerts = state.weighingAlerts.some(a => a.animalId === record.animalId);
      if (hasAlerts) {
        // Solo advertir, no bloquear
        console.warn(`Eliminando registro con alertas activas para animal ${record.animalTag}`);
      }
      
      // Eliminar del estado
      set(state => ({
        weighingRecords: state.weighingRecords.filter(r => r.id !== id),
        isProcessing: false,
        lastCalculationTimestamp: 0
      }));
      
      // Recalcular estadísticas
      await get().recalculateAllStats();
      
      return createWeighingProcessingResult<void>(true, undefined, undefined, traceId);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      set({ isProcessing: false, error: errorMessage });
      return createWeighingProcessingResult<void>(false, undefined, errorMessage, traceId);
    }
  },

  /**
   * Obtener registros de pesaje por animal
   */
  getWeighingRecordsByAnimal: (animalId) => {
    const state = get();
    return state.weighingRecords
      .filter(record => record.animalId === animalId)
      .sort((a, b) => b.fecha.localeCompare(a.fecha));
  },

  /**
   * Obtener registros por rango de fechas
   */
  getWeighingRecordsByDateRange: (startDate, endDate) => {
    const state = get();
    return state.weighingRecords
      .filter(record => record.fecha >= startDate && record.fecha <= endDate)
      .sort((a, b) => b.fecha.localeCompare(a.fecha));
  },

  /**
   * Obtener registros por categoría
   */
  getWeighingRecordsByCategory: (categoria) => {
    const state = get();
    return state.weighingRecords
      .filter(record => record.categoriaActual === categoria)
      .sort((a, b) => b.fecha.localeCompare(a.fecha));
  },

  /**
   * Obtener registros filtrados
   */
  getFilteredWeighingRecords: (filters, sort) => {
    const state = get();
    let records = state.weighingRecords;
    
    // Aplicar filtros
    if (filters.animalIds?.length) {
      records = records.filter(r => filters.animalIds!.includes(r.animalId));
    }
    
    if (filters.categorias?.length) {
      records = records.filter(r => filters.categorias!.includes(r.categoriaActual));
    }
    
    if (filters.fechaInicio) {
      records = records.filter(r => r.fecha >= filters.fechaInicio!);
    }
    
    if (filters.fechaFin) {
      records = records.filter(r => r.fecha <= filters.fechaFin!);
    }
    
    if (filters.status?.length) {
      records = records.filter(r => filters.status!.includes(r.status));
    }
    
    if (filters.gmdMinima !== undefined) {
      records = records.filter(r => r.gananciaPromedioDiaria >= filters.gmdMinima!);
    }
    
    if (filters.gmdMaxima !== undefined) {
      records = records.filter(r => r.gananciaPromedioDiaria <= filters.gmdMaxima!);
    }
    
    if (filters.pesoMinimo !== undefined) {
      records = records.filter(r => r.peso >= filters.pesoMinimo!);
    }
    
    if (filters.pesoMaximo !== undefined) {
      records = records.filter(r => r.peso <= filters.pesoMaximo!);
    }
    
    if (filters.conAlertas) {
      const animalsWithAlerts = new Set(state.weighingAlerts.map((a: WeightAlert) => a.animalId));
      records = records.filter(r => animalsWithAlerts.has(r.animalId));
    }
    
    if (filters.soloSinConciliar) {
      records = records.filter(r => !r.isReconciled);
    }
    
    // Aplicar ordenamiento
    const sortConfig = sort || state.currentSort;
    records.sort((a, b) => {
      let aValue: any = a[sortConfig.campo as keyof WeighingRecord];
      let bValue: any = b[sortConfig.campo as keyof WeighingRecord];
      
      if (sortConfig.campo === 'animalTag') {
        aValue = a.animalTag;
        bValue = b.animalTag;
      } else if (sortConfig.campo === 'categoria') {
        aValue = a.categoriaActual;
        bValue = b.categoriaActual;
      } else if (sortConfig.campo === 'gmd') {
        aValue = a.gananciaPromedioDiaria;
        bValue = b.gananciaPromedioDiaria;
      }
      
      if (typeof aValue === 'string') {
        return sortConfig.orden === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      return sortConfig.orden === 'asc' 
        ? aValue - bValue
        : bValue - aValue;
    });
    
    return records;
  },

  /**
   * Obtener último pesaje de un animal
   */
  getLatestWeighingByAnimal: (animalId) => {
    const records = get().getWeighingRecordsByAnimal(animalId);
    return records.length > 0 ? records[0] : null;
  },

  /**
   * Verificar alertas del sistema de pesaje
   */
  checkWeighingAlerts: async () => {
    try {
      const state = get();
      const newAlerts: WeightAlert[] = [];
      
      // Agrupar registros por animal
      const recordsByAnimal = new Map<string, WeighingRecord[]>();
      state.weighingRecords.forEach(record => {
        if (!recordsByAnimal.has(record.animalId)) {
          recordsByAnimal.set(record.animalId, []);
        }
        recordsByAnimal.get(record.animalId)!.push(record);
      });
      
      // Verificar alertas por animal
      recordsByAnimal.forEach((records, animalId) => {
        const sortedRecords = records.sort((a, b) => b.fecha.localeCompare(a.fecha));
        const latestRecord = sortedRecords[0];
        
        if (!latestRecord) return;
        
        // 1. Alerta GMD baja
        const categoriaConfig = STANDARD_GMD_RANGES[latestRecord.categoriaActual as keyof typeof STANDARD_GMD_RANGES];
        if (categoriaConfig && latestRecord.gananciaPromedioDiaria < categoriaConfig.minima) {
          newAlerts.push({
            id: `alert_poor_gmd_${animalId}_${Date.now()}`,
            animalId,
            animalTag: latestRecord.animalTag,
            tipo: WeightAlertType.POOR_GMD,
            severidad: AlertSeverity.WARNING,
            mensaje: `GMD baja: ${latestRecord.gananciaPromedioDiaria.toFixed(3)} kg/día`,
            descripcionDetallada: `El animal ${latestRecord.animalTag} tiene una GMD de ${latestRecord.gananciaPromedioDiaria.toFixed(3)} kg/día, por debajo del mínimo esperado de ${categoriaConfig.minima} kg/día.`,
            valorActual: latestRecord.gananciaPromedioDiaria,
            valorEsperado: categoriaConfig.minima,
            diferencia: latestRecord.gananciaPromedioDiaria - categoriaConfig.minima,
            accionesRecomendadas: [
              'Revisar alimentación del animal',
              'Verificar estado de salud',
              'Considerar suplementación nutricional'
            ],
            prioridadAtencion: 7,
            isRead: false,
            isResolved: false,
            ranchId: latestRecord.ranchId,
            createdAt: new Date().toISOString()
          });
        }
        
        // 2. Alerta GMD excelente
        if (categoriaConfig && latestRecord.gananciaPromedioDiaria > categoriaConfig.excelente) {
          newAlerts.push({
            id: `alert_excellent_gmd_${animalId}_${Date.now()}`,
            animalId,
            animalTag: latestRecord.animalTag,
            tipo: WeightAlertType.EXCELLENT_GMD,
            severidad: AlertSeverity.INFO,
            mensaje: `¡Excelente GMD!: ${latestRecord.gananciaPromedioDiaria.toFixed(3)} kg/día`,
            valorActual: latestRecord.gananciaPromedioDiaria,
            valorEsperado: categoriaConfig.excelente,
            accionesRecomendadas: [
              'Mantener el manejo actual',
              'Documentar las prácticas aplicadas',
              'Considerar como modelo para otros animales'
            ],
            prioridadAtencion: 2,
            isRead: false,
            isResolved: false,
            ranchId: latestRecord.ranchId,
            createdAt: new Date().toISOString()
          });
        }
        
        // 3. Alerta pérdida de peso
        if (sortedRecords.length > 1 && latestRecord.gananciaPromedioDiaria < -0.1) {
          newAlerts.push({
            id: `alert_weight_loss_${animalId}_${Date.now()}`,
            animalId,
            animalTag: latestRecord.animalTag,
            tipo: WeightAlertType.WEIGHT_LOSS,
            severidad: AlertSeverity.ERROR,
            mensaje: `Pérdida de peso detectada: -${Math.abs(latestRecord.gananciaPromedioDiaria).toFixed(3)} kg/día`,
            valorActual: latestRecord.gananciaPromedioDiaria,
            accionesRecomendadas: [
              '🚨 ATENCIÓN INMEDIATA requerida',
              'Examen veterinario urgente',
              'Revisar alimentación y agua',
              'Aislar animal si es necesario'
            ],
            prioridadAtencion: 10,
            fechaLimiteAtencion: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 horas
            isRead: false,
            isResolved: false,
            ranchId: latestRecord.ranchId,
            createdAt: new Date().toISOString()
          });
        }
        
        // 4. Alerta posible cambio de categoría
        // (Lógica simplificada - debe expandirse según reglas de negocio)
        if (latestRecord.peso > 450 && latestRecord.categoriaActual === 'novillas_12_24') {
          newAlerts.push({
            id: `alert_category_change_${animalId}_${Date.now()}`,
            animalId,
            animalTag: latestRecord.animalTag,
            tipo: WeightAlertType.CATEGORY_CHANGE_SUGGESTED,
            severidad: AlertSeverity.INFO,
            mensaje: `Posible cambio a categoría "novillas_gordas"`,
            descripcionDetallada: `El animal ${latestRecord.animalTag} con ${latestRecord.peso} kg podría cambiar de categoría.`,
            valorActual: latestRecord.peso,
            accionesRecomendadas: [
              'Evaluar cambio de categoría',
              'Actualizar en sistema de inventario',
              'Revisar plan nutricional'
            ],
            prioridadAtencion: 5,
            isRead: false,
            isResolved: false,
            ranchId: latestRecord.ranchId,
            createdAt: new Date().toISOString()
          });
        }
      });
      
      // Actualizar alertas en el estado
      set(state => ({
        weighingAlerts: [...state.weighingAlerts, ...newAlerts],
        globalStats: {
          ...state.globalStats,
          alertasActivas: state.weighingAlerts.length + newAlerts.length,
          alertasCriticas: [...state.weighingAlerts, ...newAlerts].filter(a => a.severidad === AlertSeverity.CRITICAL || a.severidad === AlertSeverity.ERROR).length
        }
      }));
      
      return createWeighingProcessingResult(true, newAlerts);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      return createWeighingProcessingResult<WeightAlert[]>(false, undefined, errorMessage);
    }
  },

  /**
   * Marcar alerta como leída
   */
  markAlertAsRead: (alertId) => {
    set(state => ({
      weighingAlerts: state.weighingAlerts.map(alert => 
        alert.id === alertId ? { ...alert, isRead: true } : alert
      )
    }));
  },

  /**
   * Marcar alerta como resuelta
   */
  markAlertAsResolved: (alertId, notes) => {
    set(state => ({
      weighingAlerts: state.weighingAlerts.map(alert => 
        alert.id === alertId ? { 
          ...alert, 
          isRead: true,
          isResolved: true,
          fechaResolucion: new Date().toISOString(),
          notes 
        } : alert
      )
    }));
  },

  /**
   * Limpiar todas las alertas
   */
  clearAllAlerts: () => {
    set(state => ({
      weighingAlerts: [],
      globalStats: {
        ...state.globalStats,
        alertasActivas: 0,
        alertasCriticas: 0
      }
    }));
  },

  /**
   * Obtener alertas por animal
   */
  getAlertsByAnimal: (animalId) => {
    const state = get();
    return state.weighingAlerts.filter(alert => alert.animalId === animalId);
  },

  /**
   * Obtener alertas por tipo
   */
  getAlertsByType: (tipo) => {
    const state = get();
    return state.weighingAlerts.filter(alert => alert.tipo === tipo);
  },

  /**
   * Recalcular todas las estadísticas
   */
  recalculateAllStats: async () => {
    try {
      const state = get();
      
      // Calcular estadísticas globales
      const totalRecords = state.weighingRecords.length;
      const animalesMonitoreados = new Set(state.weighingRecords.map(r => r.animalId)).size;
      const gmdPromedio = totalRecords > 0 
        ? state.weighingRecords.reduce((sum, r) => sum + r.gananciaPromedioDiaria, 0) / totalRecords 
        : 0;
      
      // Obtener alertas activas
      const alertasActivas = state.weighingAlerts.filter(a => !a.isResolved).length;
      const alertasCriticas = state.weighingAlerts.filter(a => 
        !a.isResolved && (a.severidad === AlertSeverity.CRITICAL || a.severidad === AlertSeverity.ERROR)
      ).length;
      
      // Actualizar estadísticas globales
      set(state => ({
        globalStats: {
          totalRecords,
          animalesMonitoreados,
          animalesPendientesPesaje: 0, // Se calculará con integración a LivestockCore
          alertasActivas,
          alertasCriticas,
          gmdPromedioGlobal: gmdPromedio,
          ultimaActualizacion: new Date().toISOString()
        },
        lastCalculationTimestamp: Date.now()
      }));
      
      return createWeighingProcessingResult<void>(true);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      return createWeighingProcessingResult<void>(false, undefined, errorMessage);
    }
  },

  /**
   * Obtener estadísticas globales
   */
  getGlobalStats: () => {
    return get().globalStats;
  },

  /**
   * Configurar filtros
   */
  setFilters: (filters) => {
    set(state => ({
      currentFilters: { ...state.currentFilters, ...filters }
    }));
  },

  /**
   * Configurar ordenamiento
   */
  setSort: (sort) => {
    set({ currentSort: sort });
  },

  /**
   * Resetear filtros
   */
  resetFilters: () => {
    set({ 
      currentFilters: {},
      currentSort: { campo: 'fecha', orden: 'desc' }
    });
  },

  /**
   * Inicializar sistema de pesaje
   */
  initializeWeighingSystem: async (ranchId) => {
    try {
      set({ isLoading: true, error: null });
      
      // Crear configuración por defecto
      const defaultConfig: WeighingSystemConfig = {
        ranchId,
        frecuenciaPorDefecto: WeighingFrequency.MONTHLY,
        gmdMinimaEsperada: 0.5,
        gmdExcelenteEsperada: 1.2,
        pesajeObligatorioCategoria: true,
        alertasHabilitadas: true,
        diasSinPesajeAlerta: DEFAULT_ALERT_CONFIG.diasSinPesajeAlerta,
        porcentajeGMDBajaAlerta: DEFAULT_ALERT_CONFIG.porcentajeGMDBajaAlerta,
        porcentajePerdidaPesoAlerta: DEFAULT_ALERT_CONFIG.porcentajePerdidaPesoAlerta,
        requiereValidacionSupervisor: false,
        rangoPesoAceptable: { minimo: 50, maximo: 2000 },
        variacionMaximaEntrePesajes: DEFAULT_ALERT_CONFIG.variacionMaximaEntrePesajes,
        cambioAutomaticoCategoria: false,
        rangosCategoriaPorPeso: [
          { categoriaId: 'terneros_0_12', pesoMinimo: 50, pesoMaximo: 200 },
          { categoriaId: 'novillos_12_24', pesoMinimo: 200, pesoMaximo: 400 },
          { categoriaId: 'novillas_12_24', pesoMinimo: 180, pesoMaximo: 350 },
          { categoriaId: 'novillas_gordas', pesoMinimo: 350, pesoMaximo: 600 },
          { categoriaId: 'vacas', pesoMinimo: 400 },
          { categoriaId: 'toros', pesoMinimo: 500 }
        ],
        notificacionesEmail: true,
        notificacionesPush: true,
        emailsSupervisores: [],
        frecuenciaReportes: 'monthly',
        sincronizarConInventario: true,
        generarMovimientosAutomaticos: false,
        createdAt: new Date().toISOString()
      };
      
      set({
        systemConfig: defaultConfig,
        isLoading: false
      });
      
      return createWeighingProcessingResult<void>(true);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      set({ isLoading: false, error: errorMessage });
      return createWeighingProcessingResult<void>(false, undefined, errorMessage);
    }
  },

  // ===== IMPLEMENTACIONES CORREGIDAS PARA FUNCIONES PLACEHOLDER =====

  bulkImportWeighingRecords: async (records) => {
    return createWeighingProcessingResult(false, { imported: 0, errors: 0 }, 'Función no implementada');
  },

  generateGrowthAnalysis: async (animalId) => {
    return createWeighingProcessingResult(false, {} as GrowthAnalysis, 'Función no implementada');
  },

  getGrowthAnalysis: (animalId) => {
    return get().growthAnalyses.get(animalId) || null;
  },

  refreshAllGrowthAnalyses: async () => {
    return createWeighingProcessingResult(false, undefined, 'Función no implementada');
  },

  generateProjection: async (animalId, days) => {
    return createWeighingProcessingResult(false, {} as GrowthProjection, 'Función no implementada');
  },

  getProjection: (animalId) => {
    return get().projectionCache.get(animalId) || null;
  },

  getCategoryStats: (categoriaId) => {
    return get().categoryStats.get(categoriaId) || null;
  },

  generateCategoryStats: async (categoriaId) => {
    return createWeighingProcessingResult(false, {} as CategoryWeightStats, 'Función no implementada');
  },

  getAnimalsPendingWeighing: async () => {
    return createWeighingProcessingResult(false, [], 'Función no implementada');
  },

  markAnimalAsWeighed: (animalId) => {
    // TODO: Implementar marcado como pesado
  },

  generateMonthlyReport: async (year, month) => {
    return createWeighingProcessingResult(false, {} as MonthlyWeighingReport, 'Función no implementada');
  },

  getMonthlyReport: (year, month) => {
    const key = `${year}-${month.toString().padStart(2, '0')}`;
    return get().weighingMonthlyReports.get(key) || null;
  },

  updateSystemConfig: async (config) => {
    return createWeighingProcessingResult(false, {} as WeighingSystemConfig, 'Función no implementada');
  },

  updateAnimalConfig: async (animalId, config) => {
    return createWeighingProcessingResult(false, {} as AnimalWeighingConfig, 'Función no implementada');
  },

  getAnimalConfig: (animalId) => {
    return get().animalConfigs.get(animalId) || null;
  },

  syncWithInventory: async () => {
    return createWeighingProcessingResult(false, { synced: 0, conflicts: 0 }, 'Función no implementada');
  },

  checkInventoryConsistency: async () => {
    return createWeighingProcessingResult(false, { consistent: false, issues: [] }, 'Función no implementada');
  },

  suggestCategoryChanges: async () => {
    return createWeighingProcessingResult(false, [], 'Función no implementada');
  },

  exportWeighingData: async (filters, format) => {
    return createWeighingProcessingResult(false, new Blob(), 'Función no implementada');
  }
});