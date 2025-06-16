'use client';

import { useEffect, useState } from 'react';
import useRanchOSStore from '@/store';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

// Declaración de tipos para window
declare global {
  interface Window {
    useRanchOSStore?: typeof useRanchOSStore;
  }
}

interface VerificationResult {
  label: string;
  expected: any;
  actual: any;
  passed: boolean;
}

export default function SystemVerifier() {
  const store = useRanchOSStore();
  const [results, setResults] = useState<VerificationResult[]>([]);
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    // Dar tiempo para que el store se actualice
    const timer = setTimeout(() => {
      const verificationResults: VerificationResult[] = [
        {
          label: 'Usuario Demo',
          expected: 'demo@ranchos.io',
          actual: store.currentUser?.email || 'No user',
          passed: store.currentUser?.email === 'demo@ranchos.io'
        },
        {
          label: 'Número de Ranchos',
          expected: 3,
          actual: store.ranches?.length || 0,
          passed: store.ranches?.length === 3
        },
        {
          label: 'Número de Animales',
          expected: 355,
          actual: store.animals?.length || 0,
          passed: store.animals?.length === 355
        },
        {
          label: 'Rancho Activo',
          expected: 'Definido',
          actual: store.activeRanch?.name || 'No definido',
          passed: !!store.activeRanch
        },
        {
          label: 'Perfil de Usuario',
          expected: 'Cargado',
          actual: store.profile ? 'Cargado' : 'No cargado',
          passed: !!store.profile
        },
        {
          label: 'Distribución de Animales',
          expected: 'Santa María: 150, Los Alamos: 125, El Progreso: 80',
          actual: (() => {
            if (!store.ranches || !store.animals) return 'No data';
            const distribution = store.ranches.map((ranch: any) => {
              const count = store.animals.filter((a: any) => a.ranchId === ranch.id).length;
              return `${ranch.name}: ${count}`;
            }).join(', ');
            return distribution || 'No distribution';
          })(),
          passed: (() => {
            if (!store.ranches || !store.animals) return false;
            const counts = store.ranches.map((ranch: any) => 
              store.animals.filter((a: any) => a.ranchId === ranch.id).length
            );
            return counts[0] === 150 && counts[1] === 125 && counts[2] === 80;
          })()
        }
      ];

      setResults(verificationResults);
      setIsVerifying(false);
    }, 2000); // Esperar 2 segundos para asegurar carga completa

    return () => clearTimeout(timer);
  }, [store]);

  const allPassed = results.every(r => r.passed);
  const passedCount = results.filter(r => r.passed).length;

  if (isVerifying) {
    return (
      <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-md">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          <span className="text-sm">Verificando sistema demo...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-md">
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-1">
          {allPassed ? (
            <>
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="font-semibold text-green-700">Sistema Demo OK</span>
            </>
          ) : (
            <>
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              <span className="font-semibold text-yellow-700">
                Verificación: {passedCount}/{results.length}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="space-y-2 text-sm">
        {results.map((result, index) => (
          <div key={index} className="flex items-start gap-2">
            {result.passed ? (
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
            )}
            <div className="flex-1">
              <div className="font-medium">{result.label}</div>
              <div className="text-xs text-gray-600">
                Esperado: {result.expected}
              </div>
              <div className="text-xs text-gray-600">
                Actual: {result.actual}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t text-xs text-gray-500">
        <button
          onClick={() => window.location.reload()}
          className="text-blue-600 hover:underline mr-3"
        >
          Recargar
        </button>
        <button
          onClick={() => {
            if (typeof window !== 'undefined' && window.useRanchOSStore) {
              console.log('Store completo:', window.useRanchOSStore.getState());
            }
          }}
          className="text-blue-600 hover:underline"
        >
          Ver Store en Consola
        </button>
      </div>
    </div>
  );
}
