// src/hooks/useToast.ts
'use client';

import { useState, useCallback } from 'react';

// Tipos que tu toast.tsx ya espera
export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
  duration?: number;
  action?: ToastAction;
  dismissible?: boolean;
  createdAt: number;
}

// Hook mínimo que resuelve tu error
export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Función para generar IDs únicos
  const generateId = useCallback(() => {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Agregar toast
  const addToast = useCallback((toast: Omit<Toast, 'id' | 'createdAt'>) => {
    const id = generateId();
    const newToast: Toast = {
      ...toast,
      id,
      createdAt: Date.now(),
      duration: toast.duration ?? (toast.type === 'error' ? 6000 : 4000),
      dismissible: toast.dismissible !== false,
    };

    setToasts(prev => [newToast, ...prev].slice(0, 5)); // Máximo 5 toasts
    return id;
  }, [generateId]);

  // Remover toast
  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  // Limpiar todos
  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Métodos de conveniencia (lo que tu login page necesita)
  const success = useCallback((title: string, description?: string) => {
    return addToast({ type: 'success', title, description });
  }, [addToast]);

  const error = useCallback((title: string, description?: string) => {
    return addToast({ type: 'error', title, description });
  }, [addToast]);

  const warning = useCallback((title: string, description?: string) => {
    return addToast({ type: 'warning', title, description });
  }, [addToast]);

  const info = useCallback((title: string, description?: string) => {
    return addToast({ type: 'info', title, description });
  }, [addToast]);

  return {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    success,  // ✅ Esto es lo que necesita tu login page
    error,    // ✅ Y esto también
    warning,
    info,
  };
}