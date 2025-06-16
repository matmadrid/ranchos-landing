// src/store/slices/auth.slice.ts
import { StateCreator } from 'zustand';
import { AuthCookieManager } from '@/lib/auth-cookies';
import type { User, Profile } from './types';
import type { ProcessingResult, ValidationError } from '@/types';
import type { ProcessingSlice } from './processing.slice';
import { cleanupService } from '@/services/storage/CleanupService';

// Re-exportar tipos para compatibilidad
export type { User, Profile } from './types';

// Tipo para datos de registro
export interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  phone?: string;
  location?: string;
  countryCode?: 'MX' | 'CO' | 'BR' | 'ES';
  acceptTerms: boolean;
}

export interface AuthSlice {
  // === ESTADO ===
  isAuthenticated: boolean;
  currentUser: User | null;
  profile: Profile | null;
  isOnboardingComplete: boolean;
  profilePromptDismissed: boolean;
  onboardingData: {
    currentStep: number;
    profile?: {
      name: string;
      email: string;
      phone: string;
      role: string;
    };
    ranch?: {
      name: string;
      location: string;
      size: string;
      sizeUnit: string;
    };
    animals?: Array<{
      type: string;
      count: string;
    }>;
  };
  
  // === ACCIONES DE USUARIO - Sin ProcessingResult ===
  setCurrentUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  
  // === ACCIONES DE USUARIO - Con ProcessingResult ===
  updateProfile: (updates: Partial<Profile>) => Promise<ProcessingResult<Profile>>;
  
  // === ACCIONES DE ONBOARDING - Sin ProcessingResult ===
  setIsOnboardingComplete: (complete: boolean) => void;
  setOnboardingStep: (step: number) => void;
  setOnboardingData: (data: any) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  
  // === ACCIONES DE UI - Sin ProcessingResult ===
  setProfilePromptDismissed: (dismissed: boolean) => void;
  
  // === AUTENTICACIÓN - Con ProcessingResult ===
  login: (email: string, password: string) => Promise<ProcessingResult<User>>;
  register: (userData: RegisterData) => Promise<ProcessingResult<User>>;
  logout: () => Promise<ProcessingResult<void>>;
  
  // === UTILIDADES - Sin ProcessingResult ===
  isTemporaryUser: () => boolean;
  convertToPermamentUser: (userData: Partial<User>) => void;
  checkAuthStatus: () => boolean;
  refreshUserData: () => Promise<ProcessingResult<User>>;
  
  // === PERMISOS - Sin ProcessingResult ===
  hasPermission: (permission: string) => boolean;
  getUserRole: () => string | null;
  canAccessFeature: (feature: string) => boolean;
  
  // === VALIDACIÓN ===
  validateLoginData: (email: string, password: string) => ValidationError[];
  validateRegisterData: (data: RegisterData) => ValidationError[];
  validateProfileData: (data: Partial<Profile>) => ValidationError[];
}

// Tipo extendido con ProcessingSlice
type AuthSliceWithProcessing = AuthSlice & ProcessingSlice;

export const createAuthSlice: StateCreator<
  AuthSliceWithProcessing,
  [],
  [],
  AuthSlice
> = (set, get) => ({
  // === ESTADO INICIAL ===
  isAuthenticated: false,
  currentUser: null,
  profile: null,
  isOnboardingComplete: false,
  profilePromptDismissed: false,
  onboardingData: {
    currentStep: 1
  },
  
  // === ESTABLECER USUARIO ===
  setCurrentUser: async (user) => {
    const isAuthenticated = !!user;
    console.log("[DEBUG] setCurrentUser llamado con:", user);
    const isTemporary = user?.id?.startsWith('demo-') || false;
    
    // Si es un usuario real (no demo) y está autenticándose
    if (user && !isTemporary && isAuthenticated) {
      console.log("[DEBUG] Usuario real detectado, limpiando datos demo...");
      
      // Limpiar datos demo de forma silenciosa
      try {
        await cleanupService.cleanDemoData({
          dryRun: false,
          verbose: false
        });
        console.log("[DEBUG] Datos demo limpiados exitosamente");
      } catch (error) {
        console.error("[DEBUG] Error limpiando datos demo:", error);
        // No fallar la autenticación por error de limpieza
      }
    }
    
    set({ 
      currentUser: user, 
      isAuthenticated: isAuthenticated && !isTemporary 
    });
    
    // Sincronizar con cookies
    if (user) {
      if (isTemporary) {
        AuthCookieManager.setTemporaryUser(user.id);
      } else {
        AuthCookieManager.setAuthenticatedUser(user.id, {
          onboardingCompleted: get().isOnboardingComplete,
          role: user.role
        });
      }
    } else {
      AuthCookieManager.clearAll();
    }
    
    // Si el usuario tiene datos de perfil, actualizarlos
    if (user && user.name && user.email) {
      const currentProfile = get().profile;
      if (!currentProfile || currentProfile.email !== user.email) {
        set({
          profile: {
            name: user.name,
            email: user.email,
            ranch: currentProfile?.ranch || '',
            location: user.location || '',
            countryCode: user.countryCode || 'MX'
          }
        });
      }
    }
    
    // 🎯 DETECCIÓN DE CUENTA DEMO
    if (user && user.email === 'demo@ranchos.io') {
      console.log('🎪 Cuenta DEMO detectada - Cargando datos de demostración...');
      
      // Importar función de carga demo (lazy load)
      import('../../utils/demoDataGenerator').then(({ loadDemoDataToStore }) => {
        // Verificar si ya hay datos para no duplicar
        setTimeout(() => {
          const fullStore = get() as any;
          if ((!fullStore.ranches || fullStore.ranches.length === 0) || 
              (!fullStore.animals || fullStore.animals.length === 0)) {
            loadDemoDataToStore(fullStore).then((result: any) => {
              if (result.success) {
                console.log('✅ Datos DEMO cargados:', result.summary);
              }
            }).catch((error: any) => {
              console.error('❌ Error cargando datos demo:', error);
            });
          }
        }, 100); // Pequeño delay para asegurar que el store esté listo
      }).catch(() => {
        console.error('❌ Error importando generador de datos demo');
      });
    }
  },
  
  
  // === ESTABLECER PERFIL ===
  setProfile: (profile) => {
    set({ profile });
    
    // Si hay un usuario actual, actualizar sus datos básicos
    const currentUser = get().currentUser;
    if (currentUser && profile) {
      set({
        currentUser: {
          ...currentUser,
          name: profile.name,
          email: profile.email,
          location: profile.location
        }
      });
    }
  },
  // === ACTUALIZAR PERFIL - Con ProcessingResult ===
  updateProfile: async (updates) => {
    const operationId = `update-profile-${Date.now()}`;
    
    try {
      get().startProcessing(operationId);
      
      const currentProfile = get().profile;
      
      if (!currentProfile) {
        const result = get().createProcessingResult<Profile>(
          false,
          undefined,
          [{
            code: 'PROFILE_NOT_FOUND',
            message: 'No se encontró un perfil para actualizar',
            field: '',
            severity: 'error'
          }]
        );
        
        get().endProcessing(operationId, result);
        return result;
      }
      
      // Validar datos del perfil
      const errors = get().validateProfileData(updates);
      
      if (errors.filter(e => e.severity === 'error').length > 0) {
        const result = get().createProcessingResult<Profile>(
          false,
          undefined,
          errors
        );
        
        get().endProcessing(operationId, result);
        return result;
      }
      
      // Simular actualización (aquí iría la llamada a la API)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Actualizar perfil
      const updatedProfile = {
        ...currentProfile,
        ...updates
      };
      
      set({ profile: updatedProfile });
      
      // También actualizar currentUser si es necesario
      const currentUser = get().currentUser;
      if (currentUser) {
        set({
          currentUser: {
            ...currentUser,
            name: updatedProfile.name,
            email: updatedProfile.email,
            location: updatedProfile.location,
            updatedAt: new Date().toISOString()
          }
        });
      }
      
      const result = get().createProcessingResult<Profile>(
        true,
        updatedProfile,
        undefined,
        errors.filter(e => e.severity === 'warning')
      );
      
      get().endProcessing(operationId, result);
      return result;
      
    } catch (error) {
      const errorResult = get().createProcessingResult<Profile>(
        false,
        undefined,
        [{
          code: 'PROFILE_UPDATE_ERROR',
          message: error instanceof Error ? error.message : 'Error al actualizar perfil',
          field: '',
          severity: 'error'
        }]
      );
      
      get().endProcessing(operationId, errorResult);
      return errorResult;
    }
  },
  
  // === ONBOARDING COMPLETO ===
  setIsOnboardingComplete: (complete) => {
    set({ isOnboardingComplete: complete });
    
    if (complete) {
      AuthCookieManager.completeOnboarding();
      
      // Limpiar datos temporales del onboarding
      set({
        onboardingData: { currentStep: 1 }
      });
      
      // Si es usuario temporal, mostrar prompt para completar registro
      if (get().isTemporaryUser()) {
        setTimeout(() => {
          set({ profilePromptDismissed: false });
        }, 2000);
      }
    }
  },
  
  // === PASO DE ONBOARDING ===
  setOnboardingStep: (step) => {
    set((state) => ({
      onboardingData: {
        ...state.onboardingData,
        currentStep: step
      }
    }));
    
    // Guardar progreso en localStorage
    localStorage.setItem('onboarding-step', step.toString());
  },
  
  // === DATOS DE ONBOARDING ===
  setOnboardingData: (data) => {
    set((state) => ({
      onboardingData: {
        ...state.onboardingData,
        ...data
      }
    }));
    
    // Guardar en localStorage
    const currentData = get().onboardingData;
    localStorage.setItem('onboarding-data', JSON.stringify(currentData));
  },
  
  // === COMPLETAR ONBOARDING ===
  completeOnboarding: () => {
    const { onboardingData } = get();
    
    // Crear perfil desde datos del onboarding
    if (onboardingData.profile) {
      const profile: Profile = {
        name: onboardingData.profile.name,
        email: onboardingData.profile.email,
        ranch: onboardingData.ranch?.name || '',
        location: onboardingData.ranch?.location || '',
        countryCode: 'MX' // Por defecto México
      };
      
      set({
        profile,
        isOnboardingComplete: true,
        onboardingData: { currentStep: 1 } // Reset
      });
      
      // Limpiar localStorage
      localStorage.removeItem('onboarding-step');
      localStorage.removeItem('onboarding-data');
      
      // Marcar en cookies
      AuthCookieManager.completeOnboarding();
    }
  },
  
  // === RESETEAR ONBOARDING ===
  resetOnboarding: () => {
    set({
      isOnboardingComplete: false,
      onboardingData: { currentStep: 1 }
    });
    
    // Limpiar localStorage
    localStorage.removeItem('onboarding-step');
    localStorage.removeItem('onboarding-data');
  },
  
  // === DESCARTAR PROMPT DE PERFIL ===
  setProfilePromptDismissed: (dismissed) => {
    set({ profilePromptDismissed: dismissed });
    
    if (dismissed) {
      localStorage.setItem('profilePromptDismissed', 'true');
      
      // Auto-mostrar de nuevo después de 7 días
      setTimeout(() => {
        localStorage.removeItem('profilePromptDismissed');
        set({ profilePromptDismissed: false });
      }, 7 * 24 * 60 * 60 * 1000);
    }
  },
  
  // === LOGIN - Con ProcessingResult ===
  login: async (email, password) => {
    const operationId = `login-${Date.now()}`;
    
    try {
      get().startProcessing(operationId);
      
      // Validar entrada
      const errors = get().validateLoginData(email, password);
      
      if (errors.length > 0) {
        const result = get().createProcessingResult<User>(
          false,
          undefined,
          errors
        );
        
        get().endProcessing(operationId, result);
        return result;
      }
      
      // 🎯 Detectar cuenta DEMO
      if (email === 'demo@ranchos.io' && password === 'demo123') {
        console.log('🔑 Login con cuenta DEMO');
        
        // Usuario demo especial
        const demoUser: User = {
          id: 'demo-user-001',
          email: 'demo@ranchos.io',
          name: 'Usuario Demo Premium',
          countryCode: 'MX',
          role: 'owner',
          permissions: ['*'],
          createdAt: new Date().toISOString()
        };
        
        // Actualizar estado (esto disparará la carga de datos demo)
        get().setCurrentUser(demoUser);
        
        const result = get().createProcessingResult<User>(
          true,
          demoUser
        );
        
        get().endProcessing(operationId, result);
        return result;
      }
      
      // Simular llamada API (aquí iría la llamada real)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simular respuesta del servidor
      // En producción, esto vendría del backend
      const user: User = {
        id: `user-${Date.now()}`,
        email,
        name: email.split('@')[0],
        countryCode: 'MX',
        role: 'owner',
        permissions: ['*'],
        createdAt: new Date().toISOString()
      };
      
      // Actualizar estado
      get().setCurrentUser(user);
      
      // Log de actividad
      console.log(`[Auth] Usuario ${email} inició sesión exitosamente`);
      
      const result = get().createProcessingResult<User>(
        true,
        user
      );
      
      get().endProcessing(operationId, result);
      return result;
      
    } catch (error) {
      const errorResult = get().createProcessingResult<User>(
        false,
        undefined,
        [{
          code: 'AUTH_LOGIN_ERROR',
          message: error instanceof Error ? error.message : 'Error al iniciar sesión',
          field: '',
          severity: 'error'
        }]
      );
      
      get().endProcessing(operationId, errorResult);
      return errorResult;
    }
  },
  
  // === REGISTER - Con ProcessingResult ===
  register: async (userData) => {
    const operationId = `register-${Date.now()}`;
    
    try {
      get().startProcessing(operationId);
      
      // Validar datos de registro
      const errors = get().validateRegisterData(userData);
      
      if (errors.filter(e => e.severity === 'error').length > 0) {
        const result = get().createProcessingResult<User>(
          false,
          undefined,
          errors
        );
        
        get().endProcessing(operationId, result);
        return result;
      }
      
      // Simular registro (aquí iría la llamada real al API)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Verificar si es conversión de usuario temporal
      const isTemporary = get().isTemporaryUser();
      const currentUser = get().currentUser;
      
      const newUser: User = {
        id: isTemporary && currentUser ? currentUser.id : `user-${Date.now()}`,
        email: userData.email,
        name: userData.name,
        phone: userData.phone,
        location: userData.location,
        countryCode: userData.countryCode || 'MX',
        role: 'owner',
        permissions: ['*'],
        createdAt: new Date().toISOString()
      };
      
      // Actualizar estado
      get().setCurrentUser(newUser);
      
      // Si era temporal, convertir y preservar datos
      if (isTemporary) {
        AuthCookieManager.convertToPermanentUser(newUser.id, undefined, newUser.role);
        
        // Marcar onboarding como completo si venía de demo
        if (get().onboardingData.currentStep > 1) {
          get().setIsOnboardingComplete(true);
        }
      } else {
        // Nuevo usuario, iniciar onboarding
        get().resetOnboarding();
      }
      
      // Warnings o info
      const warnings: ValidationError[] = errors.filter(e => e.severity !== 'error');
      
      if (isTemporary) {
        warnings.push({
          code: 'AUTH_TEMPORARY_CONVERTED',
          message: 'Tu cuenta temporal ha sido convertida exitosamente',
          field: '',
          severity: 'info'
        });
      }
      
      const result = get().createProcessingResult<User>(
        true,
        newUser,
        undefined,
        warnings
      );
      
      get().endProcessing(operationId, result);
      return result;
      
    } catch (error) {
      const errorResult = get().createProcessingResult<User>(
        false,
        undefined,
        [{
          code: 'AUTH_REGISTER_ERROR',
          message: error instanceof Error ? error.message : 'Error al registrar usuario',
          field: '',
          severity: 'error'
        }]
      );
      
      get().endProcessing(operationId, errorResult);
      
      // Limpiar datos según tipo de usuario antes de limpiar estado
      const wasTemporary = get().isTemporaryUser();
      try {
        if (wasTemporary) {
          await cleanupService.cleanDemoData({ dryRun: false, verbose: false });
        } else {
          await cleanupService.cleanOnLogout({
            preserveUserData: false,
            preserveKeys: ['preferredCountry', 'rememberedEmail']
          });
        }
      } catch (error) {
        console.error("[DEBUG] Error durante limpieza en logout:", error);
      }
      return errorResult;
    }
  },
  
  // === LOGOUT - Con ProcessingResult ===
  logout: async () => {
    const operationId = `logout-${Date.now()}`;
    
    try {
      get().startProcessing(operationId);
      
      const currentUser = get().currentUser;
      
      // Simular llamada al servidor para invalidar sesión
      if (currentUser && !get().isTemporaryUser()) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      // Limpiar estado de autenticación
      set({
        currentUser: null,
        profile: null,
        isAuthenticated: false,
        isOnboardingComplete: false,
        profilePromptDismissed: false,
        onboardingData: { currentStep: 1 }
      });
      
      // Limpiar cookies
      AuthCookieManager.clearAll();
      
      // Limpiar localStorage
      localStorage.removeItem('profilePromptDismissed');
      localStorage.removeItem('onboarding-step');
      localStorage.removeItem('onboarding-data');
      
      // Log de actividad
      if (currentUser) {
        console.log(`[Auth] Usuario ${currentUser.email} cerró sesión`);
      }
      
      const result = get().createProcessingResult<void>(true);
      
      get().endProcessing(operationId, result);
      return result;
      
    } catch (error) {
      const errorResult = get().createProcessingResult<void>(
        false,
        undefined,
        [{
          code: 'AUTH_LOGOUT_ERROR',
          message: error instanceof Error ? error.message : 'Error al cerrar sesión',
          field: '',
          severity: 'error'
        }]
      );
      
      get().endProcessing(operationId, errorResult);
      return errorResult;
    }
  },
  
  // === VERIFICAR SI ES USUARIO TEMPORAL ===
  isTemporaryUser: () => {
    const user = get().currentUser;
    return user?.id?.startsWith('demo-') || false;
  },
  
  // === CONVERTIR A USUARIO PERMANENTE ===
  convertToPermamentUser: (userData) => {
    const currentUser = get().currentUser;
    if (!currentUser || !get().isTemporaryUser()) return;
    
    const permanentUser: User = {
      ...currentUser,
      ...userData,
      id: `user-${Date.now()}`, // Nuevo ID permanente
      updatedAt: new Date().toISOString()
    };
    
    set({
      currentUser: permanentUser,
      isAuthenticated: true,
      isOnboardingComplete: true
    });
    
    // Actualizar cookies
    AuthCookieManager.convertToPermanentUser(permanentUser.id, undefined, permanentUser.role);
    
    // Limpiar marca de usuario temporal
    localStorage.removeItem('isTemporaryUser');
  },
  
  // === VERIFICAR ESTADO DE AUTENTICACIÓN ===
  checkAuthStatus: () => {
    const state = get();
    const cookieState = AuthCookieManager.getAuthState();
    
    // Sincronizar con cookies si hay discrepancia
    if (cookieState.isAuthenticated && !state.currentUser) {
      console.warn('Usuario autenticado en cookies pero no en store');
      return false;
    }
    
    return state.isAuthenticated && !state.isTemporaryUser();
  },
  
  // === REFRESCAR DATOS DE USUARIO - Con ProcessingResult ===
  refreshUserData: async () => {
    const operationId = `refresh-user-${Date.now()}`;
    
    const currentUser = get().currentUser;
    if (!currentUser || get().isTemporaryUser()) {
      return get().createProcessingResult<User>(
        false,
        undefined,
        [{
          code: 'AUTH_NOT_AUTHENTICATED',
          message: 'No hay usuario autenticado para refrescar',
          field: '',
          severity: 'error'
        }]
      );
    }
    
    try {
      get().startProcessing(operationId);
      
      // Simular llamada a la API para obtener datos actualizados
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // En producción, aquí se obtendrían datos frescos del servidor
      const updatedUser = {
        ...currentUser,
        updatedAt: new Date().toISOString()
      };
      
      set({ currentUser: updatedUser });
      
      const result = get().createProcessingResult<User>(
        true,
        updatedUser
      );
      
      get().endProcessing(operationId, result);
      return result;
      
    } catch (error) {
      const errorResult = get().createProcessingResult<User>(
        false,
        undefined,
        [{
          code: 'AUTH_REFRESH_ERROR',
          message: error instanceof Error ? error.message : 'Error al refrescar datos',
          field: '',
          severity: 'error'
        }]
      );
      
      get().endProcessing(operationId, errorResult);
      return errorResult;
    }
  },
  
  // === VERIFICAR PERMISO ===
  hasPermission: (permission) => {
    const user = get().currentUser;
    if (!user) return false;
    
    // Si es usuario temporal, solo permisos básicos
    if (get().isTemporaryUser()) {
      const basicPermissions = ['view_dashboard', 'create_demo_ranch', 'view_demo_animals'];
      return basicPermissions.includes(permission);
    }
    
    // Admin tiene todos los permisos
    if (user.role === 'owner' || user.permissions?.includes('*')) {
      return true;
    }
    
    // Verificar permisos específicos del usuario
    return user.permissions?.includes(permission) || false;
  },
  
  // === OBTENER ROL ===
  getUserRole: () => {
    const user = get().currentUser;
    if (!user) return null;
    
    if (get().isTemporaryUser()) return 'demo';
    
    return user.role || 'viewer';
  },
  
  // === PUEDE ACCEDER A FEATURE ===
  canAccessFeature: (feature) => {
    const role = get().getUserRole();
    
    // Mapeo de features por rol
    const featuresByRole: Record<string, string[]> = {
      owner: ['*'], // Acceso total
      manager: ['dashboard', 'animals', 'production', 'reports', 'team'],
      employee: ['dashboard', 'animals', 'production'],
      viewer: ['dashboard', 'reports'],
      demo: ['dashboard', 'demo_features']
    };
    
    if (!role) return false;
    
    const allowedFeatures = featuresByRole[role] || [];
    return allowedFeatures.includes('*') || allowedFeatures.includes(feature);
  },
  
  // === VALIDACIONES ===
  validateLoginData: (email: string, password: string): ValidationError[] => {
    const errors: ValidationError[] = [];
    
    // Validar email
    if (!email) {
      errors.push({
        code: 'AUTH_EMAIL_REQUIRED',
        message: 'El email es requerido',
        field: 'email',
        severity: 'error'
      });
    } else if (!email.includes('@') || !email.includes('.')) {
      errors.push({
        code: 'AUTH_EMAIL_INVALID',
        message: 'Email inválido',
        field: 'email',
        severity: 'error'
      });
    }
    
    // Validar contraseña
    if (!password) {
      errors.push({
        code: 'AUTH_PASSWORD_REQUIRED',
        message: 'La contraseña es requerida',
        field: 'password',
        severity: 'error'
      });
    } else if (password.length < 6) {
      errors.push({
        code: 'AUTH_PASSWORD_SHORT',
        message: 'La contraseña debe tener al menos 6 caracteres',
        field: 'password',
        severity: 'error'
      });
    }
    
    return errors;
  },
  
  validateRegisterData: (data: RegisterData): ValidationError[] => {
    const errors: ValidationError[] = [];
    
    // Validar email
    if (!data.email) {
      errors.push({
        code: 'AUTH_EMAIL_REQUIRED',
        message: 'El email es requerido',
        field: 'email',
        severity: 'error'
      });
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        errors.push({
          code: 'AUTH_EMAIL_INVALID',
          message: 'Email inválido',
          field: 'email',
          severity: 'error'
        });
      }
    }
    
    // Validar contraseña
    if (!data.password) {
      errors.push({
        code: 'AUTH_PASSWORD_REQUIRED',
        message: 'La contraseña es requerida',
        field: 'password',
        severity: 'error'
      });
    } else {
      if (data.password.length < 8) {
        errors.push({
          code: 'AUTH_PASSWORD_WEAK',
          message: 'La contraseña debe tener al menos 8 caracteres',
          field: 'password',
          severity: 'error'
        });
      }
      
      // Validar fortaleza de contraseña
      const hasNumber = /\d/.test(data.password);
      const hasUpper = /[A-Z]/.test(data.password);
      const hasLower = /[a-z]/.test(data.password);
      const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(data.password);
      
      const strength = [hasNumber, hasUpper, hasLower, hasSpecial].filter(Boolean).length;
      
      if (strength < 2) {
        errors.push({
          code: 'AUTH_PASSWORD_SIMPLE',
          message: 'La contraseña debe incluir números, mayúsculas, minúsculas o caracteres especiales',
          field: 'password',
          severity: 'warning'
        });
      }
    }
    
    // Validar confirmación de contraseña
    if (data.password !== data.confirmPassword) {
      errors.push({
        code: 'AUTH_PASSWORD_MISMATCH',
        message: 'Las contraseñas no coinciden',
        field: 'confirmPassword',
        severity: 'error'
      });
    }
    
    // Validar nombre
    if (!data.name) {
      errors.push({
        code: 'AUTH_NAME_REQUIRED',
        message: 'El nombre es requerido',
        field: 'name',
        severity: 'error'
      });
    } else if (data.name.length < 2) {
      errors.push({
        code: 'AUTH_NAME_SHORT',
        message: 'El nombre debe tener al menos 2 caracteres',
        field: 'name',
        severity: 'error'
      });
    }
    
    // Validar teléfono (opcional pero si existe, validar formato)
    if (data.phone) {
      const phoneRegex = /^[\d\s\-\+\(\)]+$/;
      if (!phoneRegex.test(data.phone) || data.phone.replace(/\D/g, '').length < 10) {
        errors.push({
          code: 'AUTH_PHONE_INVALID',
          message: 'Número de teléfono inválido',
          field: 'phone',
          severity: 'warning'
        });
      }
    }
    
    // Validar términos
    if (!data.acceptTerms) {
      errors.push({
        code: 'AUTH_TERMS_REQUIRED',
        message: 'Debes aceptar los términos y condiciones',
        field: 'acceptTerms',
        severity: 'error'
      });
    }
    
    return errors;
  },
  
  validateProfileData: (data: Partial<Profile>): ValidationError[] => {
    const errors: ValidationError[] = [];
    
    // Validar nombre si se proporciona
    if (data.name !== undefined) {
      if (!data.name || data.name.trim().length === 0) {
        errors.push({
          code: 'PROFILE_NAME_REQUIRED',
          message: 'El nombre es requerido',
          field: 'name',
          severity: 'error'
        });
      } else if (data.name.length < 2) {
        errors.push({
          code: 'PROFILE_NAME_SHORT',
          message: 'El nombre debe tener al menos 2 caracteres',
          field: 'name',
          severity: 'error'
        });
      }
    }
    
    // Validar email si se proporciona
    if (data.email !== undefined) {
      if (!data.email) {
        errors.push({
          code: 'PROFILE_EMAIL_REQUIRED',
          message: 'El email es requerido',
          field: 'email',
          severity: 'error'
        });
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
          errors.push({
            code: 'PROFILE_EMAIL_INVALID',
            message: 'Email inválido',
            field: 'email',
            severity: 'error'
          });
        }
      }
    }
    
    // Validar ubicación si se proporciona
    if (data.location !== undefined && data.location && data.location.length > 100) {
      errors.push({
        code: 'PROFILE_LOCATION_LONG',
        message: 'La ubicación es muy larga (máximo 100 caracteres)',
        field: 'location',
        severity: 'warning'
      });
    }
    
    // Validar rancho si se proporciona
    if (data.ranch !== undefined && data.ranch && data.ranch.length > 50) {
      errors.push({
        code: 'PROFILE_RANCH_LONG',
        message: 'El nombre del rancho es muy largo (máximo 50 caracteres)',
        field: 'ranch',
        severity: 'warning'
      });
    }
    
    return errors;
  }
});