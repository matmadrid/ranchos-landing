// LaborCostOptimizer/exporter.ts
import { ExportFormat, LocaleConfig } from '../../../types/base';

export class LaborCostOptimizerExporter {
  export(data: any, format: ExportFormat, locale: LocaleConfig): Buffer {
    return Buffer.from(JSON.stringify(data, null, 2));
  }
}