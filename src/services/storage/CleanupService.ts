// src/services/storage/CleanupService.ts
/**
 * @version 1.0.0
 * @author TorresLaveaga
 * @cosmovision SpaceRanch Sistemas Dinámicos Universales
 * 
 * CleanupService: Servicio especializado en limpieza inteligente del storage
 * Implementa reglas de negocio para eliminar datos demo y mantener integridad
 */

import { storageManager } from './StorageManager';
import { STORAGE_KEYS, shouldCleanOnLogout, isKeyExpired } from '@/constants/storageKeys';

/**
 * Tipos de limpieza disponibles
 */
export enum CleanupType {
  DEMO_DATA = 'demo-data',
  EXPIRED_DATA = 'expired-data',
  USER_LOGOUT = 'user-logout',
  ORPHANED_DATA = 'orphaned-data',
  CACHE_DATA = 'cache-data',
  ALL = 'all',
}

/**
 * Resultado de una operación de limpieza
 */
interface CleanupResult {
  type: CleanupType;
  timestamp: number;
  itemsCleaned: number;
  itemsPreserved: number;
  spaceSaved: number;
  errors: string[];
  details: {
    cleaned: string[];
    preserved: string[];
    failed: Array<{ key: string; error: string }>;
  };
}

/**
 * Opciones para limpieza
 */
export interface CleanupOptions {
  dryRun?: boolean; // Solo simular, no ejecutar
  preserveUserData?: boolean;
  preserveKeys?: string[];
  verbose?: boolean; // Log detallado
  beforeClean?: (key: string, value: any) => boolean; // Callback para confirmar
}

/**
 * CleanupService: Servicio de limpieza inteligente
 */
export class CleanupService {
  private static instance: CleanupService;
  private cleanupHistory: CleanupResult[] = [];
  private readonly MAX_HISTORY = 50;

  /**
   * Singleton pattern
   */
  public static getInstance(): CleanupService {
    if (!CleanupService.instance) {
      CleanupService.instance = new CleanupService();
    }
    return CleanupService.instance;
  }

  private constructor() {}

  /**
   * Limpiar datos demo del sistema
   */
  public async cleanDemoData(options: CleanupOptions = {}): Promise<CleanupResult> {
    const startTime = Date.now();
    const result: CleanupResult = {
      type: CleanupType.DEMO_DATA,
      timestamp: startTime,
      itemsCleaned: 0,
      itemsPreserved: 0,
      spaceSaved: 0,
      errors: [],
      details: {
        cleaned: [],
        preserved: [],
        failed: [],
      },
    };

    try {
      // Obtener el store principal
      const store = storageManager.get(STORAGE_KEYS.STORE.MAIN);
      
      if (!store || !store.state) {
        result.errors.push('Store principal no encontrado');
        return result;
      }

      const state = store.state;
      let spaceBefore = 0;
      let spaceAfter = 0;

      if (!options.dryRun) {
        spaceBefore = JSON.stringify(store).length;
      }

      // Limpiar ranchos demo
      if (state.ranches) {
        const originalCount = state.ranches.length;
        state.ranches = state.ranches.filter((ranch: any) => {
          const isDemo = this.isDemoItem(ranch);
          if (isDemo) {
            if (this.shouldClean(ranch, options)) {
              result.details.cleaned.push(`ranch:${ranch.id}`);
              return false;
            } else {
              result.details.preserved.push(`ranch:${ranch.id}`);
              return true;
            }
          }
          return true;
        });
        result.itemsCleaned += originalCount - state.ranches.length;
      }

      // Limpiar animales demo
      if (state.animals) {
        const originalCount = state.animals.length;
        state.animals = state.animals.filter((animal: any) => {
          const isDemo = this.isDemoItem(animal) || this.isDemoReference(animal.ranchId);
          if (isDemo) {
            if (this.shouldClean(animal, options)) {
              result.details.cleaned.push(`animal:${animal.id}`);
              return false;
            } else {
              result.details.preserved.push(`animal:${animal.id}`);
              return true;
            }
          }
          return true;
        });
        result.itemsCleaned += originalCount - state.animals.length;
      }

      // Limpiar movimientos demo
      if (state.movements) {
        const originalCount = state.movements.length;
        state.movements = state.movements.filter((movement: any) => {
          const isDemo = this.isDemoReference(movement.ranchId) || 
                         this.isDemoReference(movement.animalId);
          if (isDemo) {
            if (this.shouldClean(movement, options)) {
              result.details.cleaned.push(`movement:${movement.id}`);
              return false;
            } else {
              result.details.preserved.push(`movement:${movement.id}`);
              return true;
            }
          }
          return true;
        });
        result.itemsCleaned += originalCount - state.movements.length;
      }

      // Limpiar registros de pesaje demo
      if (state.weighingRecords) {
        const originalCount = state.weighingRecords.length;
        state.weighingRecords = state.weighingRecords.filter((record: any) => {
          const isDemo = this.isDemoReference(record.animalId);
          if (isDemo) {
            if (this.shouldClean(record, options)) {
              result.details.cleaned.push(`weighing:${record.id}`);
              return false;
            } else {
              result.details.preserved.push(`weighing:${record.id}`);
              return true;
            }
          }
          return true;
        });
        result.itemsCleaned += originalCount - state.weighingRecords.length;
      }

      // Limpiar rancho activo si es demo
      if (state.activeRanch && this.isDemoItem(state.activeRanch)) {
        if (this.shouldClean(state.activeRanch, options)) {
          state.activeRanch = null;
          state.currentRanch = null;
          result.details.cleaned.push('activeRanch');
          result.itemsCleaned += 1;
        }
      }

      // Guardar cambios si no es dry run
      if (!options.dryRun) {
        store.state = state;
        storageManager.set(STORAGE_KEYS.STORE.MAIN, store);
        
        spaceAfter = JSON.stringify(store).length;
        result.spaceSaved = spaceBefore - spaceAfter;
      }

      // Limpiar claves de inventario inicializado para ranchos demo
      const inventoryKeys = this.getInventoryKeys();
      for (const key of inventoryKeys) {
        if (this.isDemoInventoryKey(key)) {
          if (!options.dryRun) {
            storageManager.remove(key);
          }
          result.details.cleaned.push(key);
          result.itemsCleaned += 1;
        }
      }

      // Limpiar flag de usuario temporal
      if (storageManager.get(STORAGE_KEYS.AUTH.IS_TEMPORARY_USER) === 'true') {
        if (!options.dryRun) {
          storageManager.remove(STORAGE_KEYS.AUTH.IS_TEMPORARY_USER);
        }
        result.details.cleaned.push(STORAGE_KEYS.AUTH.IS_TEMPORARY_USER);
        result.itemsCleaned += 1;
      }

    } catch (error) {
result.errors.push(`Error general: ${error instanceof Error ? error.message : String(error)}`);    }

    // Guardar en historial
    this.addToHistory(result);

    // Log si verbose
    if (options.verbose) {
      console.log('🧹 Resultado de limpieza:', result);
    }

    return result;
  }

  /**
   * Limpiar datos expirados
   */
  public async cleanExpiredData(options: CleanupOptions = {}): Promise<CleanupResult> {
    const result: CleanupResult = {
      type: CleanupType.EXPIRED_DATA,
      timestamp: Date.now(),
      itemsCleaned: 0,
      itemsPreserved: 0,
      spaceSaved: 0,
      errors: [],
      details: {
        cleaned: [],
        preserved: [],
        failed: [],
      },
    };

    try {
      const allKeys = storageManager.getAllKeys();

      for (const key of allKeys) {
        // Saltar claves del sistema
        if (key.startsWith('__meta_')) continue;

        const metadata = storageManager.getItemMetadata(key);
        if (metadata && isKeyExpired(key, metadata.timestamp)) {
          if (this.shouldClean({ key }, options)) {
            if (!options.dryRun) {
              storageManager.remove(key);
            }
            result.details.cleaned.push(key);
            result.itemsCleaned += 1;
          } else {
            result.details.preserved.push(key);
            result.itemsPreserved += 1;
          }
        }
      }
    } catch (error) {
result.errors.push(`Error: ${error instanceof Error ? error.message : String(error)}`);    }

    this.addToHistory(result);
    return result;
  }

  /**
   * Limpiar datos al cerrar sesión
   */
  public async cleanOnLogout(options: CleanupOptions = {}): Promise<CleanupResult> {
    const result: CleanupResult = {
      type: CleanupType.USER_LOGOUT,
      timestamp: Date.now(),
      itemsCleaned: 0,
      itemsPreserved: 0,
      spaceSaved: 0,
      errors: [],
      details: {
        cleaned: [],
        preserved: [],
        failed: [],
      },
    };

    try {
      // Primero limpiar datos demo
      const demoResult = await this.cleanDemoData(options);
      result.itemsCleaned += demoResult.itemsCleaned;
      result.details.cleaned.push(...demoResult.details.cleaned);

      // Luego limpiar claves marcadas para logout
      const allKeys = storageManager.getAllKeys();
      
      for (const key of allKeys) {
        if (shouldCleanOnLogout(key) && !options.preserveKeys?.includes(key)) {
          if (!options.dryRun) {
            storageManager.remove(key);
          }
          result.details.cleaned.push(key);
          result.itemsCleaned += 1;
        } else {
          result.details.preserved.push(key);
          result.itemsPreserved += 1;
        }
      }

      // Limpiar datos específicos del usuario en el store
      if (!options.preserveUserData) {
        const store = storageManager.get(STORAGE_KEYS.STORE.MAIN);
        if (store?.state) {
          // Resetear usuario actual
          store.state.currentUser = null;
          store.state.activeRanch = null;
          store.state.currentRanch = null;
          
          if (!options.dryRun) {
            storageManager.set(STORAGE_KEYS.STORE.MAIN, store);
          }
        }
      }

    } catch (error) {
result.errors.push(`Error: ${error instanceof Error ? error.message : String(error)}`);    }

    this.addToHistory(result);
    return result;
  }

  /**
   * Limpiar datos huérfanos
   */
  public async cleanOrphanedData(options: CleanupOptions = {}): Promise<CleanupResult> {
    const result: CleanupResult = {
      type: CleanupType.ORPHANED_DATA,
      timestamp: Date.now(),
      itemsCleaned: 0,
      itemsPreserved: 0,
      spaceSaved: 0,
      errors: [],
      details: {
        cleaned: [],
        preserved: [],
        failed: [],
      },
    };

    try {
      const store = storageManager.get(STORAGE_KEYS.STORE.MAIN);
      if (!store?.state) return result;

      const state = store.state;
      const validRanchIds = new Set(state.ranches?.map((r: any) => r.id) || []);
      const validAnimalIds = new Set(state.animals?.map((a: any) => a.id) || []);

      // Limpiar animales huérfanos
      if (state.animals) {
        const originalCount = state.animals.length;
        state.animals = state.animals.filter((animal: any) => {
          if (!validRanchIds.has(animal.ranchId)) {
            result.details.cleaned.push(`orphan-animal:${animal.id}`);
            return false;
          }
          return true;
        });
        result.itemsCleaned += originalCount - state.animals.length;
      }

      // Limpiar movimientos huérfanos
      if (state.movements) {
        const originalCount = state.movements.length;
        state.movements = state.movements.filter((movement: any) => {
          if (!validRanchIds.has(movement.ranchId) || 
              (movement.animalId && !validAnimalIds.has(movement.animalId))) {
            result.details.cleaned.push(`orphan-movement:${movement.id}`);
            return false;
          }
          return true;
        });
        result.itemsCleaned += originalCount - state.movements.length;
      }

      if (!options.dryRun && result.itemsCleaned > 0) {
        store.state = state;
        storageManager.set(STORAGE_KEYS.STORE.MAIN, store);
      }

    } catch (error) {
result.errors.push(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }

    this.addToHistory(result);
    return result;
  }

  /**
   * Ejecutar limpieza completa
   */
  public async cleanAll(options: CleanupOptions = {}): Promise<CleanupResult[]> {
    const results: CleanupResult[] = [];

    // Ejecutar todas las limpiezas en orden
    results.push(await this.cleanDemoData(options));
    results.push(await this.cleanExpiredData(options));
    results.push(await this.cleanOrphanedData(options));

    return results;
  }

  /**
   * Helpers privados
   */
  private isDemoItem(item: any): boolean {
    if (!item) return false;
    return item.id?.startsWith('demo-') || 
           item.name?.toLowerCase().includes('demo') ||
           item.isDemo === true;
  }

  private isDemoReference(id: string | undefined): boolean {
    if (!id) return false;
    return id.startsWith('demo-');
  }

  private isDemoInventoryKey(key: string): boolean {
    const match = key.match(/inventory-initialized-(.+)/);
    if (match) {
      return this.isDemoReference(match[1]);
    }
    return false;
  }

  private getInventoryKeys(): string[] {
    return storageManager.getAllKeys()
      .filter(key => key.startsWith(STORAGE_KEYS.INVENTORY.INITIALIZED_PREFIX));
  }

  private shouldClean(item: any, options: CleanupOptions): boolean {
    if (options.beforeClean) {
      return options.beforeClean(item.key || item.id || item, item);
    }
    return true;
  }

  private addToHistory(result: CleanupResult): void {
    this.cleanupHistory.push(result);
    if (this.cleanupHistory.length > this.MAX_HISTORY) {
      this.cleanupHistory.shift();
    }
  }

  /**
   * Obtener historial de limpiezas
   */
  public getHistory(): CleanupResult[] {
    return [...this.cleanupHistory];
  }

  /**
   * Obtener estadísticas de limpieza
   */
  public getStats(): {
    totalCleaned: number;
    totalSpaceSaved: number;
    lastCleanup: number | null;
    cleanupsByType: Record<CleanupType, number>;
  } {
    const stats = {
      totalCleaned: 0,
      totalSpaceSaved: 0,
      lastCleanup: null as number | null,
      cleanupsByType: {} as Record<CleanupType, number>,
    };

    for (const result of this.cleanupHistory) {
      stats.totalCleaned += result.itemsCleaned;
      stats.totalSpaceSaved += result.spaceSaved;
      stats.lastCleanup = result.timestamp;
      
      stats.cleanupsByType[result.type] = 
        (stats.cleanupsByType[result.type] || 0) + 1;
    }

    return stats;
  }
}

// Exportar instancia singleton
export const cleanupService = CleanupService.getInstance();