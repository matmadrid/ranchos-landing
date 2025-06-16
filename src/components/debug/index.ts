// src/components/debug/index.ts
/**
 * @version 1.0.0
 * @author TorresLaveaga
 * @cosmovision SpaceRanch Sistemas Dinámicos Universales
 * 
 * Exportación centralizada de componentes de debug
 */

// Componentes principales
export { StorageDebugPanel } from './StorageDebugPanel';
export { StorageQuickActions } from './StorageQuickActions';
export { DemoDataAlert } from './DemoDataAlert';

// Hook de detección
export { useDemoDetection } from '@/hooks/useDemoDetection';

// Tipos si los necesitas
export type { StorageQuickActionsProps } from './StorageQuickActions';
export type { DemoDataAlertProps } from './DemoDataAlert';