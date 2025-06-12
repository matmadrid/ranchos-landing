// src/store/slices/auth.slice.ts
import { StateCreator } from 'zustand';
import { AuthCookieManager } from '@/lib/auth-cookies';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  phone?: string;
  location?: string;
  countryCode?: 'MX' | 'CO' | 'BR' | 'ES';
  preferredUnits?: {
    weight: 'kg' | 'lb' | 'arroba';
    area: 'hectare' | 'acre';
    volume: 'liter' | 'gallon';
    temperature: 'celsius' | 'fahrenheit';
  };
  createdAt: string;
  updatedAt?: string;
}

export interface Profile {
  name: string;
  email: string;
  ranch: string;
  location: string;
  countryCode: 'MX' | 'CO' | 'BR' | 'ES';
}

export interface AuthSlice {
  // Estado
  isAuthenticated: boolean;
  currentUser: User | null;
  profile: Profile | null;
  isOnboardingComplete: boolean;
  profilePromptDismissed: boolean;
  
  // Acciones
  setCurrentUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setIsOnboardingComplete: (complete: boolean) => void;
  setProfilePromptDismissed: (dismissed: boolean) => void;
  logout: () => void;
  
  // Utilidades
  isTemporaryUser: () => boolean;
  convertToPermamentUser: (userData: Partial<User>) => void;
}

export const createAuthSlice: StateCreator<AuthSlice> = (set, get) => ({
  // Estado inicial
  isAuthenticated: false,
  currentUser: null,
  profile: null,
  isOnboardingComplete: false,
  profilePromptDismissed: false,
  
  // Establecer usuario actual
  setCurrentUser: (user) => {
    const isAuthenticated = !!user;
    const isTemporary = user?.id?.startsWith('demo-') || false;
    
    set({ 
      currentUser: user, 
      isAuthenticated: isAuthenticated && !isTemporary 
    });
    
    // Sincronizar con cookies
    if (user) {
      if (isTemporary) {
        AuthCookieManager.setTemporaryUser(user.id);
      } else {
        AuthCookieManager.setAuthenticatedUser(user.id, get().isOnboardingComplete);
      }
    } else {
      AuthCookieManager.clearAll();
    }
  },
  
  // Establecer perfil
  setProfile: (profile) => set({ profile }),
  
  // Marcar onboarding como completo
  setIsOnboardingComplete: (complete) => {
    set({ isOnboardingComplete: complete });
    if (complete) {
      AuthCookieManager.completeOnboarding();
    }
  },
  
  // Descartar prompt de perfil
  setProfilePromptDismissed: (dismissed) => {
    set({ profilePromptDismissed: dismissed });
    if (dismissed) {
      localStorage.setItem('profilePromptDismissed', 'true');
    }
  },
  
  // Cerrar sesión
  logout: () => {
    // Limpiar estado
    set({
      currentUser: null,
      profile: null,
      isAuthenticated: false,
      isOnboardingComplete: false,
      profilePromptDismissed: false
    });
    
    // Limpiar cookies
    AuthCookieManager.clearAll();
    
    // Limpiar localStorage
    localStorage.removeItem('ranch-store');
    localStorage.removeItem('onboarding-step');
    localStorage.removeItem('onboarding-data');
    localStorage.removeItem('profilePromptDismissed');
  },
  
  // Verificar si es usuario temporal
  isTemporaryUser: () => {
    const user = get().currentUser;
    return user?.id?.startsWith('demo-') || false;
  },
  
  // Convertir usuario temporal a permanente
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
    
    AuthCookieManager.convertToPermanentUser(permanentUser.id);
  }
});