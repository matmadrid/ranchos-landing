// src/store/slices/animal.slice.ts
import { StateCreator } from 'zustand';
import type { ProcessingResult, ValidationError, Animal as AnimalModel, AnimalStatus, HealthStatus, AnimalSex } from '@/types';
import type { ProcessingSlice } from './processing.slice';
import type { RanchSlice } from './ranch.slice';

// Usar el tipo Animal desde models.ts
// Extender el tipo Animal de models con las propiedades específicas del slice
export interface AnimalSliceExtended extends AnimalModel {
  // Datos adicionales del slice original
  motherId?: string;
  fatherId?: string;
  purchaseDate?: string;
  purchasePrice?: number;
  saleDate?: string;
  salePrice?: number;
  
  // Métricas de producción
  productionData?: {
    milkYield?: number; // litros/día
    lastCalvingDate?: string;
    pregnancyStatus?: boolean;
    expectedCalvingDate?: string;
  };
}

// Usar el tipo extendido en el slice
export type Animal = AnimalSliceExtended;

export interface MilkProduction {
  id: string;
  animalId: string;
  date: string;
  quantity: number;
  unit: 'liter' | 'gallon';
  period: 'morning' | 'afternoon' | 'evening';
  quality?: 'A' | 'B' | 'C';
  notes?: string;
  createdAt: string;
}

export interface AnimalSlice {
  // Estado
  animals: Animal[];
  cattle: Animal[]; // Legacy - mantener compatibilidad
  milkProductions: MilkProduction[];
  
  // Acciones CRUD - Ahora devuelven ProcessingResult
  addAnimal: (animal: Omit<Animal, 'id' | 'createdAt' | 'updatedAt'>) => Promise<ProcessingResult<Animal>>;
  updateAnimal: (id: string, updates: Partial<Animal>) => Promise<ProcessingResult<Animal>>;
  deleteAnimal: (id: string) => Promise<ProcessingResult<void>>;
  
  // Legacy - mantener compatibilidad
  addCattle: (cattle: Omit<Animal, 'id' | 'createdAt' | 'updatedAt'>) => Promise<ProcessingResult<Animal>>;
  
  // Producción de leche - También con ProcessingResult
  addMilkProduction: (production: Omit<MilkProduction, 'id' | 'createdAt'>) => Promise<ProcessingResult<MilkProduction>>;
  updateMilkProduction: (id: string, updates: Partial<MilkProduction>) => Promise<ProcessingResult<MilkProduction>>;
  deleteMilkProduction: (id: string) => Promise<ProcessingResult<void>>;
  
  // Consultas (no cambian)
  getAnimalsByRanch: (ranchId: string) => Animal[];
  getCattleByRanch: (ranchId: string) => Animal[]; // Legacy
  getAnimalById: (id: string) => Animal | undefined;
  getAnimalsByStatus: (status: Animal['status']) => Animal[];
  getPregnantAnimals: () => Animal[];
  getMilkProductionByDate: (date: string, ranchId?: string) => MilkProduction[];
  getMilkProductionsByAnimal: (animalId: string) => MilkProduction[];
  
  // Estadísticas (no cambian)
  getAnimalStats: (ranchId?: string) => {
    total: number;
    byStatus: Record<string, number>;
    byType: Record<string, number>;
    bySex: Record<string, number>;
    pregnant: number;
    productive: number;
  };
  
  getTotalMilkProduction: (date?: string, unit?: 'liter' | 'gallon') => number;
  getAverageMilkProduction: (animalId: string, days: number) => number;
  
  // Utilidades (validación actualizada)
  convertWeight: (value: number, from: 'kg' | 'lb' | 'arroba', to: 'kg' | 'lb' | 'arroba') => number;
  calculateAge: (birthDate: string) => { years: number; months: number };
  validateAnimalData: (data: any) => { isValid: boolean; errors: ValidationError[] };
  checkTagAvailability: (tag: string, excludeId?: string) => boolean;
}

// Tipo extendido con ProcessingSlice y RanchSlice
type AnimalSliceWithDeps = AnimalSlice & ProcessingSlice & RanchSlice;

export const createAnimalSlice: StateCreator<
  AnimalSliceWithDeps,
  [],
  [],
  AnimalSlice
> = (set, get) => ({
  // Estado inicial
  animals: [],
  cattle: [],
  milkProductions: [],
  
  // Agregar animal - Con ProcessingResult
  addAnimal: async (animalData) => {
    const operationId = `add-animal-${Date.now()}`;
    
    try {
      get().startProcessing(operationId);
      
      // Validar datos
      const validation = get().validateAnimalData(animalData);
      
      if (!validation.isValid) {
        const result = get().createProcessingResult<Animal>(
          false,
          undefined,
          validation.errors
        );
        
        get().endProcessing(operationId, result);
        return result;
      }
      
      // Verificar que el rancho existe
      const ranch = get().getRanchById(animalData.ranchId);
      if (!ranch) {
        const result = get().createProcessingResult<Animal>(
          false,
          undefined,
          [{
            code: 'RANCH_NOT_FOUND',
            message: 'El rancho especificado no existe',
            field: 'ranchId',
            severity: 'error'
          }]
        );
        
        get().endProcessing(operationId, result);
        return result;
      }
      
      // Verificar tag único
      if (!get().checkTagAvailability(animalData.tag)) {
        const result = get().createProcessingResult<Animal>(
          false,
          undefined,
          [{
            code: 'ANIMAL_TAG_DUPLICATE',
            message: `La etiqueta ${animalData.tag} ya está en uso`,
            field: 'tag',
            severity: 'error'
          }]
        );
        
        get().endProcessing(operationId, result);
        return result;
      }
      
      // Crear animal
      const newAnimal: Animal = {
        ...animalData,
        id: `animal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: animalData.type || 'cattle',
        status: animalData.status || 'healthy',
        healthStatus: animalData.healthStatus || 'good',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Actualizar estado
      set((state) => ({
        animals: [...state.animals, newAnimal],
        cattle: newAnimal.type === 'cattle' 
          ? [...state.cattle, newAnimal] 
          : state.cattle
      }));
      
      // Crear resultado exitoso
      const result = get().createProcessingResult<Animal>(
        true,
        newAnimal,
        undefined,
        validation.errors.filter(e => e.severity === 'warning')
      );
      
      get().endProcessing(operationId, result);
      return result;
      
    } catch (error) {
      const errorResult = get().createProcessingResult<Animal>(
        false,
        undefined,
        [{
          code: 'ANIMAL_CREATE_ERROR',
          message: error instanceof Error ? error.message : 'Error al crear animal',
          field: '',
          severity: 'error'
        }]
      );
      
      get().endProcessing(operationId, errorResult);
      get().setProcessingError(operationId, error as Error);
      return errorResult;
    }
  },
  
  // Legacy: agregar ganado - Con ProcessingResult
  addCattle: async (cattleData) => {
    return get().addAnimal({ ...cattleData, type: 'cattle' });
  },
  
  // Actualizar animal - Con ProcessingResult
  updateAnimal: async (id, updates) => {
    const operationId = `update-animal-${Date.now()}`;
    
    try {
      get().startProcessing(operationId);
      
      const existingAnimal = get().getAnimalById(id);
      
      if (!existingAnimal) {
        const result = get().createProcessingResult<Animal>(
          false,
          undefined,
          [{
            code: 'ANIMAL_NOT_FOUND',
            message: `Animal con ID ${id} no encontrado`,
            field: 'id',
            severity: 'error'
          }]
        );
        
        get().endProcessing(operationId, result);
        return result;
      }
      
      // Si se actualiza el tag, verificar que esté disponible
      if (updates.tag && updates.tag !== existingAnimal.tag) {
        if (!get().checkTagAvailability(updates.tag, id)) {
          const result = get().createProcessingResult<Animal>(
            false,
            undefined,
            [{
              code: 'ANIMAL_TAG_DUPLICATE',
              message: `La etiqueta ${updates.tag} ya está en uso`,
              field: 'tag',
              severity: 'error'
            }]
          );
          
          get().endProcessing(operationId, result);
          return result;
        }
      }
      
      // Validar datos actualizados
      const updatedAnimal = { ...existingAnimal, ...updates };
      const validation = get().validateAnimalData(updatedAnimal);
      
      if (!validation.isValid && validation.errors.some(e => e.severity === 'error')) {
        const result = get().createProcessingResult<Animal>(
          false,
          undefined,
          validation.errors
        );
        
        get().endProcessing(operationId, result);
        return result;
      }
      
      // Actualizar estado
      set((state) => ({
        animals: state.animals.map((animal) =>
          animal.id === id 
            ? { 
                ...animal, 
                ...updates, 
                updatedAt: new Date().toISOString() 
              } 
            : animal
        ),
        cattle: state.cattle.map((animal) =>
          animal.id === id 
            ? { 
                ...animal, 
                ...updates, 
                updatedAt: new Date().toISOString() 
              } 
            : animal
        )
      }));
      
      const result = get().createProcessingResult<Animal>(
        true,
        { ...updatedAnimal, updatedAt: new Date().toISOString() },
        undefined,
        validation.errors.filter(e => e.severity === 'warning')
      );
      
      get().endProcessing(operationId, result);
      return result;
      
    } catch (error) {
      const errorResult = get().createProcessingResult<Animal>(
        false,
        undefined,
        [{
          code: 'ANIMAL_UPDATE_ERROR',
          message: error instanceof Error ? error.message : 'Error al actualizar animal',
          field: '',
          severity: 'error'
        }]
      );
      
      get().endProcessing(operationId, errorResult);
      return errorResult;
    }
  },
  
  // Eliminar animal - Con ProcessingResult
  deleteAnimal: async (id) => {
    const operationId = `delete-animal-${Date.now()}`;
    
    try {
      get().startProcessing(operationId);
      
      const existingAnimal = get().getAnimalById(id);
      
      if (!existingAnimal) {
        const result = get().createProcessingResult<void>(
          false,
          undefined,
          [{
            code: 'ANIMAL_NOT_FOUND',
            message: `Animal con ID ${id} no encontrado`,
            field: 'id',
            severity: 'error'
          }]
        );
        
        get().endProcessing(operationId, result);
        return result;
      }
      
      // Verificar si tiene producciones asociadas
      const productions = get().getMilkProductionsByAnimal(id);
      
      if (productions.length > 0) {
        const result = get().createProcessingResult<void>(
          false,
          undefined,
          [{
            code: 'ANIMAL_HAS_PRODUCTIONS',
            message: `No se puede eliminar el animal. Tiene ${productions.length} registros de producción`,
            field: '',
            severity: 'error'
          }],
          [{
            code: 'ANIMAL_DELETE_TIP',
            message: 'Puede marcar el animal como "vendido" o "fallecido" en lugar de eliminarlo',
            field: '',
            severity: 'info'
          }]
        );
        
        get().endProcessing(operationId, result);
        return result;
      }
      
      // Eliminar animal
      set((state) => ({
        animals: state.animals.filter((animal) => animal.id !== id),
        cattle: state.cattle.filter((animal) => animal.id !== id),
        milkProductions: state.milkProductions.filter((prod) => prod.animalId !== id)
      }));
      
      const result = get().createProcessingResult<void>(true);
      get().endProcessing(operationId, result);
      return result;
      
    } catch (error) {
      const errorResult = get().createProcessingResult<void>(
        false,
        undefined,
        [{
          code: 'ANIMAL_DELETE_ERROR',
          message: error instanceof Error ? error.message : 'Error al eliminar animal',
          field: '',
          severity: 'error'
        }]
      );
      
      get().endProcessing(operationId, errorResult);
      return errorResult;
    }
  },
  
  // Agregar producción de leche - Con ProcessingResult
  addMilkProduction: async (productionData) => {
    const operationId = `add-production-${Date.now()}`;
    
    try {
      get().startProcessing(operationId);
      
      // Verificar que el animal existe
      const animal = get().getAnimalById(productionData.animalId);
      if (!animal) {
        const result = get().createProcessingResult<MilkProduction>(
          false,
          undefined,
          [{
            code: 'ANIMAL_NOT_FOUND',
            message: 'El animal especificado no existe',
            field: 'animalId',
            severity: 'error'
          }]
        );
        
        get().endProcessing(operationId, result);
        return result;
      }
      
      // Validar que sea hembra
      if (animal.sex !== 'female') {
        const result = get().createProcessingResult<MilkProduction>(
          false,
          undefined,
          [{
            code: 'ANIMAL_NOT_FEMALE',
            message: 'Solo las hembras pueden tener producción de leche',
            field: 'animalId',
            severity: 'error'
          }]
        );
        
        get().endProcessing(operationId, result);
        return result;
      }
      
      // Validar cantidad
      const errors: ValidationError[] = [];
      const warnings: ValidationError[] = [];
      
      if (!productionData.quantity || productionData.quantity <= 0) {
        errors.push({
          code: 'PRODUCTION_QUANTITY_INVALID',
          message: 'La cantidad debe ser mayor a 0',
          field: 'quantity',
          severity: 'error'
        });
      }
      
      // Verificar desviación del promedio
      const avgProduction = get().getAverageMilkProduction(productionData.animalId, 30);
      if (avgProduction > 0) {
        const deviation = Math.abs(productionData.quantity - avgProduction) / avgProduction;
        
        if (deviation > 0.5) {
          warnings.push({
            code: 'PRODUCTION_DEVIATION_HIGH',
            message: `Producción ${productionData.quantity > avgProduction ? 'muy alta' : 'muy baja'} comparada con el promedio (${avgProduction.toFixed(1)} ${productionData.unit || 'litros'})`,
            field: 'quantity',
            severity: 'warning'
          });
        }
      }
      
      if (errors.length > 0) {
        const result = get().createProcessingResult<MilkProduction>(
          false,
          undefined,
          errors
        );
        
        get().endProcessing(operationId, result);
        return result;
      }
      
      // Crear producción
      const newProduction: MilkProduction = {
        ...productionData,
        id: `milk-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        unit: productionData.unit || 'liter',
        period: productionData.period || 'morning',
        createdAt: new Date().toISOString()
      };
      
      // Actualizar estado
      set((state) => ({
        milkProductions: [...state.milkProductions, newProduction]
      }));
      
      const result = get().createProcessingResult<MilkProduction>(
        true,
        newProduction,
        undefined,
        warnings
      );
      
      get().endProcessing(operationId, result);
      return result;
      
    } catch (error) {
      const errorResult = get().createProcessingResult<MilkProduction>(
        false,
        undefined,
        [{
          code: 'PRODUCTION_CREATE_ERROR',
          message: error instanceof Error ? error.message : 'Error al registrar producción',
          field: '',
          severity: 'error'
        }]
      );
      
      get().endProcessing(operationId, errorResult);
      return errorResult;
    }
  },
  
  // Actualizar producción - Con ProcessingResult
  updateMilkProduction: async (id, updates) => {
    const operationId = `update-production-${Date.now()}`;
    
    try {
      get().startProcessing(operationId);
      
      const existingProduction = get().milkProductions.find(p => p.id === id);
      
      if (!existingProduction) {
        const result = get().createProcessingResult<MilkProduction>(
          false,
          undefined,
          [{
            code: 'PRODUCTION_NOT_FOUND',
            message: `Producción con ID ${id} no encontrada`,
            field: 'id',
            severity: 'error'
          }]
        );
        
        get().endProcessing(operationId, result);
        return result;
      }
      
      // Actualizar estado
      set((state) => ({
        milkProductions: state.milkProductions.map((prod) =>
          prod.id === id ? { ...prod, ...updates } : prod
        )
      }));
      
      const result = get().createProcessingResult<MilkProduction>(
        true,
        { ...existingProduction, ...updates }
      );
      
      get().endProcessing(operationId, result);
      return result;
      
    } catch (error) {
      const errorResult = get().createProcessingResult<MilkProduction>(
        false,
        undefined,
        [{
          code: 'PRODUCTION_UPDATE_ERROR',
          message: error instanceof Error ? error.message : 'Error al actualizar producción',
          field: '',
          severity: 'error'
        }]
      );
      
      get().endProcessing(operationId, errorResult);
      return errorResult;
    }
  },
  
  // Eliminar producción - Con ProcessingResult
  deleteMilkProduction: async (id) => {
    const operationId = `delete-production-${Date.now()}`;
    
    try {
      get().startProcessing(operationId);
      
      const existingProduction = get().milkProductions.find(p => p.id === id);
      
      if (!existingProduction) {
        const result = get().createProcessingResult<void>(
          false,
          undefined,
          [{
            code: 'PRODUCTION_NOT_FOUND',
            message: `Producción con ID ${id} no encontrada`,
            field: 'id',
            severity: 'error'
          }]
        );
        
        get().endProcessing(operationId, result);
        return result;
      }
      
      // Eliminar producción
      set((state) => ({
        milkProductions: state.milkProductions.filter((prod) => prod.id !== id)
      }));
      
      const result = get().createProcessingResult<void>(true);
      get().endProcessing(operationId, result);
      return result;
      
    } catch (error) {
      const errorResult = get().createProcessingResult<void>(
        false,
        undefined,
        [{
          code: 'PRODUCTION_DELETE_ERROR',
          message: error instanceof Error ? error.message : 'Error al eliminar producción',
          field: '',
          severity: 'error'
        }]
      );
      
      get().endProcessing(operationId, errorResult);
      return errorResult;
    }
  },
  
  // Obtener animales por rancho
  getAnimalsByRanch: (ranchId) => {
    return get().animals.filter(animal => animal.ranchId === ranchId);
  },
  
  // Legacy
  getCattleByRanch: (ranchId) => {
    return get().cattle.filter(animal => animal.ranchId === ranchId);
  },
  
  // Obtener animal por ID
  getAnimalById: (id) => {
    return get().animals.find(animal => animal.id === id);
  },
  
  // Obtener animales por estado
  getAnimalsByStatus: (status) => {
    return get().animals.filter(animal => animal.status === status);
  },
  
  // Obtener animales preñadas
  getPregnantAnimals: () => {
    return get().animals.filter(animal => 
      animal.status === 'pregnant' || 
      animal.productionData?.pregnancyStatus === true
    );
  },
  
  // Obtener producción por fecha
  getMilkProductionByDate: (date, ranchId) => {
    const animals = ranchId ? get().getAnimalsByRanch(ranchId) : get().animals;
    const animalIds = animals.map(a => a.id);
    
    return get().milkProductions.filter(prod => 
      prod.date === date && 
      (!ranchId || animalIds.includes(prod.animalId))
    );
  },
  
  // Obtener producciones por animal
  getMilkProductionsByAnimal: (animalId) => {
    return get().milkProductions.filter(production => production.animalId === animalId);
  },
  
  // Estadísticas de animales
  getAnimalStats: (ranchId) => {
    const animals = ranchId ? get().getAnimalsByRanch(ranchId) : get().animals;
    
    const stats = {
      total: animals.length,
      byStatus: {} as Record<string, number>,
      byType: {} as Record<string, number>,
      bySex: { male: 0, female: 0 },
      pregnant: 0,
      productive: 0
    };
    
    animals.forEach(animal => {
      // Por estado
      const status = animal.status || 'healthy';
      stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;
      
      // Por tipo
      const type = animal.type || 'cattle';
      stats.byType[type] = (stats.byType[type] || 0) + 1;
      
      // Por sexo
      stats.bySex[animal.sex]++;
      
      // Preñadas
      if (animal.status === 'pregnant' || animal.productionData?.pregnancyStatus) {
        stats.pregnant++;
      }
      
      // Productivas (con producción de leche)
      if (animal.productionData?.milkYield && animal.productionData.milkYield > 0) {
        stats.productive++;
      }
    });
    
    return stats;
  },
  
  // Total de producción de leche
  getTotalMilkProduction: (date, unit = 'liter') => {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const productions = get().getMilkProductionByDate(targetDate);
    
    const totalLiters = productions.reduce((total, prod) => {
      const liters = prod.unit === 'gallon' 
        ? prod.quantity * 3.78541 
        : prod.quantity;
      return total + liters;
    }, 0);
    
    return unit === 'gallon' ? totalLiters / 3.78541 : totalLiters;
  },
  
  // Promedio de producción
  getAverageMilkProduction: (animalId, days) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const productions = get().milkProductions.filter(prod => {
      const prodDate = new Date(prod.date);
      return prodDate >= startDate && 
             prodDate <= endDate && 
             prod.animalId === animalId;
    });
    
    if (productions.length === 0) return 0;
    
    const totalLiters = productions.reduce((total, prod) => {
      const liters = prod.unit === 'gallon' 
        ? prod.quantity * 3.78541 
        : prod.quantity;
      return total + liters;
    }, 0);
    
    // Promedio por día (no por número de producciones)
    return totalLiters / days;
  },
  
  // Conversión de peso
  convertWeight: (value, from, to) => {
    // Primero convertir a kg
    let valueInKg = value;
    
    switch (from) {
      case 'lb':
        valueInKg = value * 0.453592;
        break;
      case 'arroba':
        valueInKg = value * 15;
        break;
    }
    
    // Luego convertir de kg a la unidad deseada
    switch (to) {
      case 'kg':
        return valueInKg;
      case 'lb':
        return valueInKg * 2.20462;
      case 'arroba':
        return valueInKg / 15;
      default:
        return valueInKg;
    }
  },
  
  // Calcular edad
  calculateAge: (birthDate) => {
    const birth = new Date(birthDate);
    const today = new Date();
    
    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();
    
    if (months < 0) {
      years--;
      months += 12;
    }
    
    if (today.getDate() < birth.getDate()) {
      months--;
      if (months < 0) {
        years--;
        months += 12;
      }
    }
    
    return { years, months };
  },
  
  // Validar datos del animal - Ahora devuelve ValidationError[]
  validateAnimalData: (data) => {
    const errors: ValidationError[] = [];
    
    // Validaciones requeridas
    if (!data.tag || data.tag.trim().length === 0) {
      errors.push({
        code: 'ANIMAL_TAG_REQUIRED',
        message: 'La etiqueta es requerida',
        field: 'tag',
        severity: 'error'
      });
    }
    
    if (!data.ranchId) {
      errors.push({
        code: 'ANIMAL_RANCH_REQUIRED',
        message: 'El rancho es requerido',
        field: 'ranchId',
        severity: 'error'
      });
    }
    
    if (!data.sex || !['male', 'female'].includes(data.sex)) {
      errors.push({
        code: 'ANIMAL_SEX_INVALID',
        message: 'El sexo debe ser macho o hembra',
        field: 'sex',
        severity: 'error'
      });
    }
    
    // Validaciones de fecha de nacimiento
    if (data.birthDate) {
      const birthDate = new Date(data.birthDate);
      const today = new Date();
      
      if (birthDate > today) {
        errors.push({
          code: 'ANIMAL_BIRTHDATE_FUTURE',
          message: 'La fecha de nacimiento no puede ser futura',
          field: 'birthDate',
          severity: 'error'
        });
      }
      
      // Advertencia si es muy viejo
      const age = get().calculateAge(data.birthDate);
      if (age.years > 20) {
        errors.push({
          code: 'ANIMAL_AGE_HIGH',
          message: `El animal tiene ${age.years} años, verifique la fecha`,
          field: 'birthDate',
          severity: 'warning'
        });
      }
    }
    
    // Validaciones de peso
    if (data.weight !== undefined) {
      if (data.weight <= 0) {
        errors.push({
          code: 'ANIMAL_WEIGHT_INVALID',
          message: 'El peso debe ser mayor a 0',
          field: 'weight',
          severity: 'error'
        });
      } else {
        // Convertir a kg para validación
        const weightInKg = get().convertWeight(
          data.weight, 
          data.weightUnit || 'kg', 
          'kg'
        );
        
        if (weightInKg < 20) {
          errors.push({
            code: 'ANIMAL_WEIGHT_LOW',
            message: 'El peso parece muy bajo para un animal adulto',
            field: 'weight',
            severity: 'warning'
          });
        }
        
        if (weightInKg > 1200) {
          errors.push({
            code: 'ANIMAL_WEIGHT_HIGH',
            message: 'El peso parece muy alto, verifique la unidad',
            field: 'weight',
            severity: 'warning'
          });
        }
      }
    }
    
    // Validaciones lógicas
    if (data.sex === 'male' && data.productionData?.milkYield) {
      errors.push({
        code: 'ANIMAL_MALE_WITH_MILK',
        message: 'Los machos no pueden tener producción de leche',
        field: 'productionData.milkYield',
        severity: 'error'
      });
    }
    
    if (data.sex === 'male' && (data.status === 'pregnant' || data.productionData?.pregnancyStatus)) {
      errors.push({
        code: 'ANIMAL_MALE_PREGNANT',
        message: 'Los machos no pueden estar preñados',
        field: 'status',
        severity: 'error'
      });
    }
    
    // Validaciones de genealogía
    if (data.motherId && data.motherId === data.id) {
      errors.push({
        code: 'ANIMAL_MOTHER_SELF',
        message: 'Un animal no puede ser su propia madre',
        field: 'motherId',
        severity: 'error'
      });
    }
    
    if (data.fatherId && data.fatherId === data.id) {
      errors.push({
        code: 'ANIMAL_FATHER_SELF',
        message: 'Un animal no puede ser su propio padre',
        field: 'fatherId',
        severity: 'error'
      });
    }
    
    // Validaciones de precio
    if (data.purchasePrice !== undefined && data.purchasePrice < 0) {
      errors.push({
        code: 'ANIMAL_PURCHASE_PRICE_NEGATIVE',
        message: 'El precio de compra no puede ser negativo',
        field: 'purchasePrice',
        severity: 'error'
      });
    }
    
    if (data.salePrice !== undefined && data.salePrice < 0) {
      errors.push({
        code: 'ANIMAL_SALE_PRICE_NEGATIVE',
        message: 'El precio de venta no puede ser negativo',
        field: 'salePrice',
        severity: 'error'
      });
    }
    
    return {
      isValid: errors.filter(e => e.severity === 'error').length === 0,
      errors
    };
  },
  
  // Verificar disponibilidad de tag
  checkTagAvailability: (tag, excludeId) => {
    return !get().animals.some(animal => 
      animal.tag === tag && animal.id !== excludeId
    );
  }
});