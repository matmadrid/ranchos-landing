// scripts/generate-templates.js
const fs = require('fs');
const path = require('path');

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

console.log('🚀 Generando templates para modelos vacíos...\n');

let filesGenerated = 0;

MODELS.forEach(model => {
  const modelPath = path.join('src/modules/dynamic-models/core', model.category, model.code);
  
  // index.ts
  const indexPath = path.join(modelPath, 'index.ts');
  if (fs.existsSync(indexPath) && fs.statSync(indexPath).size === 0) {
    const indexContent = `// ${model.code}/index.ts
import { BaseDynamicModel, ProcessResult, ValidationResult, LocaleConfig, CountryRegulations, ExportFormat, FieldDefinition, CalculationDefinition, OutputSchema, SpreadsheetConfig, DashboardConfig, ModelCategory, CountryCode, Permission } from '../../../types/base';

export class ${model.code} extends BaseDynamicModel {
  id = '${model.id}';
  code = '${model.code}';
  version = '1.0.0';
  name = '${model.name}';
  description = '${model.name} - Implementación base';
  category: ModelCategory = '${model.category}';
  supportedCountries: CountryCode[] = ['CO', 'MX', 'ES', 'BR'];
  requiredPermissions: Permission[] = ['${model.category}.view', '${model.category}.calculate'];

  async process(data: any, config: LocaleConfig): Promise<ProcessResult> {
    return { success: true, data: {}, metadata: { processedAt: new Date(), processingTime: 0, version: this.version, locale: config.country } };
  }

  validate(data: any, regulations: CountryRegulations): ValidationResult {
    return { isValid: true, errors: [], warnings: [] };
  }

  export(format: ExportFormat, locale: LocaleConfig): Buffer {
    return Buffer.from('');
  }

  getRequiredFields(): FieldDefinition[] { return []; }
  getCalculations(): CalculationDefinition[] { return []; }
  getOutputSchema(): OutputSchema { return { sections: [], summary: { title: '${model.name}', subtitle: '', keyMetrics: [], recommendations: false } }; }
  getSpreadsheetView(): SpreadsheetConfig { return { sheets: [], defaultSheet: 'main', allowedOperations: ['edit'] }; }
  getDashboardView(): DashboardConfig { return { layout: { type: 'grid', columns: 12, rows: 'auto', gap: 16 }, widgets: [] }; }
}

export default ${model.code};`;
    fs.writeFileSync(indexPath, indexContent);
    console.log(`✅ ${model.code}/index.ts`);
    filesGenerated++;
  }

  // types.ts
  const typesPath = path.join(modelPath, 'types.ts');
  if (fs.existsSync(typesPath) && fs.statSync(typesPath).size === 0) {
    const typesContent = `// ${model.code}/types.ts
export interface ${model.code}Input {
  // TODO: Define input structure
}

export interface ${model.code}Output {
  // TODO: Define output structure
}`;
    fs.writeFileSync(typesPath, typesContent);
    console.log(`✅ ${model.code}/types.ts`);
    filesGenerated++;
  }

  // calculator.ts
  const calcPath = path.join(modelPath, 'calculator.ts');
  if (fs.existsSync(calcPath) && fs.statSync(calcPath).size === 0) {
    const calcContent = `// ${model.code}/calculator.ts
import { LocaleConfig } from '../../../types/base';

export class ${model.code}Calculator {
  async calculate(data: any, config: LocaleConfig): Promise<any> {
    // TODO: Implement calculations
    return {};
  }
}`;
    fs.writeFileSync(calcPath, calcContent);
    console.log(`✅ ${model.code}/calculator.ts`);
    filesGenerated++;
  }

  // validator.ts
  const validatorPath = path.join(modelPath, 'validator.ts');
  if (fs.existsSync(validatorPath) && fs.statSync(validatorPath).size === 0) {
    const validatorContent = `// ${model.code}/validator.ts
import { ValidationResult, CountryRegulations } from '../../../types/base';

export class ${model.code}Validator {
  validate(data: any, regulations: CountryRegulations): ValidationResult {
    return { isValid: true, errors: [], warnings: [] };
  }
}`;
    fs.writeFileSync(validatorPath, validatorContent);
    console.log(`✅ ${model.code}/validator.ts`);
    filesGenerated++;
  }

  // exporter.ts
  const exporterPath = path.join(modelPath, 'exporter.ts');
  if (fs.existsSync(exporterPath) && fs.statSync(exporterPath).size === 0) {
    const exporterContent = `// ${model.code}/exporter.ts
import { ExportFormat, LocaleConfig } from '../../../types/base';

export class ${model.code}Exporter {
  export(data: any, format: ExportFormat, locale: LocaleConfig): Buffer {
    return Buffer.from(JSON.stringify(data, null, 2));
  }
}`;
    fs.writeFileSync(exporterPath, exporterContent);
    console.log(`✅ ${model.code}/exporter.ts`);
    filesGenerated++;
  }

  // localizer.ts
  const localizerPath = path.join(modelPath, 'localizer.ts');
  if (fs.existsSync(localizerPath) && fs.statSync(localizerPath).size === 0) {
    const localizerContent = `// ${model.code}/localizer.ts
import { LocaleConfig } from '../../../types/base';

export class ${model.code}Localizer {
  async localize(data: any, config: LocaleConfig): Promise<any> {
    return data;
  }
}`;
    fs.writeFileSync(localizerPath, localizerContent);
    console.log(`✅ ${model.code}/localizer.ts`);
    filesGenerated++;
  }

  // README.md
  const readmePath = path.join(modelPath, 'README.md');
  if (fs.existsSync(readmePath) && fs.statSync(readmePath).size === 0) {
    const readmeContent = `# ${model.name}

**ID:** ${model.id}  
**Código:** ${model.code}  
**Categoría:** ${model.category}

## Descripción
${model.name} - Pendiente de implementación completa.

## TODO
- [ ] Implementar lógica de cálculo
- [ ] Definir campos requeridos
- [ ] Agregar validaciones
- [ ] Configurar exportación
`;
    fs.writeFileSync(readmePath, readmeContent);
    console.log(`✅ ${model.code}/README.md`);
    filesGenerated++;
  }
});

console.log(`\n✨ Generación completada!`);
console.log(`📊 Archivos generados: ${filesGenerated}`);
console.log(`\n💡 Nota: Los archivos generados contienen implementaciones básicas.`);
console.log(`   Necesitarás personalizar cada modelo según sus requisitos específicos.`);