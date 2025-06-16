// src/hooks/useAuth.ts
'use client';

import { useEffect } from 'react';
import useRanchOSStore from '@/store';
import { useRouter } from 'next/navigation';
import { useStorageCleanup } from '@/hooks/useStorageCleanup';
import Cookies from 'js-cookie';

export function useAuth() {
  const router = useRouter();
  const { 
    currentUser, 
    setCurrentUser, 
    isOnboardingComplete,
    setIsOnboardingComplete 
  } = useRanchOSStore();
  
  const isAuthenticated = !!currentUser;

  // Sync authentication state with cookies
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      Cookies.set('isAuthenticated', 'true', { expires: 7 });
      Cookies.set('userId', currentUser.id, { expires: 7 });
      
      if (isOnboardingComplete) {
        Cookies.set('onboardingCompleted', 'true', { expires: 365 });
      }
      
      // Si es usuario temporal, marcar cookie
      if (currentUser.id.startsWith('demo-')) {
        Cookies.set('isTemporaryUser', 'true', { expires: 1 }); // Expira en 1 día
      }
    } else {
      Cookies.remove('isAuthenticated');
      Cookies.remove('userId');
      Cookies.remove('isTemporaryUser');
    }
  }, [isAuthenticated, currentUser, isOnboardingComplete]);

  const login = (user: any, redirect: string = '/dashboard') => {
    setCurrentUser(user);
    
    // Check if user needs onboarding
    if (!isOnboardingComplete) {
      router.push('/auth/onboarding');
    } else {
      router.push(redirect);
    }
  };

  const logout = async () => {
    try {
      // Usar el logout del store que ya tiene limpieza integrada
      const result = await useRanchOSStore.getState().logout();
      
      if (result.success) {
        // Limpiar cookies adicionales
        Cookies.remove('isAuthenticated');
        Cookies.remove('userId');
        Cookies.remove('onboardingCompleted');
        Cookies.remove('isTemporaryUser');
        
        // Redirigir al login
        router.push('/auth/login');
      } else {
        console.error('Error durante logout:', result.errors?.[0]?.message || "Error en logout");
      }
      
      return result;
    } catch (error) {
      console.error('Error during logout:', error);
      
      // Fallback: limpiar manualmente
      Cookies.remove('isAuthenticated');
      Cookies.remove('userId');
      Cookies.remove('onboardingCompleted');
      Cookies.remove('isTemporaryUser');
      setCurrentUser(null);
      setIsOnboardingComplete(false);
      router.push('/auth/login');
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error durante logout'
      };
    }
  };

  const checkAuth = () => {
    const authCookie = Cookies.get('isAuthenticated');
    const userIdCookie = Cookies.get('userId');
    
    if (authCookie === 'true' && userIdCookie && !currentUser) {
      // Restore session from cookies
      // In a real app, this would fetch user data from API
      const restoredUser = {
        id: userIdCookie,
        email: 'restored@example.com',
        name: 'Restored User',
        createdAt: new Date().toISOString()
      };
      
      setCurrentUser(restoredUser);
    }
    
    return isAuthenticated;
  };

  return {
    isAuthenticated,
    currentUser,
    isOnboardingComplete,
    login,
    logout,
    checkAuth
  };
}