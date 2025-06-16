// src/store/slices/inventorySlice.ts
/**
 * @version 1.0.0
 * @author TorresLaveaga
 * @cosmovision SpaceRanch Sistemas Dinámicos Universales
 * 
 * BATALLA 6: Motor de Inventario Ganadero
 * Slice de Zustand para manejo de inventario agregado - VERSION INICIAL
 */

import type { StateCreator } from 'zustand';
import type { ProcessingResult } from '@/types';

// Importar como valores, no como tipos
import { 
  InventoryMovement, 
  AnimalCategory, 
  CategoryInventorySummary,
  MonthlyInventoryReport,
  ReconciliationReport,
  InventoryAlert,
  InventorySettings,
  MovementType,
  MovementStatus,
  STANDARD_CATEGORIES,
  validateInventoryMovement, 
  calculateFinalBalance
} from '@/types/inventory';

// ===== INTERFACES DEL SLICE =====

/**
 * Estado del slice de inventario
 */
interface InventoryState {
  // === DATOS PRINCIPALES ===
  movements: InventoryMovement[];
  categories: AnimalCategory[];
  settings: InventorySettings | null;
  
  // === ESTADO DE UI ===
  isLoading: boolean;
  isProcessing: boolean;
  error: string | null;
  
  // === CACHE DE CÁLCULOS ===
  categoryBalances: Map<string, number>;
  lastCalculationTimestamp: number;
  
  // === ALERTAS Y NOTIFICACIONES ===
  alerts: InventoryAlert[];
  unreadAlertsCount: number;
  
  // === REPORTES ===
  lastReconciliation: ReconciliationReport | null;
  monthlyReports: Map<string, MonthlyInventoryReport>; // key: "YYYY-MM"
  
  // === ESTADÍSTICAS AGREGADAS ===
  stats: {
    totalAnimals: number;
    totalValue: number;
    movementsThisMonth: number;
    categoriesWithStock: number;
    lastMovementDate: string | null;
  };
}

/**
 * Acciones del slice de inventario
 */
interface InventoryActions {
  // === GESTIÓN DE MOVIMIENTOS ===
  addMovement: (
    movement: Omit<InventoryMovement, 'id' | 'saldoFinal' | 'createdAt' | 'isReconciled'>
  ) => Promise<ProcessingResult<InventoryMovement>>;
  
  updateMovement: (
    id: string, 
    updates: Partial<InventoryMovement>
  ) => Promise<ProcessingResult<InventoryMovement>>;
  
  deleteMovement: (id: string) => Promise<ProcessingResult<void>>;
  
  // === CONSULTAS DE MOVIMIENTOS ===
  getMovementsByDateRange: (startDate: string, endDate: string) => InventoryMovement[];
  getMovementsByCategory: (categoryId: string) => InventoryMovement[];
  getMovementsByType: (type: MovementType) => InventoryMovement[];
  getRecentMovements: (limit?: number) => InventoryMovement[];
  
  // === CÁLCULOS DE BALANCE ===
  getCategoryBalance: (categoryId: string, asOfDate?: string) => number;
  getAllCategoryBalances: (asOfDate?: string) => Map<string, number>;
  recalculateAllBalances: () => Promise<ProcessingResult<void>>;
  
  // === REPORTES Y ESTADÍSTICAS ===
  generateCategorySummary: (categoryId: string) => CategoryInventorySummary;
  getInventoryStats: () => InventoryState['stats'];
  
  // === ALERTAS ===
  checkInventoryAlerts: () => Promise<ProcessingResult<InventoryAlert[]>>;
  markAlertAsRead: (alertId: string) => void;
  clearAllAlerts: () => void;
  
  // === UTILIDADES INTERNAS ===
  initializeInventory: (ranchId: string) => Promise<ProcessingResult<void>>;
}

/**
 * Slice completo de inventario
 */
export interface InventorySlice extends InventoryState, InventoryActions {}

// ===== HELPER PARA CREAR ProcessingResult =====
function createProcessingResult<T>(
  success: boolean, 
  data?: T, 
  error?: string,
  traceId?: string
): ProcessingResult<T> {
  return {
    success,
    data,
    errors: error ? [{ message: error, code: 'INVENTORY_ERROR', field: '', severity: 'error' as const }] : [],
    warnings: [],
    metadata: {
      id: 'inventory-engine',
      version: '1.0.0',
      name: 'Inventory Management System',
      description: 'Motor de inventario ganadero',
      supportedCountries: ['MX', 'CO', 'BR', 'ES'],
      lastUpdated: new Date().toISOString()
    },
    processingTime: Date.now(),
    traceId: traceId || `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  };
}

// ===== IMPLEMENTACIÓN DEL SLICE =====

export const createInventorySlice: StateCreator<
  InventorySlice,
  [],
  [],
  InventorySlice
> = (set, get) => ({
  // === ESTADO INICIAL ===
  movements: [],
  categories: [...STANDARD_CATEGORIES],
  settings: null,
  isLoading: false,
  isProcessing: false,
  error: null,
  categoryBalances: new Map(),
  lastCalculationTimestamp: 0,
  alerts: [],
  unreadAlertsCount: 0,
  lastReconciliation: null,
  monthlyReports: new Map(),
  stats: {
    totalAnimals: 0,
    totalValue: 0,
    movementsThisMonth: 0,
    categoriesWithStock: 0,
    lastMovementDate: null
  },

  // === IMPLEMENTACIÓN DE ACCIONES ===

  /**
   * Agregar un nuevo movimiento de inventario
   */
  addMovement: async (movementData) => {
    const traceId = `addMovement-${Date.now()}`;
    
    try {
      set({ isProcessing: true, error: null });
      
      // Validar movimiento
      const validation = validateInventoryMovement(movementData);
      if (!validation.isValid) {
        const errorMessage = validation.errors.map(e => e.message).join(', ');
        throw new Error(`Validación fallida: ${errorMessage}`);
      }
      
      // Calcular saldo final
      const currentBalance = get().getCategoryBalance(movementData.categoriaId);
      const finalBalance = calculateFinalBalance(currentBalance, movementData);
      
      if (finalBalance < 0) {
        throw new Error(`El movimiento resultaría en stock negativo: ${finalBalance}`);
      }
      
      // Crear movimiento completo
      const movement: InventoryMovement = {
        ...movementData,
        id: `mov_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        saldoInicial: currentBalance,
        saldoFinal: finalBalance,
        status: MovementStatus.CONFIRMED,
        isReconciled: false,
        validationResult: validation,
        createdAt: new Date().toISOString()
      };
      
      // Actualizar estado
      set(state => ({
        movements: [...state.movements, movement],
        isProcessing: false,
        lastCalculationTimestamp: 0 // Forzar recálculo
      }));
      
      // Recalcular balances y estadísticas
      await get().recalculateAllBalances();
      
      // Verificar alertas
      get().checkInventoryAlerts();
      
      return createProcessingResult(true, movement, undefined, traceId);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      set({ isProcessing: false, error: errorMessage });
      return createProcessingResult<InventoryMovement>(false, undefined, errorMessage, traceId);
    }
  },

  /**
   * Actualizar un movimiento existente
   */
  updateMovement: async (id, updates) => {
    const traceId = `updateMovement-${id}-${Date.now()}`;
    
    try {
      set({ isProcessing: true, error: null });
      
      const state = get();
      const movement = state.movements.find(m => m.id === id);
      
      if (!movement) {
        throw new Error(`Movimiento no encontrado: ${id}`);
      }
      
      // Crear movimiento actualizado
      const updatedMovement = {
        ...movement,
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      // Validar movimiento actualizado
      const validation = validateInventoryMovement(updatedMovement);
      if (!validation.isValid) {
        const errorMessage = validation.errors.map(e => e.message).join(', ');
        throw new Error(`Validación fallida: ${errorMessage}`);
      }
      
      // Actualizar en el estado
      set(state => ({
        movements: state.movements.map(m => m.id === id ? updatedMovement : m),
        isProcessing: false,
        lastCalculationTimestamp: 0
      }));
      
      // Recalcular balances
      await get().recalculateAllBalances();
      
      return createProcessingResult(true, updatedMovement, undefined, traceId);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      set({ isProcessing: false, error: errorMessage });
      return createProcessingResult<InventoryMovement>(false, undefined, errorMessage, traceId);
    }
  },

  /**
   * Eliminar un movimiento
   */
  deleteMovement: async (id) => {
    const traceId = `deleteMovement-${id}-${Date.now()}`;
    
    try {
      set({ isProcessing: true, error: null });
      
      const state = get();
      const movement = state.movements.find(m => m.id === id);
      
      if (!movement) {
        throw new Error(`Movimiento no encontrado: ${id}`);
      }
      
      // Verificar dependencias
      const hasDependent = state.movements.some(m => m.parentMovementId === id);
      if (hasDependent) {
        throw new Error('No se puede eliminar: existen movimientos dependientes');
      }
      
      // Eliminar del estado
      set(state => ({
        movements: state.movements.filter(m => m.id !== id),
        isProcessing: false,
        lastCalculationTimestamp: 0
      }));
      
      // Recalcular balances
      await get().recalculateAllBalances();
      
      return createProcessingResult<void>(true, undefined, undefined, traceId);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      set({ isProcessing: false, error: errorMessage });
      return createProcessingResult<void>(false, undefined, errorMessage, traceId);
    }
  },

  /**
   * Obtener movimientos por rango de fechas
   */
  getMovementsByDateRange: (startDate, endDate) => {
    const state = get();
    return state.movements.filter(movement => {
      const movementDate = movement.fecha;
      return movementDate >= startDate && movementDate <= endDate;
    }).sort((a, b) => b.fecha.localeCompare(a.fecha));
  },

  /**
   * Obtener movimientos por categoría
   */
  getMovementsByCategory: (categoryId) => {
    const state = get();
    return state.movements
      .filter(movement => movement.categoriaId === categoryId)
      .sort((a, b) => b.fecha.localeCompare(a.fecha));
  },

  /**
   * Obtener movimientos por tipo
   */
  getMovementsByType: (type) => {
    const state = get();
    return state.movements
      .filter(movement => movement.tipo === type)
      .sort((a, b) => b.fecha.localeCompare(a.fecha));
  },

  /**
   * Obtener movimientos recientes
   */
  getRecentMovements: (limit = 10) => {
    const state = get();
    return state.movements
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit);
  },

  /**
   * Obtener balance actual de una categoría
   */
  getCategoryBalance: (categoryId, asOfDate) => {
    const state = get();
    
    // Si hay un cache válido y no se especifica fecha, usar cache
    if (!asOfDate && state.categoryBalances.has(categoryId) && 
        Date.now() - state.lastCalculationTimestamp < 5 * 60 * 1000) { // 5 minutos
      return state.categoryBalances.get(categoryId) || 0;
    }
    
    // Calcular balance desde cero
    const relevantMovements = state.movements
      .filter(m => m.categoriaId === categoryId)
      .filter(m => !asOfDate || m.fecha <= asOfDate)
      .sort((a, b) => a.fecha.localeCompare(b.fecha));
    
    let balance = 0;
    for (const movement of relevantMovements) {
      balance = calculateFinalBalance(balance, movement);
    }
    
    return balance;
  },

  /**
   * Obtener todos los balances de categorías
   */
  getAllCategoryBalances: (asOfDate) => {
    const state = get();
    const balances = new Map<string, number>();
    
    for (const category of state.categories) {
      if (category.isActive) {
        balances.set(category.id, get().getCategoryBalance(category.id, asOfDate));
      }
    }
    
    return balances;
  },

  /**
   * Recalcular todos los balances
   */
  recalculateAllBalances: async () => {
    try {
      const state = get();
      const newBalances = get().getAllCategoryBalances();
      
      // Calcular estadísticas
      const totalAnimals = Array.from(newBalances.values()).reduce((sum, balance) => sum + balance, 0);
      const categoriesWithStock = Array.from(newBalances.values()).filter(balance => balance > 0).length;
      
      const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
      const movementsThisMonth = state.movements.filter(m => 
        m.fecha.startsWith(currentMonth)
      ).length;
      
      const lastMovement = state.movements
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
      
      // Actualizar estado
      set({
        categoryBalances: newBalances,
        lastCalculationTimestamp: Date.now(),
        stats: {
          totalAnimals,
          totalValue: state.stats.totalValue, // Mantener valor actual por ahora
          movementsThisMonth,
          categoriesWithStock,
          lastMovementDate: lastMovement?.fecha || null
        }
      });
      
      return createProcessingResult<void>(true);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      return createProcessingResult<void>(false, undefined, errorMessage);
    }
  },

  /**
   * Generar resumen de categoría
   */
  generateCategorySummary: (categoryId) => {
    const state = get();
    const category = state.categories.find(c => c.id === categoryId);
    
    if (!category) {
      throw new Error(`Categoría no encontrada: ${categoryId}`);
    }
    
    const movements = get().getMovementsByCategory(categoryId);
    const currentBalance = get().getCategoryBalance(categoryId);
    
    // Calcular estadísticas de últimos 30 días
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentMovements = movements.filter(m => 
      new Date(m.fecha) >= thirtyDaysAgo
    );
    
    const purchases = recentMovements.filter(m => m.tipo === 'COMPRA');
    const sales = recentMovements.filter(m => m.tipo === 'VENTA');
    
    const avgPurchases = purchases.length > 0 
      ? purchases.reduce((sum, m) => sum + m.cantidad, 0) / purchases.length 
      : 0;
    
    const avgSales = sales.length > 0
      ? sales.reduce((sum, m) => sum + m.cantidad, 0) / sales.length
      : 0;
    
    return {
      categoriaId: categoryId,
      categoria: category.label,
      saldoActual: currentBalance,
      valorEstimado: 0, // Calcular basado en precios
      ultimaActualizacion: new Date().toISOString(),
      movimientosUltimos30Dias: recentMovements.length,
      promedioCompras30Dias: avgPurchases,
      promedioVentas30Dias: avgSales,
      rotacionInventario: 30, // Placeholder
      alertas: []
    };
  },

  /**
   * Verificar alertas de inventario
   */
  checkInventoryAlerts: async () => {
    try {
      const state = get();
      const newAlerts: InventoryAlert[] = [];
      
      // Verificar stock bajo para cada categoría
      for (const category of state.categories) {
        if (!category.isActive) continue;
        
        const balance = get().getCategoryBalance(category.id);
        
        // Alertar si balance es menor a 10
        if (balance < 10) {
          newAlerts.push({
            id: `alert_${category.id}_${Date.now()}`,
            type: 'LOW_STOCK',
            severity: balance === 0 ? 'critical' : 'warning',
            message: `Stock bajo en ${category.label}: ${balance} animales`,
            categoriaId: category.id,
            isRead: false,
            createdAt: new Date().toISOString()
          });
        }
      }
      
      // Actualizar alertas
      set(state => ({
        alerts: [...state.alerts, ...newAlerts],
        unreadAlertsCount: state.unreadAlertsCount + newAlerts.length
      }));
      
      return createProcessingResult(true, newAlerts);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      return createProcessingResult<InventoryAlert[]>(false, undefined, errorMessage);
    }
  },

  /**
   * Marcar alerta como leída
   */
  markAlertAsRead: (alertId) => {
    set(state => ({
      alerts: state.alerts.map(alert => 
        alert.id === alertId ? { ...alert, isRead: true } : alert
      ),
      unreadAlertsCount: Math.max(0, state.unreadAlertsCount - 1)
    }));
  },

  /**
   * Limpiar todas las alertas
   */
  clearAllAlerts: () => {
    set({ alerts: [], unreadAlertsCount: 0 });
  },

  /**
   * Obtener estadísticas del inventario
   */
  getInventoryStats: () => {
    return get().stats;
  },

  /**
   * Inicializar inventario para un rancho
   */
  initializeInventory: async (ranchId) => {
    try {
      set({ isLoading: true, error: null });
      
      // Crear configuración por defecto
      const defaultSettings: InventorySettings = {
        ranchId,
        enabledCategories: STANDARD_CATEGORIES.map(c => c.id),
        customCategories: [],
        alertSettings: {
          lowStockThreshold: 10,
          highRotationDays: 30,
          priceVariationPercent: 15,
          enableEmailAlerts: true,
          enablePushAlerts: true
        },
        reconciliationSettings: {
          autoReconciliationEnabled: true,
          reconciliationFrequency: 'daily',
          tolerancePercentage: 5
        },
        financialSettings: {
          defaultCurrency: 'USD',
          includeTaxInCalculations: false,
          taxRate: 0,
          depreciation: {
            enabled: false,
            annualRate: 0
          }
        },
        createdAt: new Date().toISOString()
      };
      
      set({
        settings: defaultSettings,
        isLoading: false
      });
      
      return createProcessingResult<void>(true);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      set({ isLoading: false, error: errorMessage });
      return createProcessingResult<void>(false, undefined, errorMessage);
    }
  }
});