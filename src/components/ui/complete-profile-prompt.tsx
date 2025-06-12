// src/components/ui/complete-profile-prompt.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import useRanchOSStore from '@/store';

export function CompleteProfilePrompt() {
  const router = useRouter();
  const { currentUser, isOnboardingComplete } = useRanchOSStore();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Mostrar solo si:
    // 1. Hay un usuario actual
    // 2. El usuario es temporal (ID empieza con 'demo-')
    // 3. No ha completado el registro real
    // 4. No lo ha cerrado en esta sesión
    const isTemporaryUser = currentUser?.id?.startsWith('demo-');
    const shouldShow = currentUser && isTemporaryUser && !isOnboardingComplete && !isDismissed;
    
    if (shouldShow) {
      // Mostrar después de 2 segundos
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
    
    // Return vacío para los casos donde no se muestra
    return undefined;
  }, [currentUser, isOnboardingComplete, isDismissed]);

  const handleComplete = () => {
    router.push('/auth/register');
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    setIsVisible(false);
  };

  const handleLater = () => {
    setIsDismissed(true);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 100, scale: 0.8 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed bottom-8 right-8 z-50 max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          {/* Header con gradiente */}
          <div className="bg-gradient-to-r from-blue-600 to-green-600 p-1">
            <div className="bg-white rounded-t-xl px-6 py-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      ¡Completa tu perfil! ✨
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Desbloquea funciones premium y personaliza tu experiencia en RanchOS
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleDismiss}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Contenido */}
          <div className="px-6 py-4 space-y-4">
            {/* Beneficios */}
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Reportes personalizados</p>
                  <p className="text-xs text-gray-600">Análisis avanzados de tu ganado</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Notificaciones inteligentes</p>
                  <p className="text-xs text-gray-600">Alertas de salud y producción</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Acceso a la comunidad</p>
                  <p className="text-xs text-gray-600">Conecta con otros ganaderos</p>
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleComplete}
                className="flex-1 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white"
              >
                Completar ahora
              </Button>
              <Button
                onClick={handleLater}
                variant="outline"
                className="flex-1"
              >
                Más tarde
              </Button>
            </div>

            {/* Progreso */}
            <div className="pt-2">
              <p className="text-xs text-gray-500 text-center">
                Solo toma 2 minutos ⏱️
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}