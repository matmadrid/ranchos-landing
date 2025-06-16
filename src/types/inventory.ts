// src/types/inventory.ts
/**
 * @version 1.0.0
 * @author TorresLaveaga
 * @cosmovision SpaceRanch Sistemas Dinámicos Universales
 * 
 * BATALLA 6: Motor de Inventario Ganadero
 * Sistema de tipos para inventario agregado basado en análisis de Planilla 8
 */

import type { CountryCode, ValidationResult, ProcessingResult } from './index';

// ===== ENUMS Y CONSTANTES =====

/**
 * Tipos de movimiento de inventario basados en Planilla 8
 */
export enum MovementType {
  COMPRA = 'COMPRA',
  VENTA = 'VENTA',
  NACIMIENTO = 'NACIMIENTO', 
  MUERTE = 'MUERTE',
  TRANSFERENCIA_IN = 'TRANSFERENCIA_IN',
  TRANSFERENCIA_OUT = 'TRANSFERENCIA_OUT',
  AJUSTE = 'AJUSTE' // Para conciliaciones
}

/**
 * Estados de un movimiento de inventario
 */
export enum MovementStatus {
  DRAFT = 'DRAFT',           // Borrador
  CONFIRMED = 'CONFIRMED',   // Confirmado
  CANCELLED = 'CANCELLED',   // Cancelado
  RECONCILED = 'RECONCILED'  // Conciliado
}

// ===== INTERFACES PRINCIPALES =====

/**
 * Categoría de animal para inventario agregado
 * Basado en las categorías encontradas en Planilla 8
 */
export interface AnimalCategory {
  id: string;
  label: string;
  description?: string;
  ageRangeMin: number; // meses
  ageRangeMax?: number; // meses (undefined = sin límite superior)
  sex?: 'male' | 'female' | 'both';
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt?: string;
}

/**
 * Movimiento de inventario - Estructura principal del sistema
 * Replica la estructura contable de la Planilla 8
 */
export interface InventoryMovement {
  id: string;
  
  // === DATOS BÁSICOS ===
  fecha: string; // ISO date string
  tipo: MovementType;
  status: MovementStatus;
  numeroMovimiento?: string; // Número secuencial interno
  
  // === CATEGORÍA Y CANTIDAD ===
  categoriaId: string; // Referencia a AnimalCategory
  categoria: string; // Nombre de la categoría (desnormalizado para performance)
  cantidad: number; // +/- según el tipo de movimiento
  
  // === SALDOS CONTABLES ===
  saldoInicial: number; // Balance antes del movimiento
  saldoFinal: number; // Balance después del movimiento (calculado)
  
  // === DATOS FINANCIEROS ===
  valorUnitario?: number; // Valor por animal/unidad
  valorTotal?: number; // Valor total del movimiento
  costoFlete?: number; // Costos de transporte
  costoComisiones?: number; // Comisiones de venta/compra
  costoTotalAdquisicion?: number; // Costo total (calculado)
  
  // === PRECIOS DE MERCADO ===
  precioMercadoDia?: number; // @ del día
  precioNegociado?: number; // @ negociada
  
  // === ORIGEN/DESTINO ===
  vendedorComprador: string; // Nombre del vendedor/comprador
  destino: string; // Destino o ubicación
  origen?: string; // Origen (para transferencias)
  
  // === OBSERVACIONES TÉCNICAS ===
  pesoObservado?: number; // Peso total observado
  pesoPromedio?: number; // Peso promedio por animal
  observaciones?: string; // Notas adicionales
  
  // === METADATOS ===
  ranchId: string;
  userId: string; // Usuario que registró el movimiento
  createdAt: string;
  updatedAt?: string;
  
  // === REFERENCIAS CRUZADAS ===
  relatedAnimalIds?: string[]; // IDs de animales individuales relacionados
  parentMovementId?: string; // Para movimientos derivados
  
  // === VALIDACIÓN ===
  validationResult?: ValidationResult;
  isReconciled: boolean; // Si ya fue conciliado con sistema individual
}

/**
 * Resumen de inventario por categoría
 */
export interface CategoryInventorySummary {
  categoriaId: string;
  categoria: string;
  saldoActual: number;
  valorEstimado: number;
  ultimaActualizacion: string;
  movimientosUltimos30Dias: number;
  
  // Estadísticas
  promedioCompras30Dias: number;
  promedioVentas30Dias: number;
  rotacionInventario: number; // Días
  
  // Alertas
  alertas: InventoryAlert[];
}

/**
 * Alerta de inventario
 */
export interface InventoryAlert {
  id: string;
  type: 'LOW_STOCK' | 'HIGH_ROTATION' | 'PRICE_VARIATION' | 'RECONCILIATION_ERROR';
  severity: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  categoriaId: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: string;
}

/**
 * Reporte de conciliación entre sistema individual y agregado
 */
export interface ReconciliationReport {
  id: string;
  fechaEjecucion: string;
  isBalanced: boolean;
  
  // Discrepancias por categoría
  discrepancies: {
    categoriaId: string;
    categoria: string;
    countIndividual: number; // Conteo de animales individuales
    balanceAgregado: number; // Balance del sistema agregado
    diferencia: number;
    porcentajeDiferencia: number;
  }[];
  
  // Acciones sugeridas
  suggestedActions: ReconciliationAction[];
  
  // Estadísticas
  totalAnimalsIndividual: number;
  totalAnimalsAggregate: number;
  accuracyPercentage: number;
  
  ranchId: string;
  userId: string;
  createdAt: string;
}

/**
 * Acción de conciliación sugerida
 */
export interface ReconciliationAction {
  id: string;
  type: 'CREATE_ADJUSTMENT' | 'UPDATE_INDIVIDUAL' | 'INVESTIGATE' | 'IGNORE';
  description: string;
  categoriaId: string;
  impact: 'low' | 'medium' | 'high';
  isExecuted: boolean;
  executedAt?: string;
}

/**
 * Configuración de inventario por rancho
 */
export interface InventorySettings {
  ranchId: string;
  
  // Configuración de categorías
  enabledCategories: string[]; // IDs de categorías habilitadas
  customCategories: AnimalCategory[]; // Categorías personalizadas
  
  // Configuración de alertas
  alertSettings: {
    lowStockThreshold: number; // Porcentaje
    highRotationDays: number; // Días
    priceVariationPercent: number; // Porcentaje
    enableEmailAlerts: boolean;
    enablePushAlerts: boolean;
  };
  
  // Configuración de conciliación
  reconciliationSettings: {
    autoReconciliationEnabled: boolean;
    reconciliationFrequency: 'daily' | 'weekly' | 'monthly';
    tolerancePercentage: number; // Porcentaje de tolerancia
  };
  
  // Configuración financiera
  financialSettings: {
    defaultCurrency: string;
    includeTaxInCalculations: boolean;
    taxRate: number;
    depreciation: {
      enabled: boolean;
      annualRate: number; // Porcentaje
    };
  };
  
  createdAt: string;
  updatedAt?: string;
}

/**
 * Reporte mensual de inventario
 */
export interface MonthlyInventoryReport {
  ranchId: string;
  year: number;
  month: number;
  
  // Resumen ejecutivo
  summary: {
    inventarioInicial: number;
    compras: number;
    ventas: number;
    nacimientos: number;
    muertes: number;
    transferenciasIn: number;
    transferenciasOut: number;
    inventarioFinal: number;
    
    // Financiero
    valorInventarioInicial: number;
    valorCompras: number;
    valorVentas: number;
    valorInventarioFinal: number;
    utilidadBruta: number;
    margenBruto: number; // Porcentaje
  };
  
  // Por categoría
  byCategory: Record<string, CategoryInventorySummary>;
  
  // Movimientos del mes
  movements: InventoryMovement[];
  
  // Comparación con mes anterior
  comparison: {
    inventarioChange: number;
    inventarioChangePercent: number;
    valueChange: number;
    valueChangePercent: number;
  };
  
  // Análisis
  insights: {
    topGrowthCategory: string;
    topDeclineCategory: string;
    mostProfitableCategory: string;
    recommendations: string[];
  };
  
  generatedAt: string;
  generatedBy: string;
}

// ===== CATEGORÍAS ESTÁNDAR =====

/**
 * Categorías estándar basadas en análisis de Planilla 8
 */
export const STANDARD_CATEGORIES: AnimalCategory[] = [
  {
    id: 'terneros_0_12',
    label: 'Terneros de 0 a 12 meses',
    description: 'Terneros y terneras de 0 a 12 meses de edad',
    ageRangeMin: 0,
    ageRangeMax: 12,
    sex: 'both',
    isActive: true,
    sortOrder: 1,
    createdAt: new Date().toISOString()
  },
  {
    id: 'novillos_12_24',
    label: 'Novillos de 12 a 24 meses',
    description: 'Novillos machos de 12 a 24 meses',
    ageRangeMin: 12,
    ageRangeMax: 24,
    sex: 'male',
    isActive: true,
    sortOrder: 2,
    createdAt: new Date().toISOString()
  },
  {
    id: 'novillas_12_24',
    label: 'Novillas de 12 a 24 meses',
    description: 'Novillas hembras de 12 a 24 meses',
    ageRangeMin: 12,
    ageRangeMax: 24,
    sex: 'female',
    isActive: true,
    sortOrder: 3,
    createdAt: new Date().toISOString()
  },
  {
    id: 'novillas_gordas',
    label: 'Novillas gordas',
    description: 'Novillas de engorde para venta',
    ageRangeMin: 18,
    ageRangeMax: 36,
    sex: 'female',
    isActive: true,
    sortOrder: 4,
    createdAt: new Date().toISOString()
  },
  {
    id: 'vacas',
    label: 'Vacas',
    description: 'Vacas adultas reproductoras',
    ageRangeMin: 24,
    sex: 'female',
    isActive: true,
    sortOrder: 5,
    createdAt: new Date().toISOString()
  },
  {
    id: 'toros',
    label: 'Toros',
    description: 'Toros reproductores',
    ageRangeMin: 24,
    sex: 'male',
    isActive: true,
    sortOrder: 6,
    createdAt: new Date().toISOString()
  }
];

// ===== UTILIDADES Y TYPE GUARDS =====

/**
 * Determina la categoría de un animal basado en edad y sexo
 */
export function determineAnimalCategory(
  ageInMonths: number, 
  sex: 'male' | 'female',
  categories: AnimalCategory[] = STANDARD_CATEGORIES
): AnimalCategory | null {
  return categories.find(cat => {
    const ageMatch = ageInMonths >= cat.ageRangeMin && 
                    (cat.ageRangeMax === undefined || ageInMonths <= cat.ageRangeMax);
    const sexMatch = cat.sex === 'both' || cat.sex === sex;
    return ageMatch && sexMatch && cat.isActive;
  }) || null;
}

/**
 * Valida un movimiento de inventario
 */
export function validateInventoryMovement(movement: Partial<InventoryMovement>): ValidationResult {
  const errors: any[] = [];
  
  // Validaciones básicas
  if (!movement.fecha) errors.push({ field: 'fecha', message: 'Fecha es requerida' });
  if (!movement.tipo) errors.push({ field: 'tipo', message: 'Tipo de movimiento es requerido' });
  if (!movement.categoriaId) errors.push({ field: 'categoriaId', message: 'Categoría es requerida' });
  if (!movement.cantidad || movement.cantidad === 0) {
    errors.push({ field: 'cantidad', message: 'Cantidad debe ser diferente de cero' });
  }
  
  // Validaciones por tipo de movimiento
  if (movement.tipo === MovementType.COMPRA || movement.tipo === MovementType.VENTA) {
    if (!movement.vendedorComprador?.trim()) {
      errors.push({ field: 'vendedorComprador', message: 'Vendedor/Comprador es requerido para compras y ventas' });
    }
  }
  
  // Validación de valores financieros
  if (movement.valorTotal && movement.valorTotal < 0) {
    errors.push({ field: 'valorTotal', message: 'Valor total no puede ser negativo' });
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
 * Type guard para verificar si es un movimiento de inventario válido
 */
export function isInventoryMovement(obj: any): obj is InventoryMovement {
  return obj &&
    typeof obj.id === 'string' &&
    typeof obj.fecha === 'string' &&
    Object.values(MovementType).includes(obj.tipo) &&
    typeof obj.categoriaId === 'string' &&
    typeof obj.cantidad === 'number' &&
    typeof obj.saldoInicial === 'number' &&
    typeof obj.saldoFinal === 'number';
}

/**
 * Calcula el saldo final después de un movimiento
 */
export function calculateFinalBalance(
  initialBalance: number,
  movement: Pick<InventoryMovement, 'tipo' | 'cantidad'>
): number {
  const { tipo, cantidad } = movement;
  
  switch (tipo) {
    case MovementType.COMPRA:
    case MovementType.NACIMIENTO:
    case MovementType.TRANSFERENCIA_IN:
      return initialBalance + cantidad;
      
    case MovementType.VENTA:
    case MovementType.MUERTE:
    case MovementType.TRANSFERENCIA_OUT:
      return initialBalance - cantidad;
      
    case MovementType.AJUSTE:
      return initialBalance + cantidad; // Cantidad puede ser +/-
      
    default:
      return initialBalance;
  }
}

// ===== CONSTANTES DE CONFIGURACIÓN =====

/**
 * Configuración por defecto para alertas
 */
export const DEFAULT_ALERT_SETTINGS = {
  lowStockThreshold: 10, // 10%
  highRotationDays: 30,
  priceVariationPercent: 15, // 15%
  enableEmailAlerts: true,
  enablePushAlerts: true
} as const;

/**
 * Configuración por defecto para conciliación
 */
export const DEFAULT_RECONCILIATION_SETTINGS = {
  autoReconciliationEnabled: true,
  reconciliationFrequency: 'daily' as const,
  tolerancePercentage: 5 // 5%
} as const;

/**
 * Colores para tipos de movimiento (para UI)
 */
export const MOVEMENT_TYPE_COLORS = {
  [MovementType.COMPRA]: '#10b981', // Verde
  [MovementType.VENTA]: '#ef4444', // Rojo
  [MovementType.NACIMIENTO]: '#3b82f6', // Azul
  [MovementType.MUERTE]: '#6b7280', // Gris
  [MovementType.TRANSFERENCIA_IN]: '#8b5cf6', // Púrpura
  [MovementType.TRANSFERENCIA_OUT]: '#f59e0b', // Ámbar
  [MovementType.AJUSTE]: '#6b7280' // Gris
} as const;

/**
 * Iconos para tipos de movimiento (Lucide React)
 */
export const MOVEMENT_TYPE_ICONS = {
  [MovementType.COMPRA]: 'ShoppingCart',
  [MovementType.VENTA]: 'DollarSign',
  [MovementType.NACIMIENTO]: 'Plus',
  [MovementType.MUERTE]: 'Minus',
  [MovementType.TRANSFERENCIA_IN]: 'ArrowRight',
  [MovementType.TRANSFERENCIA_OUT]: 'ArrowLeft',
  [MovementType.AJUSTE]: 'Settings'
} as const;