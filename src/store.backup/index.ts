// src/store/index.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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

// NOTA: Estos tipos deberían estar en types/models.ts
// pero los mantengo aquí temporalmente para la transición

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  phone?: string;
  location?: string;
  countryCode: CountryCode; // INTEGRACIÓN con sistema
  preferredUnits?: UnitSystem;
  createdAt: string;
  updatedAt?: string;
}

interface Ranch {
  id: string;
  name: string;
  location: string;
  countryCode: CountryCode; // INTEGRACIÓN
  size: number;
  sizeUnit: 'hectare' | 'acre'; // De UnitSystem
  type?: 'dairy' | 'beef' | 'mixed';
  description?: string;
  isActive?: boolean;
  validationStatus?: ValidationResult; // VALIDACIÓN
  createdAt: string;
  updatedAt?: string;
}

interface Animal {
  id: string;
  type?: string;
  tag: string;
  name?: string;
  tagNumber?: string;
  breed?: string;
  sex: 'male' | 'female';
  birthDate?: string;
  weight?: number;
  weightUnit: 'kg' | 'lb' | 'arroba'; // De UnitSystem
  status?: 'healthy' | 'sick' | 'pregnant' | 'sold';
  healthStatus?: 'excellent' | 'good' | 'fair' | 'poor';
  notes?: string;
  ranchId: string;
  countrySpecificData?: Record<string, any>; // Datos por país
  createdAt: string;
  updatedAt?: string;
}

interface MilkProduction {
  id: string;
  cattleId: string;
  date: string;
  quantity: number;
  unit: 'liter' | 'gallon'; // De UnitSystem
  period: 'morning' | 'evening';
  quality?: 'A' | 'B' | 'C';
  marketPrice?: number;
  currency?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

// NUEVO: Estado de procesamiento y validación
interface ProcessingState {
  lastProcessingResult: ProcessingResult<any> | null;
  validationResults: Map<string, ValidationResult>;
  processingQueue: string[];
  isProcessing: boolean;
}

// NUEVO: Estado de configuración regional
interface RegionalConfig {
  currentCountry: CountryCode;
  localeConfig: LocaleConfig | null;
  unitSystem: UnitSystem;
  currency: string;
}

// NUEVO: Estado de análisis de rentabilidad
interface ProfitabilityState {
  lastAnalysis: LivestockProfitabilityOutput | null;
  analysisHistory: Map<string, LivestockProfitabilityOutput>;
  isAnalyzing: boolean;
}

// Estado completo del store
interface StoreState extends ProcessingState, RegionalConfig, ProfitabilityState {
  // === Auth State ===
  isAuthenticated: boolean;
  currentUser: User | null;
  profile: {
    name: string;
    email: string;
    ranch: string;
    location: string;
    countryCode: CountryCode;
  } | null;
  
  // === Ranch State ===
  ranches: Ranch[];
  activeRanch: Ranch | null;
  currentRanch: Ranch | null;
  
  // === Animal State ===
  animals: Animal[];
  cattle: Animal[];
  milkProductions: MilkProduction[];
  
  // === Onboarding State ===
  isOnboardingComplete: boolean;
  profilePromptDismissed: boolean;
  onboardingData: any;
  
  // === MÉTODOS MEJORADOS CON VALIDACIÓN ===
  
  // Configuración regional
  setCountry: (country: CountryCode) => Promise<void>;
  setLocaleConfig: (config: LocaleConfig) => void;
  updateUnitSystem: (units: Partial<UnitSystem>) => void;
  
  // Usuario con validación
  setCurrentUser: (user: User | null) => void;
  logout: () => void;
  
  // Rancho con validación
  addRanch: (ranch: Omit<Ranch, 'id' | 'createdAt' | 'updatedAt'>) => Promise<ProcessingResult<Ranch>>;
  updateRanch: (id: string, updates: Partial<Ranch>) => Promise<ProcessingResult<Ranch>>;
  deleteRanch: (id: string) => Promise<ProcessingResult<void>>;
  setActiveRanch: (ranch: Ranch | null) => void;
  
  // Animales con validación
  addAnimal: (animal: Omit<Animal, 'id' | 'createdAt' | 'updatedAt'>) => Promise<ProcessingResult<Animal>>;
  updateAnimal: (id: string, updates: Partial<Animal>) => Promise<ProcessingResult<Animal>>;
  deleteAnimal: (id: string) => Promise<ProcessingResult<void>>;
  getAnimalsByRanch: (ranchId: string) => Animal[];
  getCattleByRanch: (ranchId: string) => Animal[];
  
  // Producción con conversión de unidades
  addMilkProduction: (production: Omit<MilkProduction, 'id' | 'createdAt'>) => Promise<ProcessingResult<MilkProduction>>;
  getTotalMilkProduction: (date?: string, unit?: 'liter' | 'gallon') => number;
  
  // Análisis de rentabilidad
  analyzeProfitability: (input: LivestockProfitabilityInput) => Promise<LivestockProfitabilityOutput>;
  getLastAnalysis: () => LivestockProfitabilityOutput | null;
  
  // Validación
  validateEntity: <T>(entity: T, type: 'ranch' | 'animal' | 'production') => ValidationResult;
  getValidationErrors: (entityId: string) => ValidationError[];
  
  // Utilidades
  convertWeight: (value: number, from: 'kg' | 'lb' | 'arroba', to: 'kg' | 'lb' | 'arroba') => number;
  generateTraceId: () => string;
}

const useRanchOSStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // === VALORES INICIALES ===
      
      // Configuración regional (México por defecto)
      currentCountry: 'MX' as CountryCode,
      localeConfig: {
        country: 'MX',
        currency: 'MXN',
        locale: 'es-MX',
        units: {
          weight: 'kg',
          area: 'hectare',
          volume: 'liter',
          temperature: 'celsius'
        },
        regulations: ['NOM-001-SAG-2023'],
        taxRules: {
          vatRate: 0.16,
          incomeTaxRate: 0.30,
          specialRates: {}
        }
      },
      unitSystem: {
        weight: 'kg',
        area: 'hectare',
        volume: 'liter',
        temperature: 'celsius'
      },
      currency: 'MXN',
      
      // Estado de procesamiento
      lastProcessingResult: null,
      validationResults: new Map(),
      processingQueue: [],
      isProcessing: false,
      
      // Estado de rentabilidad
      lastAnalysis: null,
      analysisHistory: new Map(),
      isAnalyzing: false,
      
      // Estados existentes
      isAuthenticated: false,
      currentUser: null,
      profile: null,
      ranches: [],
      activeRanch: null,
      currentRanch: null,
      animals: [],
      cattle: [],
      milkProductions: [],
      isOnboardingComplete: false,
      profilePromptDismissed: false,
      onboardingData: { currentStep: 1 },
      
      // === MÉTODOS IMPLEMENTADOS ===
      
      // Generar ID de trazabilidad
      generateTraceId: () => `TRACE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      
      // Cambiar país con conversión de unidades
      setCountry: async (country: CountryCode) => {
        set({ isProcessing: true });
        
        try {
          // Configurar unidades según el país
          const newUnits: UnitSystem = {
            weight: country === 'BR' ? 'arroba' : 'kg',
            area: ['MX', 'BR', 'CO'].includes(country) ? 'hectare' : 'acre',
            volume: ['MX', 'ES'].includes(country) ? 'liter' : 'gallon',
            temperature: 'celsius'
          };
          
          // Configurar moneda
          const currencies: Record<CountryCode, string> = {
            MX: 'MXN',
            CO: 'COP',
            BR: 'BRL',
            ES: 'EUR'
          };
          
          // Actualizar configuración
          const newConfig: LocaleConfig = {
            country,
            currency: currencies[country],
            locale: `${country.toLowerCase()}-${country}`,
            units: newUnits,
            regulations: [], // Cargar desde API
            taxRules: {
              vatRate: country === 'MX' ? 0.16 : 0.21,
              incomeTaxRate: 0.30,
              specialRates: {}
            }
          };
          
          set({
            currentCountry: country,
            localeConfig: newConfig,
            unitSystem: newUnits,
            currency: currencies[country],
            isProcessing: false
          });
          
          // Convertir pesos de animales existentes
          const state = get();
          if (state.animals.length > 0) {
            // TODO: Implementar conversión masiva
          }
          
        } catch (error) {
          set({ isProcessing: false });
          throw error;
        }
      },
      
      // Agregar rancho con validación
      addRanch: async (ranchData) => {
        const state = get();
        const traceId = state.generateTraceId();
        
        try {
          set({ isProcessing: true });
          
          // Validar datos del rancho
          const validationResult = state.validateEntity(ranchData, 'ranch');
          
          if (!validationResult.isValid) {
            const result: ProcessingResult<Ranch> = {
              success: false,
              errors: validationResult.errors,
              warnings: validationResult.warnings,
              metadata: {
                id: 'ranch-validator',
                version: '1.0.0',
                name: 'Ranch Validator',
                description: 'Validates ranch data',
                supportedCountries: ['MX', 'CO', 'BR', 'ES'],
                lastUpdated: new Date().toISOString()
              },
              traceId
            };
            
            set({ 
              lastProcessingResult: result,
              isProcessing: false 
            });
            
            return result;
          }
          
          // Crear rancho
          const newRanch: Ranch = {
            ...ranchData,
            id: `ranch-${Date.now()}`,
            countryCode: state.currentCountry,
            validationStatus: validationResult,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          set((state) => ({
            ranches: [...state.ranches, newRanch],
            currentRanch: newRanch,
            activeRanch: newRanch,
            isProcessing: false
          }));
          
          // Guardar resultado de validación
          state.validationResults.set(newRanch.id, validationResult);
          
          const result: ProcessingResult<Ranch> = {
            success: true,
            data: newRanch,
            metadata: {
              id: 'ranch-processor',
              version: '1.0.0',
              name: 'Ranch Processor',
              description: 'Processes ranch operations',
              supportedCountries: ['MX', 'CO', 'BR', 'ES'],
              lastUpdated: new Date().toISOString()
            },
            processingTime: Date.now(),
            traceId
          };
          
          set({ lastProcessingResult: result });
          return result;
          
        } catch (error) {
          set({ isProcessing: false });
          throw error;
        }
      },
      
      // Agregar animal con validación y conversión
      addAnimal: async (animalData) => {
        const state = get();
        const traceId = state.generateTraceId();
        
        try {
          set({ isProcessing: true });
          
          // Aplicar unidades del sistema
          const animalWithUnits = {
            ...animalData,
            weightUnit: state.unitSystem.weight,
            countrySpecificData: {
              country: state.currentCountry,
              addedDate: new Date().toISOString()
            }
          };
          
          // Validar
          const validationResult = state.validateEntity(animalWithUnits, 'animal');
          
          if (!validationResult.isValid) {
            const result: ProcessingResult<Animal> = {
              success: false,
              errors: validationResult.errors,
              warnings: validationResult.warnings,
              metadata: {
                id: 'animal-validator',
                version: '1.0.0',
                name: 'Animal Validator',
                description: 'Validates animal data',
                supportedCountries: ['MX', 'CO', 'BR', 'ES'],
                lastUpdated: new Date().toISOString()
              },
              traceId
            };
            
            set({ 
              lastProcessingResult: result,
              isProcessing: false 
            });
            
            return result;
          }
          
          // Crear animal
          const newAnimal: Animal = {
            ...animalWithUnits,
            id: `animal-${Date.now()}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          set((state) => ({
            animals: [...state.animals, newAnimal],
            cattle: [...state.cattle, newAnimal],
            isProcessing: false
          }));
          
          // Guardar validación
          state.validationResults.set(newAnimal.id, validationResult);
          
          const result: ProcessingResult<Animal> = {
            success: true,
            data: newAnimal,
            metadata: {
              id: 'animal-processor',
              version: '1.0.0',
              name: 'Animal Processor',
              description: 'Processes animal operations',
              supportedCountries: ['MX', 'CO', 'BR', 'ES'],
              lastUpdated: new Date().toISOString()
            },
            processingTime: Date.now(),
            traceId
          };
          
          set({ lastProcessingResult: result });
          return result;
          
        } catch (error) {
          set({ isProcessing: false });
          throw error;
        }
      },
      
      // Validación básica (expandir según necesidades)
      validateEntity: (entity: any, type: string): ValidationResult => {
        const errors: ValidationError[] = [];
        const warnings: ValidationError[] = [];
        
        // Validaciones por tipo
        switch (type) {
          case 'ranch':
            if (!entity.name || entity.name.length < 3) {
              errors.push({
                code: 'RANCH_NAME_INVALID',
                message: 'El nombre del rancho debe tener al menos 3 caracteres',
                field: 'name'
              });
            }
            if (!entity.size || entity.size <= 0) {
              errors.push({
                code: 'RANCH_SIZE_INVALID',
                message: 'El tamaño del rancho debe ser mayor a 0',
                field: 'size'
              });
            }
            break;
            
          case 'animal':
            if (!entity.tag) {
              errors.push({
                code: 'ANIMAL_TAG_REQUIRED',
                message: 'La etiqueta del animal es requerida',
                field: 'tag'
              });
            }
            // Validación por país
            const state = get();
            if (state.currentCountry === 'MX' && !entity.tag.startsWith('MX-')) {
              warnings.push({
                code: 'TAG_FORMAT_SUGGESTION',
                message: 'Se recomienda usar formato MX-XXXXX para México',
                field: 'tag'
              });
            }
            break;
        }
        
        return {
          isValid: errors.length === 0,
          errors,
          warnings
        };
      },
      
      // Conversión de peso
      convertWeight: (value: number, from: 'kg' | 'lb' | 'arroba', to: 'kg' | 'lb' | 'arroba'): number => {
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
      },
      
      // Análisis de rentabilidad (stub - integrar con motor real)
      analyzeProfitability: async (input: LivestockProfitabilityInput): Promise<LivestockProfitabilityOutput> => {
        set({ isAnalyzing: true });
        
        try {
          // Simular llamada al motor de rentabilidad
          const output: LivestockProfitabilityOutput = {
            revenue: input.revenue,
            costs: {
              feed: input.feedCost,
              labor: input.laborCost,
              veterinary: input.veterinaryCost,
              infrastructure: input.infrastructureCost,
              other: input.otherCosts,
              total: input.feedCost + input.laborCost + input.veterinaryCost + input.infrastructureCost + input.otherCosts
            },
            profitability: input.revenue - (input.feedCost + input.laborCost + input.veterinaryCost + input.infrastructureCost + input.otherCosts),
            margin: ((input.revenue - (input.feedCost + input.laborCost + input.veterinaryCost + input.infrastructureCost + input.otherCosts)) / input.revenue) * 100,
            breakEvenPoint: {
              units: Math.ceil((input.feedCost + input.laborCost + input.veterinaryCost + input.infrastructureCost + input.otherCosts) / (input.revenue / input.animalCount)),
              revenue: input.feedCost + input.laborCost + input.veterinaryCost + input.infrastructureCost + input.otherCosts,
              timeToBreakEven: 180 // días estimados
            },
            roi: ((input.revenue - (input.feedCost + input.laborCost + input.veterinaryCost + input.infrastructureCost + input.otherCosts)) / (input.feedCost + input.laborCost + input.veterinaryCost + input.infrastructureCost + input.otherCosts)) * 100,
            projections: [],
            recommendations: ['Optimizar costos de alimentación', 'Revisar eficiencia laboral'],
            metadata: {
              calculatedAt: new Date(),
              locale: get().localeConfig?.locale || 'es-MX',
              currency: get().currency
            }
          };
          
          set({ 
            lastAnalysis: output,
            isAnalyzing: false 
          });
          
          // Guardar en historial
          get().analysisHistory.set(`analysis-${Date.now()}`, output);
          
          return output;
          
        } catch (error) {
          set({ isAnalyzing: false });
          throw error;
        }
      },
      
      // Métodos existentes actualizados...
      updateAnimal: async (id, updates) => {
        const traceId = get().generateTraceId();
        // Implementar con validación
        // ...código similar a addAnimal
        return {} as ProcessingResult<Animal>;
      },
      
      deleteAnimal: async (id) => {
        const traceId = get().generateTraceId();
        // Implementar con procesamiento
        return {} as ProcessingResult<void>;
      },
      
      // ... resto de métodos existentes adaptados
      
      // Métodos sin cambios (temporalmente)
      setCurrentUser: (user) => set({ currentUser: user, isAuthenticated: !!user }),
      setLocaleConfig: (config) => set({ localeConfig: config }),
      updateUnitSystem: (units) => set((state) => ({ 
        unitSystem: { ...state.unitSystem, ...units } 
      })),
      getLastAnalysis: () => get().lastAnalysis,
      getValidationErrors: (entityId) => {
        const result = get().validationResults.get(entityId);
        return result?.errors || [];
      },
      
      // Métodos existentes básicos
      logout: () => {
        set({
          currentUser: null,
          profile: null,
          isAuthenticated: false,
          currentRanch: null,
          activeRanch: null,
          animals: [],
          cattle: [],
          milkProductions: [],
          isOnboardingComplete: false,
          profilePromptDismissed: false,
          onboardingData: { currentStep: 1 },
          // Limpiar estado de procesamiento
          lastProcessingResult: null,
          validationResults: new Map(),
          processingQueue: [],
          lastAnalysis: null,
          analysisHistory: new Map()
        });
        localStorage.removeItem('ranch-store');
      },
      
      // ... resto de implementaciones básicas de métodos existentes
      setActiveRanch: (ranch) => set({ activeRanch: ranch }),
      getAnimalsByRanch: (ranchId) => get().animals.filter(a => a.ranchId === ranchId),
      getCattleByRanch: (ranchId) => get().cattle.filter(a => a.ranchId === ranchId),
      
      // Producción mejorada con conversión
      getTotalMilkProduction: (date?: string, unit: 'liter' | 'gallon' = 'liter') => {
        const state = get();
        const targetDate = date || new Date().toISOString().split('T')[0];
        
        const totalLiters = state.milkProductions
          .filter(p => p.date === targetDate)
          .reduce((total, p) => {
            // Convertir a litros si es necesario
            const liters = p.unit === 'gallon' ? p.quantity * 3.78541 : p.quantity;
            return total + liters;
          }, 0);
        
        // Convertir al unit solicitado
        return unit === 'gallon' ? totalLiters / 3.78541 : totalLiters;
      },
      
      // Stubs para métodos pendientes
      updateRanch: async () => ({} as ProcessingResult<Ranch>),
      deleteRanch: async () => ({} as ProcessingResult<void>),
      addMilkProduction: async () => ({} as ProcessingResult<MilkProduction>),
      setProfilePromptDismissed: (dismissed) => set({ profilePromptDismissed: dismissed }),
      setIsOnboardingComplete: (complete) => set({ isOnboardingComplete: complete }),
      setOnboardingStep: () => {},
      setOnboardingData: () => {},
      completeOnboarding: () => {},
      resetOnboarding: () => {},
      addCattle: () => {},
      getAnimalStats: () => ({ total: 0, byStatus: {}, byType: {} })
    }),
    {
      name: 'ranch-store-v2', // Nueva versión
      partialize: (state) => ({
        // Persistir configuración regional
        currentCountry: state.currentCountry,
        localeConfig: state.localeConfig,
        unitSystem: state.unitSystem,
        currency: state.currency,
        
        // Persistir datos existentes
        isAuthenticated: state.isAuthenticated,
        currentUser: state.currentUser,
        profile: state.profile,
        ranches: state.ranches,
        currentRanch: state.currentRanch,
        activeRanch: state.activeRanch,
        animals: state.animals,
        cattle: state.cattle,
        milkProductions: state.milkProductions,
        isOnboardingComplete: state.isOnboardingComplete,
        profilePromptDismissed: state.profilePromptDismissed,
        onboardingData: state.onboardingData,
        
        // NO persistir estado temporal
        // lastProcessingResult, isProcessing, etc.
      })
    }
  )
);

// Exportar tipos para uso en componentes
export type { 
  User, 
  Ranch, 
  Animal, 
  MilkProduction,
  ProcessingState,
  RegionalConfig,
  ProfitabilityState
};

export default useRanchOSStore;