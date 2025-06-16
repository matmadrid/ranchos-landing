// src/utils/mockInventoryData.ts
/**
 * @version 1.0.0
 * @author TorresLaveaga
 * @cosmovision SpaceRanch Sistemas Dinámicos Universales
 * 
 * BATALLA 6: Motor de Inventario Ganadero
 * Datos de prueba para demostración del sistema
 */

// Importar valores del enum, no solo tipos
import { 
  MovementType, 
  MovementStatus,
  type InventoryMovement, 
  type AnimalCategory 
} from '@/types/inventory';

// ===== DATOS DE DEMOSTRACIÓN =====

/**
 * Movimientos de muestra basados en la Planilla 8 analizada
 * Replica los movimientos encontrados en el Excel real
 */
export const sampleInventoryMovements: Omit<InventoryMovement, 'ranchId' | 'userId'>[] = [
  // Movimiento inicial - Compra masiva
  {
    id: 'mov_demo_001',
    fecha: '2025-01-02',
    tipo: MovementType.COMPRA,
    status: MovementStatus.CONFIRMED,
    numeroMovimiento: 'COMP-001',
    categoriaId: 'terneros_0_12',
    categoria: 'Terneros de 0 a 12 meses',
    cantidad: 100,
    saldoInicial: 0,
    saldoFinal: 100,
    valorUnitario: 1400,
    valorTotal: 140000,
    costoFlete: 900,
    costoComisiones: 4200,
    costoTotalAdquisicion: 145100,
    precioMercadoDia: 300,
    precioNegociado: 285,
    vendedorComprador: 'Comprador 1',
    destino: 'Nueva Granja',
    pesoObservado: 210,
    pesoPromedio: 2.1,
    observaciones: 'Compra inicial de terneros para engorde',
    isReconciled: true,
    createdAt: '2025-01-02T10:30:00Z'
  },

  // Venta parcial
  {
    id: 'mov_demo_002',
    fecha: '2025-01-03',
    tipo: MovementType.VENTA,
    status: MovementStatus.CONFIRMED,
    numeroMovimiento: 'VENT-001',
    categoriaId: 'novillas_gordas',
    categoria: 'Novillas gordas',
    cantidad: -25,
    saldoInicial: 100,
    saldoFinal: 75,
    valorUnitario: 2800,
    valorTotal: 70000,
    precioMercadoDia: 310,
    precioNegociado: 310,
    vendedorComprador: 'Vendedor 1',
    destino: 'Nueva Granja',
    pesoObservado: 390,
    pesoPromedio: 15.6,
    observaciones: 'Venta de novillas en peso óptimo',
    isReconciled: true,
    createdAt: '2025-01-03T14:15:00Z'
  },

  // Nacimientos
  {
    id: 'mov_demo_003',
    fecha: '2025-01-04',
    tipo: MovementType.NACIMIENTO,
    status: MovementStatus.CONFIRMED,
    numeroMovimiento: 'NAC-001',
    categoriaId: 'terneros_0_12',
    categoria: 'Nacimiento Ternera F',
    cantidad: 3,
    saldoInicial: 75,
    saldoFinal: 78,
    vendedorComprador: 'Nacimiento',
    destino: 'Nueva Granja',
    observaciones: 'Nacimientos naturales - 3 terneras hembras',
    isReconciled: true,
    createdAt: '2025-01-04T08:00:00Z'
  },

  // Muerte
  {
    id: 'mov_demo_004',
    fecha: '2025-01-05',
    tipo: MovementType.MUERTE,
    status: MovementStatus.CONFIRMED,
    numeroMovimiento: 'MUE-001',
    categoriaId: 'terneros_0_12',
    categoria: 'Terneros de 0 a 12 meses',
    cantidad: -1,
    saldoInicial: 78,
    saldoFinal: 77,
    vendedorComprador: 'Muerte',
    destino: 'Nueva Granja',
    observaciones: 'Muerte natural - ternero macho',
    isReconciled: true,
    createdAt: '2025-01-05T16:20:00Z'
  },

  // Transferencia salida
  {
    id: 'mov_demo_005',
    fecha: '2025-01-06',
    tipo: MovementType.TRANSFERENCIA_OUT,
    status: MovementStatus.CONFIRMED,
    numeroMovimiento: 'TRANS-OUT-001',
    categoriaId: 'novillos_12_24',
    categoria: 'Novillos de 12 a 24 meses',
    cantidad: -5,
    saldoInicial: 77,
    saldoFinal: 72,
    vendedorComprador: 'Transferencia a la finca X',
    destino: 'Nueva Granja',
    origen: 'Finca Principal',
    observaciones: 'Transferencia para mejoramiento genético',
    isReconciled: true,
    createdAt: '2025-01-06T11:00:00Z'
  },

  // Transferencia entrada
  {
    id: 'mov_demo_006',
    fecha: '2025-01-06',
    tipo: MovementType.TRANSFERENCIA_IN,
    status: MovementStatus.CONFIRMED,
    numeroMovimiento: 'TRANS-IN-001',
    categoriaId: 'terneros_0_12',
    categoria: 'Terneros de 0 a 12 meses',
    cantidad: 8,
    saldoInicial: 72,
    saldoFinal: 80,
    vendedorComprador: 'Traslado desde la finca X',
    destino: 'Granja Rio Branco',
    origen: 'Finca X',
    observaciones: 'Recepción de terneros de finca secundaria',
    isReconciled: true,
    createdAt: '2025-01-06T15:30:00Z'
  },

  // Movimientos adicionales para variedad
  {
    id: 'mov_demo_007',
    fecha: '2025-01-10',
    tipo: MovementType.COMPRA,
    status: MovementStatus.CONFIRMED,
    numeroMovimiento: 'COMP-002',
    categoriaId: 'vacas',
    categoria: 'Vacas',
    cantidad: 15,
    saldoInicial: 25,
    saldoFinal: 40,
    valorUnitario: 3500,
    valorTotal: 52500,
    costoFlete: 1200,
    costoComisiones: 2100,
    precioMercadoDia: 380,
    precioNegociado: 375,
    vendedorComprador: 'Ganadera San Miguel',
    destino: 'Potrero Norte',
    pesoObservado: 520,
    pesoPromedio: 34.7,
    observaciones: 'Compra de vacas reproductoras de alta calidad',
    isReconciled: true,
    createdAt: '2025-01-10T09:15:00Z'
  },

  {
    id: 'mov_demo_008',
    fecha: '2025-01-15',
    tipo: MovementType.NACIMIENTO,
    status: MovementStatus.CONFIRMED,
    numeroMovimiento: 'NAC-002',
    categoriaId: 'terneros_0_12',
    categoria: 'Terneros de 0 a 12 meses',
    cantidad: 8,
    saldoInicial: 88,
    saldoFinal: 96,
    vendedorComprador: 'Nacimiento Natural',
    destino: 'Potrero Maternidad',
    observaciones: 'Segunda ronda de nacimientos - 5 machos, 3 hembras',
    isReconciled: true,
    createdAt: '2025-01-15T06:30:00Z'
  },

  {
    id: 'mov_demo_009',
    fecha: '2025-01-20',
    tipo: MovementType.VENTA,
    status: MovementStatus.CONFIRMED,
    numeroMovimiento: 'VENT-002',
    categoriaId: 'novillos_12_24',
    categoria: 'Novillos de 12 a 24 meses',
    cantidad: -12,
    saldoInicial: 45,
    saldoFinal: 33,
    valorUnitario: 4200,
    valorTotal: 50400,
    precioMercadoDia: 420,
    precioNegociado: 415,
    vendedorComprador: 'Frigorífico Regional',
    destino: 'Planta de Procesamiento',
    pesoObservado: 480,
    pesoPromedio: 40,
    observaciones: 'Venta programada - novillos en peso óptimo',
    isReconciled: true,
    createdAt: '2025-01-20T13:45:00Z'
  },

  // Movimiento reciente para mostrar actividad actual
  {
    id: 'mov_demo_010',
    fecha: '2025-06-12',
    tipo: MovementType.COMPRA,
    status: MovementStatus.CONFIRMED,
    numeroMovimiento: 'COMP-003',
    categoriaId: 'toros',
    categoria: 'Toros',
    cantidad: 2,
    saldoInicial: 5,
    saldoFinal: 7,
    valorUnitario: 12000,
    valorTotal: 24000,
    costoFlete: 500,
    costoComisiones: 1200,
    precioMercadoDia: 450,
    precioNegociado: 440,
    vendedorComprador: 'Rancho El Dorado',
    destino: 'Corral de Sementales',
    pesoObservado: 95,
    pesoPromedio: 47.5,
    observaciones: 'Adquisición de toros reproductores de alto valor genético',
    isReconciled: false, // Movimiento reciente sin conciliar
    createdAt: '2025-06-12T10:00:00Z'
  }
];

/**
 * Balances actuales calculados por categoría
 * Basado en los movimientos de muestra
 */
export const sampleCategoryBalances: Record<string, number> = {
  'terneros_0_12': 96,    // Base + nacimientos - muertes + transferencias
  'novillos_12_24': 33,   // Transferencias - ventas
  'novillas_12_24': 28,   // Crecimiento natural
  'novillas_gordas': 75,  // Base - ventas
  'vacas': 40,            // Compras
  'toros': 7              // Compras
};

/**
 * Estadísticas calculadas del inventario demo
 */
export const sampleInventoryStats = {
  totalAnimals: Object.values(sampleCategoryBalances).reduce((sum, count) => sum + count, 0),
  totalValue: 1250000, // USD estimado
  movementsThisMonth: 3,
  categoriesWithStock: 6,
  lastMovementDate: '2025-06-12'
};

// ===== FUNCIONES UTILITARIAS =====

/**
 * Carga datos de prueba en el store
 */
export async function loadSampleInventoryData(
  addMovement: (movement: any) => Promise<any>,
  ranchId: string,
  userId: string
) {
  console.log('🧪 Cargando datos de prueba del inventario...');
  
  try {
    const results = [];
    
    for (const movement of sampleInventoryMovements) {
      const movementWithIds = {
        ...movement,
        ranchId,
        userId
      };
      
      const result = await addMovement(movementWithIds);
      results.push(result);
      
      // Pequeña pausa para evitar problemas de concurrencia
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    const successCount = results.filter(r => r.success).length;
    const errorCount = results.filter(r => !r.success).length;
    
    console.log(`✅ Datos de prueba cargados: ${successCount} éxitos, ${errorCount} errores`);
    
    return {
      success: true,
      loaded: successCount,
      errors: errorCount,
      results
    };
    
  } catch (error) {
    console.error('❌ Error cargando datos de prueba:', error);
    return {
      success: false,
      error: (error as Error).message,
      loaded: 0,
      errors: sampleInventoryMovements.length
    };
  }
}

/**
 * Genera movimientos aleatorios para pruebas adicionales
 */
export function generateRandomMovements(
  count: number = 10,
  ranchId: string,
  userId: string
): Omit<InventoryMovement, 'ranchId' | 'userId'>[] {
  const types: MovementType[] = [MovementType.COMPRA, MovementType.VENTA, MovementType.NACIMIENTO, MovementType.MUERTE];
  const categories = ['terneros_0_12', 'novillos_12_24', 'novillas_gordas', 'vacas', 'toros'];
  const vendors = ['Rancho A', 'Rancho B', 'Frigorífico C', 'Ganadera D'];
  
  return Array.from({ length: count }, (_, index) => {
    const tipo = types[Math.floor(Math.random() * types.length)];
    const categoriaId = categories[Math.floor(Math.random() * categories.length)];
    const isNegative = [MovementType.VENTA, MovementType.MUERTE, MovementType.TRANSFERENCIA_OUT].includes(tipo);
    
    // Generar fecha aleatoria en los últimos 90 días
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 90));
    
    return {
      id: `mov_random_${Date.now()}_${index}`,
      fecha: date.toISOString().split('T')[0],
      tipo,
      status: MovementStatus.CONFIRMED,
      numeroMovimiento: `${tipo.substr(0, 4)}-${String(index + 1).padStart(3, '0')}`,
      categoriaId,
      categoria: categories.find(c => c === categoriaId) || 'terneros_0_12',
      cantidad: (Math.floor(Math.random() * 20) + 1) * (isNegative ? -1 : 1),
      saldoInicial: Math.floor(Math.random() * 100),
      saldoFinal: Math.floor(Math.random() * 100),
      valorUnitario: tipo === MovementType.COMPRA || tipo === MovementType.VENTA ? Math.floor(Math.random() * 5000) + 1000 : undefined,
      valorTotal: tipo === MovementType.COMPRA || tipo === MovementType.VENTA ? Math.floor(Math.random() * 50000) + 5000 : undefined,
      vendedorComprador: vendors[Math.floor(Math.random() * vendors.length)],
      destino: 'Potrero Principal',
      observaciones: `Movimiento de prueba generado automáticamente`,
      isReconciled: Math.random() > 0.3,
      createdAt: date.toISOString()
    };
  });
}

/**
 * Resumen de datos de prueba para mostrar al usuario
 */
export const sampleDataSummary = {
  totalMovements: sampleInventoryMovements.length,
  movementTypes: {
    compras: sampleInventoryMovements.filter(m => m.tipo === MovementType.COMPRA).length,
    ventas: sampleInventoryMovements.filter(m => m.tipo === MovementType.VENTA).length,
    nacimientos: sampleInventoryMovements.filter(m => m.tipo === MovementType.NACIMIENTO).length,
    muertes: sampleInventoryMovements.filter(m => m.tipo === MovementType.MUERTE).length,
    transferencias: sampleInventoryMovements.filter(m => 
      m.tipo === MovementType.TRANSFERENCIA_IN || m.tipo === MovementType.TRANSFERENCIA_OUT
    ).length
  },
  dateRange: {
    from: '2025-01-02',
    to: '2025-06-12'
  },
  totalValue: sampleInventoryMovements
    .filter(m => m.valorTotal)
    .reduce((sum, m) => sum + (m.valorTotal || 0), 0),
  description: 'Datos basados en la Planilla 8 real analizada - Control de Inventario de Bovinos'
};

// ===== DATOS ADICIONALES PARA TESTING =====

/**
 * Escenarios de prueba específicos
 */
export const testScenarios = {
  // Escenario: Stock bajo
  lowStock: {
    categoriaId: 'toros',
    currentBalance: 2,
    alertThreshold: 5,
    recommendedAction: 'Considerar compra de nuevos reproductores'
  },
  
  // Escenario: Movimiento que resulta en stock negativo
  negativeStock: {
    categoriaId: 'terneros_0_12',
    attemptedSale: 150, // Más de lo disponible
    currentBalance: 96,
    expectedError: 'El movimiento resultaría en stock negativo'
  },
  
  // Escenario: Compra grande
  largePurchase: {
    categoriaId: 'novillas_12_24',
    quantity: 50,
    unitValue: 2500,
    totalInvestment: 125000,
    expectedImpact: 'Incremento significativo en inventario de novillas'
  }
};

// Crear objeto con nombre para export default
const mockInventoryData = {
  sampleInventoryMovements,
  sampleCategoryBalances,
  sampleInventoryStats,
  sampleDataSummary,
  testScenarios,
  loadSampleInventoryData,
  generateRandomMovements
};

export default mockInventoryData;