'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, User, Gift, Sparkles, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface UserProfilePromptProps {
  onDismiss: () => void;
  onComplete: () => void;
}

export const UserProfilePrompt = ({ onDismiss, onComplete }: UserProfilePromptProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Mostrar después de un pequeño delay para mejor UX
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onDismiss, 300); // Esperar a que termine la animación
  };

  const handleComplete = () => {
    setIsVisible(false);
    setTimeout(onComplete, 300);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed bottom-4 right-4 p-5 bg-white shadow-xl rounded-xl border max-w-sm z-50"
        >
          {/* Header con gradiente */}
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-t-xl" />
          
          {/* Botón de cerrar */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
          
          {/* Ícono animado */}
          <motion.div
            initial={{ rotate: -10 }}
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-3"
          >
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full">
              <User className="h-6 w-6 text-blue-600" />
            </div>
          </motion.div>
          
          {/* Contenido */}
          <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
            ¡Completa tu perfil! 
            <Sparkles className="h-4 w-4 ml-1 text-yellow-500" />
          </h3>
          
          <p className="text-sm text-gray-600 mb-4">
            Desbloquea funciones premium y personaliza tu experiencia en RanchOS
          </p>
          
          {/* Beneficios */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center text-sm text-gray-600">
              <Gift className="h-4 w-4 mr-2 text-green-500" />
              <span>Reportes personalizados</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Gift className="h-4 w-4 mr-2 text-green-500" />
              <span>Notificaciones inteligentes</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Gift className="h-4 w-4 mr-2 text-green-500" />
              <span>Acceso a la comunidad</span>
            </div>
          </div>
          
          {/* Botones */}
          <div className="flex gap-2">
            <Button 
              size="sm" 
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              onClick={handleComplete}
            >
              Completar ahora
            </Button>
            <Button 
              size="sm" 
              variant="ghost"
              onClick={handleClose}
              className="flex-1"
            >
              Más tarde
            </Button>
          </div>
          
          {/* Indicador de tiempo */}
          <div className="flex items-center justify-center text-xs text-gray-400 mt-3">
            <Clock className="h-3 w-3 mr-1" />
            Solo toma 2 minutos
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};