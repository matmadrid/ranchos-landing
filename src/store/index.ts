// src/store/index.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { devtools } from 'zustand/middleware';
import type { 
  CountryCode, 
  LocaleConfig, 
  ValidationResult,
  ValidationError,
  ProcessingResult,
  UnitSystem,
  LivestockProfitabilityInput,
  LivestockProfitabilityOutput
} from '@/types';

// Importar slices existentes
import { AuthSlice, createAuthSlice } from './slices/auth.slice';
import { RanchSlice, createRanchSlice } from './slices/ranch.slice';
import { AnimalSlice, createAnimalSlice } from './slices/animal.slice';
import { RegionalSlice, createRegionalSlice } from './slices/regional.slice';
import { ProcessingSlice, createProcessingSlice } from './slices/processing.slice';
import { ProfitabilitySlice, createProfitabilitySlice } from './slices/profitability.slice';
import { InventorySlice, createInventorySlice } from './slices/inventorySlice';

// BATALLA 7: Importar WeightTracker Pro
import { WeighingSlice, createWeighingSlice } from './slices/weighingSlice';

// Tipo base que incluye ProcessingSlice para que esté disponible en todos los slices
type StoreBase = ProcessingSlice;

// Tipo del store completo con todas las capacidades enterprise
export type RanchOSStore = 
  AuthSlice & 
  RanchSlice & 
  AnimalSlice & 
  RegionalSlice & 
  ProcessingSlice & 
  ProfitabilitySlice & 
  InventorySlice & 
  WeighingSlice & { // BATALLA 7: Añadir WeightTracker Pro
    // Métodos transversales de validación
    validateEntity: <T>(entity: T, type: 'ranch' | 'animal' | 'production') => ValidationResult;
    getValidationErrors: (entityId: string) => ValidationError[];
    generateTraceId: () => string;
    
    // BATALLA 7: Métodos de integración WeightTracker Pro + LivestockCore
    initializeAllSystems: (ranchId: string) => Promise<{
      livestock: boolean;
      weighing: boolean;
      errors: string[];
    }>;
    
    getIntegratedDashboardData: () => {
      livestock: {
        totalAnimals: number;
        totalValue: number;
        recentMovements: number;
        categoriesWithStock: number;
      };
      weighing: {
        totalRecords: number;
        averageGMD: number;
        animalsMonitored: number;
        pendingWeighing: number;
      };
      alerts: {
        inventory: number;
        weighing: number;
        critical: number;
      };
    };
    
    syncInventoryWithWeighing: () => Promise<{
      success: boolean;
      syncedAnimals: number;
      conflicts: string[];
      recommendations: string[];
    }>;
    
    // Métodos de migración existentes
    migrateFromLegacyStore: () => Promise<void>;
  };

// Crear el store enterprise-grade
const useRanchOSStore = create<RanchOSStore>()(
  devtools(
    persist(
      (set, get, api) => {
        // Primero crear ProcessingSlice para que esté disponible
        const processingSlice = createProcessingSlice(set, get, api);
        
        // Crear un getter extendido que incluya ProcessingSlice
        const getWithProcessing = () => ({
          ...get(),
          ...processingSlice
        });
        
        return {
          // ProcessingSlice primero para que esté disponible
          ...processingSlice,
          
          // Resto de slices existentes
          ...createAuthSlice(set, getWithProcessing, api),
          ...createRanchSlice(set, getWithProcessing, api),
          ...createAnimalSlice(set, getWithProcessing, api),
          ...createRegionalSlice(set, getWithProcessing, api),
          ...createProfitabilitySlice(set, getWithProcessing, api),
          ...createInventorySlice(set, getWithProcessing, api),
          
          // BATALLA 7: Integrar WeightTracker Pro
          ...createWeighingSlice(set, getWithProcessing, api),
          
          // === MÉTODOS TRANSVERSALES EXISTENTES ===
          
          // Generar ID de trazabilidad único
          generateTraceId: () => {
            const timestamp = Date.now();
            const random = Math.random().toString(36).substr(2, 9);
            const country = get().currentCountry;
            return `TRACE-${country}-${timestamp}-${random}`;
          },
          
          // Validación empresarial con reglas por país
          validateEntity: <T>(entity: any, type: 'ranch' | 'animal' | 'production'): ValidationResult => {
            const errors: ValidationError[] = [];
            const warnings: ValidationError[] = [];
            const country = get().currentCountry;
            const localeConfig = get().localeConfig;
            
            // Validaciones base (mantener código existente)
            switch (type) {
              case 'ranch':
                // Validación nombre
                if (!entity.name || entity.name.trim().length < 3) {
                  errors.push({
                    code: 'RANCH_NAME_INVALID',
                    message: 'El nombre del rancho debe tener al menos 3 caracteres',
                    field: 'name',
                    severity: 'error'
                  });
                }
                
                // Validación tamaño
                if (!entity.size || entity.size <= 0) {
                  errors.push({
                    code: 'RANCH_SIZE_INVALID',
                    message: 'El tamaño del rancho debe ser mayor a 0',
                    field: 'size',
                    severity: 'error'
                  });
                }
                
                // Validaciones por país
                if (country === 'MX' && entity.size > 5000) {
                  warnings.push({
                    code: 'RANCH_SIZE_LARGE',
                    message: 'Ranchos mayores a 5000 hectáreas requieren permisos especiales en México',
                    field: 'size',
                    severity: 'warning'
                  });
                }
                
                // Validación de ubicación con formato específico por país
                if (country === 'BR' && !entity.location.includes(',')) {
                  warnings.push({
                    code: 'LOCATION_FORMAT_BR',
                    message: 'En Brasil se recomienda formato: Ciudad, Estado',
                    field: 'location',
                    severity: 'info'
                  });
                }
                break;
                
              case 'animal':
                // Validación etiqueta requerida
                if (!entity.tag) {
                  errors.push({
                    code: 'ANIMAL_TAG_REQUIRED',
                    message: 'La etiqueta del animal es requerida',
                    field: 'tag',
                    severity: 'error'
                  });
                }
                
                // Formato de etiqueta por país
                const tagFormats: Record<CountryCode, RegExp> = {
                  MX: /^MX-[A-Z0-9]{6,}$/,
                  BR: /^BR[0-9]{15}$/,
                  CO: /^CO-[0-9]{8,}$/,
                  ES: /^ES[0-9]{14}$/
                };
                
                if (entity.tag && tagFormats[country] && !tagFormats[country].test(entity.tag)) {
                  warnings.push({
                    code: 'TAG_FORMAT_SUGGESTION',
                    message: `Formato recomendado para ${country}: ${getTagFormatExample(country)}`,
                    field: 'tag',
                    severity: 'warning'
                  });
                }
                
                // Validación de peso según unidades del país
                const unitSystem = get().unitSystem;
                if (entity.weight) {
                  const minWeight = unitSystem.weight === 'kg' ? 20 : 
                                  unitSystem.weight === 'lb' ? 44 : 1.3; // arroba
                  const maxWeight = unitSystem.weight === 'kg' ? 1200 : 
                                  unitSystem.weight === 'lb' ? 2645 : 80; // arroba
                  
                  if (entity.weight < minWeight || entity.weight > maxWeight) {
                    warnings.push({
                      code: 'WEIGHT_OUT_OF_RANGE',
                      message: `Peso fuera del rango normal (${minWeight}-${maxWeight} ${unitSystem.weight})`,
                      field: 'weight',
                      severity: 'warning'
                    });
                  }
                }
                
                // Validación edad reproductiva
                if (entity.birthDate && entity.sex === 'female') {
                  const age = calculateAgeInMonths(entity.birthDate);
                  if (age < 15 && entity.status === 'pregnant') {
                    errors.push({
                      code: 'BREEDING_AGE_TOO_YOUNG',
                      message: 'Animal demasiado joven para reproducción',
                      field: 'status',
                      severity: 'error'
                    });
                  }
                }
                break;
                
              case 'production':
                // Validación de producción de leche
                if (entity.quantity <= 0) {
                  errors.push({
                    code: 'PRODUCTION_QUANTITY_INVALID',
                    message: 'La cantidad debe ser mayor a 0',
                    field: 'quantity',
                    severity: 'error'
                  });
                }
                
                // Límites de producción realistas
                const maxProduction = entity.unit === 'liter' ? 50 : 13; // galones
                if (entity.quantity > maxProduction) {
                  warnings.push({
                    code: 'PRODUCTION_UNUSUALLY_HIGH',
                    message: `Producción inusualmente alta (>${maxProduction} ${entity.unit}/día)`,
                    field: 'quantity',
                    severity: 'warning'
                  });
                }
                break;
            }
            
            // Aplicar regulaciones específicas del país
            if (localeConfig?.regulations) {
              // Aquí se aplicarían validaciones basadas en regulaciones
              // Por ejemplo: NOM-001-SAG-2023 para México
            }
            
            return {
              isValid: errors.length === 0,
              errors,
              warnings,
              metadata: {
                validatedAt: new Date().toISOString(),
                validatorVersion: '2.0.0',
                country,
                regulations: localeConfig?.regulations || []
              }
            };
          },
          
          // Obtener errores de validación por entidad
          getValidationErrors: (entityId: string): ValidationError[] => {
            const result = get().getValidationResult(entityId);
            return result?.errors || [];
          },
          
          // === BATALLA 7: MÉTODOS DE INTEGRACIÓN WEIGHTTRACKER PRO ===
          
          /**
           * Inicializar todos los sistemas para un rancho
           */
          initializeAllSystems: async (ranchId: string) => {
            const errors: string[] = [];
            let livestock = false;
            let weighing = false;
            
            try {
              // Inicializar LivestockCore (Inventario) - usar método existente si existe
              if (get().initializeInventory) {
                const livestockResult = await get().initializeInventory(ranchId);
                livestock = livestockResult?.success || false;
                if (!livestock) {
                  errors.push('Error inicializando sistema de inventario');
                }
              } else {
                livestock = true; // Asumir que está inicializado si no hay método específico
              }
            } catch (error) {
              errors.push(`Error LivestockCore: ${error instanceof Error ? error.message : 'Desconocido'}`);
            }
            
            try {
              // Inicializar WeightTracker Pro
              const weighingResult = await get().initializeWeighingSystem(ranchId);
              weighing = weighingResult?.success || false;
              if (!weighing) {
                errors.push('Error inicializando sistema de pesaje');
              }
            } catch (error) {
              errors.push(`Error WeightTracker Pro: ${error instanceof Error ? error.message : 'Desconocido'}`);
            }
            
            // Si ambos sistemas están inicializados, realizar sincronización inicial
            if (livestock && weighing) {
              try {
                await get().syncInventoryWithWeighing();
              } catch (error) {
                errors.push(`Error en sincronización inicial: ${error instanceof Error ? error.message : 'Desconocido'}`);
              }
            }
            
            return { livestock, weighing, errors };
          },
          
          /**
           * Dashboard integrado con datos de ambos sistemas
           */
          getIntegratedDashboardData: () => {
            // Obtener stats de inventario (LivestockCore)
            const inventoryStats = get().getInventoryStats ? get().getInventoryStats() : {
              totalAnimals: 0,
              totalValue: 0,
              movementsThisMonth: 0,
              categoriesWithStock: 0,
              lastMovementDate: null
            };
            
            // Obtener stats de pesaje (WeightTracker Pro)
            const weighingStats = get().getGlobalStats ? get().getGlobalStats() : {
              totalRecords: 0,
              animalesMonitoreados: 0,
              animalesPendientesPesaje: 0,
              alertasActivas: 0,
              alertasCriticas: 0,
              gmdPromedioGlobal: 0,
              ultimaActualizacion: null
            };
            
            // ✅ CORRECCIÓN PROFESIONAL: Nomenclatura consistente y descriptiva
            const inventoryAlertsCount = get().unreadAlertsCount || 0;
            const weighingAlertsCount = weighingStats.alertasActivas || 0;
            const criticalAlertsCount = weighingStats.alertasCriticas || 0;
            
            return {
              livestock: {
                totalAnimals: inventoryStats.totalAnimals,
                totalValue: inventoryStats.totalValue,
                recentMovements: inventoryStats.movementsThisMonth,
                categoriesWithStock: inventoryStats.categoriesWithStock
              },
              weighing: {
                totalRecords: weighingStats.totalRecords,
                averageGMD: weighingStats.gmdPromedioGlobal,
                animalsMonitored: weighingStats.animalesMonitoreados,
                pendingWeighing: weighingStats.animalesPendientesPesaje
              },
              alerts: {
                inventory: inventoryAlertsCount,
                weighing: weighingAlertsCount, // ✅ CORREGIDO: Variable correcta
                critical: criticalAlertsCount   // ✅ CORREGIDO: Sin duplicación
              }
            };
          },
          
          /**
           * Sincronización bidireccional entre inventario y pesaje
           */
          syncInventoryWithWeighing: async () => {
            try {
              const conflicts: string[] = [];
              const recommendations: string[] = [];
              let syncedAnimals = 0;
              
              // Obtener datos de ambos sistemas
              const animals = get().animals || [];
              const weighingRecords = get().weighingRecords || [];
              const categoryBalances = get().categoryBalances || new Map();
              
              // 1. Verificar consistencia de animales entre sistemas
              const animalsWithWeighing = new Set(weighingRecords.map(r => r.animalId));
              const animalsInInventory = new Set(animals.map(a => a.id));
              
              // Animales en pesaje pero no en inventario
              weighingRecords.forEach(record => {
                if (!animalsInInventory.has(record.animalId)) {
                  conflicts.push(`Animal ${record.animalTag} (${record.animalId}) tiene pesajes pero no existe en inventario`);
                }
              });
              
              // 2. Verificar consistencia de categorías
              const weighingByCategory = new Map<string, number>();
              weighingRecords.forEach(record => {
                const latestForAnimal = weighingRecords
                  .filter(r => r.animalId === record.animalId)
                  .sort((a, b) => b.fecha.localeCompare(a.fecha))[0];
                
                if (latestForAnimal.id === record.id) { // Solo contar el último pesaje por animal
                  weighingByCategory.set(
                    record.categoriaActual, 
                    (weighingByCategory.get(record.categoriaActual) || 0) + 1
                  );
                }
              });
              
              // Comparar con balances de inventario
              categoryBalances.forEach((balance, categoryId) => {
                const weighingCount = weighingByCategory.get(categoryId) || 0;
                if (Math.abs(balance - weighingCount) > 0) {
                  conflicts.push(`Categoría ${categoryId}: Inventario=${balance}, Pesajes=${weighingCount}`);
                }
              });
              
              // 3. Generar recomendaciones basadas en conflictos
              if (conflicts.length === 0) {
                recommendations.push('✅ Sistemas completamente sincronizados');
                syncedAnimals = animals.length;
              } else {
                recommendations.push('🔄 Sincronización requerida');
                recommendations.push(`📊 ${conflicts.length} discrepancias encontradas`);
                
                if (conflicts.length < 5) {
                  recommendations.push('🎯 Discrepancias menores - corrección automática posible');
                } else {
                  recommendations.push('⚠️ Múltiples discrepancias - revisión manual recomendada');
                }
                
                // Sugerir acciones específicas
                recommendations.push('📋 Acciones sugeridas:');
                recommendations.push('   • Verificar movimientos de inventario recientes');
                recommendations.push('   • Revisar pesajes sin conciliar');
                recommendations.push('   • Actualizar categorías basadas en peso');
              }
              
              return {
                success: conflicts.length === 0,
                syncedAnimals,
                conflicts,
                recommendations
              };
              
            } catch (error) {
              return {
                success: false,
                syncedAnimals: 0,
                conflicts: [`Error en sincronización: ${error instanceof Error ? error.message : 'Desconocido'}`],
                recommendations: ['❌ Reintentar sincronización', '🔧 Verificar configuración de sistemas']
              };
            }
          },
          
          // Migración desde store legacy (mantener método existente)
          migrateFromLegacyStore: async () => {
            const legacyStores = ['ranch-store', 'ranch-store-v2'];
            let migrated = false;
            
            for (const storeName of legacyStores) {
              const oldData = localStorage.getItem(storeName);
              if (!oldData) continue;
              
              try {
                const parsed = JSON.parse(oldData);
                const state = parsed.state || parsed;
                
                // Migrar usuario
                if (state.currentUser && !state.currentUser.countryCode) {
                  get().setCurrentUser({
                    ...state.currentUser,
                    countryCode: 'MX',
                    preferredUnits: get().unitSystem
                  });
                }
                
                // Migrar ranchos con ProcessingResult
                if (state.ranches?.length > 0) {
                  for (const ranch of state.ranches) {
                    if (!ranch.countryCode) {
                      const result = await get().addRanch({
                        ...ranch,
                        countryCode: 'MX',
                        sizeUnit: 'hectare'
                      });
                      if (!result.success) {
                        console.error('Error migrando rancho:', result.errors);
                      }
                    }
                  }
                }
                
                // Migrar animales con ProcessingResult
                if (state.animals?.length > 0) {
                  for (const animal of state.animals) {
                    if (!animal.weightUnit) {
                      const result = await get().addAnimal({
                        ...animal,
                        weightUnit: 'kg',
                        type: animal.type || 'cattle'
                      });
                      if (!result.success) {
                        console.error('Error migrando animal:', result.errors);
                      }
                    }
                  }
                }
                
                // Migrar producciones de leche
                if (state.milkProductions?.length > 0) {
                  for (const production of state.milkProductions) {
                    const result = await get().addMilkProduction({
                      ...production,
                      unit: production.unit || 'liter'
                    });
                    if (!result.success) {
                      console.error('Error migrando producción:', result.errors);
                    }
                  }
                }
                
                migrated = true;
                localStorage.removeItem(storeName);
                console.log(`✅ Migración completada desde ${storeName}`);
                
              } catch (error) {
                console.error(`❌ Error migrando desde ${storeName}:`, error);
              }
            }
            
            if (migrated) {
              // Notificar migración exitosa
              const result: ProcessingResult<void> = {
                success: true,
                metadata: {
                  id: 'migration-tool',
                  version: '1.0.0',
                  name: 'Legacy Store Migrator',
                  description: 'Migrates data from legacy store versions',
                  supportedCountries: ['MX', 'CO', 'BR', 'ES'],
                  lastUpdated: new Date().toISOString()
                },
                processingTime: Date.now(),
                traceId: get().generateTraceId()
              };
              
              set({ lastProcessingResult: result });
            }
          }
        };
      },
      {
        name: 'ranchos-store-v3',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          // === Auth ===
          isAuthenticated: state.isAuthenticated,
          currentUser: state.currentUser,
          profile: state.profile,
          isOnboardingComplete: state.isOnboardingComplete,
          profilePromptDismissed: state.profilePromptDismissed,
          
          // === Ranch ===
          ranches: state.ranches,
          activeRanch: state.activeRanch,
          currentRanch: state.currentRanch,
          
          // === Animals ===
          animals: state.animals,
          cattle: state.cattle,
          milkProductions: state.milkProductions,
          
          // === Inventory (Batalla 6) ===
          movements: state.movements,
          categories: state.categories,
          categoryBalances: state.categoryBalances,
          
          // === WeightTracker Pro (Batalla 7) ===
          weighingRecords: state.weighingRecords,
          weighingAlerts: state.weighingAlerts, // Persistir alertas de pesaje
          systemConfig: state.systemConfig,
          
          // === Regional ===
          currentCountry: state.currentCountry,
          localeConfig: state.localeConfig,
          unitSystem: state.unitSystem,
          currency: state.currency,
          
          // === Persistir resultados importantes ===
          lastAnalysis: state.lastAnalysis,
          
          // NO persistir: isProcessing, validationResults (temporal)
        }),
        onRehydrateStorage: () => (state) => {
          if (state) {
            console.log('🔄 RanchOS Store rehidratado:', {
              version: 'v3-batalla7',
              usuario: state.currentUser?.name || 'No autenticado',
              rancho: state.activeRanch?.name || 'Sin rancho',
              país: state.currentCountry,
              animales: state.animals?.length || 0,
              inventario: state.movements?.length || 0,
              pesajes: state.weighingRecords?.length || 0,
              alertasPesaje: state.weighingAlerts?.length || 0,
              timestamp: new Date().toISOString()
            });
            
            // Inicializar Maps después de rehidratar
            if (!state.validationResults || !(state.validationResults instanceof Map)) {
              state.validationResults = new Map();
            }
            if (!state.analysisHistory || !(state.analysisHistory instanceof Map)) {
              state.analysisHistory = new Map();
            }
            
            // BATALLA 7: Inicializar arrays de WeightTracker Pro
            if (!state.weighingAlerts || !Array.isArray(state.weighingAlerts)) {
              state.weighingAlerts = [];
            }
            
            // BATALLA 7: Inicializar Maps de WeightTracker Pro
            if (!state.growthAnalyses || !(state.growthAnalyses instanceof Map)) {
              state.growthAnalyses = new Map();
            }
            if (!state.categoryStats || !(state.categoryStats instanceof Map)) {
              state.categoryStats = new Map();
            }
            if (!state.animalConfigs || !(state.animalConfigs instanceof Map)) {
              state.animalConfigs = new Map();
            }
            if (!state.projectionCache || !(state.projectionCache instanceof Map)) {
              state.projectionCache = new Map();
            }
            if (!state.weighingMonthlyReports || !(state.weighingMonthlyReports instanceof Map)) {
              state.weighingMonthlyReports = new Map();
            }
            
            // Auto-migrar si es necesario
            const needsMigration = localStorage.getItem('ranch-store') || 
                                 localStorage.getItem('ranch-store-v2');
            if (needsMigration) {
              setTimeout(() => state.migrateFromLegacyStore(), 1000);
            }
          }
        }
      }
    ),
    {
      name: 'RanchOSStore',
      trace: true,
      enabled: process.env.NODE_ENV === 'development'
    }
  )
);

// === FUNCIONES AUXILIARES ===

function calculateAgeInMonths(birthDate: string): number {
  const birth = new Date(birthDate);
  const today = new Date();
  const months = (today.getFullYear() - birth.getFullYear()) * 12 + 
                (today.getMonth() - birth.getMonth());
  return months;
}

function getTagFormatExample(country: CountryCode): string {
  const examples: Record<CountryCode, string> = {
    MX: 'MX-ABC123',
    BR: 'BR123456789012345',
    CO: 'CO-12345678',
    ES: 'ES12345678901234'
  };
  return examples[country] || 'TAG-001';
}

// === SELECTORES ATÓMICOS PARA WEIGHTTRACKER (OPTIMIZACIÓN) ===
const selectWeighingRecords = (state: RanchOSStore) => state.weighingRecords;
const selectWeighingAlerts = (state: RanchOSStore) => state.weighingAlerts;
const selectGlobalStats = (state: RanchOSStore) => state.globalStats;
const selectIntegratedDashboardData = (state: RanchOSStore) => state.getIntegratedDashboardData;
const selectSyncInventoryWithWeighing = (state: RanchOSStore) => state.syncInventoryWithWeighing;
const selectInitializeAllSystems = (state: RanchOSStore) => state.initializeAllSystems;

// === HOOKS OPTIMIZADOS CON SELECTORES ===

// Hooks existentes (mantener todos)
export const useCurrentUser = () => useRanchOSStore((state) => state.currentUser);
export const useIsAuthenticated = () => useRanchOSStore((state) => state.isAuthenticated);
export const useIsTemporaryUser = () => useRanchOSStore((state) => state.isTemporaryUser());

// Ranchos
export const useActiveRanch = () => useRanchOSStore((state) => state.activeRanch);
export const useRanches = () => useRanchOSStore((state) => state.ranches);
export const useRanchById = (id: string) => 
  useRanchOSStore((state) => state.getRanchById(id));

// Animales
export const useAnimals = () => useRanchOSStore((state) => state.animals);
export const useAnimalsByRanch = (ranchId: string) => 
  useRanchOSStore((state) => state.getAnimalsByRanch(ranchId));
export const useAnimalStats = (ranchId?: string) => 
  useRanchOSStore((state) => state.getAnimalStats(ranchId));

// Regional
export const useCountryConfig = () => 
  useRanchOSStore((state) => ({
    country: state.currentCountry,
    config: state.localeConfig,
    units: state.unitSystem,
    currency: state.currency
  }));

export const useRegionalFormat = () => {
  const store = useRanchOSStore();
  return {
    currency: store.formatCurrency,
    number: store.formatNumber,
    date: store.formatDate,
    weight: store.formatWeight,
    area: store.formatArea,
    volume: store.formatVolume
  };
};

// Procesamiento
export const useIsProcessing = () => useRanchOSStore((state) => state.isProcessing);
export const useLastProcessingResult = () => useRanchOSStore((state) => state.lastProcessingResult);

// Rentabilidad
export const useLastAnalysis = () => useRanchOSStore((state) => state.lastAnalysis);
export const useIsAnalyzing = () => useRanchOSStore((state) => state.isAnalyzing);

// === HOOKS OPTIMIZADOS PARA WEIGHTTRACKER PRO ===

/**
 * Hook optimizado para WeightTracker Pro
 * Evita re-renders innecesarios usando selectores atómicos
 */
export const useWeightTrackerOptimized = () => {
  const weighingRecords = useRanchOSStore(selectWeighingRecords);
  const weighingAlerts = useRanchOSStore(selectWeighingAlerts);
  const globalStats = useRanchOSStore(selectGlobalStats);
  
  // Funciones separadas para evitar re-renders
  const addWeighingRecord = useRanchOSStore((state) => state.addWeighingRecord);
  const getWeighingRecordsByAnimal = useRanchOSStore((state) => state.getWeighingRecordsByAnimal);
  const getGlobalStats = useRanchOSStore((state) => state.getGlobalStats);
  const checkWeighingAlerts = useRanchOSStore((state) => state.checkWeighingAlerts);
  const getLatestWeighingByAnimal = useRanchOSStore((state) => state.getLatestWeighingByAnimal);
  const updateWeighingRecord = useRanchOSStore((state) => state.updateWeighingRecord);
  const deleteWeighingRecord = useRanchOSStore((state) => state.deleteWeighingRecord);
  const getAlertsByAnimal = useRanchOSStore((state) => state.getAlertsByAnimal);
  const markAlertAsRead = useRanchOSStore((state) => state.markAlertAsRead);
  const markAlertAsResolved = useRanchOSStore((state) => state.markAlertAsResolved);
  const initializeWeighingSystem = useRanchOSStore((state) => state.initializeWeighingSystem);
  
  return {
    weighingRecords,
    weighingAlerts,
    globalStats,
    addWeighingRecord,
    getWeighingRecordsByAnimal,
    getGlobalStats,
    checkWeighingAlerts,
    getLatestWeighingByAnimal,
    updateWeighingRecord,
    deleteWeighingRecord,
    getAlertsByAnimal,
    markAlertAsRead,
    markAlertAsResolved,
    initializeWeighingSystem
  };
};

/**
 * Hook optimizado para Dashboard Integrado
 * Evita re-renders innecesarios usando selectores específicos
 */
export const useIntegratedDashboardOptimized = () => {
  const getIntegratedDashboardData = useRanchOSStore(selectIntegratedDashboardData);
  const syncInventoryWithWeighing = useRanchOSStore(selectSyncInventoryWithWeighing);
  const initializeAllSystems = useRanchOSStore(selectInitializeAllSystems);
  
  return {
    getIntegratedDashboardData,
    syncInventoryWithWeighing,
    initializeAllSystems
  };
};

// BATALLA 7: Hooks para WeightTracker Pro (MANTENER PARA COMPATIBILIDAD)
export const useWeightTracker = () => useRanchOSStore((state) => ({
  weighingRecords: state.weighingRecords,
  weighingAlerts: state.weighingAlerts,
  addWeighingRecord: state.addWeighingRecord,
  getWeighingRecordsByAnimal: state.getWeighingRecordsByAnimal,
  getGlobalStats: state.getGlobalStats,
  checkWeighingAlerts: state.checkWeighingAlerts,
  getLatestWeighingByAnimal: state.getLatestWeighingByAnimal,
  updateWeighingRecord: state.updateWeighingRecord,
  deleteWeighingRecord: state.deleteWeighingRecord,
  getAlertsByAnimal: state.getAlertsByAnimal,
  markAlertAsRead: state.markAlertAsRead,
  markAlertAsResolved: state.markAlertAsResolved,
  initializeWeighingSystem: state.initializeWeighingSystem
}));

export const useIntegratedDashboard = () => useRanchOSStore((state) => ({
  getIntegratedDashboardData: state.getIntegratedDashboardData,
  syncInventoryWithWeighing: state.syncInventoryWithWeighing,
  initializeAllSystems: state.initializeAllSystems
}));

// LivestockCore (Batalla 6) - Mantener intacto
export const useLivestockCore = () => useRanchOSStore((state) => ({
  movements: state.movements,
  categories: state.categories,
  categoryBalances: state.categoryBalances,
  addMovement: state.addMovement,
  getInventoryStats: state.getInventoryStats,
  getCategoryBalance: state.getCategoryBalance,
  getRecentMovements: state.getRecentMovements
}));

// === HOOKS COMPUESTOS EXISTENTES (mantener todos) ===

/**
 * Hook para el estado completo de autenticación
 */
export const useAuthState = () => {
  const isAuthenticated = useIsAuthenticated();
  const currentUser = useCurrentUser();
  const isTemporary = useIsTemporaryUser();
  const isOnboardingComplete = useRanchOSStore((state) => state.isOnboardingComplete);
  
  return {
    isAuthenticated,
    currentUser,
    isTemporary,
    isOnboardingComplete,
    isLoggedIn: isAuthenticated && !isTemporary,
    needsRegistration: isTemporary && currentUser !== null,
    needsOnboarding: !isOnboardingComplete && currentUser !== null
  };
};

/**
 * Hook para operaciones del rancho activo
 */
export const useActiveRanchOperations = () => {
  const activeRanch = useActiveRanch();
  const animals = useAnimalsByRanch(activeRanch?.id || '');
  const stats = useAnimalStats(activeRanch?.id);
  const format = useRegionalFormat();
  
  return {
    ranch: activeRanch,
    animals,
    stats,
    format,
    hasRanch: !!activeRanch,
    totalArea: activeRanch ? format.area(activeRanch.size, true) : '0 ha'
  };
};

// Re-exportar tipos desde slices
export type {
  User,
  Profile,
  Ranch,
  Animal,
  MilkProduction
} from './slices/types';

// Exportar el store por defecto
export default useRanchOSStore;

// === DEBUGGING EN DESARROLLO ===

// Exponer store en desarrollo para debugging
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).useRanchOSStore = useRanchOSStore;
  
  // Agregar helpers de debugging
  (window as any).debugWeightTracker = () => {
    const state = useRanchOSStore.getState();
    console.log('📊 WeightTracker Debug:', {
      records: state.weighingRecords.length,
      alerts: state.weighingAlerts.length,
      stats: state.globalStats,
      isProcessing: state.isProcessing
    });
  };
  
  (window as any).debugStore = () => {
    const state = useRanchOSStore.getState();
    console.log('🏪 Store completo:', state);
  };
}