// src/types/core/production.types.ts
// TYPES ÚNICOS Y CENTRALIZADOS PARA PRODUCCIÓN

/**
 * Tipo base para producción de leche
 * IMPORTANTE: Este es el ÚNICO tipo que debe usarse en todo el sistema
 * para garantizar consistencia en analytics y ML
 */
export interface MilkProduction {
  // === Identificadores ===
  id: string;
  animalId: string;      // ID del animal (consistente con Animal.id)
  ranchId: string;       // ID del rancho para multi-tenancy
  
  // === Datos temporales ===
  date: string;          // ISO 8601: YYYY-MM-DD
  period: MilkPeriod;    // Turno del día
  timestamp?: string;    // ISO 8601 completo para precisión ML
  
  // === Métricas de producción ===
  quantity: number;      // Cantidad producida
  unit: MilkUnit;        // Unidad de medida
  temperature?: number;  // Temperatura de la leche (°C)
  
  // === Calidad (crítico para ML) ===
  quality?: MilkQuality;
  qualityMetrics?: {
    fat?: number;        // % de grasa
    protein?: number;    // % de proteína
    lactose?: number;    // % de lactosa
    somaticCells?: number; // Células somáticas/ml
    bacterialCount?: number; // UFC/ml
    ph?: number;         // pH
  };
  
  // === Factores contextuales (features para ML) ===
  environmentalFactors?: {
    ambientTemperature?: number;  // °C
    humidity?: number;            // %
    weatherCondition?: WeatherCondition;
  };
  
  feedingFactors?: {
    feedType?: string;
    supplementsGiven?: string[];
    waterIntake?: number;         // litros
  };
  
  // === Metadata ===
  collectedBy?: string;  // Usuario que registró
  notes?: string;        // Observaciones
  tags?: string[];       // Etiquetas para clasificación
  
  // === Auditoría ===
  createdAt: string;     // ISO 8601
  updatedAt?: string;    // ISO 8601
  syncedAt?: string;     // Para sincronización offline
  version?: number;      // Versionado de datos
}

// === ENUMS Y TIPOS AUXILIARES ===

export type MilkPeriod = 'morning' | 'afternoon' | 'evening' | 'night';

export type MilkUnit = 'liter' | 'gallon' | 'pound' | 'kilogram';

export type MilkQuality = 'premium' | 'A' | 'B' | 'C' | 'rejected';

export type WeatherCondition = 
  | 'sunny' 
  | 'cloudy' 
  | 'rainy' 
  | 'stormy' 
  | 'windy' 
  | 'foggy';

// === INTERFACES PARA ANALYTICS ===

/**
 * Agregación diaria para dashboards y reportes
 */
export interface DailyProductionSummary {
  animalId: string;
  date: string;
  totalQuantity: number;
  unit: MilkUnit;
  productionsByPeriod: Record<MilkPeriod, number>;
  averageQuality?: MilkQuality;
  qualityDistribution?: Record<MilkQuality, number>;
}

/**
 * Métricas para predicciones ML
 */
export interface ProductionMetrics {
  animalId: string;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  
  // Estadísticas básicas
  mean: number;
  median: number;
  stdDev: number;
  variance: number;
  
  // Tendencias
  trend: 'increasing' | 'decreasing' | 'stable';
  trendSlope: number;
  seasonalityIndex?: number;
  
  // Anomalías
  anomalies: Array<{
    date: string;
    value: number;
    severity: 'low' | 'medium' | 'high';
    reason?: string;
  }>;
  
  // Predicciones
  forecast?: {
    nextPeriod: number;
    confidence: number;
    upperBound: number;
    lowerBound: number;
  };
}

// === FUNCIONES DE VALIDACIÓN ===

export const ProductionValidation = {
  isValidQuantity: (quantity: number, unit: MilkUnit): boolean => {
    const limits = {
      liter: { min: 0, max: 100 },
      gallon: { min: 0, max: 26.4 },
      pound: { min: 0, max: 220 },
      kilogram: { min: 0, max: 100 }
    };
    
    const limit = limits[unit];
    return quantity >= limit.min && quantity <= limit.max;
  },
  
  isValidQualityMetrics: (metrics: any): boolean => {
    if (!metrics) return true;
    
    const ranges = {
      fat: { min: 2.5, max: 6.0 },
      protein: { min: 2.5, max: 4.5 },
      lactose: { min: 4.0, max: 5.5 },
      ph: { min: 6.4, max: 6.8 },
      somaticCells: { min: 0, max: 1000000 },
      bacterialCount: { min: 0, max: 100000 }
    };
    
    return Object.entries(metrics).every(([key, value]) => {
      if (!(key in ranges)) return true;
      const range = ranges[key as keyof typeof ranges];
      return typeof value === 'number' && value >= range.min && value <= range.max;
    });
  }
};

// === TIPOS PARA MIGRACIÓN ===

/**
 * Mapeo para migrar datos antiguos
 */
export interface LegacyProductionMapping {
  // Mapeo de campos antiguos a nuevos
  cattleId?: string;  // -> animalId
  morningAmount?: number; // -> crear registro con period: 'morning'
  eveningAmount?: number; // -> crear registro con period: 'evening'
  milkQuality?: string; // -> quality
  
  // Función de migración
  migrate: () => MilkProduction[];
}