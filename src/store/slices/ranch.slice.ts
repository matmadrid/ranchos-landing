// src/store/slices/ranch.slice.ts
import { StateCreator } from 'zustand';
import type { ProcessingResult, ValidationError, ModelMetadata } from '@/types';
import type { ProcessingSlice } from './processing.slice';

export interface Ranch {
  id: string;
  name: string;
  location: string;
  countryCode: 'MX' | 'CO' | 'BR' | 'ES';
  size: number;
  sizeUnit: 'hectare' | 'acre';
  type?: 'dairy' | 'beef' | 'mixed';
  description?: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt?: string;
  
  // Métricas
  totalAnimals?: number;
  totalArea?: number;
  productionMetrics?: {
    milk?: number; // litros/día
    meat?: number; // kg/mes
  };
}

export interface RanchSlice {
  // Estado
  ranches: Ranch[];
  activeRanch: Ranch | null;
  currentRanch: Ranch | null; // Compatibilidad legacy
  
  // Acciones básicas - AHORA DEVUELVEN ProcessingResult
  addRanch: (ranch: Omit<Ranch, 'id' | 'createdAt' | 'updatedAt'>) => Promise<ProcessingResult<Ranch>>;
  updateRanch: (id: string, updates: Partial<Ranch>) => Promise<ProcessingResult<Ranch>>;
  deleteRanch: (id: string) => Promise<ProcessingResult<{ id: string; deleted: boolean }>>;
  setActiveRanch: (ranch: Ranch | null) => void;
  setCurrentRanch: (ranch: Ranch | null) => void; // Legacy
  
  // Consultas
  getRanchById: (id: string) => Ranch | undefined;
  getRanchesByType: (type: 'dairy' | 'beef' | 'mixed') => Ranch[];
  getTotalRanchArea: () => number;
  
  // Utilidades
  switchRanch: (ranchId: string) => void;
  validateRanchData: (data: any) => { isValid: boolean; errors: ValidationError[] };
  
  // Operaciones adicionales para completar la arquitectura
  deleteProduction?: (id: string) => Promise<ProcessingResult<{ id: string; deleted: boolean }>>;
  deleteCattle?: (id: string) => Promise<ProcessingResult<{ id: string; deleted: boolean }>>;
}

// Utilidades para generar trace IDs y crear resultados de procesamiento
const generateTraceId = (): string => {
  return `trace-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const createProcessingResult = <T>(config: {
  success: boolean;
  data: T | null;
  errors?: ValidationError[];
  traceId: string;
  processingTime: number;
  metadata?: ModelMetadata;
}): ProcessingResult<T> => {
  return {
    success: config.success,
    data: config.data === null ? undefined : config.data,
    errors: config.errors || [],
    traceId: config.traceId,
    processingTime: config.processingTime,
    metadata: config.metadata || {
      id: 'ranch-processor',
      version: '2.0.0',
      name: 'RanchOS Ranch Processing',
      description: 'Ranch operations processor',
      supportedCountries: ['MX', 'CO', 'BR', 'ES'],
      lastUpdated: new Date().toISOString()
    }
  };
};

// Extender el tipo para incluir ProcessingSlice
type RanchSliceWithProcessing = RanchSlice & ProcessingSlice;

export const createRanchSlice: StateCreator<
  RanchSliceWithProcessing,
  [],
  [],
  RanchSlice
> = (set, get) => ({
  // Estado inicial
  ranches: [],
  activeRanch: null,
  currentRanch: null,
  
  // Agregar rancho - AHORA DEVUELVE ProcessingResult
  addRanch: async (ranchData) => {
    const operationId = `add-ranch-${Date.now()}`;
    
    try {
      // Iniciar procesamiento
      get().startProcessing(operationId);
      
      // Validar datos
      const validation = get().validateRanchData(ranchData);
      
      if (!validation.isValid) {
        // Crear resultado de error
        const result = get().createProcessingResult<Ranch>(
          false,
          undefined,
          validation.errors
        );
        
        get().endProcessing(operationId, result);
        return result;
      }
      
      // Crear rancho
      const newRanch: Ranch = {
        ...ranchData,
        id: `ranch-${Date.now()}`,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Actualizar estado
      set((state) => ({
        ranches: [...state.ranches, newRanch],
        activeRanch: newRanch,
        currentRanch: newRanch // Legacy
      }));
      
      // Crear resultado exitoso
      const result = get().createProcessingResult<Ranch>(
        true,
        newRanch,
        undefined,
        validation.errors.filter(e => e.severity === 'warning')
      );
      
      get().endProcessing(operationId, result);
      return result;
      
    } catch (error) {
      // Manejar error inesperado
      const errorResult = get().createProcessingResult<Ranch>(
        false,
        undefined,
        [{
          code: 'RANCH_CREATE_ERROR',
          message: error instanceof Error ? error.message : 'Error desconocido al crear rancho',
          field: '',
          severity: 'error'
        }]
      );
      
      get().endProcessing(operationId, errorResult);
      get().setProcessingError(operationId, error as Error);
      return errorResult;
    }
  },
  
  // Actualizar rancho - AHORA DEVUELVE ProcessingResult
  updateRanch: async (id, updates) => {
    const operationId = `update-ranch-${Date.now()}`;
    
    try {
      get().startProcessing(operationId);
      
      const existingRanch = get().getRanchById(id);
      
      if (!existingRanch) {
        const result = get().createProcessingResult<Ranch>(
          false,
          undefined,
          [{
            code: 'RANCH_NOT_FOUND',
            message: `Rancho con ID ${id} no encontrado`,
            field: 'id',
            severity: 'error'
          }]
        );
        
        get().endProcessing(operationId, result);
        return result;
      }
      
      // Validar actualizaciones
      const updatedRanch = { ...existingRanch, ...updates };
      const validation = get().validateRanchData(updatedRanch);
      
      if (!validation.isValid) {
        const result = get().createProcessingResult<Ranch>(
          false,
          undefined,
          validation.errors
        );
        
        get().endProcessing(operationId, result);
        return result;
      }
      
      // Actualizar estado
      set((state) => ({
        ranches: state.ranches.map((ranch) =>
          ranch.id === id 
            ? { 
                ...ranch, 
                ...updates, 
                updatedAt: new Date().toISOString() 
              } 
            : ranch
        ),
        activeRanch: 
          state.activeRanch?.id === id 
            ? { ...state.activeRanch, ...updates, updatedAt: new Date().toISOString() }
            : state.activeRanch,
        currentRanch: 
          state.currentRanch?.id === id 
            ? { ...state.currentRanch, ...updates, updatedAt: new Date().toISOString() }
            : state.currentRanch
      }));
      
      const result = get().createProcessingResult<Ranch>(
        true,
        { ...updatedRanch, updatedAt: new Date().toISOString() }
      );
      
      get().endProcessing(operationId, result);
      return result;
      
    } catch (error) {
      const errorResult = get().createProcessingResult<Ranch>(
        false,
        undefined,
        [{
          code: 'RANCH_UPDATE_ERROR',
          message: error instanceof Error ? error.message : 'Error al actualizar rancho',
          field: '',
          severity: 'error'
        }]
      );
      
      get().endProcessing(operationId, errorResult);
      return errorResult;
    }
  },
  
  // Eliminar rancho - FIXED: Ahora devuelve { id: string; deleted: boolean }
  deleteRanch: async (id: string): Promise<ProcessingResult<{ id: string; deleted: boolean }>> => {
    const startTime = Date.now();
    const traceId = generateTraceId();
    
    try {
      const { ranches, activeRanch } = get();
      const ranchIndex = ranches.findIndex(r => r.id === id);
      
      if (ranchIndex === -1) {
        return createProcessingResult<{ id: string; deleted: boolean }>({
          success: false,
          data: null,
          errors: [{
            field: 'id',
            message: 'Ranch not found',
            severity: 'error',
            code: 'NOT_FOUND'
          }],
          traceId,
          processingTime: Date.now() - startTime
        });
      }
      
      // No permitir eliminar el rancho activo
      if (activeRanch?.id === id) {
        return createProcessingResult<{ id: string; deleted: boolean }>({
          success: false,
          data: null,
          errors: [{
            field: 'id',
            message: 'Cannot delete active ranch',
            severity: 'error',
            code: 'ACTIVE_RANCH'
          }],
          traceId,
          processingTime: Date.now() - startTime
        });
      }
      
      // Verificar si hay animales asociados (si existe la propiedad animals)
      const state = get() as any;
      const associatedAnimals = state.animals?.filter?.((a: any) => a.ranchId === id).length || 0;
      
      if (associatedAnimals > 0) {
        return createProcessingResult<{ id: string; deleted: boolean }>({
          success: false,
          data: null,
          errors: [{
            field: 'animals',
            message: `Cannot delete ranch with ${associatedAnimals} associated animals`,
            severity: 'error',
            code: 'RANCH_HAS_ANIMALS'
          }],
          traceId,
          processingTime: Date.now() - startTime
        });
      }
      
      // Eliminar el rancho
      const updatedRanches = ranches.filter(r => r.id !== id);
      
      set((state) => {
        const filteredRanches = state.ranches.filter((ranch) => ranch.id !== id);
        const isActiveRanch = state.activeRanch?.id === id;
        
        return {
          ranches: filteredRanches,
          activeRanch: isActiveRanch ? filteredRanches[0] || null : state.activeRanch,
          currentRanch: isActiveRanch ? filteredRanches[0] || null : state.currentRanch
        };
      });
      
      return createProcessingResult<{ id: string; deleted: boolean }>({
        success: true,
        data: { id, deleted: true }, // ✅ Devolver data de confirmación
        traceId,
        processingTime: Date.now() - startTime,
      });
      
    } catch (error) {
      return createProcessingResult<{ id: string; deleted: boolean }>({
        success: false,
        data: null,
        errors: [{
          field: 'general',
          message: error instanceof Error ? error.message : 'Unknown error',
          severity: 'error',
          code: 'INTERNAL_ERROR'
        }],
        traceId,
        processingTime: Date.now() - startTime
      });
    }
  },
  
  // FIXED: deleteProduction - Operación DELETE para producciones
  deleteProduction: async (id: string): Promise<ProcessingResult<{ id: string; deleted: boolean }>> => {
    const startTime = Date.now();
    const traceId = generateTraceId();
    
    try {
      const state = get() as any;
      const productions = state.productions || [];
      const productionIndex = productions.findIndex((p: any) => p.id === id);
      
      if (productionIndex === -1) {
        return createProcessingResult<{ id: string; deleted: boolean }>({
          success: false,
          data: null,
          errors: [{
            field: 'id',
            message: 'Production not found',
            severity: 'error',
            code: 'NOT_FOUND'
          }],
          traceId,
          processingTime: Date.now() - startTime
        });
      }
      
      // Eliminar la producción
      const updatedProductions = productions.filter((p: any) => p.id !== id);
      
      set((state: any) => ({
        ...state,
        productions: updatedProductions
      }));
      
      return createProcessingResult<{ id: string; deleted: boolean }>({
        success: true,
        data: { id, deleted: true }, // ✅ Devolver data de confirmación
        traceId,
        processingTime: Date.now() - startTime,
      });
      
    } catch (error) {
      return createProcessingResult<{ id: string; deleted: boolean }>({
        success: false,
        data: null,
        errors: [{
          field: 'general',
          message: error instanceof Error ? error.message : 'Unknown error',
          severity: 'error',
          code: 'INTERNAL_ERROR'
        }],
        traceId,
        processingTime: Date.now() - startTime
      });
    }
  },
  
  // FIXED: deleteCattle - Operación DELETE para ganado
  deleteCattle: async (id: string): Promise<ProcessingResult<{ id: string; deleted: boolean }>> => {
    const startTime = Date.now();
    const traceId = generateTraceId();
    
    try {
      const state = get() as any;
      const cattle = state.cattle || [];
      const animalIndex = cattle.findIndex((c: any) => c.id === id);
      
      if (animalIndex === -1) {
        return createProcessingResult<{ id: string; deleted: boolean }>({
          success: false,
          data: null,
          errors: [{
            field: 'id',
            message: 'Animal not found',
            severity: 'error',
            code: 'NOT_FOUND'
          }],
          traceId,
          processingTime: Date.now() - startTime
        });
      }
      
      // Eliminar el animal
      const updatedCattle = cattle.filter((c: any) => c.id !== id);
      
      set((state: any) => ({
        ...state,
        cattle: updatedCattle
      }));
      
      return createProcessingResult<{ id: string; deleted: boolean }>({
        success: true,
        data: { id, deleted: true }, // ✅ Devolver data de confirmación
        traceId,
        processingTime: Date.now() - startTime,
      });
      
    } catch (error) {
      return createProcessingResult<{ id: string; deleted: boolean }>({
        success: false,
        data: null,
        errors: [{
          field: 'general',
          message: error instanceof Error ? error.message : 'Unknown error',
          severity: 'error',
          code: 'INTERNAL_ERROR'
        }],
        traceId,
        processingTime: Date.now() - startTime
      });
    }
  },
  
  // Establecer rancho activo
  setActiveRanch: (ranch) => set({ 
    activeRanch: ranch,
    currentRanch: ranch // Mantener sincronizado
  }),
  
  // Legacy: establecer rancho actual
  setCurrentRanch: (ranch) => set({ 
    currentRanch: ranch,
    activeRanch: ranch // Mantener sincronizado
  }),
  
  // Obtener rancho por ID
  getRanchById: (id) => {
    return get().ranches.find(ranch => ranch.id === id);
  },
  
  // Obtener ranchos por tipo
  getRanchesByType: (type) => {
    return get().ranches.filter(ranch => ranch.type === type);
  },
  
  // Obtener área total
  getTotalRanchArea: () => {
    return get().ranches.reduce((total, ranch) => {
      // Convertir a hectáreas si es necesario
      const areaInHectares = ranch.sizeUnit === 'acre' 
        ? ranch.size * 0.4047 
        : ranch.size;
      return total + areaInHectares;
    }, 0);
  },
  
  // Cambiar de rancho
  switchRanch: (ranchId) => {
    const ranch = get().getRanchById(ranchId);
    if (ranch) {
      set({ 
        activeRanch: ranch,
        currentRanch: ranch 
      });
    }
  },
  
  // Validar datos del rancho - MEJORADO PARA DEVOLVER ValidationError[]
  validateRanchData: (data) => {
    const errors: ValidationError[] = [];
    
    if (!data.name || data.name.trim().length < 3) {
      errors.push({
        code: 'RANCH_NAME_INVALID',
        message: 'El nombre debe tener al menos 3 caracteres',
        field: 'name',
        severity: 'error'
      });
    }
    
    if (!data.location || data.location.trim().length < 3) {
      errors.push({
        code: 'RANCH_LOCATION_INVALID',
        message: 'La ubicación es requerida',
        field: 'location',
        severity: 'error'
      });
    }
    
    if (!data.size || data.size <= 0) {
      errors.push({
        code: 'RANCH_SIZE_INVALID',
        message: 'El tamaño debe ser mayor a 0',
        field: 'size',
        severity: 'error'
      });
    }
    
    if (data.type && !['dairy', 'beef', 'mixed'].includes(data.type)) {
      errors.push({
        code: 'RANCH_TYPE_INVALID',
        message: 'Tipo de rancho inválido',
        field: 'type',
        severity: 'error'
      });
    }
    
    // Warnings
    if (data.size > 10000) {
      errors.push({
        code: 'RANCH_SIZE_LARGE',
        message: 'El tamaño del rancho es inusualmente grande',
        field: 'size',
        severity: 'warning'
      });
    }
    
    return {
      isValid: errors.filter(e => e.severity === 'error').length === 0,
      errors
    };
  }
});