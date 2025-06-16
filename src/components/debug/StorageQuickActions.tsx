/**
 * StorageQuickActions Component
 * Acciones rápidas para gestión de storage
 */

import React, { useState } from 'react';
import { 
  Trash2, 
  Download, 
  Upload, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  XCircle 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useStorageCleanup } from '@/hooks/useStorageCleanup';
import { storageManager } from '@/services/storage/StorageManager';
import { cleanupService } from '@/services/storage/CleanupService';
import { toast } from 'sonner';

export interface StorageQuickActionsProps {
  variant?: 'card' | 'inline';
  onActionComplete?: () => void;
  className?: string;
  showTitle?: boolean;
}

interface ActionResult {
  success: boolean;
  message: string;
  details?: any;
}

export function StorageQuickActions({ 
  showTitle = true, 
  variant = 'card',
  className = ''
}: StorageQuickActionsProps) {
  const {
    cleanDemoData,
    cleanOnLogout,
    isLoading,
    stats,
    lastCleanup
  } = useStorageCleanup({
    showNotifications: true,
    confirmBeforeClean: true
  });

  const content = (
    <div className="space-y-4">
      {/* Estadísticas rápidas */}
      {stats.itemsCleaned > 0 && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Última limpieza: {stats.itemsCleaned} elementos eliminados
            {lastCleanup && ` hace ${getTimeSince(lastCleanup)}`}
          </AlertDescription>
        </Alert>
      )}

      {/* Botones de acción */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={() => cleanDemoData()}
          disabled={isLoading}
          variant="outline"
          className="flex-1"
        >
          {isLoading ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4 mr-2" />
          )}
          Limpiar Datos Demo
        </Button>

        <Button
          onClick={() => cleanOnLogout(true)}
          disabled={isLoading}
          variant="outline"
          className="flex-1"
        >
          <AlertCircle className="w-4 h-4 mr-2" />
          Limpiar Cache
        </Button>
      </div>

      {/* Advertencia */}
      <p className="text-sm text-gray-500 text-center">
        Estas acciones son irreversibles. Los datos eliminados no se pueden recuperar.
      </p>
    </div>
  );

  if (variant === 'inline') {
    return <div className={className}>{content}</div>;
  }

  return (
    <Card className={className}>
      {showTitle && (
        <CardHeader>
          <CardTitle className="text-lg">Gestión de Storage</CardTitle>
        </CardHeader>
      )}
      <CardContent>{content}</CardContent>
    </Card>
  );
}

// Función auxiliar para calcular tiempo transcurrido
function getTimeSince(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return `${seconds} segundos`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minutos`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} horas`;
  const days = Math.floor(hours / 24);
  return `${days} días`;
}