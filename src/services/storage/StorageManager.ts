// src/services/storage/StorageManager.ts
/**
 * @version 1.0.0
 * @author TorresLaveaga
 * @cosmovision SpaceRanch Sistemas Dinámicos Universales
 * 
 * StorageManager: Servicio central para gestión profesional del localStorage
 * Implementa patrones enterprise para acceso seguro y controlado al storage
 */

import { STORAGE_KEYS, getKeyType, StorageDataType } from '@/constants/storageKeys';

/**
 * Interfaz para metadatos de storage
 */
interface StorageMetadata {
  key: string;
  timestamp: number;
  version?: string;
  userId?: string;
  checksum?: string;
}

/**
 * Interfaz para operaciones de storage
 */
interface StorageOperation {
  type: 'set' | 'get' | 'remove' | 'clear';
  key: string;
  value?: any;
  timestamp: number;
  success: boolean;
  error?: string;
}

/**
 * Opciones de configuración para operaciones
 */
interface StorageOptions {
  encrypt?: boolean;
  compress?: boolean;
  metadata?: boolean;
  silent?: boolean; // No lanzar errores
}

/**
 * StorageManager: Gestor central de localStorage
 */
export class StorageManager {
  private static instance: StorageManager;
  private operations: StorageOperation[] = [];
  private listeners: Map<string, Set<Function>> = new Map();
  private readonly MAX_OPERATIONS_LOG = 100;

  private isSettingMetadata: boolean = false;
  /**
   * Singleton pattern
   */
  public static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager();
    }
    return StorageManager.instance;
  }

  private constructor() {
    // Solo inicializar en el cliente (evitar warnings en SSR)
    if (typeof window !== 'undefined') {
      // Inicializar y validar storage al crear la instancia
      this.validateStorageAvailability();
      this.initializeMetadata();
    }
  }

  /**
   * Verificar disponibilidad de localStorage
   */
  private validateStorageAvailability(): boolean {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      console.error('⚠️ localStorage no disponible:', e);
      return false;
    }
  }

  /**
   * Inicializar metadatos del sistema
   */
  private initializeMetadata(): void {
    const metadata = this.getMetadata();
    if (!metadata.initialized) {
      this.setMetadata({
        initialized: Date.now(),
        version: '1.0.0',
        lastCleanup: Date.now(),
      });
    }
  }

  /**
   * Obtener valor del storage con tipo seguro
   */
  public get<T = any>(key: string, defaultValue?: T): T | null {
    try {
      const rawValue = localStorage.getItem(key);
      
      if (rawValue === null) {
        return defaultValue ?? null;
      }

      // Intentar parsear JSON
      try {
        const parsed = JSON.parse(rawValue);
        this.logOperation({ type: 'get', key, timestamp: Date.now(), success: true });
        return parsed as T;
      } catch {
        // Si no es JSON, devolver como string
        this.logOperation({ type: 'get', key, timestamp: Date.now(), success: true });
        return rawValue as unknown as T;
      }
    } catch (error) {
      this.logOperation({ 
        type: 'get', 
        key, 
        timestamp: Date.now(), 
        success: false, 
        error: error instanceof Error ? error.message : String(error)
 
      });
      return defaultValue ?? null;
    }
  }

  /**
   * Establecer valor en storage
   */
  public set(key: string, value: any, options: StorageOptions = {}): boolean {
    try {
      // Preparar valor para almacenar
      let storageValue: string;
      
      if (typeof value === 'string') {
        storageValue = value;
      } else {
        storageValue = JSON.stringify(value);
      }

      // Aplicar opciones si es necesario
      if (options.compress) {
        // Implementar compresión si es necesario
        // storageValue = compress(storageValue);
      }

      if (options.encrypt) {
        // Implementar encriptación si es necesario
        // storageValue = encrypt(storageValue);
      }

      // Almacenar
      localStorage.setItem(key, storageValue);

      // Almacenar metadata si está habilitado
      if (options.metadata) {
        this.setItemMetadata(key, {
          timestamp: Date.now(),
          version: '1.0.0',
        });
      }

      // Notificar listeners
      this.notifyListeners(key, value);

      // Log operación
      this.logOperation({ 
        type: 'set', 
        key, 
        value, 
        timestamp: Date.now(), 
        success: true 
      });

      return true;
    } catch (error) {
      if (!options.silent) {
        console.error(`❌ Error al guardar ${key}:`, error);
      }
      
      this.logOperation({ 
        type: 'set', 
        key, 
        value, 
        timestamp: Date.now(), 
        success: false, 
        error: error instanceof Error ? error.message : String(error)

      });
      
      return false;
    }
  }

  /**
   * Eliminar clave del storage
   */
  public remove(key: string): boolean {
    try {
      localStorage.removeItem(key);
      this.removeItemMetadata(key);
      this.notifyListeners(key, null);
      
      this.logOperation({ 
        type: 'remove', 
        key, 
        timestamp: Date.now(), 
        success: true 
      });
      
      return true;
    } catch (error) {
      this.logOperation({ 
        type: 'remove', 
        key, 
        timestamp: Date.now(), 
        success: false, 
        error: error instanceof Error ? error.message : String(error)
 
      });
      
      return false;
    }
  }

  /**
   * Limpiar todo el storage (usar con cuidado)
   */
  public clear(options: { preserveKeys?: string[] } = {}): boolean {
    try {
      const { preserveKeys = [] } = options;
      
      // Si hay claves a preservar, guardar sus valores
      const preserved: Record<string, any> = {};
      for (const key of preserveKeys) {
        const value = this.get(key);
        if (value !== null) {
          preserved[key] = value;
        }
      }

      // Limpiar todo
      localStorage.clear();

      // Restaurar claves preservadas
      for (const [key, value] of Object.entries(preserved)) {
        this.set(key, value);
      }

      // Reinicializar metadata
      this.initializeMetadata();

      this.logOperation({ 
        type: 'clear', 
        key: '*', 
        timestamp: Date.now(), 
        success: true 
      });

      return true;
    } catch (error) {
      this.logOperation({ 
        type: 'clear', 
        key: '*', 
        timestamp: Date.now(), 
        success: false, 
        error: error instanceof Error ? error.message : String(error)
 
      });
      
      return false;
    }
  }

  /**
   * Obtener todas las claves del storage
   */
  public getAllKeys(): string[] {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && !key.startsWith('__meta_')) {
        keys.push(key);
      }
    }
    return keys;
  }

  /**
   * Obtener tamaño usado del storage
   */
  public getStorageSize(): { used: number; total: number; percentage: number } {
    let used = 0;
    
    // Calcular tamaño usado
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);
        used += key.length + (value?.length || 0);
      }
    }

    // Estimar tamaño total (generalmente 5-10MB)
    const total = 5 * 1024 * 1024; // 5MB
    const percentage = (used / total) * 100;

    return { used, total, percentage };
  }

  /**
   * Suscribirse a cambios en una clave
   */
  public subscribe(key: string, callback: Function): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    
    this.listeners.get(key)!.add(callback);

    // Retornar función de desuscripción
    return () => {
      this.listeners.get(key)?.delete(callback);
    };
  }

  /**
   * Notificar a listeners sobre cambios
   */
  private notifyListeners(key: string, value: any): void {
    const callbacks = this.listeners.get(key);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(value);
        } catch (error) {
          console.error('Error en listener:', error);
        }
      });
    }
  }

  /**
   * Gestión de metadata
   */
  private getMetadata(): Record<string, any> {
    return this.get('__meta_system__') || {};
  }

  private setMetadata(data: Record<string, any>): void {
    const current = this.getMetadata();
    if (this.isSettingMetadata) return; this.isSettingMetadata = true; try { localStorage.setItem('__meta_system__', JSON.stringify({ ...current, ...data })); } catch (e) { console.error('Error setting metadata:', e); } finally { this.isSettingMetadata = false; }
  }

  private setItemMetadata(key: string, metadata: Partial<StorageMetadata>): void {
    this.set(`__meta_${key}__`, {
      key,
      ...metadata,
      timestamp: Date.now(),
    });
  }

  private removeItemMetadata(key: string): void {
    this.remove(`__meta_${key}__`);
  }

  /**
   * Obtener metadata de un item
   */
  public getItemMetadata(key: string): StorageMetadata | null {
    return this.get(`__meta_${key}__`);
  }

  /**
   * Log de operaciones para debugging
   */
  private logOperation(operation: StorageOperation): void {
    this.operations.push(operation);
    
    // Mantener solo las últimas N operaciones
    if (this.operations.length > this.MAX_OPERATIONS_LOG) {
      this.operations.shift();
    }
  }

  /**
   * Obtener historial de operaciones
   */
  public getOperationsLog(): StorageOperation[] {
    return [...this.operations];
  }

  /**
   * Exportar todo el storage (para backup)
   */
  public export(): Record<string, any> {
    const data: Record<string, any> = {};
    const keys = this.getAllKeys();
    
    for (const key of keys) {
      data[key] = this.get(key);
    }
    
    return data;
  }

  /**
   * Importar datos al storage
   */
  public import(data: Record<string, any>, options: { merge?: boolean } = {}): boolean {
    try {
      if (!options.merge) {
        this.clear();
      }

      for (const [key, value] of Object.entries(data)) {
        this.set(key, value);
      }

      return true;
    } catch (error) {
      console.error('Error al importar:', error);
      return false;
    }
  }
}

// Exportar instancia singleton
export const storageManager = StorageManager.getInstance();
