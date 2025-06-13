// src/hooks/useToast.tsx
'use client';

import { toast, Toaster } from 'sonner';
import { CheckCircle2, XCircle, AlertCircle, Info, Loader2 } from 'lucide-react';

// Constantes para configuración por defecto
const DEFAULT_DURATIONS = {
  success: 4000,
  error: 6000,
  warning: 5000,
  info: 4000,
  loading: Infinity,
} as const;

const DEFAULT_POSITION = 'bottom-right' as const;

interface ToastOptions {
  duration?: number;
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  dismissible?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Exportar el componente Toaster para usar en el layout
export { Toaster };

/**
 * Hook personalizado para mostrar notificaciones toast
 * Usa Sonner para notificaciones modernas y personalizables
 * 
 * @example
 * const { success, error, warning, info, loading, promise } = useToast();
 * 
 * // Uso básico
 * success('Operación exitosa');
 * 
 * // Con descripción
 * error('Error al guardar', 'Verifica tu conexión a internet');
 * 
 * // Con opciones personalizadas
 * warning('Advertencia', 'El archivo es muy grande', {
 *   duration: 8000,
 *   action: {
 *     label: 'Comprimir',
 *     onClick: () => compressFile()
 *   }
 * });
 * 
 * // Con promesas
 * await promise(saveData(), {
 *   loading: 'Guardando...',
 *   success: 'Guardado exitosamente',
 *   error: (err) => `Error: ${err.message}`
 * });
 */
export function useToast() {
  /**
   * Muestra un toast de éxito
   */
  const success = (title: string, description?: string, options?: ToastOptions) => {
    return toast.success(
      <div className="flex items-start space-x-3">
        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-gray-900">{title}</p>
          {description && (
            <p className="text-sm text-gray-600 mt-0.5">{description}</p>
          )}
        </div>
      </div>,
      {
        duration: options?.duration ?? DEFAULT_DURATIONS.success,
        position: options?.position ?? DEFAULT_POSITION,
        className: 'bg-white border-green-200',
        dismissible: options?.dismissible !== false,
        action: options?.action,
      }
    );
  };

  /**
   * Muestra un toast de error
   */
  const error = (title: string, description?: string, options?: ToastOptions) => {
    return toast.error(
      <div className="flex items-start space-x-3">
        <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-gray-900">{title}</p>
          {description && (
            <p className="text-sm text-gray-600 mt-0.5">{description}</p>
          )}
        </div>
      </div>,
      {
        duration: options?.duration ?? DEFAULT_DURATIONS.error,
        position: options?.position ?? DEFAULT_POSITION,
        className: 'bg-white border-red-200',
        dismissible: options?.dismissible !== false,
        action: options?.action,
      }
    );
  };

  /**
   * Muestra un toast de advertencia
   */
  const warning = (title: string, description?: string, options?: ToastOptions) => {
    return toast.warning(
      <div className="flex items-start space-x-3">
        <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-gray-900">{title}</p>
          {description && (
            <p className="text-sm text-gray-600 mt-0.5">{description}</p>
          )}
        </div>
      </div>,
      {
        duration: options?.duration ?? DEFAULT_DURATIONS.warning,
        position: options?.position ?? DEFAULT_POSITION,
        className: 'bg-white border-amber-200',
        dismissible: options?.dismissible !== false,
        action: options?.action,
      }
    );
  };

  /**
   * Muestra un toast informativo
   */
  const info = (title: string, description?: string, options?: ToastOptions) => {
    return toast.info(
      <div className="flex items-start space-x-3">
        <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-gray-900">{title}</p>
          {description && (
            <p className="text-sm text-gray-600 mt-0.5">{description}</p>
          )}
        </div>
      </div>,
      {
        duration: options?.duration ?? DEFAULT_DURATIONS.info,
        position: options?.position ?? DEFAULT_POSITION,
        className: 'bg-white border-blue-200',
        dismissible: options?.dismissible !== false,
        action: options?.action,
      }
    );
  };

  /**
   * Muestra un toast de carga (no se auto-elimina)
   */
  const loading = (title: string, description?: string) => {
    return toast.loading(
      <div className="flex items-start space-x-3">
        <Loader2 className="h-5 w-5 text-gray-600 mt-0.5 animate-spin flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-gray-900">{title}</p>
          {description && (
            <p className="text-sm text-gray-600 mt-0.5">{description}</p>
          )}
        </div>
      </div>,
      {
        position: DEFAULT_POSITION,
      }
    );
  };

  /**
   * Elimina un toast específico o todos los toasts
   */
  const dismiss = (toastId?: string | number) => {
    if (toastId !== undefined) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  };

  /**
   * Maneja una promesa mostrando estados de carga, éxito y error
   */
  const promise = <T,>(
    promise: Promise<T>,
    msgs: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ) => {
    return toast.promise(promise, {
      loading: msgs.loading,
      success: msgs.success,
      error: (err) => {
        // Asegurar que siempre devolvemos un string
        if (typeof msgs.error === 'function') {
          try {
            return msgs.error(err);
          } catch {
            return 'Error al procesar la operación';
          }
        }
        return msgs.error;
      },
    });
  };

  return {
    success,
    error,
    warning,
    info,
    loading,
    dismiss,
    promise,
    // Exponer toast.custom para casos especiales
    custom: toast.custom,
  };
}

// Hook auxiliar para operaciones CRUD comunes
export function useCrudToast() {
  const { success, error } = useToast();
  
  return {
    created: (entity: string) => 
      success(`${entity} creado`, 'Se ha guardado correctamente'),
    
    updated: (entity: string) => 
      success(`${entity} actualizado`, 'Los cambios se han guardado'),
    
    deleted: (entity: string) => 
      success(`${entity} eliminado`, 'Se ha eliminado permanentemente'),
    
    failed: (action: string, reason?: string) => 
      error(`Error al ${action}`, reason || 'Por favor intenta de nuevo'),
  };
}