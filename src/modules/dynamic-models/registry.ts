// src/modules/dynamic-models/registry.ts
import { BaseDynamicModel, ModelCategory } from './types/base';

export interface ModelRegistryEntry {
  id: string;
  code: string;
  name: string;
  originalName: string;  // Nombre original de la planilla Excel
  category: ModelCategory;
  description: string;
  path: string;
  enabled: boolean;
}

export const DYNAMIC_MODELS_REGISTRY: ModelRegistryEntry[] = [
  // Financial Models
  {
    id: 'LPE-001',
    code: 'LivestockProfitabilityEngine',
    name: 'Motor de Rentabilidad Pecuaria',
    originalName: 'Cálculo de Resultados Pecuarios v.2025',
    category: 'financial',
    description: 'Análisis integral de rentabilidad con soporte multi-país y proyecciones financieras',
    path: 'core/financial/LivestockProfitabilityEngine',
    enabled: true
  },
  {
    id: 'CFM-006',
    code: 'CashFlowMonitor',
    name: 'Monitor de Flujo de Caja',
    originalName: 'Control Mensual de Gastos e Ingresos',
    category: 'financial',
    description: 'Seguimiento en tiempo real del flujo de efectivo con alertas inteligentes',
    path: 'core/financial/CashFlowMonitor',
    enabled: true
  },
  {
    id: 'APA-007',
    code: 'AnnualPerformanceAnalyzer',
    name: 'Analizador de Rendimiento Anual',
    originalName: 'Evaluación Anual de Resultados',
    category: 'financial',
    description: 'Evaluación comprehensiva del rendimiento anual con comparativas históricas',
    path: 'core/financial/AnnualPerformanceAnalyzer',
    enabled: true
  },
  {
    id: 'BEO-011',
    code: 'BreakEvenOptimizer',
    name: 'Optimizador de Punto de Equilibrio',
    originalName: 'Cálculo de Punto de Equilibrio de la Arroba',
    category: 'financial',
    description: 'Optimización del punto de equilibrio con análisis de sensibilidad',
    path: 'core/financial/BreakEvenOptimizer',
    enabled: true
  },
  
  // Operational Models
  {
    id: 'FOE-002',
    code: 'FeedOptimizationEngine',
    name: 'Motor de Optimización de Alimentación',
    originalName: 'Cálculo de Costos de Suplementación',
    category: 'operational',
    description: 'Optimización de costos de alimentación con formulación de dietas balanceadas',
    path: 'core/operational/FeedOptimizationEngine',
    enabled: true
  },
  {
    id: 'CCO-004',
    code: 'CarryingCapacityOptimizer',
    name: 'Optimizador de Capacidad de Carga',
    originalName: 'Cálculo de la Tasa de Capacidad',
    category: 'operational',
    description: 'Optimización de la capacidad de carga del terreno con sostenibilidad',
    path: 'core/operational/CarryingCapacityOptimizer',
    enabled: true
  },
  {
    id: 'DRC-005',
    code: 'DailyRateCalculator',
    name: 'Calculador de Tasa Diaria',
    originalName: 'Cálculo de la Tarifa Diaria',
    category: 'operational',
    description: 'Cálculo dinámico de tasas diarias con múltiples variables',
    path: 'core/operational/DailyRateCalculator',
    enabled: true
  },
  {
    id: 'LIT-008',
    code: 'LivestockInventoryTracker',
    name: 'Rastreador de Inventario Ganadero',
    originalName: 'Control de Inventario de Bovinos',
    category: 'operational',
    description: 'Gestión integral del inventario con trazabilidad completa',
    path: 'core/operational/LivestockInventoryTracker',
    enabled: true
  },
  {
    id: 'WMS-009',
    code: 'WeightManagementSystem',
    name: 'Sistema de Gestión de Peso',
    originalName: 'Control de Pesaje',
    category: 'operational',
    description: 'Monitoreo de peso con predicciones de crecimiento y alertas',
    path: 'core/operational/WeightManagementSystem',
    enabled: true
  },
  {
    id: 'ICC-013',
    code: 'InfrastructureCostCalculator',
    name: 'Calculador de Costos de Infraestructura',
    originalName: 'Cálculo de Costo de Cerca Tradicional',
    category: 'operational',
    description: 'Planificación y costeo de infraestructura con ROI',
    path: 'core/operational/InfrastructureCostCalculator',
    enabled: true
  },
  
  // Strategic Models
  {
    id: 'SBP-003',
    code: 'StrategicBudgetPlanner',
    name: 'Planificador de Presupuesto Estratégico',
    originalName: 'Planificación y Presupuesto',
    category: 'strategic',
    description: 'Planificación estratégica con escenarios y simulaciones',
    path: 'core/strategic/StrategicBudgetPlanner',
    enabled: true
  },
  {
    id: 'EDA-010',
    code: 'EquityDilutionAnalyzer',
    name: 'Analizador de Dilución de Capital',
    originalName: 'Cálculo de la Dilución del Fondo de Comercio',
    category: 'strategic',
    description: 'Análisis de dilución para decisiones de inversión y M&A',
    path: 'core/strategic/EquityDilutionAnalyzer',
    enabled: true
  },
  {
    id: 'MPO-012',
    code: 'MarketPlacementOptimizer',
    name: 'Optimizador de Colocación en Mercado',
    originalName: 'Cálculo de la Cantidad a ser Colocada',
    category: 'strategic',
    description: 'Optimización de estrategias de venta y colocación en mercado',
    path: 'core/strategic/MarketPlacementOptimizer',
    enabled: true
  },
  {
    id: 'ERA-014',
    code: 'ExchangeRatioAnalyzer',
    name: 'Analizador de Relación de Cambio',
    originalName: 'Cálculo de la Relación de Cambio',
    category: 'strategic',
    description: 'Análisis de relaciones de intercambio y arbitraje',
    path: 'core/strategic/ExchangeRatioAnalyzer',
    enabled: true
  },
  
  // Human Resources Models
  {
    id: 'LCO-015',
    code: 'LaborCostOptimizer',
    name: 'Optimizador de Costos Laborales',
    originalName: 'Cálculo de Costos por Empleado',
    category: 'human-resources',
    description: 'Optimización de costos laborales con análisis de productividad',
    path: 'core/human-resources/LaborCostOptimizer',
    enabled: true
  }
];

// Utility functions
export function getModelById(id: string): ModelRegistryEntry | undefined {
  return DYNAMIC_MODELS_REGISTRY.find(model => model.id === id);
}

export function getModelByCode(code: string): ModelRegistryEntry | undefined {
  return DYNAMIC_MODELS_REGISTRY.find(model => model.code === code);
}

export function getModelsByCategory(category: ModelCategory): ModelRegistryEntry[] {
  return DYNAMIC_MODELS_REGISTRY.filter(model => model.category === category);
}

export function getEnabledModels(): ModelRegistryEntry[] {
  return DYNAMIC_MODELS_REGISTRY.filter(model => model.enabled);
}

// Dynamic Model Loader
export class BaseDynamicModelLoader {
  private static cache: Map<string, BaseDynamicModel> = new Map();
  
  static async loadModel(modelId: string): Promise<BaseDynamicModel> {
    // Check cache first
    if (this.cache.has(modelId)) {
      return this.cache.get(modelId)!;
    }
    
    // Find model in registry
    const registryEntry = getModelById(modelId);
    if (!registryEntry) {
      throw new Error(`Model ${modelId} not found in registry`);
    }
    
    if (!registryEntry.enabled) {
      throw new Error(`Model ${modelId} is disabled`);
    }
    
    try {
      // Dynamic import
      const modulePath = `./modules/dynamic-models/${registryEntry.path}`;
      const module = await import(modulePath);
      const ModelClass = module.default || module[registryEntry.code];
      
      if (!ModelClass) {
        throw new Error(`Model class not found in ${modulePath}`);
      }
      
      // Instantiate and cache
      const modelInstance = new ModelClass();
      this.cache.set(modelId, modelInstance);
      
      return modelInstance;
    } catch (error) {
      throw new Error(`Failed to load model ${modelId}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  static async loadModels(modelIds: string[]): Promise<Map<string, BaseDynamicModel>> {
    const models = new Map<string, BaseDynamicModel>();
    
    await Promise.all(
      modelIds.map(async (id) => {
        try {
          const model = await this.loadModel(id);
          models.set(id, model);
        } catch (error) {
          console.error(`Failed to load model ${id}:`, error);
        }
      })
    );
    
    return models;
  }
  
  static clearCache(): void {
    this.cache.clear();
  }
}