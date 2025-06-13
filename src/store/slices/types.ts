// src/store/slices/types.ts
/**
 * Tipos compartidos entre todos los slices
 * Mantiene consistencia y evita duplicación
 */

import type { CountryCode, UnitSystem } from '@/types';

// === MODELOS DE DOMINIO ===

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  phone?: string;
  location?: string;
  countryCode?: CountryCode;
  preferredUnits?: UnitSystem;
  role?: 'owner' | 'manager' | 'employee' | 'viewer';
  permissions?: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface Profile {
  name: string;
  email: string;
  ranch: string;
  location: string;
  countryCode: CountryCode;
  bio?: string;
  preferences?: {
    notifications: boolean;
    newsletter: boolean;
    language: string;
    theme: 'light' | 'dark' | 'auto';
  };
}

export interface Ranch {
  id: string;
  name: string;
  location: string;
  countryCode: CountryCode;
  coordinates?: {
    lat: number;
    lng: number;
  };
  size: number;
  sizeUnit: 'hectare' | 'acre';
  type?: 'dairy' | 'beef' | 'mixed';
  description?: string;
  isActive?: boolean;
  
  // Capacidad y ocupación
  capacity?: {
    total: number;
    occupied: number;
    available: number;
  };
  
  // Métricas
  metrics?: {
    totalAnimals: number;
    healthyAnimals: number;
    sickAnimals: number;
    pregnantAnimals: number;
    productionAvg: number;
  };
  
  // Metadata
  tags?: string[];
  images?: string[];
  certifications?: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface Animal {
  id: string;
  tag: string;
  name?: string;
  type?: 'cattle' | 'sheep' | 'goat' | 'pig' | 'horse';
  breed?: string;
  sex: 'male' | 'female';
  birthDate?: string;
  
  // Peso y medidas
  weight?: number;
  weightUnit: 'kg' | 'lb' | 'arroba';
  height?: number; // cm
  length?: number; // cm
  
  // Estado
  status?: 'healthy' | 'sick' | 'pregnant' | 'sold' | 'deceased' | 'quarantine';
  healthStatus?: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  reproductiveStatus?: 'active' | 'inactive' | 'pregnant' | 'lactating' | 'dry';
  
  // Ubicación
  ranchId: string;
  paddockId?: string;
  location?: string;
  
  // Genealogía
  motherId?: string;
  fatherId?: string;
  offspring?: string[];
  
  // Datos económicos
  purchaseDate?: string;
  purchasePrice?: number;
  purchaseWeight?: number;
  saleDate?: string;
  salePrice?: number;
  saleWeight?: number;
  estimatedValue?: number;
  
  // Producción
  productionData?: {
    milkYield?: number; // litros/día promedio
    lastMilkDate?: string;
    totalMilkProduced?: number; // histórico
    
    // Reproducción
    lastCalvingDate?: string;
    calvingCount?: number;
    pregnancyStatus?: boolean;
    expectedCalvingDate?: string;
    inseminationDates?: string[];
    
    // Carne
    dailyWeightGain?: number; // kg/día
    feedConversionRatio?: number;
  };
  
  // Salud
  healthRecords?: Array<{
    date: string;
    type: 'vaccination' | 'treatment' | 'checkup' | 'injury';
    description: string;
    veterinarianId?: string;
    cost?: number;
    medications?: string[];
    nextCheckup?: string;
  }>;
  
  // Alimentación
  feedingPlan?: {
    type: string;
    dailyAmount: number;
    unit: 'kg' | 'lb';
    cost: number;
    supplements?: string[];
  };
  
  // Metadata
  notes?: string;
  tags?: string[];
  images?: string[];
  documents?: string[];
  qrCode?: string;
  rfidTag?: string;
  
  // Datos específicos por país
  countrySpecificData?: Record<string, any>;
  
  // Timestamps
  createdAt: string;
  updatedAt?: string;
  lastSeenAt?: string;
}

export interface MilkProduction {
  id: string;
  animalId: string;
  ranchId: string;
  date: string;
  
  // Producción
  quantity: number;
  unit: 'liter' | 'gallon';
  period: 'morning' | 'afternoon' | 'evening' | 'total';
  
  // Calidad
  quality?: 'A' | 'B' | 'C' | 'rejected';
  fatContent?: number; // %
  proteinContent?: number; // %
  somaticCellCount?: number;
  bacterialCount?: number;
  temperature?: number; // °C
  
  // Económico
  pricePerUnit?: number;
  totalValue?: number;
  currency?: string;
  buyerId?: string;
  invoiceNumber?: string;
  
  // Condiciones
  weather?: 'sunny' | 'cloudy' | 'rainy' | 'cold' | 'hot';
  animalCondition?: 'excellent' | 'good' | 'fair' | 'poor';
  
  // Metadata
  collectedBy?: string;
  notes?: string;
  tags?: string[];
  
  // Validación
  verified?: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
  
  createdAt: string;
  updatedAt?: string;
}

// === TIPOS DE EVENTOS ===

export interface RanchEvent {
  id: string;
  ranchId: string;
  type: 'health' | 'breeding' | 'feeding' | 'sale' | 'purchase' | 'maintenance' | 'other';
  title: string;
  description: string;
  date: string;
  
  // Participantes
  animalIds?: string[];
  userIds?: string[];
  
  // Económico
  cost?: number;
  revenue?: number;
  currency?: string;
  
  // Estado
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  
  // Recurrencia
  recurring?: boolean;
  recurrencePattern?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  recurrenceEnd?: string;
  
  // Metadata
  tags?: string[];
  attachments?: string[];
  location?: string;
  weather?: string;
  
  createdAt: string;
  updatedAt?: string;
  completedAt?: string;
}

// === TIPOS DE RESPUESTA ===

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    timestamp: string;
    version: string;
    requestId: string;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// === TIPOS DE FILTROS ===

export interface AnimalFilters {
  ranchId?: string;
  type?: Animal['type'];
  breed?: string;
  sex?: Animal['sex'];
  status?: Animal['status'];
  healthStatus?: Animal['healthStatus'];
  ageMin?: number; // meses
  ageMax?: number; // meses
  weightMin?: number;
  weightMax?: number;
  tags?: string[];
  search?: string;
}

export interface ProductionFilters {
  ranchId?: string;
  animalId?: string;
  dateFrom?: string;
  dateTo?: string;
  quality?: MilkProduction['quality'];
  quantityMin?: number;
  quantityMax?: number;
  period?: MilkProduction['period'];
}

// === TIPOS DE ESTADÍSTICAS ===

export interface RanchStatistics {
  overview: {
    totalAnimals: number;
    totalArea: number;
    occupancyRate: number;
    healthIndex: number; // 0-100
  };
  
  byType: Record<string, number>;
  byStatus: Record<string, number>;
  byAge: {
    '0-6': number;
    '6-12': number;
    '12-24': number;
    '24+': number;
  };
  
  production: {
    dailyMilkAvg: number;
    monthlyMilkTotal: number;
    topProducers: Array<{ animalId: string; name: string; production: number }>;
  };
  
  health: {
    vaccinationRate: number;
    sickAnimals: number;
    pregnancyRate: number;
    mortalityRate: number;
  };
  
  financial: {
    monthlyRevenue: number;
    monthlyCosts: number;
    profitMargin: number;
    costPerAnimal: number;
  };
}

// === TIPOS DE CONFIGURACIÓN ===

export interface NotificationSettings {
  email: boolean;
  sms: boolean;
  push: boolean;
  
  events: {
    health: boolean;
    breeding: boolean;
    production: boolean;
    financial: boolean;
  };
  
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
  quietHours?: {
    start: string; // "22:00"
    end: string; // "07:00"
  };
}

export interface SystemSettings {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  dateFormat: string;
  numberFormat: string;
  
  features: {
    aiInsights: boolean;
    weatherIntegration: boolean;
    marketPrices: boolean;
    satelliteImagery: boolean;
  };
  
  privacy: {
    shareAnalytics: boolean;
    allowTelemetry: boolean;
    dataRetention: number; // días
  };
}