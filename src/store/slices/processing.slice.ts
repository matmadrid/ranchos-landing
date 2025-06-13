// src/store/slices/processing.slice.ts
import { StateCreator } from 'zustand';
import type { 
  ProcessingResult, 
  ValidationResult, 
  ValidationError 
} from '@/types';

export interface ProcessingSlice {
  // Estado
  lastProcessingResult: ProcessingResult<any> | null;
  validationResults: Map<string, ValidationResult>;
  processingQueue: string[];
  isProcessing: boolean;
  processingErrors: Record<string, Error>;
  
  // Acciones de procesamiento
  startProcessing: (operationId: string) => void;
  endProcessing: (operationId: string, result: ProcessingResult<any>) => void;
  clearProcessingResult: () => void;
  
  // Gestión de cola
  addToQueue: (operationId: string) => void;
  removeFromQueue: (operationId: string) => void;
  isInQueue: (operationId: string) => boolean;
  getQueueLength: () => number;
  
  // Validación
  saveValidationResult: (entityId: string, result: ValidationResult) => void;
  clearValidationResult: (entityId: string) => void;
  getValidationResult: (entityId: string) => ValidationResult | undefined;
  hasValidationErrors: (entityId: string) => boolean;
  
  // Manejo de errores
  setProcessingError: (operationId: string, error: Error) => void;
  clearProcessingError: (operationId: string) => void;
  getProcessingError: (operationId: string) => Error | undefined;
  
  // Utilidades
  createProcessingResult: <T>(
    success: boolean,
    data?: T,
    errors?: ValidationError[],
    warnings?: ValidationError[]
  ) => ProcessingResult<T>;
}

/**
 * Slice para manejar procesamiento asíncrono y validación
 * Mantiene la trazabilidad y metadata de todas las operaciones
 */
export const createProcessingSlice: StateCreator<ProcessingSlice> = (set, get) => ({
  // Estado inicial
  lastProcessingResult: null,
  validationResults: new Map(),
  processingQueue: [],
  isProcessing: false,
  processingErrors: {},
  
  // Iniciar procesamiento
  startProcessing: (operationId) => {
    set((state) => ({
      isProcessing: true,
      processingQueue: [...state.processingQueue, operationId]
    }));
  },
  
  // Finalizar procesamiento
  endProcessing: (operationId, result) => {
    set((state) => ({
      lastProcessingResult: result,
      isProcessing: state.processingQueue.length > 1,
      processingQueue: state.processingQueue.filter(id => id !== operationId)
    }));
    
    // Log en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Processing] Operación completada:`, {
        operationId,
        success: result.success,
        duration: result.processingTime ? `${Date.now() - result.processingTime}ms` : 'N/A',
        traceId: result.traceId
      });
    }
  },
  
  // Limpiar resultado de procesamiento
  clearProcessingResult: () => {
    set({ lastProcessingResult: null });
  },
  
  // Agregar a cola
  addToQueue: (operationId) => {
    set((state) => ({
      processingQueue: [...new Set([...state.processingQueue, operationId])]
    }));
  },
  
  // Remover de cola
  removeFromQueue: (operationId) => {
    set((state) => ({
      processingQueue: state.processingQueue.filter(id => id !== operationId),
      isProcessing: state.processingQueue.length > 1
    }));
  },
  
  // Verificar si está en cola
  isInQueue: (operationId) => {
    return get().processingQueue.includes(operationId);
  },
  
  // Obtener longitud de cola
  getQueueLength: () => {
    return get().processingQueue.length;
  },
  
  // Guardar resultado de validación
  saveValidationResult: (entityId, result) => {
    const validationResults = new Map(get().validationResults);
    validationResults.set(entityId, result);
    set({ validationResults });
    
    // Auto-limpiar después de 1 hora
    setTimeout(() => {
      const currentResults = get().validationResults;
      if (currentResults.get(entityId) === result) {
        get().clearValidationResult(entityId);
      }
    }, 3600000); // 1 hora
  },
  
  // Limpiar resultado de validación
  clearValidationResult: (entityId) => {
    const validationResults = new Map(get().validationResults);
    validationResults.delete(entityId);
    set({ validationResults });
  },
  
  // Obtener resultado de validación
  getValidationResult: (entityId) => {
    return get().validationResults.get(entityId);
  },
  
  // Verificar si tiene errores de validación
  hasValidationErrors: (entityId) => {
    const result = get().validationResults.get(entityId);
    return result ? !result.isValid : false;
  },
  
  // Establecer error de procesamiento
  setProcessingError: (operationId, error) => {
    set((state) => ({
      processingErrors: {
        ...state.processingErrors,
        [operationId]: error
      }
    }));
  },
  
  // Limpiar error de procesamiento
  clearProcessingError: (operationId) => {
    set((state) => {
      const { [operationId]: _, ...rest } = state.processingErrors;
      return { processingErrors: rest };
    });
  },
  
  // Obtener error de procesamiento
  getProcessingError: (operationId) => {
    return get().processingErrors[operationId];
  },
  
  // Crear resultado de procesamiento estructurado
  createProcessingResult: <T>(
    success: boolean,
    data?: T,
    errors?: ValidationError[],
    warnings?: ValidationError[]
  ): ProcessingResult<T> => {
    const baseResult: ProcessingResult<T> = {
      success,
      metadata: {
        id: 'ranchos-processor',
        version: '2.0.0',
        name: 'RanchOS Processing Engine',
        description: 'Enterprise-grade processing for ranch operations',
        supportedCountries: ['MX', 'CO', 'BR', 'ES'],
        lastUpdated: new Date().toISOString()
      },
      processingTime: Date.now(),
      traceId: `TRACE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    
    if (data) baseResult.data = data;
    if (errors && errors.length > 0) baseResult.errors = errors;
    if (warnings && warnings.length > 0) baseResult.warnings = warnings;
    
    return baseResult;
  }
});