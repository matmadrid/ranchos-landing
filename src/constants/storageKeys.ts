// src/constants/storageKeys.ts
/**
 * @version 1.0.0
 * @author TorresLaveaga
 * @cosmovision SpaceRanch Sistemas Dinámicos Universales
 * 
 * Mapa completo de todas las claves de localStorage usadas en RanchOS
 * Centraliza y documenta cada clave para facilitar la gestión
 */

export const STORAGE_KEYS = {
  // Store principal de Zustand
  STORE: {
    MAIN: 'ranchos-store-v3',
  },

  // Autenticación y Usuario
  AUTH: {
    REMEMBERED_EMAIL: 'rememberedEmail',
    IS_TEMPORARY_USER: 'isTemporaryUser',
    ONBOARDING_COMPLETE: 'onboardingComplete',
    ONBOARDING_STEP: 'onboarding-step',
    ONBOARDING_DATA: 'onboarding-data',
  },

  // Configuración Regional
  REGIONAL: {
    PREFERRED_COUNTRY: 'preferredCountry',
  },

  // Datos de Inventario
  INVENTORY: {
    // Patrón dinámico: `inventory-initialized-${ranchId}`
    INITIALIZED_PREFIX: 'inventory-initialized-',
  },

  // Posibles claves adicionales (a verificar)
  CACHE: {
    API_CACHE: 'api-cache',
    IMAGES_CACHE: 'images-cache',
  },

  // Debug y Desarrollo
  DEBUG: {
    DEV_MODE: 'dev-mode',
    LOG_LEVEL: 'log-level',
  },
} as const;

/**
 * Tipos de datos almacenados
 */
export enum StorageDataType {
  ZUSTAND_STORE = 'zustand-store',
  USER_PREFERENCE = 'user-preference',
  CACHE_DATA = 'cache-data',
  TEMPORARY_DATA = 'temporary-data',
  DEBUG_DATA = 'debug-data',
}

/**
 * Configuración de retención por tipo de dato
 */
export const RETENTION_POLICIES = {
  [StorageDataType.ZUSTAND_STORE]: {
    maxAge: Infinity, // Nunca expira automáticamente
    cleanOnLogout: false, // Se limpia selectivamente
  },
  [StorageDataType.USER_PREFERENCE]: {
    maxAge: 365 * 24 * 60 * 60 * 1000, // 1 año
    cleanOnLogout: false,
  },
  [StorageDataType.CACHE_DATA]: {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
    cleanOnLogout: true,
  },
  [StorageDataType.TEMPORARY_DATA]: {
    maxAge: 24 * 60 * 60 * 1000, // 24 horas
    cleanOnLogout: true,
  },
  [StorageDataType.DEBUG_DATA]: {
    maxAge: 60 * 60 * 1000, // 1 hora
    cleanOnLogout: true,
  },
} as const;

/**
 * Mapa de claves a tipos de datos
 */
export const KEY_TO_TYPE_MAP: Record<string, StorageDataType> = {
  [STORAGE_KEYS.STORE.MAIN]: StorageDataType.ZUSTAND_STORE,
  [STORAGE_KEYS.AUTH.REMEMBERED_EMAIL]: StorageDataType.USER_PREFERENCE,
  [STORAGE_KEYS.AUTH.IS_TEMPORARY_USER]: StorageDataType.TEMPORARY_DATA,
  [STORAGE_KEYS.AUTH.ONBOARDING_COMPLETE]: StorageDataType.USER_PREFERENCE,
  [STORAGE_KEYS.AUTH.ONBOARDING_STEP]: StorageDataType.TEMPORARY_DATA,
  [STORAGE_KEYS.AUTH.ONBOARDING_DATA]: StorageDataType.TEMPORARY_DATA,
  [STORAGE_KEYS.REGIONAL.PREFERRED_COUNTRY]: StorageDataType.USER_PREFERENCE,
};

/**
 * Patrones para identificar claves dinámicas
 */
export const DYNAMIC_KEY_PATTERNS = [
  {
    pattern: /^inventory-initialized-/,
    type: StorageDataType.CACHE_DATA,
    description: 'Estado de inicialización de inventario por rancho',
  },
  {
    pattern: /^api-cache-/,
    type: StorageDataType.CACHE_DATA,
    description: 'Cache de respuestas API',
  },
  {
    pattern: /^temp-/,
    type: StorageDataType.TEMPORARY_DATA,
    description: 'Datos temporales varios',
  },
] as const;

/**
 * Helper para obtener el tipo de una clave
 */
export function getKeyType(key: string): StorageDataType {
  // Verificar mapa estático
  if (key in KEY_TO_TYPE_MAP) {
    return KEY_TO_TYPE_MAP[key];
  }

  // Verificar patrones dinámicos
  for (const { pattern, type } of DYNAMIC_KEY_PATTERNS) {
    if (pattern.test(key)) {
      return type;
    }
  }

  // Por defecto, considerar como temporal
  return StorageDataType.TEMPORARY_DATA;
}

/**
 * Helper para verificar si una clave debe limpiarse en logout
 */
export function shouldCleanOnLogout(key: string): boolean {
  const type = getKeyType(key);
  return RETENTION_POLICIES[type].cleanOnLogout;
}

/**
 * Helper para verificar si una clave ha expirado
 */
export function isKeyExpired(key: string, timestamp: number): boolean {
  const type = getKeyType(key);
  const maxAge = RETENTION_POLICIES[type].maxAge;
  
  if (maxAge === Infinity) return false;
  
  return Date.now() - timestamp > maxAge;
}