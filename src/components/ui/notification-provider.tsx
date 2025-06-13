// src/components/ui/notification-provider.tsx
'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useToast } from '@/hooks/useToast';
import { Toaster } from 'sonner';

interface NotificationContextType {
  success: (title: string, description?: string) => string | number;
  error: (title: string, description?: string) => string | number;
  warning: (title: string, description?: string) => string | number;
  info: (title: string, description?: string) => string | number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const { success, error, warning, info } = useToast();

  const contextValue: NotificationContextType = {
    success,
    error,
    warning,
    info
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <Toaster 
        position="top-right"
        richColors
        closeButton
        expand={false}
        duration={5000}
      />
    </NotificationContext.Provider>
  );
}

export function useNotificationContext() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
}
