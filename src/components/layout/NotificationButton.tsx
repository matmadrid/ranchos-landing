// src/components/layout/NotificationButton.tsx
'use client';

import { useState, useEffect } from 'react';
import { NotificationBadge, NotificationCenter } from '@/components/notifications';
import { useNotifications } from '@/hooks/useNotifications';
import { useAlerts } from '@/hooks/useAlerts';

export function NotificationButton() {
  const [isOpen, setIsOpen] = useState(false);
  const { unreadCount, processAlerts } = useNotifications();
  const { checkAutoAlerts } = useAlerts();

  // Inicializar y procesar alertas cuando el componente se monta
  useEffect(() => {
    // Procesar alertas iniciales
    checkAutoAlerts();
    processAlerts();
    
    // Configurar intervalo para verificar alertas automáticamente
    const interval = setInterval(() => {
      checkAutoAlerts();
    }, 5 * 60 * 1000); // Cada 5 minutos

    return () => clearInterval(interval);
  }, [checkAutoAlerts, processAlerts]);

  return (
    <>
      <NotificationBadge
        count={unreadCount}
        onClick={() => setIsOpen(true)}
        variant="minimal"
        size="md"
      />
      
      <NotificationCenter
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}

// src/components/layout/NotificationIntegration.tsx - CONTENIDO ADICIONAL
'use client';

import { ReactNode } from 'react';
import { NotificationProvider } from '@/components/notifications';

interface NotificationIntegrationProps {
  children: ReactNode;
}

export function NotificationIntegration({ children }: NotificationIntegrationProps) {
  return (
    <NotificationProvider>
      {children}
    </NotificationProvider>
  );
}

// Hook para usar en otros componentes
export function useNotificationIntegration() {
  return {
    NotificationButton
  };
}