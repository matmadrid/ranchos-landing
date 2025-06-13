// src/components/examples/StoreUsageExample.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Package, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2,
  Loader2,
  DollarSign
} from 'lucide-react';
import useRanchOSStore, { 
  useActiveRanch,
  useAnimalsByRanch,
  useRegionalFormat,
  useIsProcessing,
  useLastAnalysis
} from '@/store';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { ProcessingResult } from '@/types';

/**
 * Ejemplo completo de uso del store enterprise-grade
 * Demuestra todas las capacidades avanzadas
 */
export function StoreUsageExample() {
  const store = useRanchOSStore();
  const activeRanch = useActiveRanch();
  const animals = useAnimalsByRanch(activeRanch?.id || '');
  const format = useRegionalFormat();
  const isProcessing = useIsProcessing();
  const lastAnalysis = useLastAnalysis();
  const { success, error } = useToast();
  
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // 1. EJEMPLO: Crear rancho con validación completa
  const handleCreateRanch = async () => {
    const ranchData = {
      name: 'Rancho El Mirador',
      location: 'Guadalajara, Jalisco',
      countryCode: store.currentCountry,
      size: 250,
      sizeUnit: store.unitSystem.area,
      type: 'dairy' as const,
      description: 'Especializado en producción de leche premium'
    };

    const result: ProcessingResult<any> = await store.addRanch(ranchData);

    if (result.success) {
      if (result.data) {
      success(
        '¡Rancho creado!',
        `${result.data.name} ha sido registrado exitosamente`
      );
      
      // Log de trazabilidad
      console.log('Rancho creado con TraceID:', result.traceId);
    } else {
      // Mostrar errores de validación
      setValidationErrors(result.errors?.map(e => e.message) || []);
      error(
        'Error al crear rancho',
        result.errors?.[0]?.message || 'Error desconocido'
      );
    }
  };

  // 2. EJEMPLO: Agregar animal con conversión de unidades
  const handleAddAnimal = async () => {
    if (!activeRanch) {
      error('Error', 'Primero debes seleccionar un rancho');
      return;
    }

    const animalData = {
      tag: `${store.currentCountry}-${Date.now()}`,
      name: 'Clarabella',
      type: 'cattle' as const,
      breed: 'Holstein',
      sex: 'female' as const,
      birthDate: '2021-03-15',
      weight: store.currentCountry === 'BR' ? 30 : 450, // Arroba vs kg
      weightUnit: store.unitSystem.weight,
      status: 'healthy' as const,
      healthStatus: 'excellent' as const,
      ranchId: activeRanch.id,
      productionData: {
        milkYield: 28,
        pregnancyStatus: false
      }
    };

    const result = await store.addAnimal(animalData);

    if (result.success) {
      if (result.data) {
      success(
        'Animal registrado',
        `${result.data.name} agregada al inventario`
      );
      
      // Mostrar peso convertido
      const weightInKg = store.convertWeight(
        result.data.weight!,
        result.data.weightUnit || store.unitSystem.weight,
        'kg'
      );
      console.log(`Peso: ${format.weight(result.data.weight!, true)} (${weightInKg} kg)`);
    }
    }
  };

  // 3. EJEMPLO: Análisis de rentabilidad con recomendaciones
  const handleProfitabilityAnalysis = async () => {
    if (!activeRanch || animals.length === 0) {
      error('Error', 'Necesitas tener un rancho con animales');
      return;
    }

    setIsAnalyzing(true);

    try {
      const analysis = await store.analyzeProfitability({
        animalCount: animals.length,
        revenue: 1500000, // Simulado
        feedCost: 600000,
        laborCost: 240000,
        veterinaryCost: 90000,
        infrastructureCost: 60000,
        otherCosts: 30000,
        currency: store.currency,
        averageWeight: animals.reduce((sum, animal) => sum + (animal.weight || 0), 0) / animals.length || 400,
        mortalityRate: 2, // 2% tasa típica
        weightUnit: store.unitSystem.weight,
        weights: [], // Arrays para análisis futuro
        prices: []
      });

      success(
        'Análisis completado',
        `Margen de ganancia: ${analysis.margin.toFixed(1)}%`
      );

      // Obtener optimizaciones sugeridas
      const optimizations = store.suggestOptimizations(analysis);
      console.log('Optimizaciones sugeridas:', optimizations);

    } catch (err) {
      error('Error en análisis', 'No se pudo completar el análisis');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 4. EJEMPLO: Comparar con benchmarks del sector
  const handleBenchmarkComparison = () => {
    if (!activeRanch || !lastAnalysis) {
      error('Error', 'Primero realiza un análisis de rentabilidad');
      return;
    }

    const benchmarks = store.getBenchmarks(
      activeRanch.type || 'mixed',
      store.currentCountry
    );

    const comparison = {
      yourMargin: lastAnalysis.margin,
      avgMargin: benchmarks.avgMargin,
      topMargin: benchmarks.topPerformers.margin,
      yourROI: lastAnalysis.roi,
      avgROI: benchmarks.avgROI,
      topROI: benchmarks.topPerformers.roi
    };

    console.log('Comparación con el sector:', comparison);
    
    if (lastAnalysis.margin > benchmarks.avgMargin) {
      success(
        '¡Excelente desempeño!',
        `Tu margen está ${(lastAnalysis.margin - benchmarks.avgMargin).toFixed(1)}% por encima del promedio`
      );
    } else {
      error(
        'Oportunidad de mejora',
        `Tu margen está ${(benchmarks.avgMargin - lastAnalysis.margin).toFixed(1)}% por debajo del promedio`
      );
    }
  };

  // 5. EJEMPLO: Cambiar configuración regional
  const handleCountryChange = async (country: 'MX' | 'BR' | 'CO' | 'ES') => {
    await store.setCountry(country);
    
    success(
      'País actualizado',
      `Configuración cambiada a ${country}. Moneda: ${store.currency}`
    );
  };

  // UI del ejemplo
  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Ejemplo de Store Enterprise</h2>
      
      {/* Estado actual */}
      <Card className="p-4">
        <h3 className="font-semibold mb-2">Estado Actual</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>País: {store.currentCountry}</div>
          <div>Moneda: {store.currency}</div>
          <div>Rancho activo: {activeRanch?.name || 'Ninguno'}</div>
          <div>Animales: {animals.length}</div>
          <div>Procesando: {isProcessing ? 'Sí' : 'No'}</div>
          <div>Unidad peso: {store.unitSystem.weight}</div>
        </div>
      </Card>

      {/* Errores de validación */}
      {validationErrors.length > 0 && (
        <Card className="p-4 border-red-200 bg-red-50">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-900">Errores de validación</h4>
              <ul className="mt-2 space-y-1">
                {validationErrors.map((err, i) => (
                  <li key={i} className="text-sm text-red-700">• {err}</li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* Acciones */}
      <div className="grid grid-cols-2 gap-4">
        <Button 
          onClick={handleCreateRanch}
          disabled={isProcessing}
          className="relative"
        >
          {isProcessing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Package className="h-4 w-4 mr-2" />
          )}
          Crear Rancho
        </Button>

        <Button 
          onClick={handleAddAnimal}
          disabled={!activeRanch || isProcessing}
          variant="secondary"
        >
          Agregar Animal
        </Button>

        <Button 
          onClick={handleProfitabilityAnalysis}
          disabled={!activeRanch || animals.length === 0 || isAnalyzing}
          className="bg-gradient-to-r from-blue-600 to-green-600"
        >
          {isAnalyzing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <TrendingUp className="h-4 w-4 mr-2" />
          )}
          Análisis de Rentabilidad
        </Button>

        <Button 
          onClick={handleBenchmarkComparison}
          disabled={!lastAnalysis}
          variant="outline"
        >
          <DollarSign className="h-4 w-4 mr-2" />
          Comparar con Sector
        </Button>
      </div>

      {/* Cambio de país */}
      <Card className="p-4">
        <h3 className="font-semibold mb-2">Cambiar País</h3>
        <div className="flex gap-2">
          {(['MX', 'BR', 'CO', 'ES'] as const).map(country => (
            <Button
              key={country}
              size="sm"
              variant={store.currentCountry === country ? 'default' : 'outline'}
              onClick={() => handleCountryChange(country)}
            >
              {country}
            </Button>
          ))}
        </div>
      </Card>

      {/* Resultado del último análisis */}
      {lastAnalysis && (
        <Card className="p-4">
          <h3 className="font-semibold mb-2 flex items-center">
            <CheckCircle2 className="h-5 w-5 text-green-600 mr-2" />
            Último Análisis
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>Ingresos: {format.currency(lastAnalysis.revenue)}</div>
            <div>Costos: {format.currency(lastAnalysis.costs.total)}</div>
            <div>Rentabilidad: {format.currency(lastAnalysis.profitability)}</div>
            <div>Margen: {lastAnalysis.margin.toFixed(2)}%</div>
            <div>ROI: {lastAnalysis.roi.toFixed(2)}%</div>
            <div>Punto equilibrio: {lastAnalysis.breakEvenPoint.units} animales</div>
          </div>
          
          {lastAnalysis.recommendations.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">Recomendaciones:</h4>
              <ul className="space-y-1">
                {lastAnalysis.recommendations.map((rec, i) => (
                  <li key={i} className="text-sm text-gray-600">
                    • {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
}
