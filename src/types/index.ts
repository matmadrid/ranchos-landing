// RanchOS Core Types
export type CountryCode = 'CO' | 'MX' | 'ES' | 'BR';
export interface LocaleConfig {
country: CountryCode;
currency: string;
locale: string;
units: UnitSystem;
regulations: string[];
taxRules: TaxRules;
}
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  metadata?: {
    validatedAt: string;
    validatorVersion: string;
    country: string;
    regulations?: any[];
  };
}
export interface ValidationError {
code: string;
message: string;
field: string | null;
  severity: 'error' | 'warning' | 'info';
}
export interface ValidationWarning {
code: string;
message: string;
field: string | null;
}
export type ExportFormat = 'xlsx' | 'pdf' | 'csv' | 'json';
export interface ModelMetadata {
id: string;
version: string;
name: string;
description: string;
supportedCountries: CountryCode[];
lastUpdated: string;
}
export interface ProcessingResult<T> {
success: boolean;
data?: T;
errors?: ValidationError[];
warnings?: ValidationWarning[];
metadata: ModelMetadata;
processingTime?: number;
cached?: boolean;
traceId: string;
}
export interface UnitSystem {
weight: 'kg' | 'lb' | 'arroba';
area: 'hectare' | 'acre';
volume: 'liter' | 'gallon';
temperature: 'celsius' | 'fahrenheit';
}
export interface TaxRules {
vatRate: number;
incomeTaxRate: number;
specialRates: Record<string, number>;
}
// Specific types for LivestockProfitabilityEngine
export interface LivestockProfitabilityInput {
revenue: number;
feedCost: number;
laborCost: number;
veterinaryCost: number;
infrastructureCost: number;
otherCosts: number;
animalCount: number;
operationType?: 'dairy' | 'beef' | 'mixed';
averageWeight: number;
mortalityRate: number;
currency: string;
locale?: string;
weightUnit: string;
weights: number[];
prices: number[];
}
export interface LivestockProfitabilityOutput {
revenue: number;
costs: CostStructure;
profitability: number;
margin: number;
breakEvenPoint: BreakEvenAnalysis;
roi: number;
projections: Projection[];
recommendations: string[];
metadata: {
calculatedAt: Date;
locale: string;
currency: string;
  analysisId?: string;
  version?: string;
};
}
export interface CostStructure {
feed: number;
labor: number;
veterinary: number;
infrastructure: number;
other: number;
total: number;
}
export interface BreakEvenAnalysis {
units: number;
revenue: number;
timeToBreakEven: number;
}
export interface Projection {
period: string;
value: number;
confidence: number;
}

// Exportar modelos
export type {
  Animal,
  Cattle,
  MilkProduction,
  AnimalSex,
  AnimalStatus,
  HealthStatus,
  MilkPeriod,
  MilkQuality
} from './models';
