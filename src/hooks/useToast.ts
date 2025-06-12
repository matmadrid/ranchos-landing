// src/hooks/useToast.tsx
'use client';

import { toast } from 'sonner';
import { CheckCircle2, XCircle, AlertCircle, Info } from 'lucide-react';

interface ToastOptions {
  duration?: number;
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
}

/**
 * Hook personalizado para mostrar notificaciones toast
 * Usa Sonner para notificaciones modernas y personalizables
 */
export function useToast() {
  const success = (title: string, description?: string, options?: ToastOptions) => {
    toast.success(
      <div className="flex items-start space-x-3">
        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
        <div>
          <p className="font-semibold text-gray-900">{title}</p>
          {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
        </div>
      </div>,
      {
        duration: options?.duration || 4000,
        position: options?.position || 'bottom-right',
        className: 'bg-white border-green-200',
      }
    );
  };

  const error = (title: string, description?: string, options?: ToastOptions) => {
    toast.error(
      <div className="flex items-start space-x-3">
        <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
        <div>
          <p className="font-semibold text-gray-900">{title}</p>
          {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
        </div>
      </div>,
      {
        duration: options?.duration || 5000,
        position: options?.position || 'bottom-right',
        className: 'bg-white border-red-200',
      }
    );
  };

  const warning = (title: string, description?: string, options?: ToastOptions) => {
    toast(
      <div className="flex items-start space-x-3">
        <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
        <div>
          <p className="font-semibold text-gray-900">{title}</p>
          {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
        </div>
      </div>,
      {
        duration: options?.duration || 4000,
        position: options?.position || 'bottom-right',
        className: 'bg-white border-amber-200',
      }
    );
  };

  const info = (title: string, description?: string, options?: ToastOptions) => {
    toast(
      <div className="flex items-start space-x-3">
        <Info className="h-5 w-5 text-blue-600 mt-0.5" />
        <div>
          <p className="font-semibold text-gray-900">{title}</p>
          {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
        </div>
      </div>,
      {
        duration: options?.duration || 4000,
        position: options?.position || 'bottom-right',
        className: 'bg-white border-blue-200',
      }
    );
  };

  const loading = (title: string, description?: string) => {
    return toast.loading(
      <div>
        <p className="font-semibold text-gray-900">{title}</p>
        {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
      </div>,
      {
        position: 'bottom-right',
      }
    );
  };

  const dismiss = (toastId?: string | number) => {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  };

  const promise = <T,>(
    promise: Promise<T>,
    msgs: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ) => {
    return toast.promise(promise, msgs);
  };

  return {
    success,
    error,
    warning,
    info,
    loading,
    dismiss,
    promise,
    toast: toast.custom, // Para toasts personalizados
  };
}
