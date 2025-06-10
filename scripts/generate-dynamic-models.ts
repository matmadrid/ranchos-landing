// scripts/generate-model-templates.ts
import * as fs from 'fs';
import * as path from 'path';

// Ya ejecutaste el script anterior, así que uso la salida como referencia
const MODELS = [
  { id: 'CFM-006', code: 'CashFlowMonitor', name: 'Monitor de Flujo de Caja', category: 'financial' },
  { id: 'APA-007', code: 'AnnualPerformanceAnalyzer', name: 'Analizador de Rendimiento Anual', category: 'financial' },
  { id: 'BEO-011', code: 'BreakEvenOptimizer', name: 'Optimizador de Punto de Equilibrio', category: 'financial' },
  { id: 'FOE-002', code: 'FeedOptimizationEngine', name: 'Motor de Optimización de Alimentación', category: 'operational' },
  { id: 'CCO-004', code: 'CarryingCapacityOptimizer', name: 'Optimizador de Capacidad de Carga', category: 'operational' },
  { id: 'DRC-005', code: 'DailyRateCalculator', name: 'Calculador de Tasa Diaria', category: 'operational' },
  { id: 'LIT-008', code: 'LivestockInventoryTracker', name: 'Rastreador de Inventario Ganadero', category: 'operational' },
  { id: 'WMS-009', code: 'WeightManagementSystem', name: 'Sistema de Gestión de Peso', category: 'operational' },
  { id: 'ICC-013', code: 'InfrastructureCostCalculator', name: 'Calculador de Costos de Infraestructura', category: 'operational' },
  { id: 'SBP-003', code: 'StrategicBudgetPlanner', name: 'Planificador de Presupuesto Estratégico', category: 'strategic' },
  { id: 'EDA-010', code: 'EquityDilutionAnalyzer', name: 'Analizador de Dilución de Capital', category: 'strategic' },
  { id: 'MPO-012', code: 'MarketPlacementOptimizer', name: 'Optimizador de Colocación en Mercado', category: 'strategic' },
  { id: 'ERA-014', code: 'ExchangeRatioAnalyzer', name: 'Analizador de Relación de Cambio', category: 'strategic' },
  { id: 'LCO-015', code: 'LaborCostOptimizer', name: 'Optimizador de Costos Laborales', category: 'human-resources' }
];

function generateIndexTemplate(model: any): string {
  return `// src/modules/dynamic-models/core/${model.category}/${model.code}/index.ts
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
  Permission
} from '../../../types/base';
import { ${model.code}Calculator } from './calculator';
import { ${model.code}Validator } from './validator';
import { ${model.code}Exporter } from './exporter';
import { ${model.code}Localizer } from './localizer';

export class ${model.code} extends BaseDynamicModel {
  // Metadata
  id = '${model.id}';
  code = '${model.code}';
  version = '1.0.0';
  name = '${model.name}';
  description = 'Implementación del ${model.name}';
  category: ModelCategory = '${model.category}';
  supportedCountries: CountryCode[] = ['CO', 'MX', 'ES', 'BR'];
  requiredPermissions: Permission[] = ['${model.category}.view', '${model.category}.calculate'];
  
  // Services
  private calculator = new ${model.code}Calculator();
  private validator = new ${model.code}Validator();
  private exporter = new ${model.code}Exporter();
  private localizer = new ${model.code}Localizer();
  
  async process(data: any, config: LocaleConfig): Promise<ProcessResult> {
    // Validate
    const validation = this.validate(data, config.regulations);
    if (!validation.isValid) {
      return { success: false, errors: validation.errors };
    }
    
    // Localize
    const localizedData = await this.localizer.localize(data, config);
    
    // Calculate
    const result = await this.calculator.calculate(localizedData, config);
    
    return {
      success: true,
      data: result,
      metadata: {
        processedAt: new Date(),
        processingTime: 0,
        version: this.version,
        locale: config.country
      }
    };
  }
  
  validate(data: any, regulations: CountryRegulations): ValidationResult {
    return this.validator.validate(data, regulations);
  }
  
  export(format: ExportFormat, locale: LocaleConfig): Buffer {
    return this.exporter.export(this.lastResult, format, locale);
  }
  
  getRequiredFields(): FieldDefinition[] {
    // TODO: Define required fields for ${model.name}
    return [];
  }
  
  getCalculations(): CalculationDefinition[] {
    // TODO: Define calculations for ${model.name}
    return [];
  }
  
  getOutputSchema(): OutputSchema {
    return {
      sections: [],
      summary: {
        title: '${model.name}',
        subtitle: 'Análisis Completo',
        keyMetrics: [],
        recommendations: false
      }
    };
  }
  
  getSpreadsheetView(): SpreadsheetConfig {
    return {
      sheets: [{
        id: 'main',
        name: 'Principal',
        columns: [],
        rows: [],
        formulas: []
      }],
      defaultSheet: 'main',
      allowedOperations: ['edit', 'export', 'print']
    };
  }
  
  getDashboardView(): DashboardConfig {
    return {
      layout: { type: 'grid', columns: 12, rows: 'auto', gap: 16 },
      widgets: []
    };
  }
  
  private lastResult: any = null;
}

export default ${model.code};`;
}

function generateTypesTemplate(model: any): string {
  return `// src/modules/dynamic-models/core/${model.category}/${model.code}/types.ts

export interface ${model.code}Input {
  // TODO: Define input data structure
  id: string;
  date: Date;
}

export interface ${model.code}Output {
  // TODO: Define output data structure
  success: boolean;
  results: any;
}

export interface ${model.code}Config {
  // TODO: Define configuration options
  locale: string;
  currency: string;
}`;
}

function generateCalculatorTemplate(model: any): string {
  return `// src/modules/dynamic-models/core/${model.category}/${model.code}/calculator.ts
import { LocaleConfig } from '../../../types/base';

export class ${model.code}Calculator {
  async calculate(data: any, config: LocaleConfig): Promise<any> {
    // TODO: Implement calculation logic for ${model.name}
    const result = {
      // Placeholder result
      calculated: true,
      value: 0
    };
    
    return result;
  }
}`;
}

function generateValidatorTemplate(model: any): string {
  return `// src/modules/dynamic-models/core/${model.category}/${model.code}/validator.ts
import { ValidationResult, ValidationError, Warning, CountryRegulations } from '../../../types/base';

export class ${model.code}Validator {
  validate(data: any, regulations: CountryRegulations): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: Warning[] = [];
    
    // TODO: Implement validation logic for ${model.name}
    
    // Example validation
    if (!data.id) {
      errors.push({
        field: 'id',
        message: 'ID es requerido',
        code: 'REQUIRED_FIELD',
        severity: 'error'
      });
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}`;
}

function generateExporterTemplate(model: any): string {
  return `// src/modules/dynamic-models/core/${model.category}/${model.code}/exporter.ts
import { ExportFormat, LocaleConfig } from '../../../types/base';

export class ${model.code}Exporter {
  export(data: any, format: ExportFormat, locale: LocaleConfig): Buffer {
    switch (format) {
      case 'excel':
        return this.exportToExcel(data, locale);
      case 'pdf':
        return this.exportToPDF(data, locale);
      case 'csv':
        return this.exportToCSV(data, locale);
      case 'json':
        return this.exportToJSON(data, locale);
      default:
        throw new Error(\`Unsupported format: \${format}\`);
    }
  }
  
  private exportToExcel(data: any, locale: LocaleConfig): Buffer {
    // TODO: Implement Excel export
    return Buffer.from('Excel data');
  }
  
  private exportToPDF(data: any, locale: LocaleConfig): Buffer {
    // TODO: Implement PDF export
    return Buffer.from('PDF data');
  }
  
  private exportToCSV(data: any, locale: LocaleConfig): Buffer {
    // TODO: Implement CSV export
    return Buffer.from('CSV data');
  }
  
  private exportToJSON(data: any, locale: LocaleConfig): Buffer {
    return Buffer.from(JSON.stringify(data, null, 2));
  }
}`;
}

function generateLocalizerTemplate(model: any): string {
  return `// src/modules/dynamic-models/core/${model.category}/${model.code}/localizer.ts
import { LocaleConfig } from '../../../types/base';

export class ${model.code}Localizer {
  async localize(data: any, config: LocaleConfig): Promise<any> {
    // TODO: Implement localization logic for ${model.name}
    const localizedData = { ...data };
    
    // Apply country-specific conversions
    switch (config.country) {
      case 'CO':
        // Colombian adaptations
        break;
      case 'MX':
        // Mexican adaptations
        break;
      case 'ES':
        // Spanish adaptations
        break;
      case 'BR':
        // Brazilian adaptations
        break;
    }
    
    return localizedData;
  }
}`;
}

function generateReadmeTemplate(model: any): string {
  return `# ${model.name}

**ID:** ${model.id}  
**Código:** ${model.code}  
**Categoría:** ${model.category}  

## Descripción

${model.name} es un modelo dinámico que [DESCRIPCIÓN DETALLADA].

## Características

- 🌍 Soporte multi-país (CO, MX, ES, BR)
- 📊 Cálculos automatizados
- 📈 Visualizaciones interactivas
- 📋 Exportación en múltiples formatos

## Uso

\`\`\`typescript
import { ${model.code} } from '@/modules/dynamic-models/core/${model.category}/${model.code}';

const model = new ${model.code}();
const result = await model.process(inputData, localeConfig);
\`\`\`

## Campos Requeridos

TODO: Documentar campos requeridos

## Cálculos Principales

TODO: Documentar cálculos

## Configuración por País

- **Colombia**: [Especificaciones CO]
- **México**: [Especificaciones MX]
- **España**: [Especificaciones ES]
- **Brasil**: [Especificaciones BR]
`;
}

// Main execution
const baseDir = 'src/modules/dynamic-models/core';

MODELS.forEach(model => {
  const categoryMap: any = {
    'financial': 'financial',
    'operational': 'operational',
    'strategic': 'strategic',
    'human-resources': 'human-resources'
  };
  
  const modelPath = path.join(baseDir, categoryMap[model.category], model.code);
  
  // Check if files are empty and generate content
  const files = [
    { name: 'index.ts', generator: generateIndexTemplate },
    { name: 'types.ts', generator: generateTypesTemplate },
    { name: 'calculator.ts', generator: generateCalculatorTemplate },
    { name: 'validator.ts', generator: generateValidatorTemplate },
    { name: 'exporter.ts', generator: generateExporterTemplate },
    { name: 'localizer.ts', generator: generateLocalizerTemplate },
    { name: 'README.md', generator: generateReadmeTemplate }
  ];
  
  files.forEach(file => {
    const filePath = path.join(modelPath, file.name);
    
    // Check if file is empty
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      if (stats.size === 0) {
        // Generate content
        const content = file.generator(model);
        fs.writeFileSync(filePath, content);
        console.log(`✅ Generated: ${model.code}/${file.name}`);
      }
    }
  });
});

console.log('\n✨ Template generation completed!');
console.log('Note: Don\'t forget to customize the TODO sections in each file.');