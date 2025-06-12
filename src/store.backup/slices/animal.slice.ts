// src/store/slices/animal.slice.ts
import { StateCreator } from 'zustand';

export interface Animal {
  id: string;
  tag: string;
  name?: string;
  type?: 'cattle' | 'sheep' | 'goat' | 'pig';
  breed?: string;
  sex: 'male' | 'female';
  birthDate?: string;
  weight?: number;
  weightUnit: 'kg' | 'lb' | 'arroba';
  status?: 'healthy' | 'sick' | 'pregnant' | 'sold' | 'deceased';
  healthStatus?: 'excellent' | 'good' | 'fair' | 'poor';
  notes?: string;
  ranchId: string;
  
  // Datos adicionales
  motherId?: string;
  fatherId?: string;
  purchaseDate?: string;
  purchasePrice?: number;
  saleDate?: string;
  salePrice?: number;
  
  // Métricas
  productionData?: {
    milkYield?: number; // litros/día
    lastCalvingDate?: string;
    pregnancyStatus?: boolean;
    expectedCalvingDate?: string;
  };
  
  createdAt: string;
  updatedAt?: string;
}

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
  
  // Acciones CRUD
  addAnimal: (animal: Omit<Animal, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Animal>;
  updateAnimal: (id: string, updates: Partial<Animal>) => Promise<void>;
  deleteAnimal: (id: string) => Promise<void>;
  addCattle: (cattle: Omit<Animal, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Animal>; // Legacy
  
  // Producción de leche
  addMilkProduction: (production: Omit<MilkProduction, 'id' | 'createdAt'>) => Promise<MilkProduction>;
  updateMilkProduction: (id: string, updates: Partial<MilkProduction>) => Promise<void>;
  deleteMilkProduction: (id: string) => Promise<void>;
  
  // Consultas
  getAnimalsByRanch: (ranchId: string) => Animal[];
  getCattleByRanch: (ranchId: string) => Animal[]; // Legacy
  getAnimalById: (id: string) => Animal | undefined;
  getAnimalsByStatus: (status: Animal['status']) => Animal[];
  getPregnantAnimals: () => Animal[];
  getMilkProductionByDate: (date: string, ranchId?: string) => MilkProduction[];
  
  // Estadísticas
  getAnimalStats: (ranchId?: string) => {
    total: number;
    byStatus: Record<string, number>;
    byType: Record<string, number>;
    bySex: Record<string, number>;
    pregnant: number;
    productive: number;
  };
  
  getTotalMilkProduction: (date?: string, unit?: 'liter' | 'gallon') => number;
  getAverageMilkProduction: (days: number, animalId?: string) => number;
  
  // Utilidades
  convertWeight: (value: number, from: 'kg' | 'lb' | 'arroba', to: 'kg' | 'lb' | 'arroba') => number;
  calculateAge: (birthDate: string) => { years: number; months: number };
  validateAnimalData: (data: any) => { isValid: boolean; errors: string[] };
}

export const createAnimalSlice: StateCreator<AnimalSlice> = (set, get) => ({
  // Estado inicial
  animals: [],
  cattle: [],
  milkProductions: [],
  
  // Agregar animal
  addAnimal: async (animalData) => {
    // Validar datos
    const validation = get().validateAnimalData(animalData);
    if (!validation.isValid) {
      throw new Error(`Datos inválidos: ${validation.errors.join(', ')}`);
    }
    
    // Crear animal
    const newAnimal: Animal = {
      ...animalData,
      id: `animal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: animalData.type || 'cattle',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    set((state) => ({
      animals: [...state.animals, newAnimal],
      cattle: newAnimal.type === 'cattle' 
        ? [...state.cattle, newAnimal] 
        : state.cattle
    }));
    
    return newAnimal;
  },
  
  // Legacy: agregar ganado
  addCattle: async (cattleData) => {
    return get().addAnimal({ ...cattleData, type: 'cattle' });
  },
  
  // Actualizar animal
  updateAnimal: async (id, updates) => {
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
  },
  
  // Eliminar animal
  deleteAnimal: async (id) => {
    set((state) => ({
      animals: state.animals.filter((animal) => animal.id !== id),
      cattle: state.cattle.filter((animal) => animal.id !== id),
      milkProductions: state.milkProductions.filter((prod) => prod.animalId !== id)
    }));
  },
  
  // Agregar producción de leche
  addMilkProduction: async (productionData) => {
    const newProduction: MilkProduction = {
      ...productionData,
      id: `milk-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    
    set((state) => ({
      milkProductions: [...state.milkProductions, newProduction]
    }));
    
    return newProduction;
  },
  
  // Actualizar producción
  updateMilkProduction: async (id, updates) => {
    set((state) => ({
      milkProductions: state.milkProductions.map((prod) =>
        prod.id === id ? { ...prod, ...updates } : prod
      )
    }));
  },
  
  // Eliminar producción
  deleteMilkProduction: async (id) => {
    set((state) => ({
      milkProductions: state.milkProductions.filter((prod) => prod.id !== id)
    }));
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
  getAverageMilkProduction: (days, animalId) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const productions = get().milkProductions.filter(prod => {
      const prodDate = new Date(prod.date);
      return prodDate >= startDate && 
             prodDate <= endDate && 
             (!animalId || prod.animalId === animalId);
    });
    
    if (productions.length === 0) return 0;
    
    const totalLiters = productions.reduce((total, prod) => {
      const liters = prod.unit === 'gallon' 
        ? prod.quantity * 3.78541 
        : prod.quantity;
      return total + liters;
    }, 0);
    
    return totalLiters / days;
  },
  
  // Conversión de peso
  convertWeight: (value, from, to) => {
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
    
    return { years, months };
  },
  
  // Validar datos del animal
  validateAnimalData: (data) => {
    const errors: string[] = [];
    
    if (!data.tag || data.tag.trim().length === 0) {
      errors.push('La etiqueta es requerida');
    }
    
    if (!data.ranchId) {
      errors.push('El rancho es requerido');
    }
    
    if (!['male', 'female'].includes(data.sex)) {
      errors.push('El sexo debe ser macho o hembra');
    }
    
    if (data.birthDate) {
      const birthDate = new Date(data.birthDate);
      if (birthDate > new Date()) {
        errors.push('La fecha de nacimiento no puede ser futura');
      }
    }
    
    if (data.weight && data.weight <= 0) {
      errors.push('El peso debe ser mayor a 0');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
});