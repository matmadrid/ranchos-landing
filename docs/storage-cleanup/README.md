# Sistema de Limpieza de Storage 🧹

> Sistema profesional de gestión y limpieza de localStorage para RanchOS

[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18+-61dafb)](https://reactjs.org/)
[![Status](https://img.shields.io/badge/Status-Production_Ready-green)]()

## 🌟 Características

- 🎯 **Limpieza Inteligente** - Identifica y elimina solo datos demo
- 🔐 **Integración con Auth** - Limpieza automática en login/logout
- 📊 **Panel de Debug** - Herramientas visuales de monitoreo
- 🚨 **Alertas Automáticas** - Notifica sobre datos demo presentes
- 💾 **Gestión de Storage** - Control total sobre localStorage
- 🔄 **Hooks Reactivos** - Integración seamless con React

## 📦 Componentes del Sistema

```
🧹 Sistema de Limpieza
├── 📁 Servicios Core
│   ├── StorageManager     # Gestión centralizada
│   └── CleanupService     # Lógica de limpieza
├── 🪝 Hooks
│   ├── useStorageCleanup  # Hook principal
│   └── useDemoDetection   # Detección automática
└── 🎨 Componentes UI
    ├── StorageDebugPanel  # Panel completo
    ├── StorageQuickActions # Acciones rápidas
    └── DemoDataAlert      # Alertas automáticas
```

## 🚀 Quick Start

### 1. Uso Básico

```tsx
import { useStorageCleanup } from '@/hooks/useStorageCleanup';

function MyComponent() {
  const { cleanDemoData, isLoading } = useStorageCleanup();

  return (
    <button onClick={() => cleanDemoData()} disabled={isLoading}>
      Limpiar Datos Demo
    </button>
  );
}
```

### 2. Detección Automática

```tsx
import { DemoDataAlert } from '@/components/debug';

// En tu layout principal
<DemoDataAlert position="bottom" autoHideAfter={30000} />
```

### 3. Panel de Debug

```tsx
import { StorageDebugPanel } from '@/components/debug';

// Solo en desarrollo
{process.env.NODE_ENV === 'development' && <StorageDebugPanel />}
```

## 📖 Documentación

- [📚 Documentación Completa](./STORAGE-CLEANUP-DOCS.md)
- [🚀 Guía Rápida](./STORAGE-CLEANUP-QUICKSTART.md)
- [🔧 API Reference](./STORAGE-CLEANUP-API.md)

## 🛠️ Instalación

### Prerequisitos

- React 18+
- TypeScript 4.5+
- Zustand 4+
- shadcn/ui components

### Archivos Requeridos

```bash
src/
├── constants/storageKeys.ts
├── services/storage/
│   ├── StorageManager.ts
│   └── CleanupService.ts
├── hooks/
│   ├── useStorageCleanup.ts
│   └── useDemoDetection.ts
└── components/debug/
    ├── StorageDebugPanel.tsx
    ├── StorageQuickActions.tsx
    ├── DemoDataAlert.tsx
    └── index.ts
```

## 🔧 Configuración

### En el Store de Auth

```typescript
// src/store/slices/auth.slice.ts
import { cleanupService } from '@/services/storage/CleanupService';

// En setCurrentUser y logout
```

### En el Dashboard

```tsx
// src/app/dashboard/page.tsx
import { StorageDebugPanel, DemoDataAlert } from '@/components/debug';

return (
  <div>
    <DemoDataAlert position="bottom" />
    <StorageDebugPanel />
    {/* ... */}
  </div>
);
```

## 🎯 Casos de Uso

### Limpieza Manual

```typescript
const { cleanDemoData } = useStorageCleanup({
  confirmBeforeClean: true,
  showNotifications: true
});

await cleanDemoData();
```

### Limpieza en Logout

```typescript
const { cleanOnLogout } = useStorageCleanup();

// Preservar datos importantes
await cleanOnLogout({
  preserveKeys: ['theme', 'language']
});
```

### Verificación de Datos Demo

```typescript
const { hasDemoData, demoCount } = useDemoDetection();

if (hasDemoData) {
  console.log(`Encontrados ${demoCount.total} elementos demo`);
}
```

## 📊 Panel de Debug

El panel incluye 4 pestañas:

1. **Vista General** - Estadísticas y uso
2. **Limpieza** - Acciones de limpieza
3. **Claves** - Explorador de localStorage
4. **Historial** - Log de operaciones

![Panel de Debug](./docs/debug-panel.png)

## 🔍 API Reference

### useStorageCleanup

```typescript
const {
  // Funciones
  cleanDemoData,      // Limpia datos demo
  cleanOnLogout,      // Limpia al cerrar sesión
  cleanExpiredData,   // Limpia expirados
  cleanOrphanedData,  // Limpia huérfanos
  cleanAll,           // Limpieza completa
  
  // Estado
  isLoading,          // Operación en progreso
  error,              // Error si existe
  stats,              // Estadísticas
  lastCleanup,        // Última limpieza
} = useStorageCleanup(options);
```

### useDemoDetection

```typescript
const {
  hasDemoData,        // Hay datos demo
  demoCount,          // Conteo por tipo
  isTemporaryUser,    // Usuario es demo
  shouldShowPrompt,   // Mostrar alerta
  refresh,            // Actualizar detección
} = useDemoDetection();
```

## 🧪 Testing

```bash
# Verificar compilación
npm run type-check

# Verificar en navegador
localStorage.length // Ver cantidad de claves
```

## 🚨 Troubleshooting

### Los datos demo no se limpian
- Verificar que los IDs comiencen con 'demo-'
- Usar el panel de debug para inspeccionar

### Error "localStorage is not defined"
- Verificar que el código se ejecute en cliente
- Usar `typeof window !== 'undefined'`

### Datos importantes eliminados
- Usar `preserveKeys` en las opciones
- Implementar backup antes de limpiar

## 📈 Roadmap

- [ ] Tests unitarios con Jest
- [ ] Compresión de datos grandes
- [ ] Sistema de migraciones
- [ ] Analytics de uso
- [ ] Exportación de reportes

## 🤝 Contribuir

1. Fork el proyecto
2. Crear feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto es parte de RanchOS y está bajo la licencia del proyecto principal.

## 👥 Créditos

- **Autor**: TorresLaveaga
- **Framework**: RanchOS - Sistemas Dinámicos Universales
- **Versión**: 1.0.0

---

<p align="center">
  Hecho con ❤️ para RanchOS
</p>