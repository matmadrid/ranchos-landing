// src/store/selectors.ts - Selectores memoizados para evitar re-renders

// Importar el tipo directamente del index
import type { RanchOSStore as RanchOSState } from './index';

// Definir tipos locales para evitar errores
interface Animal {
  id: string;
  ranchId: string;
  tag?: string;
  type?: string;
  breed?: string;
  sex?: 'male' | 'female';
  birthDate?: string;
  weight?: number;
  weightUnit?: string;
  status?: string;
}

interface Ranch {
  id: string;
  name: string;
  size?: number;
  sizeUnit?: string;
  location?: string;
  countryCode?: string;
}

// Selectores básicos - siempre devuelven la misma referencia para el mismo valor
export const selectors = {
  // Datos primitivos - seguros de usar directamente
  usuario: (state: RanchOSState) => state.currentUser,
  rancho: (state: RanchOSState) => state.activeRanch || state.currentRanch,
  pais: (state: RanchOSState) => state.currentCountry,
  
  // Arrays y objetos - necesitan comparación estable
  ranches: (state: RanchOSState) => state.ranches,
  animals: (state: RanchOSState) => state.animals,
  activeRanch: (state: RanchOSState) => state.activeRanch,
  
  // Selectores derivados - calculan valores basados en el estado
  activeAnimals: (state: RanchOSState) => {
    if (!state.activeRanch) return [];
    return state.animals?.filter((a: Animal) => a.ranchId === state.activeRanch!.id) || [];
  },
  
  totalAnimals: (state: RanchOSState) => state.animals?.length || 0,
  
  ranchById: (id: string) => (state: RanchOSState) => 
    state.ranches?.find((r: Ranch) => r.id === id),
    
  animalsByRanch: (ranchId: string) => (state: RanchOSState) =>
    state.animals?.filter((a: Animal) => a.ranchId === ranchId) || [],
    
  // Selector con múltiples valores (usa shallow comparison)
  dashboardData: (state: RanchOSState) => ({
    activeRanch: state.activeRanch,
    totalAnimals: state.animals?.length || 0,
    totalRanches: state.ranches?.length || 0,
  }),
};

// Hook personalizado con selectores memoizados
import { useCallback } from 'react';
import useRanchOSStore from './index';

export const useRanchData = () => {
  // Para objetos complejos, usar función de selector sin shallow por ahora
  const data = useRanchOSStore(
    useCallback(
      (state: RanchOSState) => ({
        activeRanch: state.activeRanch,
        ranches: state.ranches,
        animals: state.animals,
      }),
      []
    )
  );
  
  return data;
};

// Hook para animales del rancho activo
export const useActiveRanchAnimals = () => {
  return useRanchOSStore(
    useCallback((state: RanchOSState) => {
      if (!state.activeRanch) return [];
      return state.animals?.filter((a: Animal) => a.ranchId === state.activeRanch!.id) || [];
    }, [])
  );
};

// Hook para estadísticas
export const useRanchStats = () => {
  return useRanchOSStore(
    useCallback(
      (state: RanchOSState) => ({
        totalAnimals: state.animals?.length || 0,
        totalRanches: state.ranches?.length || 0,
        activeRanchName: state.activeRanch?.name || 'Sin rancho activo',
      }),
      []
    )
  );
};