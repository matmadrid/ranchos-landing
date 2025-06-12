// src/hooks/useAuth.ts
'use client';

import { useEffect } from 'react';
import useRanchOSStore from '@/store';
import { useRouter } from 'next/navigation';
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

  const logout = () => {
    // Clear all auth cookies
    Cookies.remove('isAuthenticated');
    Cookies.remove('userId');
    Cookies.remove('onboardingCompleted');
    
    // Clear store
    setCurrentUser(null);
    setIsOnboardingComplete(false);
    
    // Redirect to login
    router.push('/auth/login');
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