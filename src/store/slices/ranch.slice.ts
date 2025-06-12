// src/store/slices/ranch.slice.ts
import { StateCreator } from 'zustand';

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
  
  // Acciones básicas
  addRanch: (ranch: Omit<Ranch, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Ranch>;
  updateRanch: (id: string, updates: Partial<Ranch>) => Promise<void>;
  deleteRanch: (id: string) => Promise<void>;
  setActiveRanch: (ranch: Ranch | null) => void;
  setCurrentRanch: (ranch: Ranch | null) => void; // Legacy
  
  // Consultas
  getRanchById: (id: string) => Ranch | undefined;
  getRanchesByType: (type: 'dairy' | 'beef' | 'mixed') => Ranch[];
  getTotalRanchArea: () => number;
  
  // Utilidades
  switchRanch: (ranchId: string) => void;
  validateRanchData: (data: any) => { isValid: boolean; errors: string[] };
}

export const createRanchSlice: StateCreator<RanchSlice> = (set, get) => ({
  // Estado inicial
  ranches: [],
  activeRanch: null,
  currentRanch: null,
  
  // Agregar rancho
  addRanch: async (ranchData) => {
    // Validar datos
    const validation = get().validateRanchData(ranchData);
    if (!validation.isValid) {
      throw new Error(`Datos inválidos: ${validation.errors.join(', ')}`);
    }
    
    // Crear rancho
    const newRanch: Ranch = {
      ...ranchData,
      id: `ranch-${Date.now()}`,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    set((state) => ({
      ranches: [...state.ranches, newRanch],
      activeRanch: newRanch,
      currentRanch: newRanch // Legacy
    }));
    
    return newRanch;
  },
  
  // Actualizar rancho
  updateRanch: async (id, updates) => {
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
          ? { ...state.activeRanch, ...updates }
          : state.activeRanch,
      currentRanch: 
        state.currentRanch?.id === id 
          ? { ...state.currentRanch, ...updates }
          : state.currentRanch
    }));
  },
  
  // Eliminar rancho
  deleteRanch: async (id) => {
    set((state) => {
      const filteredRanches = state.ranches.filter((ranch) => ranch.id !== id);
      const isActiveRanch = state.activeRanch?.id === id;
      
      return {
        ranches: filteredRanches,
        activeRanch: isActiveRanch ? filteredRanches[0] || null : state.activeRanch,
        currentRanch: isActiveRanch ? filteredRanches[0] || null : state.currentRanch
      };
    });
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
  
  // Validar datos del rancho
  validateRanchData: (data) => {
    const errors: string[] = [];
    
    if (!data.name || data.name.trim().length < 3) {
      errors.push('El nombre debe tener al menos 3 caracteres');
    }
    
    if (!data.location || data.location.trim().length < 3) {
      errors.push('La ubicación es requerida');
    }
    
    if (!data.size || data.size <= 0) {
      errors.push('El tamaño debe ser mayor a 0');
    }
    
    if (!['dairy', 'beef', 'mixed'].includes(data.type)) {
      errors.push('Tipo de rancho inválido');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
});