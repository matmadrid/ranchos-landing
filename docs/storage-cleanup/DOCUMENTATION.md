# 🧹 Sistema de Limpieza de Storage - RanchOS

## 📋 Tabla de Contenidos

1. [Introducción](#introducción)
2. [Arquitectura](#arquitectura)
3. [Instalación](#instalación)
4. [Uso Básico](#uso-básico)
5. [Componentes](#componentes)
6. [Hooks](#hooks)
7. [Servicios](#servicios)
8. [Integración con Auth](#integración-con-auth)
9. [Panel de Debug](#panel-de-debug)
10. [API Reference](#api-reference)
11. [Mejores Prácticas](#mejores-prácticas)
12. [Troubleshooting](#troubleshooting)

## 🎯 Introducción

El Sistema de Limpieza de Storage es una solución enterprise para gestionar y limpiar datos del localStorage en RanchOS. Diseñado específicamente para manejar datos demo, expirados y huérfanos de forma segura y eficiente.

### Características Principales

- ✅ **Limpieza Selectiva**: Elimina solo datos demo sin afectar datos reales
- ✅ **Integración con Auth**: Limpieza automática en login/logout
- ✅ **Panel de Debug**: Herramientas visuales para monitoreo
- ✅ **Detección Automática**: Identifica datos demo proactivamente
- ✅ **Type-Safe**: Totalmente tipado con TypeScript
- ✅ **Notificaciones**: Feedback visual de operaciones

## 🏗️ Arquitectura

```
src/
├── constants/
│   └── storageKeys.ts          # Mapa centralizado de claves
├── services/
│   └── storage/
│       ├── StorageManager.ts   # Gestor central del storage
│       └── CleanupService.ts   # Servicio de limpieza
├── hooks/
│   ├── useStorageCleanup.ts    # Hook principal
│   └── useDemoDetection.ts     # Hook de detección
└── components/
    └── debug/
        ├── StorageDebugPanel.tsx    # Panel completo
        ├── StorageQuickActions.tsx  # Acciones rápidas
        ├── DemoDataAlert.tsx        # Alerta automática
        └── index.ts                 # Exportaciones
```

## 🚀 Instalación

### 1. Verificar Dependencias

El sistema usa las siguientes dependencias que ya deberían estar en tu proyecto:

```json
{
  "dependencies": {
    "react": "^18.0.0",
    "zustand": "^4.0.0",
    "lucide-react": "^0.0.0",
    "@/components/ui/*": "shadcn/ui"
  }
}
```

### 2. Crear los Archivos

```bash
# Crear estructura de carpetas
mkdir -p src/constants
mkdir -p src/services/storage
mkdir -p src/hooks
mkdir -p src/components/debug

# Los archivos ya deberían estar creados siguiendo los pasos anteriores
```

## 💡 Uso Básico

### Hook Principal - useStorageCleanup

```typescript
import { useStorageCleanup } from '@/hooks/useStorageCleanup';

function MyComponent() {
  const {
    cleanDemoData,
    cleanOnLogout,
    cleanExpiredData,
    cleanOrphanedData,
    cleanAll,
    isLoading,
    stats,
    error
  } = useStorageCleanup({
    showNotifications: true,
    confirmBeforeClean: true
  });

  // Limpiar datos demo
  const handleCleanDemo = async () => {
    const result = await cleanDemoData();
    if (result?.success) {
      console.log(`Limpiados ${result.itemsCleaned} elementos`);
    }
  };

  return (
    <button onClick={handleCleanDemo} disabled={isLoading}>
      Limpiar Datos Demo
    </button>
  );
}
```

### Detección Automática

```typescript
import { useDemoDetection } from '@/hooks/useDemoDetection';

function DetectionExample() {
  const {
    hasDemoData,
    demoCount,
    isTemporaryUser,
    shouldShowPrompt,
    refresh
  } = useDemoDetection();

  if (!hasDemoData) {
    return <p>No hay datos demo</p>;
  }

  return (
    <div>
      <p>Datos demo detectados:</p>
      <ul>
        <li>Ranchos: {demoCount.ranches}</li>
        <li>Animales: {demoCount.animals}</li>
        <li>Movimientos: {demoCount.movements}</li>
      </ul>
      <button onClick={refresh}>Actualizar</button>
    </div>
  );
}
```

## 🧩 Componentes

### StorageDebugPanel

Panel completo de debug con 4 pestañas. Solo visible en desarrollo.

```tsx
import { StorageDebugPanel } from '@/components/debug';

// En tu layout o página principal
<StorageDebugPanel />
```

**Características:**
- Vista general con estadísticas
- Botones de limpieza con confirmación
- Explorador de claves localStorage
- Historial de operaciones

### StorageQuickActions

Componente simplificado para acciones rápidas.

```tsx
import { StorageQuickActions } from '@/components/debug';

<StorageQuickActions 
  showTitle={true}
  variant="card"      // 'card' | 'inline'
  className="max-w-md"
/>
```

### DemoDataAlert

Alerta automática cuando se detectan datos demo.

```tsx
import { DemoDataAlert } from '@/components/debug';

<DemoDataAlert 
  position="bottom"       // 'top' | 'bottom'
  autoHideAfter={30000}  // ms o undefined
  showOnlyOnce={true}    // recordar dismissal
/>
```

## 🪝 Hooks

### useStorageCleanup

Hook principal para operaciones de limpieza.

```typescript
interface UseStorageCleanupOptions {
  showNotifications?: boolean;    // Mostrar toasts (default: true)
  confirmBeforeClean?: boolean;   // Confirmar acciones (default: false)
  onSuccess?: (result: any) => void;
  onError?: (error: Error) => void;
}

const {
  // Estado
  isLoading: boolean;
  error: Error | null;
  lastCleanup: Date | null;
  stats: {
    itemsCleaned: number;
    spaceSaved: number;
  };
  
  // Funciones
  cleanDemoData: (options?: CleanupOptions) => Promise<CleanupResult>;
  cleanOnLogout: (preserveUserData?: boolean) => Promise<CleanupResult>;
  cleanExpiredData: () => Promise<CleanupResult>;
  cleanOrphanedData: () => Promise<CleanupResult>;
  cleanAll: () => Promise<CleanupResult[]>;
  
  // Utilidades
  getCleanupStats: () => CleanupStats;
  getCleanupHistory: () => CleanupResult[];
  resetState: () => void;
} = useStorageCleanup(options);
```

### useDemoDetection

Hook para detectar automáticamente datos demo.

```typescript
const {
  hasDemoData: boolean;
  demoCount: {
    ranches: number;
    animals: number;
    movements: number;
    total: number;
  };
  isTemporaryUser: boolean;
  shouldShowPrompt: boolean;
  refresh: () => void;
} = useDemoDetection();
```

## 🔧 Servicios

### StorageManager

Servicio singleton para gestión centralizada del localStorage.

```typescript
import { storageManager } from '@/services/storage/StorageManager';

// Obtener valor
const value = storageManager.get<MyType>('myKey', defaultValue);

// Establecer valor
storageManager.set('myKey', value, {
  encrypt: false,
  compress: false,
  metadata: true
});

// Eliminar clave
storageManager.remove('myKey');

// Obtener todas las claves
const keys = storageManager.getAllKeys();

// Suscribirse a cambios
const unsubscribe = storageManager.subscribe('myKey', (newValue) => {
  console.log('Valor cambió:', newValue);
});

// Exportar/Importar
const backup = storageManager.export();
storageManager.import(backup, { merge: true });
```

### CleanupService

Servicio especializado en limpieza de datos.

```typescript
import { cleanupService } from '@/services/storage/CleanupService';

// Limpieza con opciones
const result = await cleanupService.cleanDemoData({
  dryRun: false,           // Simular sin ejecutar
  preserveUserData: true,  // Mantener datos de usuario
  preserveKeys: ['key1'],  // Claves a preservar
  verbose: true,           // Log detallado
  beforeClean: (key, value) => { // Callback de confirmación
    return confirm(`¿Eliminar ${key}?`);
  }
});

// Resultado
console.log({
  itemsCleaned: result.itemsCleaned,
  spaceSaved: result.spaceSaved,
  errors: result.errors,
  details: result.details
});
```

## 🔐 Integración con Auth

El sistema está integrado automáticamente con el flujo de autenticación:

### En Login/Registro

```typescript
// src/store/slices/auth.slice.ts
setCurrentUser: async (user) => {
  // Si es usuario real, limpia datos demo automáticamente
  if (user && !user.id.startsWith('demo-')) {
    await cleanupService.cleanDemoData({
      dryRun: false,
      verbose: false
    });
  }
  // ... resto del código
}
```

### En Logout

```typescript
logout: async () => {
  const wasTemporary = get().isTemporaryUser();
  
  if (wasTemporary) {
    // Usuario demo: limpieza completa
    await cleanupService.cleanDemoData();
  } else {
    // Usuario real: limpieza selectiva
    await cleanupService.cleanOnLogout({
      preserveKeys: ['preferredCountry', 'rememberedEmail']
    });
  }
  // ... resto del código
}
```

## 🛠️ Panel de Debug

### Acceso

En desarrollo, aparecerá un botón flotante en la esquina inferior derecha.

### Pestañas

1. **Vista General**
   - Estadísticas de uso
   - Distribución por tipo
   - Barra de uso del storage

2. **Limpieza**
   - Botones para cada tipo de limpieza
   - Confirmación antes de ejecutar
   - Feedback visual

3. **Claves**
   - Lista de todas las claves
   - Valores en JSON
   - Eliminación individual

4. **Historial**
   - Log de operaciones
   - Estadísticas globales
   - Tiempo transcurrido

## 📚 API Reference

### Tipos Principales

```typescript
// Tipos de limpieza
enum CleanupType {
  DEMO_DATA = 'demo-data',
  EXPIRED_DATA = 'expired-data',
  USER_LOGOUT = 'user-logout',
  ORPHANED_DATA = 'orphaned-data',
  CACHE_DATA = 'cache-data',
  ALL = 'all'
}

// Resultado de limpieza
interface CleanupResult {
  type: CleanupType;
  timestamp: number;
  itemsCleaned: number;
  itemsPreserved: number;
  spaceSaved: number;
  errors: string[];
  details: {
    cleaned: string[];
    preserved: string[];
    failed: Array<{ key: string; error: string }>;
  };
}

// Opciones de limpieza
interface CleanupOptions {
  dryRun?: boolean;
  preserveUserData?: boolean;
  preserveKeys?: string[];
  verbose?: boolean;
  beforeClean?: (key: string, value: any) => boolean;
}
```

### Constantes de Storage

```typescript
import { STORAGE_KEYS } from '@/constants/storageKeys';

// Claves principales
STORAGE_KEYS.STORE.MAIN           // 'ranchos-store-v3'
STORAGE_KEYS.AUTH.REMEMBERED_EMAIL // 'rememberedEmail'
STORAGE_KEYS.AUTH.IS_TEMPORARY_USER // 'isTemporaryUser'
STORAGE_KEYS.INVENTORY.INITIALIZED_PREFIX // 'inventory-initialized-'
```

## 🎯 Mejores Prácticas

### 1. Siempre Usar el StorageManager

```typescript
// ❌ MAL
localStorage.setItem('myKey', JSON.stringify(data));

// ✅ BIEN
storageManager.set('myKey', data);
```

### 2. Manejar Errores

```typescript
try {
  const result = await cleanDemoData();
  if (!result.success) {
    console.error('Limpieza falló:', result.errors);
  }
} catch (error) {
  console.error('Error inesperado:', error);
}
```

### 3. Usar Tipos Correctos

```typescript
// Definir tipos para tus datos
interface MyData {
  id: string;
  value: number;
}

// Usar genéricos
const data = storageManager.get<MyData>('myKey');
```

### 4. Limpieza Proactiva

```typescript
// En componentes que crean datos temporales
useEffect(() => {
  return () => {
    // Limpiar al desmontar
    storageManager.remove('temp-data');
  };
}, []);
```

### 5. Monitoreo en Producción

```typescript
// Solo mostrar debug en desarrollo
if (process.env.NODE_ENV === 'development') {
  return <StorageDebugPanel />;
}
```

## 🔍 Troubleshooting

### Problema: Los datos demo no se limpian

**Solución:**
1. Verificar que el ID comience con 'demo-'
2. Revisar en el panel de debug qué claves existen
3. Usar `cleanAll()` como último recurso

### Problema: Error "localStorage is not defined"

**Solución:**
```typescript
// Verificar que estás en el cliente
if (typeof window !== 'undefined') {
  // Usar storage
}
```

### Problema: Datos importantes se eliminaron

**Solución:**
1. Usar `preserveKeys` en las opciones
2. Implementar backup antes de limpiar:
```typescript
const backup = storageManager.export();
// Guardar backup antes de limpiar
```

### Problema: Las notificaciones no aparecen

**Solución:**
1. Verificar que `showNotifications: true`
2. Verificar que los hooks de toast estén configurados
3. Revisar la consola para errores

## 📈 Métricas y Monitoreo

### Obtener Estadísticas

```typescript
const stats = cleanupService.getStats();
console.log({
  totalCleaned: stats.totalCleaned,
  totalSpaceSaved: stats.totalSpaceSaved,
  lastCleanup: stats.lastCleanup,
  cleanupsByType: stats.cleanupsByType
});
```

### Monitorear Uso del Storage

```typescript
const { used, total, percentage } = storageManager.getStorageSize();
if (percentage > 80) {
  console.warn('Storage casi lleno:', percentage + '%');
}
```

## 🚀 Próximos Pasos

1. **Tests**: Implementar tests unitarios
2. **Métricas**: Agregar analytics de uso
3. **Optimización**: Compresión de datos grandes
4. **Migración**: Sistema de versiones para el storage

---

*Desarrollado por TorresLaveaga para RanchOS*
*Versión 1.0.0 - Sistema Dinámico Universal*