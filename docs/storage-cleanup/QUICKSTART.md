# 🚀 Guía Rápida - Sistema de Limpieza de Storage

## 📌 Casos de Uso Comunes

### 1. Agregar Limpieza Automática en una Página

```tsx
// src/app/mi-pagina/page.tsx
import { DemoDataAlert, StorageDebugPanel } from '@/components/debug';

export default function MiPagina() {
  return (
    <div>
      {/* Alerta automática si hay datos demo */}
      <DemoDataAlert position="bottom" />
      
      {/* Panel de debug (solo desarrollo) */}
      <StorageDebugPanel />
      
      {/* Tu contenido */}
      <h1>Mi Página</h1>
    </div>
  );
}
```

### 2. Botón de Limpieza Manual

```tsx
import { useStorageCleanup } from '@/hooks/useStorageCleanup';
import { Button } from '@/components/ui/button';

function LimpiezaManual() {
  const { cleanDemoData, isLoading, stats } = useStorageCleanup();

  return (
    <div>
      <Button 
        onClick={() => cleanDemoData()}
        disabled={isLoading}
      >
        Limpiar {stats.itemsCleaned > 0 && `(${stats.itemsCleaned} limpiados)`}
      </Button>
    </div>
  );
}
```

### 3. Verificar Antes de Mostrar Contenido

```tsx
import { useDemoDetection } from '@/hooks/useDemoDetection';

function ContenidoCondicional() {
  const { hasDemoData, isTemporaryUser } = useDemoDetection();

  if (isTemporaryUser) {
    return <p>Modo demo - Funcionalidad limitada</p>;
  }

  if (hasDemoData) {
    return <p>Tienes datos demo mezclados con tus datos reales</p>;
  }

  return <p>Todos tus datos son reales</p>;
}
```

### 4. Limpieza en Formularios

```tsx
import { useStorageCleanup } from '@/hooks/useStorageCleanup';

function FormularioConLimpieza() {
  const { cleanDemoData } = useStorageCleanup({ 
    confirmBeforeClean: false 
  });

  const handleSubmit = async (data) => {
    // Limpiar datos demo antes de guardar nuevos datos
    await cleanDemoData();
    
    // Guardar nuevos datos
    await saveData(data);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* campos del formulario */}
    </form>
  );
}
```

### 5. Panel de Administración

```tsx
import { StorageQuickActions } from '@/components/debug';

function AdminPanel() {
  return (
    <div className="grid gap-6">
      <h2>Administración</h2>
      
      {/* Acciones rápidas de storage */}
      <StorageQuickActions 
        showTitle={true}
        variant="card"
      />
      
      {/* Otras opciones de admin */}
    </div>
  );
}
```

## 🛠️ Snippets Útiles

### Limpiar con Confirmación Personalizada

```typescript
const { cleanDemoData } = useStorageCleanup({
  confirmBeforeClean: false,
  onSuccess: (result) => {
    console.log('Limpieza exitosa:', result);
  },
  onError: (error) => {
    console.error('Error en limpieza:', error);
  }
});

// Confirmación personalizada
const handleClean = async () => {
  const confirmed = await myCustomConfirm('¿Estás seguro?');
  if (confirmed) {
    await cleanDemoData();
  }
};
```

### Verificar Storage Antes de Operaciones

```typescript
import { storageManager } from '@/services/storage/StorageManager';

function checkStorageHealth() {
  const { percentage } = storageManager.getStorageSize();
  
  if (percentage > 90) {
    // Storage casi lleno, limpiar automáticamente
    cleanupService.cleanExpiredData();
  }
}
```

### Hook Personalizado para Auto-Limpieza

```typescript
// src/hooks/useAutoCleanup.ts
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useStorageCleanup } from '@/hooks/useStorageCleanup';
import { useDemoDetection } from '@/hooks/useDemoDetection';

export function useAutoCleanup() {
  const { isAuthenticated, user } = useAuth();
  const { hasDemoData } = useDemoDetection();
  const { cleanDemoData } = useStorageCleanup({ 
    showNotifications: false 
  });

  useEffect(() => {
    // Auto-limpiar cuando un usuario real se autentica
    if (isAuthenticated && !user?.id?.startsWith('demo-') && hasDemoData) {
      cleanDemoData();
    }
  }, [isAuthenticated, user, hasDemoData]);
}
```

### Componente con Estado de Limpieza

```tsx
function StorageStatus() {
  const { stats, lastCleanup, isLoading } = useStorageCleanup();
  const { used, total, percentage } = storageManager.getStorageSize();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estado del Storage</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p>Uso: {percentage.toFixed(1)}%</p>
          <p>Espacio: {formatBytes(used)} / {formatBytes(total)}</p>
          {lastCleanup && (
            <p>Última limpieza: {formatDate(lastCleanup)}</p>
          )}
          {stats.itemsCleaned > 0 && (
            <p>Total limpiado: {stats.itemsCleaned} items</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

## 🎯 Checklist de Implementación

- [ ] Instalar archivos del sistema
- [ ] Agregar imports en `auth.slice.ts`
- [ ] Actualizar `useAuth.ts`
- [ ] Agregar componentes al dashboard
- [ ] Verificar compilación sin errores
- [ ] Probar limpieza de datos demo
- [ ] Verificar limpieza en logout
- [ ] Configurar alertas automáticas

## 🔍 Comandos de Verificación

```bash
# Verificar que todos los archivos existen
find src -name "*storage*" -o -name "*Storage*" -o -name "*cleanup*" -o -name "*Cleanup*" | sort

# Verificar imports
grep -r "cleanupService\|StorageManager\|useStorageCleanup" src/

# Verificar que compila
npx tsc --noEmit

# Ver tamaño del storage (en consola del navegador)
localStorage.length
```

## 💡 Tips Pro

1. **Desarrollo vs Producción**
   ```typescript
   // Solo mostrar herramientas de debug en desarrollo
   {process.env.NODE_ENV === 'development' && <StorageDebugPanel />}
   ```

2. **Preservar Datos Importantes**
   ```typescript
   cleanOnLogout({
     preserveKeys: ['theme', 'language', 'preferences']
   });
   ```

3. **Limpieza Programada**
   ```typescript
   // Limpiar automáticamente cada 24 horas
   useEffect(() => {
     const interval = setInterval(() => {
       cleanExpiredData();
     }, 24 * 60 * 60 * 1000);
     
     return () => clearInterval(interval);
   }, []);
   ```

4. **Migración de Datos**
   ```typescript
   // Antes de limpiar, migrar datos importantes
   const backup = storageManager.export();
   const importantData = extractImportantData(backup);
   await cleanAll();
   restoreImportantData(importantData);
   ```

---

*Sistema de Limpieza v1.0.0 - RanchOS*