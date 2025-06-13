// src/lib/auth-cookies.ts
'use client';

import Cookies from 'js-cookie';

/**
 * Sistema de gestión de cookies para autenticación
 * Mantiene sincronización entre cliente y servidor
 * Compatible con SSR y seguridad mejorada
 */

// === TIPOS ===

/**
 * Estado completo de cookies de autenticación
 */
export interface AuthCookies {
  isAuthenticated: boolean;
  userId: string | null;
  userType: 'temporary' | 'permanent' | null;
  userRole: 'owner' | 'manager' | 'employee' | 'viewer' | null;
  onboardingCompleted: boolean;
  ranchId: string | null;
  sessionToken: string | null;
  refreshToken: string | null;
  lastActivity: string | null;
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    notifications: boolean;
  } | null;
}

/**
 * Opciones para configurar cookies
 */
export interface CookieOptions {
  expires?: number; // días
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
  httpOnly?: boolean; // Solo para server-side
}

// === CONSTANTES ===

/**
 * Nombres de cookies estandarizados
 */
export const COOKIE_NAMES = {
  // Autenticación principal
  IS_AUTHENTICATED: 'ranchos_authenticated',
  USER_ID: 'ranchos_user_id',
  USER_TYPE: 'ranchos_user_type',
  USER_ROLE: 'ranchos_user_role',
  SESSION_TOKEN: 'ranchos_session',
  REFRESH_TOKEN: 'ranchos_refresh',
  
  // Estado de la aplicación
  ONBOARDING_COMPLETED: 'ranchos_onboarding_done',
  RANCH_ID: 'ranchos_active_ranch',
  LAST_ACTIVITY: 'ranchos_last_activity',
  
  // Preferencias
  THEME: 'ranchos_theme',
  LANGUAGE: 'ranchos_lang',
  NOTIFICATIONS: 'ranchos_notif',
  
  // Legacy (mantener compatibilidad)
  IS_TEMPORARY_USER: 'isTemporaryUser', // Deprecado
} as const;

/**
 * Configuración por defecto para cookies
 */
const DEFAULT_COOKIE_OPTIONS: CookieOptions = {
  expires: 7, // 7 días
  path: '/',
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
};

/**
 * Opciones para diferentes tipos de cookies
 */
const COOKIE_CONFIGS = {
  // Cookies de sesión (corta duración)
  session: {
    ...DEFAULT_COOKIE_OPTIONS,
    expires: 1, // 1 día
  },
  
  // Cookies de autenticación (duración media)
  auth: {
    ...DEFAULT_COOKIE_OPTIONS,
    expires: 7, // 7 días
  },
  
  // Cookies de preferencias (larga duración)
  preferences: {
    ...DEFAULT_COOKIE_OPTIONS,
    expires: 365, // 1 año
  },
  
  // Cookies temporales (muy corta duración)
  temporary: {
    ...DEFAULT_COOKIE_OPTIONS,
    expires: 0.25, // 6 horas
  },
} as const;

// === CLASE PRINCIPAL ===

/**
 * Gestor centralizado de cookies de autenticación
 * Proporciona métodos seguros y consistentes para manejar cookies
 */
export class AuthCookieManager {
  /**
   * Verifica si estamos en un entorno de navegador
   */
  private static isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  /**
   * Obtiene opciones de cookie según el tipo
   */
  private static getCookieOptions(type: keyof typeof COOKIE_CONFIGS = 'auth'): CookieOptions {
    return COOKIE_CONFIGS[type];
  }

  /**
   * Establece una cookie de forma segura
   */
  private static setCookie(name: string, value: string, options?: CookieOptions): void {
    if (!this.isBrowser()) return;
    
    const finalOptions = {
      ...DEFAULT_COOKIE_OPTIONS,
      ...options,
    };
    
    Cookies.set(name, value, finalOptions);
  }

  /**
   * Obtiene el valor de una cookie
   */
  private static getCookie(name: string): string | undefined {
    if (!this.isBrowser()) return undefined;
    return Cookies.get(name);
  }

  /**
   * Elimina una cookie
   */
  private static removeCookie(name: string, options?: CookieOptions): void {
    if (!this.isBrowser()) return;
    
    const finalOptions = {
      path: options?.path || '/',
      domain: options?.domain,
    };
    
    Cookies.remove(name, finalOptions);
  }

  // === MÉTODOS PÚBLICOS - USUARIOS ===

  /**
   * Establece las cookies para un usuario temporal (demo)
   * Usado durante el onboarding antes del registro
   */
  static setTemporaryUser(userId: string, ranchId?: string): void {
    // Usuario temporal NO está autenticado
    this.setCookie(COOKIE_NAMES.IS_AUTHENTICATED, 'false', COOKIE_CONFIGS.temporary);
    this.setCookie(COOKIE_NAMES.USER_ID, userId, COOKIE_CONFIGS.temporary);
    this.setCookie(COOKIE_NAMES.USER_TYPE, 'temporary', COOKIE_CONFIGS.temporary);
    
    // Legacy support
    this.setCookie(COOKIE_NAMES.IS_TEMPORARY_USER, 'true', COOKIE_CONFIGS.temporary);
    
    if (ranchId) {
      this.setCookie(COOKIE_NAMES.RANCH_ID, ranchId, COOKIE_CONFIGS.temporary);
    }
    
    this.updateLastActivity();
    
    // Log en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log('[AuthCookies] Usuario temporal establecido:', { userId, ranchId });
    }
  }

  /**
   * Establece las cookies para un usuario autenticado permanente
   */
  static setAuthenticatedUser(
    userId: string, 
    options?: {
      role?: AuthCookies['userRole'];
      sessionToken?: string;
      refreshToken?: string;
      rememberMe?: boolean;
      onboardingCompleted?: boolean;
    }
  ): void {
    const cookieOptions = options?.rememberMe 
      ? { ...COOKIE_CONFIGS.auth, expires: 30 } // 30 días si "recordarme"
      : COOKIE_CONFIGS.auth;
    
    // Autenticación principal
    this.setCookie(COOKIE_NAMES.IS_AUTHENTICATED, 'true', cookieOptions);
    this.setCookie(COOKIE_NAMES.USER_ID, userId, cookieOptions);
    this.setCookie(COOKIE_NAMES.USER_TYPE, 'permanent', cookieOptions);
    
    // Rol de usuario
    if (options?.role) {
      this.setCookie(COOKIE_NAMES.USER_ROLE, options.role, cookieOptions);
    }
    
    // Tokens de sesión
    if (options?.sessionToken) {
      this.setCookie(COOKIE_NAMES.SESSION_TOKEN, options.sessionToken, COOKIE_CONFIGS.session);
    }
    
    if (options?.refreshToken) {
      this.setCookie(COOKIE_NAMES.REFRESH_TOKEN, options.refreshToken, {
        ...cookieOptions,
        expires: 60, // 60 días para refresh token
      });
    }
    
    // Estado de onboarding
    if (options?.onboardingCompleted) {
      this.setCookie(COOKIE_NAMES.ONBOARDING_COMPLETED, 'true', COOKIE_CONFIGS.preferences);
    }
    
    // Limpiar cookies temporales
    this.removeCookie(COOKIE_NAMES.IS_TEMPORARY_USER);
    
    this.updateLastActivity();
  }

  /**
   * Convierte un usuario temporal a permanente
   * Mantiene datos del rancho y preferencias
   */
  static convertToPermanentUser(
    userId: string,
    sessionToken?: string,
    role?: AuthCookies['userRole']
  ): void {
    // Obtener datos actuales
    const currentRanchId = this.getCookie(COOKIE_NAMES.RANCH_ID);
    const preferences = this.getPreferences();
    
    // Establecer como usuario permanente
    this.setAuthenticatedUser(userId, {
      role,
      sessionToken,
      onboardingCompleted: true,
      rememberMe: true,
    });
    
    // Restaurar datos preservados
    if (currentRanchId) {
      this.setCookie(COOKIE_NAMES.RANCH_ID, currentRanchId, COOKIE_CONFIGS.auth);
    }
    
    // Mantener preferencias
    if (preferences) {
      this.setPreferences(preferences);
    }
    
    console.log('[AuthCookies] Usuario convertido a permanente:', { userId, role });
  }

  // === MÉTODOS PÚBLICOS - SESIÓN ===

  /**
   * Actualiza el token de sesión
   */
  static updateSessionToken(token: string): void {
    this.setCookie(COOKIE_NAMES.SESSION_TOKEN, token, COOKIE_CONFIGS.session);
    this.updateLastActivity();
  }

  /**
   * Actualiza el refresh token
   */
  static updateRefreshToken(token: string): void {
    this.setCookie(COOKIE_NAMES.REFRESH_TOKEN, token, {
      ...COOKIE_CONFIGS.auth,
      expires: 60, // 60 días
    });
  }

  /**
   * Verifica si la sesión está activa
   */
  static isSessionActive(): boolean {
    const lastActivity = this.getCookie(COOKIE_NAMES.LAST_ACTIVITY);
    if (!lastActivity) return false;
    
    const lastActivityDate = new Date(lastActivity);
    const now = new Date();
    const diffHours = (now.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60);
    
    // Sesión activa si la última actividad fue hace menos de 24 horas
    return diffHours < 24;
  }

  /**
   * Actualiza la marca de tiempo de última actividad
   */
  static updateLastActivity(): void {
    this.setCookie(
      COOKIE_NAMES.LAST_ACTIVITY, 
      new Date().toISOString(), 
      COOKIE_CONFIGS.session
    );
  }

  // === MÉTODOS PÚBLICOS - ESTADO ===

  /**
   * Marca el onboarding como completado
   */
  static completeOnboarding(): void {
    this.setCookie(
      COOKIE_NAMES.ONBOARDING_COMPLETED, 
      'true', 
      COOKIE_CONFIGS.preferences
    );
  }

  /**
   * Establece el rancho activo
   */
  static setActiveRanch(ranchId: string): void {
    this.setCookie(COOKIE_NAMES.RANCH_ID, ranchId, COOKIE_CONFIGS.auth);
  }

  /**
   * Establece las preferencias del usuario
   */
  static setPreferences(preferences: Partial<AuthCookies['preferences']>): void {
    const current = this.getPreferences() || {
      theme: 'auto' as const,
      language: 'es',
      notifications: true,
    };
    
    const updated = { ...current, ...preferences };
    
    if (updated.theme) {
      this.setCookie(COOKIE_NAMES.THEME, updated.theme, COOKIE_CONFIGS.preferences);
    }
    
    if (updated.language) {
      this.setCookie(COOKIE_NAMES.LANGUAGE, updated.language, COOKIE_CONFIGS.preferences);
    }
    
    if (updated.notifications !== undefined) {
      this.setCookie(
        COOKIE_NAMES.NOTIFICATIONS, 
        String(updated.notifications), 
        COOKIE_CONFIGS.preferences
      );
    }
  }

  // === MÉTODOS PÚBLICOS - LECTURA ===

  /**
   * Obtiene el estado completo de las cookies
   */
  static getAuthState(): AuthCookies {
    return {
      isAuthenticated: this.getCookie(COOKIE_NAMES.IS_AUTHENTICATED) === 'true',
      userId: this.getCookie(COOKIE_NAMES.USER_ID) || null,
      userType: this.getUserType(),
      userRole: this.getUserRole(),
      onboardingCompleted: this.getCookie(COOKIE_NAMES.ONBOARDING_COMPLETED) === 'true',
      ranchId: this.getCookie(COOKIE_NAMES.RANCH_ID) || null,
      sessionToken: this.getCookie(COOKIE_NAMES.SESSION_TOKEN) || null,
      refreshToken: this.getCookie(COOKIE_NAMES.REFRESH_TOKEN) || null,
      lastActivity: this.getCookie(COOKIE_NAMES.LAST_ACTIVITY) || null,
      preferences: this.getPreferences(),
    };
  }

  /**
   * Obtiene el tipo de usuario actual
   */
  static getUserType(): AuthCookies['userType'] {
    const userType = this.getCookie(COOKIE_NAMES.USER_TYPE);
    
    if (userType === 'temporary' || userType === 'permanent') {
      return userType;
    }
    
    // Compatibilidad con sistema anterior
    if (this.getCookie(COOKIE_NAMES.IS_TEMPORARY_USER) === 'true') {
      return 'temporary';
    }
    
    if (this.getCookie(COOKIE_NAMES.IS_AUTHENTICATED) === 'true') {
      return 'permanent';
    }
    
    return null;
  }

  /**
   * Obtiene el rol del usuario
   */
  static getUserRole(): AuthCookies['userRole'] {
    const role = this.getCookie(COOKIE_NAMES.USER_ROLE);
    
    if (role === 'owner' || role === 'manager' || role === 'employee' || role === 'viewer') {
      return role;
    }
    
    return null;
  }

  /**
   * Obtiene las preferencias del usuario
   */
  static getPreferences(): AuthCookies['preferences'] | null {
    const theme = this.getCookie(COOKIE_NAMES.THEME);
    const language = this.getCookie(COOKIE_NAMES.LANGUAGE);
    const notifications = this.getCookie(COOKIE_NAMES.NOTIFICATIONS);
    
    if (!theme && !language && !notifications) {
      return null;
    }
    
    return {
      theme: (theme as ('light' | 'dark' | 'auto')) || 'auto',
      language: language || 'es',
      notifications: notifications === 'true',
    };
  }

  /**
   * Verifica si el usuario actual es temporal
   */
  static isTemporaryUser(): boolean {
    return this.getUserType() === 'temporary';
  }

  /**
   * Verifica si el usuario está autenticado
   */
  static isAuthenticated(): boolean {
    return this.getCookie(COOKIE_NAMES.IS_AUTHENTICATED) === 'true' && 
           this.getUserType() === 'permanent';
  }

  /**
   * Obtiene el token de sesión actual
   */
  static getSessionToken(): string | null {
    return this.getCookie(COOKIE_NAMES.SESSION_TOKEN) || null;
  }

  /**
   * Obtiene el refresh token actual
   */
  static getRefreshToken(): string | null {
    return this.getCookie(COOKIE_NAMES.REFRESH_TOKEN) || null;
  }

  // === MÉTODOS PÚBLICOS - LIMPIEZA ===

  /**
   * Limpia todas las cookies de autenticación
   */
  static clearAll(): void {
    // Limpiar cookies de autenticación
    Object.values(COOKIE_NAMES).forEach(cookieName => {
      this.removeCookie(cookieName);
    });
    
    // Log en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log('[AuthCookies] Todas las cookies eliminadas');
    }
  }

  /**
   * Limpia solo las cookies de sesión (mantiene preferencias)
   */
  static clearSession(): void {
    // Cookies de sesión
    this.removeCookie(COOKIE_NAMES.IS_AUTHENTICATED);
    this.removeCookie(COOKIE_NAMES.USER_ID);
    this.removeCookie(COOKIE_NAMES.USER_TYPE);
    this.removeCookie(COOKIE_NAMES.USER_ROLE);
    this.removeCookie(COOKIE_NAMES.SESSION_TOKEN);
    this.removeCookie(COOKIE_NAMES.REFRESH_TOKEN);
    this.removeCookie(COOKIE_NAMES.RANCH_ID);
    this.removeCookie(COOKIE_NAMES.LAST_ACTIVITY);
    this.removeCookie(COOKIE_NAMES.IS_TEMPORARY_USER);
    
    // Mantener preferencias y onboarding
  }

  /**
   * Limpia cookies expiradas
   */
  static cleanupExpired(): void {
    // Las cookies se limpian automáticamente al expirar
    // Este método es para limpieza manual si es necesario
    
    if (!this.isSessionActive() && this.getCookie(COOKIE_NAMES.SESSION_TOKEN)) {
      this.clearSession();
      console.log('[AuthCookies] Sesión expirada, cookies limpiadas');
    }
  }

  // === MÉTODOS PÚBLICOS - UTILIDADES ===

  /**
   * Exporta todas las cookies como objeto (para debugging)
   */
  static export(): Record<string, string> {
    if (!this.isBrowser()) return {};
    
    const cookies: Record<string, string> = {};
    
    Object.entries(COOKIE_NAMES).forEach(([key, cookieName]) => {
      const value = this.getCookie(cookieName);
      if (value) {
        cookies[key] = value;
      }
    });
    
    return cookies;
  }

  /**
   * Debug: Imprime el estado actual de las cookies
   */
  static debug(): void {
    if (process.env.NODE_ENV !== 'development') return;
    
    console.group('🍪 Auth Cookies State');
    console.table(this.getAuthState());
    console.log('All cookies:', this.export());
    console.log('Session active:', this.isSessionActive());
    console.groupEnd();
  }

  /**
   * Valida la integridad de las cookies
   */
  static validate(): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    const state = this.getAuthState();
    
    // Validaciones básicas
    if (state.isAuthenticated && !state.userId) {
      errors.push('Usuario autenticado sin ID');
    }
    
    if (state.userType === 'permanent' && !state.isAuthenticated) {
      errors.push('Usuario permanente no marcado como autenticado');
    }
    
    if (state.sessionToken && !state.isAuthenticated) {
      errors.push('Token de sesión presente sin autenticación');
    }
    
    if (state.ranchId && !state.userId) {
      errors.push('Rancho activo sin usuario');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

// === FUNCIONES DE UTILIDAD EXPORTADAS ===

/**
 * Funciones de conveniencia para uso directo
 */
export const setTemporaryUser = AuthCookieManager.setTemporaryUser.bind(AuthCookieManager);
export const setAuthenticatedUser = AuthCookieManager.setAuthenticatedUser.bind(AuthCookieManager);
export const convertToPermanentUser = AuthCookieManager.convertToPermanentUser.bind(AuthCookieManager);
export const completeOnboarding = AuthCookieManager.completeOnboarding.bind(AuthCookieManager);
export const setActiveRanch = AuthCookieManager.setActiveRanch.bind(AuthCookieManager);
export const getAuthState = AuthCookieManager.getAuthState.bind(AuthCookieManager);
export const isTemporaryUser = AuthCookieManager.isTemporaryUser.bind(AuthCookieManager);
export const isAuthenticated = AuthCookieManager.isAuthenticated.bind(AuthCookieManager);
export const clearAuthCookies = AuthCookieManager.clearAll.bind(AuthCookieManager);
export const debugAuthCookies = AuthCookieManager.debug.bind(AuthCookieManager);

// === HOOK PARA REACT ===

/**
 * Hook personalizado para usar las cookies en componentes React
 */
export function useAuthCookies() {
  return {
    // Estado
    getAuthState: AuthCookieManager.getAuthState.bind(AuthCookieManager),
    isAuthenticated: AuthCookieManager.isAuthenticated.bind(AuthCookieManager),
    isTemporaryUser: AuthCookieManager.isTemporaryUser.bind(AuthCookieManager),
    
    // Acciones
    setTemporaryUser: AuthCookieManager.setTemporaryUser.bind(AuthCookieManager),
    setAuthenticatedUser: AuthCookieManager.setAuthenticatedUser.bind(AuthCookieManager),
    convertToPermanentUser: AuthCookieManager.convertToPermanentUser.bind(AuthCookieManager),
    completeOnboarding: AuthCookieManager.completeOnboarding.bind(AuthCookieManager),
    setActiveRanch: AuthCookieManager.setActiveRanch.bind(AuthCookieManager),
    setPreferences: AuthCookieManager.setPreferences.bind(AuthCookieManager),
    
    // Sesión
    updateSessionToken: AuthCookieManager.updateSessionToken.bind(AuthCookieManager),
    updateRefreshToken: AuthCookieManager.updateRefreshToken.bind(AuthCookieManager),
    isSessionActive: AuthCookieManager.isSessionActive.bind(AuthCookieManager),
    
    // Limpieza
    clearAll: AuthCookieManager.clearAll.bind(AuthCookieManager),
    clearSession: AuthCookieManager.clearSession.bind(AuthCookieManager),
    
    // Debug
    debug: AuthCookieManager.debug.bind(AuthCookieManager),
    validate: AuthCookieManager.validate.bind(AuthCookieManager),
  };
}