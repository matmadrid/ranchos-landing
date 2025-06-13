// src/scripts/verify-processing-result.ts
import { create } from 'zustand';
import type { ProcessingResult } from '@/types';

/**
 * Script para verificar que la implementación de ProcessingResult
 * funciona correctamente en todo el store
 */

async function verifyProcessingResultImplementation() {
  console.log('🔍 Verificando implementación de ProcessingResult...\n');
  
  // Importar store (ajustar según tu configuración)
  const useStore = await import('@/store').then(m => m.default);
  const store = useStore.getState();
  
  let testsRun = 0;
  let testsPassed = 0;
  let testsFailed = 0;
  
  // Helper para verificar resultado
  const verifyResult = (
    testName: string, 
    result: any,
    expectSuccess: boolean = true
  ) => {
    testsRun++;
    console.log(`\n📋 Test: ${testName}`);
    
    // Verificar estructura de ProcessingResult
    const hasCorrectStructure = 
      typeof result === 'object' &&
      'success' in result &&
      'traceId' in result &&
      'metadata' in result;
    
    if (!hasCorrectStructure) {
      console.error('❌ No tiene estructura de ProcessingResult');
      console.log('Resultado recibido:', result);
      testsFailed++;
      return false;
    }
    
    // Verificar campos obligatorios
    const checks = [
      { field: 'success', type: 'boolean' },
      { field: 'traceId', type: 'string' },
      { field: 'metadata', type: 'object' }
    ];
    
    let allChecksPassed = true;
    
    for (const check of checks) {
      if (typeof result[check.field] !== check.type) {
        console.error(`❌ Campo ${check.field} no es ${check.type}`);
        allChecksPassed = false;
      }
    }
    
    // Verificar data si es exitoso
    if (result.success && expectSuccess && !result.data) {
      console.error('❌ Éxito pero sin data');
      allChecksPassed = false;
    }
    
    // Verificar errors si falló
    if (!result.success && !expectSuccess && !result.errors) {
      console.error('❌ Fallo pero sin errors');
      allChecksPassed = false;
    }
    
    if (allChecksPassed && result.success === expectSuccess) {
      console.log('✅ Test pasado');
      console.log(`   - Trace ID: ${result.traceId}`);
      console.log(`   - Processing Time: ${result.processingTime ? Date.now() - result.processingTime + 'ms' : 'N/A'}`);
      if (result.warnings?.length) {
        console.log(`   - Warnings: ${result.warnings.length}`);
      }
      testsPassed++;
      return true;
    } else {
      console.error('❌ Test fallido');
      console.log('Resultado completo:', JSON.stringify(result, null, 2));
      testsFailed++;
      return false;
    }
  };
  
  try {
    // Test 1: Crear rancho válido
    console.log('=== TEST 1: Crear rancho válido ===');
    const validRanchResult = await store.addRanch({
      name: 'Test Ranch ProcessingResult',
      location: 'Test Location',
      size: 100,
      sizeUnit: 'hectare',
      type: 'mixed',
      countryCode: 'MX'
    });
    
    verifyResult('Crear rancho válido', validRanchResult, true);
    
    // Test 2: Crear rancho inválido (sin nombre)
    console.log('\n=== TEST 2: Crear rancho inválido ===');
    const invalidRanchResult = await store.addRanch({
      name: '', // Nombre vacío
      location: 'Test Location',
      size: 100,
      sizeUnit: 'hectare',
      type: 'mixed',
      countryCode: 'MX'
    });
    
    verifyResult('Crear rancho sin nombre', invalidRanchResult, false);
    
    // Test 3: Crear animal válido
    if (validRanchResult.success && validRanchResult.data) {
      console.log('\n=== TEST 3: Crear animal válido ===');
      const validAnimalResult = await store.addAnimal({
        tag: `TEST-${Date.now()}`,
        name: 'Test Animal',
        breed: 'Holstein',
        sex: 'female',
        birthDate: '2020-01-01',
        weight: 500,
        weightUnit: 'kg',
        healthStatus: 'good',
        ranchId: validRanchResult.data.id
      });
      
      verifyResult('Crear animal válido', validAnimalResult, true);
      
      // Test 4: Crear animal con tag duplicado
      console.log('\n=== TEST 4: Crear animal con tag duplicado ===');
      const duplicateAnimalResult = await store.addAnimal({
        tag: validAnimalResult.data?.tag || 'TEST-DUP',
        name: 'Duplicate Animal',
        breed: 'Holstein',
        sex: 'male',
        weight: 600,
        weightUnit: 'kg',
        healthStatus: 'good',
        ranchId: validRanchResult.data.id
      });
      
      verifyResult('Crear animal con tag duplicado', duplicateAnimalResult, false);
      
      // Test 5: Crear producción de leche válida
      if (validAnimalResult.success && validAnimalResult.data) {
        console.log('\n=== TEST 5: Crear producción válida ===');
        const validProductionResult = await store.addMilkProduction({
          animalId: validAnimalResult.data.id,
          date: new Date().toISOString(),
          quantity: 25,
          unit: 'liter',
          period: 'morning'
        });
        
        verifyResult('Crear producción válida', validProductionResult, true);
        
        // Test 6: Actualizar animal
        console.log('\n=== TEST 6: Actualizar animal ===');
        const updateAnimalResult = await store.updateAnimal(
          validAnimalResult.data.id,
          { name: 'Updated Test Animal', weight: 550 }
        );
        
        verifyResult('Actualizar animal', updateAnimalResult, true);
        
        // Test 7: Eliminar producción
        if (validProductionResult.success && validProductionResult.data) {
          console.log('\n=== TEST 7: Eliminar producción ===');
          const deleteProductionResult = await store.deleteMilkProduction(
            validProductionResult.data.id
          );
          
          verifyResult('Eliminar producción', deleteProductionResult, true);
        }
        
        // Test 8: Eliminar animal
        console.log('\n=== TEST 8: Eliminar animal ===');
        const deleteAnimalResult = await store.deleteAnimal(
          validAnimalResult.data.id
        );
        
        verifyResult('Eliminar animal', deleteAnimalResult, true);
      }
      
      // Test 9: Actualizar rancho
      console.log('\n=== TEST 9: Actualizar rancho ===');
      const updateRanchResult = await store.updateRanch(
        validRanchResult.data.id,
        { name: 'Updated Test Ranch', size: 150 }
      );
      
      verifyResult('Actualizar rancho', updateRanchResult, true);
      
      // Test 10: Eliminar rancho
      console.log('\n=== TEST 10: Eliminar rancho ===');
      const deleteRanchResult = await store.deleteRanch(
        validRanchResult.data.id
      );
      
      verifyResult('Eliminar rancho', deleteRanchResult, true);
    }
    
    // Test 11: Verificar procesamiento asíncrono
    console.log('\n=== TEST 11: Verificar estado de procesamiento ===');
    const processingState = {
      isProcessing: store.isProcessing,
      queueLength: store.getQueueLength(),
      lastResult: store.lastProcessingResult
    };
    
    console.log('Estado de procesamiento:', processingState);
    
    if (typeof processingState.isProcessing === 'boolean' &&
        typeof processingState.queueLength === 'number') {
      console.log('✅ Estado de procesamiento correcto');
      testsPassed++;
    } else {
      console.error('❌ Estado de procesamiento incorrecto');
      testsFailed++;
    }
    testsRun++;
    
    // Test 12: Verificar método createProcessingResult
    console.log('\n=== TEST 12: Verificar createProcessingResult ===');
    const customResult = store.createProcessingResult(
      true,
      { test: 'data' },
      undefined,
      [{ 
        code: 'TEST_WARNING', 
        message: 'Test warning', 
        field: 'test',
        severity: 'warning' as const
      }]
    );
    
    verifyResult('createProcessingResult manual', customResult, true);
    
  } catch (error) {
    console.error('\n❌ Error durante las pruebas:', error);
    testsFailed++;
  }
  
  // Resumen final
  console.log('\n' + '='.repeat(50));
  console.log('📊 RESUMEN DE PRUEBAS');
  console.log('='.repeat(50));
  console.log(`Total de pruebas: ${testsRun}`);
  console.log(`✅ Pasadas: ${testsPassed}`);
  console.log(`❌ Fallidas: ${testsFailed}`);
  console.log(`Porcentaje de éxito: ${((testsPassed / testsRun) * 100).toFixed(1)}%`);
  
  if (testsFailed === 0) {
    console.log('\n🎉 ¡Todas las pruebas pasaron! La implementación es correcta.');
  } else {
    console.log('\n⚠️  Algunas pruebas fallaron. Revisa la implementación.');
  }
  
  return {
    total: testsRun,
    passed: testsPassed,
    failed: testsFailed
  };
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  verifyProcessingResultImplementation()
    .then(results => {
      process.exit(results.failed > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('Error fatal:', error);
      process.exit(1);
    });
}

export default verifyProcessingResultImplementation;