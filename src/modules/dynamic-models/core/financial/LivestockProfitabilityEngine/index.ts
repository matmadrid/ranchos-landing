// src/modules/dynamic-models/core/financial/LivestockProfitabilityEngine/index.ts
import { 
  BaseDynamicModel, 
  ProcessResult, 
  ValidationResult, 
  LocaleConfig, 
  CountryRegulations,
  ExportFormat,
  FieldDefinition,
  CalculationDefinition,
  OutputSchema,
  SpreadsheetConfig,
  DashboardConfig,
  ModelCategory,
  CountryCode,
  Permission,
  DataSchema
} from '../../../types/base';

import { LivestockData, ProfitabilityResult } from './types';
import { LivestockCalculator } from './calculator';
import { LivestockValidator } from './validator';
import { LivestockExporter } from './exporter';
import { LivestockLocalizer } from './localizer';

export class LivestockProfitabilityEngine extends BaseDynamicModel {
  // Metadata
  id = 'LPE-001';
  code = 'LivestockProfitabilityEngine';
  version = '2.0.0';
  name = 'Motor de Rentabilidad Pecuaria';
  description = 'Análisis integral de rentabilidad pecuaria con soporte multi-país, proyecciones financieras y optimización automática';
  category = 'financial' as const;
  supportedCountries = ['CO', 'MX', 'ES', 'BR'];
  requiredPermissions = ['financial.view', 'financial.calculate'];
  
  // Services
  private calculator = new LivestockCalculator();
  private validator = new LivestockValidator();
  private exporter = new LivestockExporter();
  private localizer = new LivestockLocalizer();
  
  async process(data: LivestockData, config: LocaleConfig): Promise<ProcessResult> {
    const startTime = Date.now();
    
    try {
      // 1. Validate input data
      const validation = await this.validate(data, config);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.errors?.join(', ') || 'Datos inválidos',
          metadata: {
            timestamp: new Date(),
            processingTime: Date.now() - startTime,
            version: this.version,
            locale: config.country
          }
        };
      }
      
      // 2. Localize data (convert units, currencies, etc.)
      const localizedData = await this.localizer.localize(data, config);
      
      // 3. Perform calculations
      const result = await this.calculator.calculate(localizedData, config);
      
      // 4. Apply country-specific adjustments
      const adjustedResult = await this.applyCountryAdjustments(result, config);
      
      // 5. Generate insights and recommendations
      const enrichedResult = await this.enrichWithInsights(adjustedResult, config);
      
      return {
        success: true,
        data: enrichedResult,
        metadata: {
          timestamp: new Date(),
          processingTime: Date.now() - startTime,
          version: this.version,
          locale: config.country
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        metadata: {
          timestamp: new Date(),
          processingTime: Date.now() - startTime,
          version: this.version,
          locale: config.country
        }
      };
    }
  }
  
  getRequiredFields(): FieldDefinition[] {
    return [
      {
        name: 'initialInventory',
        label: 'Inventario Inicial',
        type: 'number',
        required: true,
        validation: { min: 0 },
        unit: 'cabezas',
        helpText: 'Número de animales al inicio del período'
      },
      {
        name: 'averageWeight',
        label: 'Peso Promedio',
        type: 'number',
        required: true,
        validation: { min: 0, max: 1000 },
        unit: 'kg',
        helpText: 'Peso promedio del ganado'
      },
      {
        name: 'purchasePrice',
        label: 'Precio de Compra',
        type: 'currency',
        required: true,
        validation: { min: 0 },
        helpText: 'Precio por kilogramo o arroba'
      },
      {
        name: 'salePrice',
        label: 'Precio de Venta',
        type: 'currency',
        required: true,
        validation: { min: 0 },
        helpText: 'Precio estimado de venta'
      },
      {
        name: 'feedCostPerDay',
        label: 'Costo de Alimentación Diario',
        type: 'currency',
        required: true,
        validation: { min: 0 },
        helpText: 'Costo promedio de alimentación por animal por día'
      },
      {
        name: 'periodDays',
        label: 'Período (días)',
        type: 'number',
        required: true,
        validation: { min: 1, max: 730 },
        defaultValue: 365,
        helpText: 'Duración del período de análisis'
      },
      {
        name: 'mortalityRate',
        label: 'Tasa de Mortalidad',
        type: 'percentage',
        required: false,
        defaultValue: 2,
        validation: { min: 0, max: 100 },
        helpText: 'Porcentaje estimado de mortalidad'
      },
      {
        name: 'financingRate',
        label: 'Tasa de Financiamiento',
        type: 'percentage',
        required: false,
        defaultValue: 0,
        validation: { min: 0, max: 100 },
        helpText: 'Tasa de interés anual si hay financiamiento'
      }
    ];
  }
  
  getCalculations(): CalculationDefinition[] {
    return [
      {
        id: 'grossRevenue',
        name: 'Ingreso Bruto',
        formula: '(finalInventory * averageWeight * salePrice) - mortality',
        inputs: ['finalInventory', 'averageWeight', 'salePrice', 'mortality'],
        output: 'grossRevenue',
        unit: 'currency',
        precision: 2
      },
      {
        id: 'totalCosts',
        name: 'Costos Totales',
        formula: 'purchaseCosts + feedCosts + operationalCosts + financingCosts',
        inputs: ['purchaseCosts', 'feedCosts', 'operationalCosts', 'financingCosts'],
        output: 'totalCosts',
        unit: 'currency',
        precision: 2
      },
      {
        id: 'netProfit',
        name: 'Utilidad Neta',
        formula: 'grossRevenue - totalCosts - taxes',
        inputs: ['grossRevenue', 'totalCosts', 'taxes'],
        output: 'netProfit',
        unit: 'currency',
        precision: 2
      },
      {
        id: 'profitMargin',
        name: 'Margen de Utilidad',
        formula: '(netProfit / grossRevenue) * 100',
        inputs: ['netProfit', 'grossRevenue'],
        output: 'profitMargin',
        unit: 'percentage',
        precision: 2
      },
      {
        id: 'roi',
        name: 'Retorno sobre Inversión',
        formula: '(netProfit / totalInvestment) * 100',
        inputs: ['netProfit', 'totalInvestment'],
        output: 'roi',
        unit: 'percentage',
        precision: 2
      },
      {
        id: 'breakEvenPoint',
        name: 'Punto de Equilibrio',
        formula: 'fixedCosts / (salePrice - variableCostPerUnit)',
        inputs: ['fixedCosts', 'salePrice', 'variableCostPerUnit'],
        output: 'breakEvenPoint',
        unit: 'units',
        precision: 0
      }
    ];
  }
  
  getSpreadsheetView(): SpreadsheetConfig {
    return {
      sheets: [
        {
          id: 'inputs',
          name: 'Datos de Entrada',
          columns: this.getRequiredFields().map(field => ({
            id: field.name,
            header: field.label,
            type: 'number',
            width: 120,
            editable: true,
            validation: field.validation
          })),
          rows: [],
          formulas: []
        },
        {
          id: 'calculations',
          name: 'Cálculos',
          columns: [],
          rows: [],
          formulas: this.getCalculations().map(calc => ({
            id: calc.id,
            formula: calc.formula,
            dependencies: calc.inputs
          }))
        },
        {
          id: 'results',
          name: 'Resultados',
          columns: [],
          rows: [],
          formulas: []
        }
      ],
      defaultSheet: 'inputs',
      allowedOperations: ['edit', 'export', 'print', 'share']
    };
  }
  
  getDashboardView(): DashboardConfig {
    return {
      layout: {
        type: 'grid',
        columns: 12,
        rows: 'auto',
        gap: 16
      },
      widgets: [
        {
          id: 'profitCard',
          type: 'metric-card',
          title: 'Utilidad Neta',
          dataKey: 'netProfit',
          span: { columns: 4, rows: 1 },
          format: 'currency',
          trend: true,
          sparkline: true
        },
        {
          id: 'marginCard',
          type: 'metric-card',
          title: 'Margen de Utilidad',
          dataKey: 'profitMargin',
          span: { columns: 4, rows: 1 },
          format: 'percentage',
          color: 'conditional'
        },
        {
          id: 'roiCard',
          type: 'metric-card',
          title: 'ROI',
          dataKey: 'roi',
          span: { columns: 4, rows: 1 },
          format: 'percentage',
          benchmark: 15
        },
        {
          id: 'cashFlowChart',
          type: 'chart',
          title: 'Flujo de Caja Mensual',
          chartType: 'area',
          dataKey: 'monthlyData.cashFlow',
          span: { columns: 8, rows: 2 },
          interactive: true
        },
        {
          id: 'costBreakdown',
          type: 'chart',
          title: 'Desglose de Costos',
          chartType: 'donut',
          dataKey: 'costs',
          span: { columns: 4, rows: 2 },
          showLegend: true
        },
        {
          id: 'scenarioAnalysis',
          type: 'scenario-comparison',
          title: 'Análisis de Escenarios',
          scenarios: ['pessimistic', 'realistic', 'optimistic'],
          span: { columns: 12, rows: 2 }
        },
        {
          id: 'recommendations',
          type: 'insights',
          title: 'Recomendaciones',
          dataKey: 'insights',
          span: { columns: 6, rows: 2 },
          priority: true
        },
        {
          id: 'alerts',
          type: 'alerts',
          title: 'Alertas',
          dataKey: 'alerts',
          span: { columns: 6, rows: 2 },
          severity: ['high', 'medium']
        }
      ],
      refreshInterval: 300000 // 5 minutes
    };
  }
  
  // Private helper methods
  private async applyCountryAdjustments(result: ProfitabilityResult, config: LocaleConfig): Promise<ProfitabilityResult> {
    // Apply country-specific tax rules, regulations, etc.
    const adjusted = { ...result };
    
    // Por ahora, cálculo simplificado de impuestos
    const taxRate = config.country === 'CO' ? 0.19 : 
                   config.country === 'MX' ? 0.16 :
                   config.country === 'ES' ? 0.21 :
                   config.country === 'BR' ? 0.15 : 0.15;
    
    if (adjusted.totalRevenue || adjusted.grossRevenue) {
      const revenue = adjusted.totalRevenue || adjusted.grossRevenue || 0;
      adjusted.taxes = revenue * taxRate;
    }
    
    return adjusted;
  }
  
  private async enrichWithInsights(result: ProfitabilityResult, config: LocaleConfig): Promise<ProfitabilityResult> {
    // Por ahora, retornar el resultado sin cambios
    // En el futuro, aquí se agregarían insights generados por IA
    return result;
  }
  
  // Insight generation
  private async generateInsights(result: ProfitabilityResult, config: LocaleConfig): Promise<any[]> {
    // AI-powered insight generation
    return [];
  }
  
  private async generateRecommendations(result: ProfitabilityResult, config: LocaleConfig): Promise<any[]> {
    // Generate actionable recommendations
    return [];
  }
  
  private async generateAlerts(result: ProfitabilityResult, config: LocaleConfig): Promise<any[]> {
    // Generate alerts based on thresholds
    return [];
  }
  
  // Métodos requeridos por BaseDynamicModel
  async validate(data: any, config: LocaleConfig): Promise<ValidationResult> {
    const result = this.validator.validate(data, config);
    
    // Convertir isValid a valid si es necesario
    return {
      valid: 'valid' in result ? result.valid : (result as any).isValid || false,
      errors: result.errors,
    };
  }
  
  getInputSchema(): DataSchema {
    // Convertir los campos existentes a DataSchema
    return {
      type: 'object',
      required: this.getRequiredFields()
        .filter(f => f.required)
        .map(f => f.name),
      properties: this.getRequiredFields().reduce((acc, field) => {
        acc[field.name] = {
          type: 'number',
          ...field.validation
        };
        return acc;
      }, {} as Record<string, any>)
    };
  }
  
  async export(result: any, format: ExportFormat, locale: LocaleConfig): Promise<Buffer> {
    return this.exporter.export(result, format, locale);
  }
  
  getOutputSchema(): DataSchema {
    return {
      type: 'object',
      properties: {
        netProfit: { type: 'number' },
        profitMargin: { type: 'number' },
        roi: { type: 'number' },
        totalRevenue: { type: 'number' },
        grossRevenue: { type: 'number' },
        totalCosts: { type: 'number' },
        taxes: { type: 'number' }
      }
    };
  }
}

// Export as default
export default LivestockProfitabilityEngine;