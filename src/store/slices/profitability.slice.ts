// src/store/slices/profitability.slice.ts
import { StateCreator } from 'zustand';
import type { 
  LivestockProfitabilityInput,
  LivestockProfitabilityOutput,
  CountryCode
} from '@/types';

export interface ProfitabilitySlice {
  // Estado
  lastAnalysis: LivestockProfitabilityOutput | null;
  analysisHistory: Map<string, LivestockProfitabilityOutput>;
  isAnalyzing: boolean;
  analysisErrors: string[];
  
  // Análisis principal
  analyzeProfitability: (input: LivestockProfitabilityInput) => Promise<LivestockProfitabilityOutput>;
  
  // Análisis comparativo
  compareScenarios: (scenarios: LivestockProfitabilityInput[]) => Promise<{
    scenarios: LivestockProfitabilityOutput[];
    bestScenario: number;
    comparison: {
      profitabilityDiff: number[];
      roiDiff: number[];
      breakEvenDiff: number[];
    };
  }>;
  
  // Proyecciones
  generateProjections: (
    baseInput: LivestockProfitabilityInput,
    months: number
  ) => Promise<{
    monthly: LivestockProfitabilityOutput[];
    accumulated: LivestockProfitabilityOutput;
    trends: {
      revenue: number[];
      costs: number[];
      profit: number[];
    };
  }>;
  
  // Histórico
  saveAnalysis: (analysis: LivestockProfitabilityOutput) => void;
  getAnalysisHistory: (limit?: number) => LivestockProfitabilityOutput[];
  clearAnalysisHistory: () => void;
  getAnalysisById: (id: string) => LivestockProfitabilityOutput | undefined;
  
  // Optimización
  suggestOptimizations: (current: LivestockProfitabilityOutput) => {
    suggestions: Array<{
      area: 'feed' | 'labor' | 'veterinary' | 'infrastructure' | 'revenue';
      impact: number;
      description: string;
      actions: string[];
    }>;
    potentialSavings: number;
    potentialRevenueIncrease: number;
  };
  
  // Benchmarking
  getBenchmarks: (type: 'dairy' | 'beef' | 'mixed', country: CountryCode) => {
    avgMargin: number;
    avgROI: number;
    avgCosts: {
      feed: number;
      labor: number;
      veterinary: number;
      infrastructure: number;
    };
    topPerformers: {
      margin: number;
      roi: number;
    };
  };
  
  // Utilidades
  calculateBreakEven: (fixed: number, variable: number, pricePerUnit: number) => {
    units: number;
    revenue: number;
    days: number;
  };
  
  getLastAnalysis: () => LivestockProfitabilityOutput | null;
  isAnalysisStale: (analysisId: string, days: number) => boolean;
}

/**
 * Slice para análisis de rentabilidad ganadera
 * Incluye proyecciones, optimizaciones y benchmarking
 */
export const createProfitabilitySlice: StateCreator<ProfitabilitySlice> = (set, get) => ({
  // Estado inicial
  lastAnalysis: null,
  analysisHistory: new Map(),
  isAnalyzing: false,
  analysisErrors: [],
  
  // Análisis principal de rentabilidad
  analyzeProfitability: async (input) => {
    set({ isAnalyzing: true, analysisErrors: [] });
    
    try {
      // Validar entrada
      if (!input.animalCount || input.animalCount <= 0) {
        throw new Error('Número de animales debe ser mayor a 0');
      }
      
      // Calcular costos totales
      const totalCosts = 
        input.feedCost + 
        input.laborCost + 
        input.veterinaryCost + 
        input.infrastructureCost + 
        input.otherCosts;
      
      // Calcular rentabilidad
      const profit = input.revenue - totalCosts;
      const margin = input.revenue > 0 ? (profit / input.revenue) * 100 : 0;
      const roi = totalCosts > 0 ? (profit / totalCosts) * 100 : 0;
      
      // Calcular punto de equilibrio
      const avgRevenuePerAnimal = input.revenue / input.animalCount;
      const avgCostPerAnimal = totalCosts / input.animalCount;
      const breakEvenUnits = avgRevenuePerAnimal > avgCostPerAnimal 
        ? Math.ceil(totalCosts / (avgRevenuePerAnimal - avgCostPerAnimal))
        : Infinity;
      
      // Generar recomendaciones basadas en análisis
      const recommendations: string[] = [];
      
      // Análisis de costos
      const costBreakdown = {
        feed: (input.feedCost / totalCosts) * 100,
        labor: (input.laborCost / totalCosts) * 100,
        veterinary: (input.veterinaryCost / totalCosts) * 100,
        infrastructure: (input.infrastructureCost / totalCosts) * 100,
        other: (input.otherCosts / totalCosts) * 100
      };
      
      // Recomendaciones basadas en porcentajes
      if (costBreakdown.feed > 60) {
        recommendations.push('Costos de alimentación muy altos (>60%). Considerar opciones de alimentación más económicas o producción propia de forraje.');
      }
      
      if (costBreakdown.labor > 25) {
        recommendations.push('Costos laborales elevados (>25%). Evaluar automatización o eficiencia en procesos.');
      }
      
      if (margin < 20) {
        recommendations.push('Margen de ganancia bajo (<20%). Revisar estrategia de precios o reducir costos operativos.');
      }
      
      if (roi < 15) {
        recommendations.push('ROI por debajo del promedio del sector (<15%). Analizar oportunidades de mejora en productividad.');
      }
      
      // Análisis por tipo de operación
      if (input.operationType === 'dairy') {
        const avgMilkProductionPerCow = input.revenue / input.animalCount / 365;
        if (avgMilkProductionPerCow < 20) { // litros/día
          recommendations.push('Producción de leche por vaca baja. Mejorar genética y nutrición del hato.');
        }
      } else if (input.operationType === 'beef') {
        const avgWeightGain = input.revenue / input.animalCount / 12; // kg/mes
        if (avgWeightGain < 30) {
          recommendations.push('Ganancia de peso mensual baja. Optimizar programa de alimentación.');
        }
      }
      
      // Crear resultado
      const output: LivestockProfitabilityOutput = {
        revenue: input.revenue,
        costs: {
          feed: input.feedCost,
          labor: input.laborCost,
          veterinary: input.veterinaryCost,
          infrastructure: input.infrastructureCost,
          other: input.otherCosts,
          total: totalCosts
        },
        profitability: profit,
        margin,
        roi,
        breakEvenPoint: {
          units: breakEvenUnits,
          revenue: breakEvenUnits * avgRevenuePerAnimal,
          timeToBreakEven: breakEvenUnits < input.animalCount 
            ? 0 
            : Math.ceil((breakEvenUnits - input.animalCount) / (input.animalCount / 365))
        },
        projections: [], // Se llenarían con generateProjections
        recommendations,
        metadata: {
          calculatedAt: new Date(),
          locale: input.locale || 'es-MX',
          currency: input.currency || 'MXN',
          analysisId: `analysis-${Date.now()}`,
          version: '2.0.0'
        }
      };
      
      // Guardar análisis
      set((state) => {
        const newHistory = new Map(state.analysisHistory);
        newHistory.set(output.metadata.analysisId!, output);
        
        // Limitar historial a 100 análisis
        if (newHistory.size > 100) {
          const oldestKey = Array.from(newHistory.keys())[0];
          newHistory.delete(oldestKey);
        }
        
        return {
          lastAnalysis: output,
          analysisHistory: newHistory,
          isAnalyzing: false
        };
      });
      
      return output;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      set({ 
        isAnalyzing: false, 
        analysisErrors: [errorMessage] 
      });
      throw error;
    }
  },
  
  // Comparar escenarios
  compareScenarios: async (scenarios) => {
    const results = await Promise.all(
      scenarios.map(scenario => get().analyzeProfitability(scenario))
    );
    
    // Encontrar mejor escenario
    let bestScenario = 0;
    let bestROI = results[0].roi;
    
    results.forEach((result, index) => {
      if (result.roi > bestROI) {
        bestROI = result.roi;
        bestScenario = index;
      }
    });
    
    // Calcular diferencias
    const baseScenario = results[0];
    const comparison = {
      profitabilityDiff: results.map(r => r.profitability - baseScenario.profitability),
      roiDiff: results.map(r => r.roi - baseScenario.roi),
      breakEvenDiff: results.map(r => 
        r.breakEvenPoint.timeToBreakEven - baseScenario.breakEvenPoint.timeToBreakEven
      )
    };
    
    return {
      scenarios: results,
      bestScenario,
      comparison
    };
  },
  
  // Generar proyecciones
  generateProjections: async (baseInput, months) => {
    const monthly: LivestockProfitabilityOutput[] = [];
    const trends = {
      revenue: [] as number[],
      costs: [] as number[],
      profit: [] as number[]
    };
    
    // Factores de crecimiento/inflación
    const growthFactors = {
      revenue: 0.02, // 2% mensual
      feedCost: 0.015, // 1.5% inflación alimentos
      laborCost: 0.01, // 1% incremento laboral
      veterinaryCost: 0.005, // 0.5% costos veterinarios
      infrastructureCost: 0, // Sin cambio
      otherCosts: 0.01 // 1% otros costos
    };
    
    let accumulatedRevenue = 0;
    let accumulatedCosts = 0;
    
    for (let month = 1; month <= months; month++) {
      // Aplicar factores de crecimiento
      const monthInput: LivestockProfitabilityInput = {
        ...baseInput,
        revenue: baseInput.revenue * Math.pow(1 + growthFactors.revenue, month),
        feedCost: baseInput.feedCost * Math.pow(1 + growthFactors.feedCost, month),
        laborCost: baseInput.laborCost * Math.pow(1 + growthFactors.laborCost, month),
        veterinaryCost: baseInput.veterinaryCost * Math.pow(1 + growthFactors.veterinaryCost, month),
        infrastructureCost: baseInput.infrastructureCost,
        otherCosts: baseInput.otherCosts * Math.pow(1 + growthFactors.otherCosts, month)
      };
      
      const monthResult = await get().analyzeProfitability(monthInput);
      monthly.push(monthResult);
      
      // Acumular para tendencias
      accumulatedRevenue += monthResult.revenue;
      accumulatedCosts += monthResult.costs.total;
      
      trends.revenue.push(monthResult.revenue);
      trends.costs.push(monthResult.costs.total);
      trends.profit.push(monthResult.profitability);
    }
    
    // Crear resumen acumulado
    const accumulated: LivestockProfitabilityOutput = {
      ...monthly[monthly.length - 1],
      revenue: accumulatedRevenue,
      costs: {
        ...monthly[monthly.length - 1].costs,
        total: accumulatedCosts
      },
      profitability: accumulatedRevenue - accumulatedCosts,
      margin: ((accumulatedRevenue - accumulatedCosts) / accumulatedRevenue) * 100,
      roi: ((accumulatedRevenue - accumulatedCosts) / accumulatedCosts) * 100
    };
    
    return {
      monthly,
      accumulated,
      trends
    };
  },
  
  // Guardar análisis
  saveAnalysis: (analysis) => {
    set((state) => {
      const newHistory = new Map(state.analysisHistory);
      const analysisId = analysis.metadata.analysisId || `analysis-${Date.now()}`;
      newHistory.set(analysisId, analysis);
      return { analysisHistory: newHistory };
    });
  },
  
  // Obtener historial
  getAnalysisHistory: (limit = 10) => {
    const history = Array.from(get().analysisHistory.values());
    return history
      .sort((a, b) => 
        new Date(b.metadata.calculatedAt).getTime() - 
        new Date(a.metadata.calculatedAt).getTime()
      )
      .slice(0, limit);
  },
  
  // Limpiar historial
  clearAnalysisHistory: () => {
    set({ analysisHistory: new Map() });
  },
  
  // Obtener análisis por ID
  getAnalysisById: (id) => {
    return get().analysisHistory.get(id);
  },
  
  // Sugerir optimizaciones
  suggestOptimizations: (current) => {
    const suggestions = [];
    let potentialSavings = 0;
    let potentialRevenueIncrease = 0;
    
    // Analizar cada área de costo
    const totalCosts = current.costs.total;
    
    // Alimentación
    if (current.costs.feed / totalCosts > 0.5) {
      const savingPotential = current.costs.feed * 0.15; // 15% de ahorro potencial
      potentialSavings += savingPotential;
      
      suggestions.push({
        area: 'feed' as const,
        impact: savingPotential,
        description: 'Optimizar costos de alimentación',
        actions: [
          'Negociar contratos a largo plazo con proveedores',
          'Implementar sistema de pastoreo rotacional',
          'Producir forraje propio',
          'Mejorar eficiencia de conversión alimenticia'
        ]
      });
    }
    
    // Mano de obra
    if (current.costs.labor / totalCosts > 0.2) {
      const savingPotential = current.costs.labor * 0.1; // 10% de ahorro potencial
      potentialSavings += savingPotential;
      
      suggestions.push({
        area: 'labor' as const,
        impact: savingPotential,
        description: 'Mejorar eficiencia laboral',
        actions: [
          'Implementar tecnología de monitoreo automático',
          'Optimizar rutinas de trabajo',
          'Capacitar personal en mejores prácticas',
          'Evaluar automatización de procesos repetitivos'
        ]
      });
    }
    
    // Ingresos
    if (current.margin < 25) {
      const revenuePotential = current.revenue * 0.1; // 10% de incremento potencial
      potentialRevenueIncrease += revenuePotential;
      
      suggestions.push({
        area: 'revenue' as const,
        impact: revenuePotential,
        description: 'Incrementar ingresos',
        actions: [
          'Mejorar calidad del producto para premium pricing',
          'Diversificar canales de venta',
          'Implementar venta directa al consumidor',
          'Agregar valor con productos procesados'
        ]
      });
    }
    
    return {
      suggestions,
      potentialSavings,
      potentialRevenueIncrease
    };
  },
  
  // Obtener benchmarks del sector
  getBenchmarks: (type, country) => {
    // Benchmarks por tipo y país (datos de ejemplo)
    const benchmarks = {
      MX: {
        dairy: { avgMargin: 22, avgROI: 18, topMargin: 35, topROI: 28 },
        beef: { avgMargin: 18, avgROI: 15, topMargin: 30, topROI: 25 },
        mixed: { avgMargin: 20, avgROI: 16, topMargin: 32, topROI: 26 }
      },
      BR: {
        dairy: { avgMargin: 20, avgROI: 16, topMargin: 32, topROI: 26 },
        beef: { avgMargin: 25, avgROI: 20, topMargin: 38, topROI: 32 },
        mixed: { avgMargin: 22, avgROI: 18, topMargin: 35, topROI: 29 }
      },
      CO: {
        dairy: { avgMargin: 21, avgROI: 17, topMargin: 33, topROI: 27 },
        beef: { avgMargin: 19, avgROI: 16, topMargin: 31, topROI: 26 },
        mixed: { avgMargin: 20, avgROI: 16, topMargin: 32, topROI: 26 }
      },
      ES: {
        dairy: { avgMargin: 24, avgROI: 19, topMargin: 36, topROI: 30 },
        beef: { avgMargin: 20, avgROI: 17, topMargin: 32, topROI: 27 },
        mixed: { avgMargin: 22, avgROI: 18, topMargin: 34, topROI: 28 }
      }
    };
    
    const countryData = benchmarks[country];
    const typeData = countryData[type];
    
    return {
      avgMargin: typeData.avgMargin,
      avgROI: typeData.avgROI,
      avgCosts: {
        feed: 0.55, // 55% del costo total promedio
        labor: 0.20, // 20%
        veterinary: 0.10, // 10%
        infrastructure: 0.15 // 15%
      },
      topPerformers: {
        margin: typeData.topMargin,
        roi: typeData.topROI
      }
    };
  },
  
  // Calcular punto de equilibrio
  calculateBreakEven: (fixed, variable, pricePerUnit) => {
    const units = Math.ceil(fixed / (pricePerUnit - variable));
    const revenue = units * pricePerUnit;
    const days = units * 30; // Estimación simple
    
    return { units, revenue, days };
  },
  
  // Obtener último análisis
  getLastAnalysis: () => {
    return get().lastAnalysis;
  },
  
  // Verificar si el análisis está desactualizado
  isAnalysisStale: (analysisId, days) => {
    const analysis = get().analysisHistory.get(analysisId);
    if (!analysis) return true;
    
    const analysisDate = new Date(analysis.metadata.calculatedAt);
    const now = new Date();
    const diffDays = (now.getTime() - analysisDate.getTime()) / (1000 * 60 * 60 * 24);
    
    return diffDays > days;
  }
});