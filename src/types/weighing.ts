// src/types/weighing.ts
/**
 * @version 1.0.0
 * @author TorresLaveaga
 * @cosmovision SpaceRanch Sistemas Dinámicos Universales
 * 
 * BATALLA 7: WeightTracker Pro - Sistema de Monitoreo de Peso
 * Tipos y interfaces para el sistema de pesaje integrado con LivestockCore
 */

import type { CountryCode, ValidationResult, ProcessingResult } from './index';
import type { Animal } from './models';

// ===== ENUMS Y CONSTANTES =====

/**
 * Frecuencia de pesaje configurada
 */
export enum WeighingFrequency {
  WEEKLY = 'WEEKLY',
  BIWEEKLY = 'BIWEEKLY', 
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  CUSTOM = 'CUSTOM'
}

/**
 * Estado de un registro de pesaje
 */
export enum WeighingStatus {
  DRAFT = 'DRAFT',           // Borrador
  CONFIRMED = 'CONFIRMED',   // Confirmado
  VALIDATED = 'VALIDATED',   // Validado por supervisor
  CANCELLED = 'CANCELLED'    // Cancelado
}

/**
 * Tipo de alerta del sistema de pesaje
 */
export enum WeightAlertType {
  LOW_WEIGHT = 'LOW_WEIGHT',                    // Peso bajo para la categoría
  HIGH_WEIGHT = 'HIGH_WEIGHT',                  // Peso alto, posible cambio categoría
  POOR_GMD = 'POOR_GMD',                        // Ganancia Media Diaria baja
  EXCELLENT_GMD = 'EXCELLENT_GMD',              // GMD excelente
  WEIGHT_LOSS = 'WEIGHT_LOSS',                  // Pérdida de peso
  STAGNANT_GROWTH = 'STAGNANT_GROWTH',         // Crecimiento estancado
  CATEGORY_CHANGE_SUGGESTED = 'CATEGORY_CHANGE_SUGGESTED', // Sugerencia cambio categoría
  MISSING_WEIGHING = 'MISSING_WEIGHING'         // Pesaje faltante
}

/**
 * Severidad de alertas
 */
export enum AlertSeverity {
  INFO = 'info',
  WARNING = 'warning', 
  ERROR = 'error',
  CRITICAL = 'critical'
}

// ===== INTERFACES PRINCIPALES =====

/**
 * Registro de pesaje individual - Entidad principal del sistema
 */
export interface WeighingRecord {
  id: string;
  
  // === IDENTIFICACIÓN ===
  animalId: string;              // Conexión con LivestockCore
  animalTag: string;             // Tag del animal (desnormalizado para performance)
  animalName?: string;           // Nombre del animal si existe
  
  // === DATOS DEL PESAJE ===
  fecha: string;                 // ISO date string
  peso: number;                  // Peso actual en kg
  pesoAnterior?: number;         // Peso del pesaje anterior
  diasTranscurridos?: number;    // Días desde último pesaje
  
  // === MÉTRICAS CALCULADAS ===
  gananciaTotal?: number;        // Ganancia total desde último pesaje (kg)
  gananciaPromedioDiaria: number;// GMD - Ganancia Media Diaria (kg/día)
  eficienciaCrecimiento: number; // Porcentaje de eficiencia vs. esperado
  
  // === CATEGORIZACIÓN ===
  categoriaActual: string;       // Categoría actual del animal
  categoriaSugerida?: string;    // Categoría sugerida basada en peso
  requiereCambioCategoria: boolean; // Si el peso sugiere cambio
  
  // === CONTEXTO DEL PESAJE ===
  condicionCorporal?: number;    // Escala 1-5 de condición corporal
  observaciones?: string;        // Notas del operador
  ubicacion?: string;            // Ubicación donde se pesó
  operadorId: string;            // Usuario que realizó el pesaje
  equipoUtilizado?: string;      // Identificación del equipo/báscula
  
  // === VALIDACIÓN Y CALIDAD ===
  esValorAtipico: boolean;       // Si el peso es estadísticamente atípico
  confiabilidadDatos: number;    // Porcentaje de confiabilidad (1-100)
  validadoPor?: string;          // ID del supervisor que validó
  fechaValidacion?: string;      // Cuándo fue validado
  
  // === METADATOS ===
  ranchId: string;
  status: WeighingStatus;
  createdAt: string;
  updatedAt?: string;
  
  // === ANÁLISIS PREDICTIVO ===
  proyeccionPeso30Dias?: number; // Peso proyectado a 30 días
  proyeccionPeso60Dias?: number; // Peso proyectado a 60 días
  tendenciaCrecimiento: 'ascending' | 'descending' | 'stable'; // Tendencia
  
  // === INTEGRACIÓN CON LIVESTOCKCORE ===
  inventoryMovementId?: string;  // Si generó movimiento en inventario
  isReconciled: boolean;         // Si está conciliado con inventario
}

/**
 * Configuración de pesaje por animal
 */
export interface AnimalWeighingConfig {
  animalId: string;
  frecuenciaPesaje: WeighingFrequency;
  diasCustom?: number;          // Si frecuencia es CUSTOM
  pesoObjetivo?: number;        // Peso objetivo a alcanzar
  fechaObjetivo?: string;       // Fecha objetivo para peso
  gmdObjetivo?: number;         // GMD objetivo (kg/día)
  alertasHabilitadas: boolean;
  categoriaMeta?: string;       // Categoría a la que se quiere llegar
  notificacionesEmail: boolean;
  notificacionesPush: boolean;
  createdAt: string;
  updatedAt?: string;
}

/**
 * Análisis de crecimiento de un animal
 */
export interface GrowthAnalysis {
  animalId: string;
  
  // === DATOS ACTUALES ===
  pesoActual: number;
  pesoInicial: number;          // Primer pesaje registrado
  fechaInicialPesaje: string;
  diasMonitoreados: number;
  
  // === MÉTRICAS DE CRECIMIENTO ===
  gananciaTotal: number;        // Ganancia desde primer pesaje
  gmdPromedio: number;          // GMD promedio de todo el período
  gmdUltimos30Dias: number;     // GMD de últimos 30 días
  gmdUltimos7Dias: number;      // GMD de última semana
  
  // === ANÁLISIS ESTADÍSTICO ===
  mejorGMD: number;             // Mejor GMD registrada
  peorGMD: number;              // Peor GMD registrada
  variabilidadGMD: number;      // Variabilidad en las GMD
  consistenciaRendimiento: number; // Score de consistencia (1-100)
  
  // === PROYECCIONES ===
  proyeccionPeso30: number;
  proyeccionPeso60: number;
  proyeccionPeso90: number;
  fechaProyectadaCambioCategoria?: string;
  pesoProyectadoCambioCategoria?: number;
  
  // === COMPARATIVAS ===
  rankingEnCategoria?: number;   // Posición vs otros de su categoría
  promedioCategoria?: number;    // GMD promedio de su categoría
  mejoresPracticas: string[];    // Recomendaciones
  
  // === ALERTAS ===
  alertas: WeightAlert[];
  
  // === METADATOS ===
  fechaAnalisis: string;
  validoHasta: string;          // Cache válido hasta...
}

/**
 * Alerta del sistema de pesaje
 */
export interface WeightAlert {
  id: string;
  animalId: string;
  animalTag: string;
  
  // === DATOS DE LA ALERTA ===
  tipo: WeightAlertType;
  severidad: AlertSeverity;
  mensaje: string;
  descripcionDetallada?: string;
  
  // === VALORES RELACIONADOS ===
  valorActual: number;          // Peso o GMD actual
  valorEsperado?: number;       // Valor esperado
  diferencia?: number;          // Diferencia entre actual y esperado
  porcentajeDiferencia?: number;
  
  // === RECOMENDACIONES ===
  accionesRecomendadas: string[];
  prioridadAtencion: number;    // 1-10 (10 = máxima prioridad)
  fechaLimiteAtencion?: string; // Cuándo debe atenderse
  
  // === ESTADO ===
  isRead: boolean;
  isResolved: boolean;
  resolvedBy?: string;
  fechaResolucion?: string;
  notas?: string;               // Notas de resolución
  
  // === METADATOS ===
  ranchId: string;
  createdAt: string;
  updatedAt?: string;
}

/**
 * Estadísticas agregadas por categoría
 */
export interface CategoryWeightStats {
  categoriaId: string;
  categoriaNombre: string;
  
  // === CONTADORES ===
  totalAnimales: number;
  animalesPesados: number;      // En el período analizado
  animalesPendientes: number;   // Sin pesar en tiempo esperado
  
  // === ESTADÍSTICAS DE PESO ===
  pesoPromedio: number;
  pesoMinimo: number;
  pesoMaximo: number;
  desviacionEstandar: number;
  
  // === ESTADÍSTICAS GMD ===
  gmdPromedio: number;
  gmdMinima: number;
  gmdMaxima: number;
  gmdMediana: number;
  
  // === DISTRIBUCIÓN ===
  distribucionPeso: {
    rango: string;              // "100-150 kg"
    cantidad: number;
    porcentaje: number;
  }[];
  
  // === TENDENCIAS ===
  tendenciaGMD: 'improving' | 'declining' | 'stable';
  cambioGMDUltimo30Dias: number; // Cambio porcentual
  
  // === TOP PERFORMERS ===
  mejoresAnimales: {
    animalId: string;
    animalTag: string;
    gmd: number;
    peso: number;
  }[];
  
  // === ALERTAS POR CATEGORÍA ===
  alertasActivas: number;
  alertasCriticas: number;
  
  // === METADATOS ===
  fechaAnalisis: string;
  periodoAnalizado: string;     // "últimos 30 días"
}

/**
 * Reporte mensual de pesaje
 */
export interface MonthlyWeighingReport {
  ranchId: string;
  año: number;
  mes: number;
  
  // === RESUMEN EJECUTIVO ===
  totalPesajes: number;
  animalesPesados: number;
  animalesPendientes: number;
  coberturaPesaje: number;      // Porcentaje de animales pesados
  
  // === MÉTRICAS PRINCIPALES ===
  gmdPromedioGeneral: number;
  gananciaPromedioPorAnimal: number;
  totalGananciaKg: number;
  eficienciaPromedioGeneral: number;
  
  // === POR CATEGORÍA ===
  statsPorCategoria: CategoryWeightStats[];
  
  // === TENDENCIAS ===
  comparacionMesAnterior: {
    cambioGMD: number;          // Porcentaje de cambio
    cambioEficiencia: number;
    cambioCobertura: number;
  };
  
  // === TOP PERFORMERS ===
  mejoresAnimales: {
    animalId: string;
    animalTag: string;
    categoria: string;
    gmd: number;
    gananciaTotal: number;
  }[];
  
  // === ALERTAS DEL MES ===
  resumenAlertas: {
    total: number;
    porTipo: Record<WeightAlertType, number>;
    resueltas: number;
    pendientes: number;
  };
  
  // === RECOMENDACIONES ===
  recomendaciones: {
    prioridad: 'alta' | 'media' | 'baja';
    categoria?: string;
    descripcion: string;
    impactoEstimado: string;
  }[];
  
  // === METADATOS ===
  fechaGeneracion: string;
  generadoPor: string;
  periodoAnalisis: {
    fechaInicio: string;
    fechaFin: string;
  };
}

/**
 * Configuración del sistema de pesaje por rancho
 */
export interface WeighingSystemConfig {
  ranchId: string;
  
  // === CONFIGURACIÓN GENERAL ===
  frecuenciaPorDefecto: WeighingFrequency;
  gmdMinimaEsperada: number;    // GMD mínima esperada kg/día
  gmdExcelenteEsperada: number; // GMD considerada excelente
  pesajeObligatorioCategoria: boolean; // Si es obligatorio por categoría
  
  // === ALERTAS ===
  alertasHabilitadas: boolean;
  diasSinPesajeAlerta: number;  // Días sin pesar para generar alerta
  porcentajeGMDBajaAlerta: number; // % bajo GMD esperada para alerta
  porcentajePerdidaPesoAlerta: number; // % pérdida para alerta crítica
  
  // === VALIDACIÓN ===
  requiereValidacionSupervisor: boolean;
  rangoPesoAceptable: {
    minimo: number;             // Peso mínimo aceptable
    maximo: number;             // Peso máximo aceptable
  };
  variacionMaximaEntrePesajes: number; // % máxima variación permitida
  
  // === CATEGORIZACIÓN AUTOMÁTICA ===
  cambioAutomaticoCategoria: boolean;
  rangosCategoriaPorPeso: {
    categoriaId: string;
    pesoMinimo: number;
    pesoMaximo?: number;
  }[];
  
  // === NOTIFICACIONES ===
  notificacionesEmail: boolean;
  notificacionesPush: boolean;
  emailsSupervisores: string[];
  frecuenciaReportes: 'daily' | 'weekly' | 'monthly';
  
  // === INTEGRACIÓN ===
  sincronizarConInventario: boolean;
  generarMovimientosAutomaticos: boolean;
  
  // === METADATOS ===
  createdAt: string;
  updatedAt?: string;
}

/**
 * Proyección de crecimiento
 */
export interface GrowthProjection {
  animalId: string;
  fechaProyeccion: string;
  
  // === DATOS BASE ===
  pesoActual: number;
  gmdActual: number;
  fechaUltimoPesaje: string;
  
  // === PROYECCIONES TEMPORALES ===
  proyecciones: {
    dias: number;
    pesoProyectado: number;
    confiabilidad: number;      // 0-100%
    rangoMinimo: number;
    rangoMaximo: number;
  }[];
  
  // === ESCENARIOS ===
  escenarios: {
    nombre: string;             // "Optimista", "Conservador", "Pesimista"
    gmdAsumida: number;
    pesoFinal30Dias: number;
    pesoFinal60Dias: number;
    probabilidad: number;       // 0-100%
  }[];
  
  // === RECOMENDACIONES ===
  recomendacionesNutricionales: string[];
  recomendacionesManejo: string[];
  fechaOptimaCambioCategoria?: string;
  categoriaDestino?: string;
  
  // === METADATOS ===
  algoritmoUtilizado: string;  // Tipo de algoritmo de proyección
  factoresConsiderados: string[];
  fechaCalculado: string;
  validoHasta: string;
}

// ===== TIPOS DE UTILIDAD =====

/**
 * Filtros para consultas de pesaje
 */
export interface WeighingFilters {
  animalIds?: string[];
  categorias?: string[];
  fechaInicio?: string;
  fechaFin?: string;
  status?: WeighingStatus[];
  operadorIds?: string[];
  conAlertas?: boolean;
  soloSinConciliar?: boolean;
  gmdMinima?: number;
  gmdMaxima?: number;
  pesoMinimo?: number;
  pesoMaximo?: number;
}

/**
 * Opciones de ordenamiento
 */
export interface WeighingSortOptions {
  campo: 'fecha' | 'peso' | 'gmd' | 'animalTag' | 'categoria';
  orden: 'asc' | 'desc';
}

/**
 * Resultado de análisis de eficiencia
 */
export interface EfficiencyAnalysisResult {
  animalId: string;
  scoreEficiencia: number;      // 0-100
  clasificacion: 'excelente' | 'buena' | 'regular' | 'deficiente';
  factoresPositivos: string[];
  factoresNegativos: string[];
  recomendacionesMejora: string[];
  potencialMejora: number;      // % estimado de mejora posible
}

// ===== CONSTANTES DE CONFIGURACIÓN =====

/**
 * Rangos estándar de GMD por categoría (kg/día)
 */
export const STANDARD_GMD_RANGES = {
  'terneros_0_12': { minima: 0.3, optima: 0.8, excelente: 1.2 },
  'novillos_12_24': { minima: 0.5, optima: 1.0, excelente: 1.5 },
  'novillas_12_24': { minima: 0.4, optima: 0.8, excelente: 1.2 },
  'novillas_gordas': { minima: 0.6, optima: 1.0, excelente: 1.4 },
  'vacas': { minima: 0.0, optima: 0.3, excelente: 0.6 },      // Vacas adultas crecen menos
  'toros': { minima: 0.2, optima: 0.5, excelente: 0.8 }       // Toros adultos
} as const;

/**
 * Configuración por defecto de alertas
 */
export const DEFAULT_ALERT_CONFIG = {
  diasSinPesajeAlerta: 35,          // 35 días sin pesar = alerta
  porcentajeGMDBajaAlerta: 50,      // GMD 50% bajo esperado = alerta
  porcentajePerdidaPesoAlerta: 5,   // 5% pérdida peso = alerta crítica
  variacionMaximaEntrePesajes: 25   // 25% variación máxima entre pesajes
} as const;

/**
 * Colores para visualización de alertas
 */
export const ALERT_COLORS = {
  [WeightAlertType.LOW_WEIGHT]: '#ef4444',
  [WeightAlertType.HIGH_WEIGHT]: '#3b82f6',
  [WeightAlertType.POOR_GMD]: '#f59e0b',
  [WeightAlertType.EXCELLENT_GMD]: '#10b981',
  [WeightAlertType.WEIGHT_LOSS]: '#dc2626',
  [WeightAlertType.STAGNANT_GROWTH]: '#6b7280',
  [WeightAlertType.CATEGORY_CHANGE_SUGGESTED]: '#8b5cf6',
  [WeightAlertType.MISSING_WEIGHING]: '#f97316'
} as const;

/**
 * Iconos para tipos de alerta (Lucide React)
 */
export const ALERT_ICONS = {
  [WeightAlertType.LOW_WEIGHT]: 'TrendingDown',
  [WeightAlertType.HIGH_WEIGHT]: 'TrendingUp', 
  [WeightAlertType.POOR_GMD]: 'AlertTriangle',
  [WeightAlertType.EXCELLENT_GMD]: 'Star',
  [WeightAlertType.WEIGHT_LOSS]: 'ArrowDown',
  [WeightAlertType.STAGNANT_GROWTH]: 'Minus',
  [WeightAlertType.CATEGORY_CHANGE_SUGGESTED]: 'ArrowRight',
  [WeightAlertType.MISSING_WEIGHING]: 'Clock'
} as const;

// ===== FUNCIONES DE UTILIDAD =====

/**
 * Calcula la GMD entre dos pesajes
 */
export function calculateGMD(
  pesoActual: number, 
  pesoAnterior: number, 
  diasTranscurridos: number
): number {
  if (diasTranscurridos === 0) return 0;
  return (pesoActual - pesoAnterior) / diasTranscurridos;
}

/**
 * Determina la categoría sugerida basada en peso y edad
 */
export function suggestCategoryByWeight(
  peso: number, 
  edadMeses: number, 
  sexo: 'male' | 'female'
): string | null {
  // Lógica simplificada - debe expandirse según reglas de negocio
  if (edadMeses <= 12) return 'terneros_0_12';
  if (edadMeses <= 24) {
    return sexo === 'male' ? 'novillos_12_24' : 'novillas_12_24';
  }
  if (sexo === 'female') {
    return peso >= 450 ? 'novillas_gordas' : 'novillas_12_24';
  }
  return peso >= 500 ? 'toros' : 'novillos_12_24';
}

/**
 * Calcula el score de eficiencia basado en GMD
 */
export function calculateEfficiencyScore(
  gmdActual: number, 
  gmdEsperada: number
): number {
  const ratio = gmdActual / gmdEsperada;
  return Math.min(100, Math.max(0, ratio * 100));
}

/**
 * Valida un registro de pesaje
 */
export function validateWeighingRecord(
  record: Partial<WeighingRecord>
): ValidationResult {
  const errors: any[] = [];
  
  if (!record.animalId) {
    errors.push({ field: 'animalId', message: 'Animal ID es requerido' });
  }
  
  if (!record.fecha) {
    errors.push({ field: 'fecha', message: 'Fecha es requerida' });
  }
  
  if (!record.peso || record.peso <= 0) {
    errors.push({ field: 'peso', message: 'Peso debe ser mayor a 0' });
  }
  
  if (record.peso && (record.peso < 50 || record.peso > 2000)) {
    errors.push({ field: 'peso', message: 'Peso fuera de rango razonable (50-2000 kg)' });
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings: [],
    metadata: {
      validatedAt: new Date().toISOString(),
      validatorVersion: '1.0.0',
      country: 'MX'
    }
  };
}

/**
 * Type guard para WeighingRecord
 */
export function isWeighingRecord(obj: any): obj is WeighingRecord {
  return obj &&
    typeof obj.id === 'string' &&
    typeof obj.animalId === 'string' &&
    typeof obj.fecha === 'string' &&
    typeof obj.peso === 'number' &&
    typeof obj.gananciaPromedioDiaria === 'number' &&
    typeof obj.eficienciaCrecimiento === 'number';
}

/**
 * Determina si un animal necesita ser pesado basado en última fecha
 */
export function needsWeighing(
  ultimaFechaPesaje: string, 
  frecuencia: WeighingFrequency,
  diasCustom?: number
): boolean {
  const ultimaFecha = new Date(ultimaFechaPesaje);
  const hoy = new Date();
  const diasTranscurridos = Math.floor((hoy.getTime() - ultimaFecha.getTime()) / (1000 * 60 * 60 * 24));
  
  switch (frecuencia) {
    case WeighingFrequency.WEEKLY:
      return diasTranscurridos >= 7;
    case WeighingFrequency.BIWEEKLY:
      return diasTranscurridos >= 14;
    case WeighingFrequency.MONTHLY:
      return diasTranscurridos >= 30;
    case WeighingFrequency.QUARTERLY:
      return diasTranscurridos >= 90;
    case WeighingFrequency.CUSTOM:
      return diasTranscurridos >= (diasCustom || 30);
    default:
      return false;
  }
}

/**
 * Genera proyección simple de peso
 */
export function projectWeight(
  pesoActual: number, 
  gmdPromedio: number, 
  diasFuturos: number
): number {
  return pesoActual + (gmdPromedio * diasFuturos);
}