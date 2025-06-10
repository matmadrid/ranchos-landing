// src/modules/dynamic-models/types/base.ts

// TEMPORAL - Solo para compilar (todos los tipos que faltan como 'any')
export type SpreadsheetConfig = any;
export type DashboardConfig = any;
export type ModelCategory = any;
export type CountryCode = any;
export type CurrencyCode = any;
export type UnitSystem = any;
export type ProcessingOptions = any;
export type VisualizationConfig = any;
export type ReportConfig = any;
export type AnalysisConfig = any;
export type WorksheetDefinition = any;
export type CellDefinition = any;
export type FormulaDefinition = any;
export type ValidationRule = any;
export type ConditionalFormatting = any;
export type DataSource = any;
export type DataConnection = any;
export type ExportOptions = any;
export type ImportOptions = any;
export type UserPermissions = any;
export type AuditLog = any;
export type SystemConfig = any;
export type Permission = any; // AGREGADO

// ===== LOCALE AND CONFIGURATION =====
export interface LocaleConfig {
  country: 'MX' | 'BR' | 'CO' | 'ES';
  language: string;
  currency: string;
  dateFormat?: string;
  numberFormat?: string | {
    locale: string;
    options?: Intl.NumberFormatOptions;
  };
  units?: 'metric' | 'imperial' | 'mixed';
  taxRules?: {
    incomeTax?: { rate: number; name: string; code?: string };
    vatRate?: { rate: number; name: string; code?: string };
    localTaxes?: { rate: number; name: string; code?: string };
    specialTaxes?: Array<{ rate: number; name: string; type: string; code?: string; description?: string }>;
  };
  regulations?: {
    taxRates?: any;
    requiredDocuments?: any;
    complianceRules?: string[];
    certificationBodies?: string[];
    reportingRequirements?: string[];
  };
}

export type ExportFormat = 'excel' | 'pdf' | 'csv' | 'json';

// ===== RESULT TYPES =====
export interface ProcessResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: {
    processingTime: number;
    timestamp: Date;
    version: string;
    [key: string]: any;
  };
}

export interface ValidationResult {
  valid: boolean;
  errors?: string[];
  warnings?: string[];
}

export interface CalculationResult<T = any> extends ProcessResult<T> {
  calculations?: Record<string, any>;
  formulas?: Record<string, string>;
}

// ===== SCHEMA TYPES =====
export interface DataSchema {
  type: string;
  required?: string[];
  properties?: Record<string, any>;
  additionalProperties?: boolean;
}

export interface InputSchema extends DataSchema {
  title?: string;
  description?: string;
  examples?: any[];
}

export interface OutputSchema extends DataSchema {
  title?: string;
  description?: string;
  examples?: any[];
}

export interface SchemaProperty {
  type: string;
  description?: string;
  required?: boolean;
  default?: any;
  enum?: any[];
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  format?: string;
  items?: SchemaProperty;
  properties?: Record<string, SchemaProperty>;
}

// ===== BASE CLASSES =====
export abstract class BaseDynamicModel<TInput = any, TOutput = any> {
  abstract id: string;
  abstract name: string;
  abstract description: string;
  abstract version: string;
  abstract supportedCountries: string[];
  abstract category: string;
  
  abstract validate(data: TInput, config: LocaleConfig): Promise<ValidationResult>;
  abstract process(data: TInput, config: LocaleConfig): Promise<ProcessResult<TOutput>>;
  abstract export(result: TOutput, format: ExportFormat, locale: LocaleConfig): Promise<Buffer>;
  
  abstract getInputSchema(): DataSchema;
  abstract getOutputSchema(): DataSchema;
  abstract getDashboardView(): DashboardConfig;
  abstract getRequiredFields(): FieldDefinition[];
  abstract getCalculations(): CalculationDefinition[];
  abstract getSpreadsheetView(): SpreadsheetConfig;
  
  // Optional methods
  getName?(): string;
  getVersion?(): string;
  getSupportedCountries?(): string[];
  getCategory?(): string;
}

// ===== ENGINE INTERFACES =====
export interface FinancialEngine<TInput, TOutput> {
  name: string;
  version: string;
  supportedCountries: string[];
  category: 'agricultural' | 'industrial' | 'commercial' | 'service';
  
  getName(): string;
  getVersion(): string;
  getSupportedCountries(): string[];
  getCategory(): string;
  
  validate(data: TInput, config: LocaleConfig): Promise<{ valid: boolean; errors?: string[] }>;
  calculate(data: TInput, config: LocaleConfig): Promise<any>;
  export(result: TOutput, format: ExportFormat, locale: LocaleConfig): Promise<Buffer>;
  
  getInputSchema(): any;
  getOutputSchema(): any;
}

// ===== COMMON DATA TYPES =====
export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface TimeSeriesData {
  date: Date;
  value: number;
  label?: string;
}

export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    [key: string]: any;
  }>;
}

// ===== FINANCIAL TYPES =====
export interface FinancialMetrics {
  revenue: number;
  costs: number;
  profit: number;
  margin: number;
  roi?: number;
}

export interface TaxCalculation {
  subtotal: number;
  taxAmount: number;
  total: number;
  taxBreakdown?: Record<string, number>;
}

export interface FinancialReport {
  title: string;
  period: DateRange;
  metrics: FinancialMetrics;
  sections?: ReportSection[];
  summary?: string;
  recommendations?: string[];
}

export interface AnalysisResult {
  analysis: string;
  findings: string[];
  recommendations: string[];
  metrics?: Record<string, any>;
  charts?: ChartData[];
}

// ===== REPORT TYPES =====
export interface ReportSection {
  title: string;
  content: any;
  type: 'text' | 'table' | 'chart' | 'list';
  order?: number;
}

export interface Report {
  title: string;
  subtitle?: string;
  date: Date;
  sections: ReportSection[];
  metadata?: Record<string, any>;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description?: string;
  sections: ReportSection[];
  defaultConfig?: any;
}

// ===== FORM AND UI TYPES =====
export interface DynamicFormConfig {
  fields: FieldDefinition[];
  layout?: 'vertical' | 'horizontal' | 'grid';
  sections?: Array<{
    title: string;
    fields: string[];
  }>;
  validation?: Record<string, any>;
}

export interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'doughnut' | 'radar' | 'scatter';
  data: ChartData;
  options?: any;
}

export interface TableConfig {
  columns: Array<{
    key: string;
    title: string;
    type?: string;
    format?: string;
    sortable?: boolean;
    filterable?: boolean;
  }>;
  data: any[];
  pagination?: boolean;
  pageSize?: number;
}

// ===== UTILITY TYPES =====
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Nullable<T> = T | null;

export type Optional<T> = T | undefined;

// ===== MODEL REGISTRY =====
export interface ModelInfo {
  id: string;
  name: string;
  version: string;
  category: string;
  supportedCountries: string[];
  description?: string;
  tags?: string[];
}

export interface ModelRegistry {
  register(model: BaseDynamicModel, info: ModelInfo): void;
  get(id: string): BaseDynamicModel | undefined;
  list(filter?: Partial<ModelInfo>): ModelInfo[];
}

// ===== COUNTRY REGULATIONS =====
export interface CountryRegulations {
  country: string;
  taxRates: Array<{
    type: string;
    rate: number;
    description?: string;
  }>;
  requiredDocuments: string[];
  complianceRules: string[];
  reportingRequirements: string[];
  certificationBodies?: string[];
}

// ===== FIELD DEFINITIONS =====
export interface FieldDefinition {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object' | 'currency' | 'percentage';
  label: string;
  required?: boolean;
  defaultValue?: any;
  validation?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    enum?: any[];
    custom?: (value: any) => boolean | string;
  };
  description?: string;
  placeholder?: string;
  helpText?: string;
  group?: string;
  order?: number;
  dependsOn?: string[];
  conditional?: (data: any) => boolean;
  unit?: string;
}

// ===== CALCULATION DEFINITIONS =====
export interface CalculationDefinition {
  id: string;
  name: string;
  formula: string;
  inputs: string[];
  output: string;
  description?: string;
  unit?: string;
  precision?: number;
  rounding?: 'up' | 'down' | 'nearest';
  validation?: {
    min?: number;
    max?: number;
  };
}

// ===== ERROR TYPES =====
export class ValidationError extends Error {
  constructor(public errors: string[]) {
    super(errors.join(', '));
    this.name = 'ValidationError';
  }
}

export class ProcessingError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'ProcessingError';
  }
}

export class ExportError extends Error {
  constructor(message: string, public format?: ExportFormat) {
    super(message);
    this.name = 'ExportError';
  }
}