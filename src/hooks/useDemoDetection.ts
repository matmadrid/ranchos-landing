// src/hooks/useDemoDetection.ts
/**
 * Hook para detectar datos demo en el sistema
 * @version 1.0.0
 * @author TorresLaveaga
 */

import { useState, useEffect, useCallback } from 'react';
import { storageManager } from '@/services/storage/StorageManager';
import useRanchOSStore from '@/store';

interface DemoCount {
  ranches: number;
  animals: number;
  movements: number;
  total: number;
}

interface DemoDetectionResult {
  hasDemoData: boolean;
  demoCount: DemoCount;
  isTemporaryUser: boolean;
  shouldShowPrompt: boolean;
  refresh: () => void;
}

/**
 * Hook para detectar y gestionar datos demo en el sistema
 */
export function useDemoDetection(): DemoDetectionResult {
  const { currentUser, activeRanch, ranches, animals, movements, isTemporaryUser } = useRanchOSStore((state) => ({
    currentUser: state.currentUser,
    activeRanch: state.activeRanch,
    ranches: state.ranches,
    animals: state.animals,
    movements: state.movements,
    isTemporaryUser: state.isTemporaryUser
  }));
  
  const [demoCount, setDemoCount] = useState<DemoCount>({
    ranches: 0,
    animals: 0,
    movements: 0,
    total: 0
  });

  const [hasDemoData, setHasDemoData] = useState(false);

  /**
   * Detectar si un item es demo
   */
  const isDemoItem = useCallback((item: any): boolean => {
    if (!item) return false;
    
    // Verificar por ID (case-insensitive)
    if (item.id && typeof item.id === 'string') {
      if (item.id.toLowerCase().includes('demo')) return true;
    }
    
    // Verificar por nombre (case-insensitive)
    if (item.name && typeof item.name === 'string') {
      if (item.name.toLowerCase().includes('demo')) return true;
    }
    
    // Verificar por rancho para animales/movements
    if (item.ranchId && typeof item.ranchId === 'string') {
      if (item.ranchId.toLowerCase().includes('demo')) return true;
    }
    
    return false;
  }, []);

  /**
   * Contar datos demo en el storage
   */
  const countDemoData = useCallback(() => {
    // También verificar en localStorage por si hay datos persistidos
    const storageData = storageManager.get('state');
    
    // Usar datos del store o del localStorage
    const ranchesData = ranches || storageData?.ranches || [];
    const animalsData = animals || storageData?.animals || [];
    const movementsData = movements || storageData?.movements || [];

    let ranchesCount = 0;
    let animalsCount = 0;
    let movementsCount = 0;

    // Contar ranchos demo
    if (Array.isArray(ranchesData)) {
      ranchesCount = ranchesData.filter(isDemoItem).length;
    }

    // Contar animales demo
    if (Array.isArray(animalsData)) {
      animalsCount = animalsData.filter(isDemoItem).length;
    }

    // Contar movements demo
    if (Array.isArray(movementsData)) {
      movementsCount = movementsData.filter(isDemoItem).length;
    }

    const total = ranchesCount + animalsCount + movementsCount;

    setDemoCount({
      ranches: ranchesCount,
      animals: animalsCount,
      movements: movementsCount,
      total
    });

    setHasDemoData(total > 0);
  }, [ranches, animals, movements, isDemoItem]);

  /**
   * Determinar si el usuario es temporal
   */
  const isTemporary = isTemporaryUser?.() || false;

  /**
   * Determinar si mostrar el prompt
   * Solo mostrar si:
   * 1. Hay datos demo
   * 2. El usuario NO es temporal
   * 3. NO está en un rancho demo activo
   */
  const shouldShowPrompt = hasDemoData && 
    !isTemporary && 
    (activeRanch?.id ? !activeRanch.id.toLowerCase().includes('demo') : true);

  /**
   * Función de actualización manual
   */
  const refresh = useCallback(() => {
    countDemoData();
  }, [countDemoData]);

  /**
   * Efecto para contar datos demo inicialmente
   */
  useEffect(() => {
    countDemoData();
  }, [countDemoData]);

  /**
   * Efecto para actualizar cuando cambian los datos
   */
  useEffect(() => {
    countDemoData();
  }, [currentUser, activeRanch, ranches, animals, movements, countDemoData]);

  /**
   * Efecto para actualización periódica cada 30 segundos
   */
  useEffect(() => {
    const interval = setInterval(() => {
      countDemoData();
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, [countDemoData]);

  return {
    hasDemoData,
    demoCount,
    isTemporaryUser: isTemporary,
    shouldShowPrompt,
    refresh
  };
}

export default useDemoDetection;