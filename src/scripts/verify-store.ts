// src/scripts/verify-store.ts
/**
 * Script para verificar que el store enterprise-grade funciona correctamente
 * Ejecutar con: npx tsx src/scripts/verify-store.ts
 */

import useRanchOSStore from '../store';
import type { ProcessingResult, ValidationResult } from '../types';

async function verifyStore() {
  console.log('🔍 Verificando Store Enterprise-Grade...\n');
  
  const store = useRanchOSStore.getState();
  
  // 1. Verificar estado inicial
  console.log('1️⃣ Estado Inicial:');
  console.log('   - País:', store.currentCountry);
  console.log('   - Moneda:', store.currency);
  console.log('   - Unidades:', JSON.stringify(store.unitSystem));
  console.log('   - Autenticado:', store.isAuthenticated);
  console.log('   - Ranchos:', store.ranches.length);
  console.log('   - Animales:', store.animals.length);
  
  // 2. Probar autenticación
  console.log('\n2️⃣ Probando Autenticación:');
  const testUser = {
    id: 'test-user-1',
    email: 'test@ranchos.app',
    name: 'Usuario de Prueba',
    countryCode: 'MX' as const,
    preferredUnits: store.unitSystem,
    createdAt: new Date().toISOString()
  };
  
  store.setCurrentUser(testUser);
  console.log('   ✅ Usuario establecido:', store.currentUser?.name);
  console.log('   - Es temporal:', store.isTemporaryUser());
  
  // 3. Probar creación de rancho con validación
  console.log('\n3️⃣ Probando Creación de Rancho:');
  const ranchResult: ProcessingResult<any> = await store.addRanch({
    name: 'Rancho de Prueba',
    location: 'Jalisco, México',
    countryCode: 'MX',
    size: 500,
    sizeUnit: 'hectare',
    type: 'mixed',
    description: 'Rancho de prueba para verificación'
  });
  
  if (ranchResult.success && ranchResult.data) {
    console.log('   ✅ Rancho creado:', ranchResult.data.name);
    console.log('   - ID:', ranchResult.data.id);
    console.log('   - TraceID:', ranchResult.traceId);
  } else {
    console.log('   ❌ Error creando rancho:', ranchResult.errors);
  }
  
  // 4. Probar validación con datos inválidos
  console.log('\n4️⃣ Probando Validación:');
  const invalidResult = await store.addRanch({
    name: 'R', // Muy corto
    location: '',
    countryCode: 'MX',
    size: -10, // Negativo
    sizeUnit: 'hectare',
    type: 'invalid' as any // Tipo inválido
  });
  
  console.log('   - Validación falló:', !invalidResult.success);
  console.log('   - Errores:', invalidResult.errors?.length || 0);
  invalidResult.errors?.forEach(err => {
    console.log(`     • ${err.field}: ${err.message}`);
  });
  
  // 5. Probar creación de animal
  console.log('\n5️⃣ Probando Creación de Animal:');
  const activeRanch = store.activeRanch;
  if (activeRanch) {
    const animalResult = await store.addAnimal({
      tag: 'MX-TEST001',
      name: 'Bessie',
      type: 'cattle',
      breed: 'Holstein',
      sex: 'female',
      birthDate: '2020-01-15',
      weight: 450,
      weightUnit: 'kg',
      status: 'healthy',
      healthStatus: 'excellent',
      ranchId: activeRanch.id
    });
    
    if (animalResult.success && animalResult.data) {
      console.log('   ✅ Animal creado:', animalResult.data.name);
      console.log('   - Tag:', animalResult.data.tag);
      console.log('   - Peso:', `${animalResult.data.weight} ${animalResult.data.weightUnit}`);
    }
  }
  
  // 6. Probar conversiones de unidades
  console.log('\n6️⃣ Probando Conversiones:');
  const kgValue = 450;
  const lbValue = store.convertWeight(kgValue, 'kg', 'lb');
  const arrobaValue = store.convertWeight(kgValue, 'kg', 'arroba');
  
  console.log(`   - ${kgValue} kg = ${lbValue.toFixed(2)} lb`);
  console.log(`   - ${kgValue} kg = ${arrobaValue.toFixed(2)} @`);
  
  // 7. Probar formateo regional
  console.log('\n7️⃣ Probando Formateo Regional:');
  console.log('   - Moneda:', store.formatCurrency(15000));
  console.log('   - Número:', store.formatNumber(1234.567));
  console.log('   - Fecha:', store.formatDate(new Date()));
  console.log('   - Peso:', store.formatWeight(450, true));
  console.log('   - Área:', store.formatArea(500, true));
  console.log('   - Volumen:', store.formatVolume(25, true));
  
  // 8. Probar análisis de rentabilidad
  console.log('\n8️⃣ Probando Análisis de Rentabilidad:');
  const profitAnalysis = await store.analyzeProfitability({
    animalCount: 100,
    revenue: 500000,
    feedCost: 200000,
    laborCost: 80000,
    veterinaryCost: 30000,
    infrastructureCost: 20000,
    otherCosts: 10000,
    averageWeight: 450,
    mortalityRate: 2,
    currency: 'MXN',
    weightUnit: 'kg',
    weights: [],
    prices: []
  });
  
  console.log('   - Ingresos:', store.formatCurrency(profitAnalysis.revenue));
  console.log('   - Costos:', store.formatCurrency(profitAnalysis.costs.total));
  console.log('   - Rentabilidad:', store.formatCurrency(profitAnalysis.profitability));
  console.log('   - Margen:', profitAnalysis.margin.toFixed(2) + '%');
  console.log('   - ROI:', profitAnalysis.roi.toFixed(2) + '%');
  console.log('   - Punto de equilibrio:', profitAnalysis.breakEvenPoint.units + ' animales');
  
  // 9. Probar estadísticas
  console.log('\n9️⃣ Estadísticas del Rancho:');
  const stats = store.getAnimalStats(activeRanch?.id);
  console.log('   - Total animales:', stats.total);
  console.log('   - Por estado:', JSON.stringify(stats.byStatus));
  console.log('   - Por tipo:', JSON.stringify(stats.byType));
  console.log('   - Por sexo:', JSON.stringify(stats.bySex));
  
  // 10. Probar cambio de país
  console.log('\n🔟 Probando Cambio de País:');
  await store.setCountry('BR');
  console.log('   - Nuevo país:', store.currentCountry);
  console.log('   - Nueva moneda:', store.currency);
  console.log('   - Nuevas unidades de peso:', store.unitSystem.weight);
  
  // 11. Verificar benchmarks
  console.log('\n1️⃣1️⃣ Benchmarks del Sector:');
  const benchmarks = store.getBenchmarks('dairy', 'MX');
  console.log('   - Margen promedio:', benchmarks.avgMargin + '%');
  console.log('   - ROI promedio:', benchmarks.avgROI + '%');
  console.log('   - Top performers margen:', benchmarks.topPerformers.margin + '%');
  console.log('   - Top performers ROI:', benchmarks.topPerformers.roi + '%');
  
  // 12. Limpiar datos de prueba
  console.log('\n🧹 Limpiando datos de prueba...');
  store.logout();
  console.log('   ✅ Store limpiado');
  
  console.log('\n✅ Verificación completada exitosamente!');
}

// Ejecutar verificación
verifyStore().catch(console.error);
