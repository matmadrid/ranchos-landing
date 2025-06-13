// src/types/models.ts
/**
 * Modelos de dominio para RanchOS
 * Complementa el sistema de tipos core en index.ts
 */

import type { CountryCode, ValidationResult, UnitSystem } from './index';

// ===== MODELOS DE DOMINIO =====

// Usuario con soporte multi-país
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  phone?: string;
  location?: string;
  countryCode: CountryCode; // Integración con sistema de países
  preferredUnits?: UnitSystem;
  createdAt: string;
  updatedAt?: string;
}

// Rancho con validación
export interface Ranch {
  id: string;
  name: string;
  location: string;
  countryCode: CountryCode;
  size: number;
  sizeUnit: 'hectare' | 'acre'; // Alineado con UnitSystem
  type?: RanchType;
  description?: string;
  isActive?: boolean;
  validationStatus?: ValidationResult;
  createdAt: string;
  updatedAt?: string;
}

// Animal con sistema de unidades flexible
export interface Animal {
  id: string;
  type?: string;
  tag: string;
  name?: string;
  tagNumber?: string;
  breed?: string;
  sex: AnimalSex;
  birthDate?: string;
  dateOfBirth?: string;
  weight?: number;
  weightUnit?: 'kg' | 'lb' | 'arroba'; // Alineado con UnitSystem
  status?: AnimalStatus;
  healthStatus?: HealthStatus;
  notes?: string;
  ranchId: string;
  countrySpecificData?: Record<string, any>; // Datos específicos por país
  createdAt: string;
  updatedAt?: string;
}

// Ganado extendido con campos financieros
export interface Cattle extends Animal {
  location?: string;
  purchasePrice?: number;
  purchaseCurrency?: string; // Moneda de compra
  purchaseDate?: string;
  motherId?: string;
  fatherId?: string;
  // Integración con LivestockProfitabilityEngine
  profitabilityData?: {
    feedCost: number;
    veterinaryCost: number;
    projectedRevenue: number;
  };
}

// Producción de leche con unidades flexibles
export interface MilkProduction {
  id: string;
  cattleId: string;
  date: string;
  quantity: number;
  unit: 'liter' | 'gallon'; // Alineado con UnitSystem
  period: MilkPeriod;
  quality?: MilkQuality;
  notes?: string;
  // Datos para análisis de rentabilidad
  marketPrice?: number;
  currency?: string;
  createdAt: string;
  updatedAt?: string;
}

// Perfil con localización
export interface Profile {
  name: string;
  email: string;
  ranch: string;
  location: string;
  countryCode: CountryCode;
  preferredLocale: string;
  preferredCurrency: string;
}

// ===== TIPOS Y ENUMS =====

export type HealthStatus = 'excellent' | 'good' | 'fair' | 'poor';
export type AnimalStatus = 'healthy' | 'sick' | 'pregnant' | 'sold' | 'quarantine' | 'deceased';
export type AnimalSex = 'male' | 'female';
export type RanchType = 'dairy' | 'beef' | 'mixed' | 'experimental';
export type MilkPeriod = 'morning' | 'evening' | 'night';
export type MilkQuality = 'A' | 'B' | 'C' | 'Premium';

// ===== CONSTANTES CON LOCALIZACIÓN =====

export const HEALTH_STATUS_OPTIONS = [
  { value: 'excellent' as HealthStatus, label: 'Excelente', color: 'green', score: 100 },
  { value: 'good' as HealthStatus, label: 'Buena', color: 'blue', score: 75 },
  { value: 'fair' as HealthStatus, label: 'Regular', color: 'yellow', score: 50 },
  { value: 'poor' as HealthStatus, label: 'Mala', color: 'red', score: 25 }
] as const;

export const ANIMAL_STATUS_OPTIONS = [
  { value: 'healthy' as AnimalStatus, label: 'Saludable', icon: '✅', priority: 1 },
  { value: 'sick' as AnimalStatus, label: 'Enfermo', icon: '🤒', priority: 5 },
  { value: 'pregnant' as AnimalStatus, label: 'Preñada', icon: '🤰', priority: 3 },
  { value: 'quarantine' as AnimalStatus, label: 'Cuarentena', icon: '⚠️', priority: 4 },
  { value: 'sold' as AnimalStatus, label: 'Vendido', icon: '💰', priority: 2 }
,
  { value: 'deceased' as AnimalStatus, label: 'Fallecido', icon: '✝️', priority: 6 }
] as const;

// Razas por país
export const BREEDS_BY_COUNTRY: Record<CountryCode, readonly string[]> = {
  MX: ['Charolais', 'Simmental', 'Brahman', 'Suizo', 'Cebu', 'Criollo'],
  CO: ['Brahman', 'Normando', 'Cebú', 'Romosinuano', 'BON', 'Sanmartinero'],
  BR: ['Nelore', 'Gir', 'Guzerá', 'Brahman', 'Tabapuã', 'Girolando'],
  ES: ['Rubia Gallega', 'Asturiana', 'Retinta', 'Avileña', 'Morucha', 'Limusina']
} as const;

// ===== TYPE GUARDS MEJORADOS =====

export function isAnimal(obj: any): obj is Animal {
  return obj && 
    typeof obj.id === 'string' &&
    typeof obj.tag === 'string' &&
    typeof obj.sex === 'string' &&
    ['male', 'female'].includes(obj.sex) &&
    typeof obj.ranchId === 'string';
}

export function isCattle(obj: any): obj is Cattle {
  return isAnimal(obj) && 
    ('location' in obj || 'purchasePrice' in obj || 'motherId' in obj);
}

export function hasValidationErrors(result: ValidationResult): boolean {
  return result.errors.length > 0;
}

// ===== UTILIDADES DE CONVERSIÓN =====

export function convertWeight(value: number, from: 'kg' | 'lb' | 'arroba', to: 'kg' | 'lb' | 'arroba'): number {
  const toKg: Record<typeof from, number> = {
    kg: 1,
    lb: 0.453592,
    arroba: 15
  };
  
  const fromKg: Record<typeof to, number> = {
    kg: 1,
    lb: 2.20462,
    arroba: 0.0666667
  };
  
  return value * toKg[from] * fromKg[to];
}

export function getBreedsByCountry(countryCode: CountryCode): readonly string[] {
  return BREEDS_BY_COUNTRY[countryCode] || [];
}

// ===== INTERFACES PARA INTEGRACIÓN CON MOTORES =====

// Input para análisis de rentabilidad de animal individual
export interface AnimalProfitabilityInput {
  animal: Animal | Cattle;
  feedCostPerDay: number;
  veterinaryCostPerMonth: number;
  projectedSalePrice: number;
  currency: string;
  weightUnit: 'kg' | 'lb' | 'arroba';
}

// Resultado del análisis
export interface AnimalProfitabilityResult {
  animalId: string;
  currentValue: number;
  projectedProfit: number;
  roi: number;
  daysToBreakEven: number;
  recommendations: string[];
}