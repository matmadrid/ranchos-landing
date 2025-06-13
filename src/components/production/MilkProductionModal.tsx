// src/components/production/MilkProductionModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { X, Milk, Calendar, AlertCircle } from 'lucide-react';
import useRanchOSStore from '@/store';

interface MilkProductionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ProductionEntry {
  cattleId: string;
  liters: number;
  shift: 'morning' | 'afternoon' | 'evening';
}

export default function MilkProductionModal({ isOpen, onClose }: MilkProductionModalProps) {
  // Separar las llamadas al store
  const activeRanch = useRanchOSStore((state) => state.activeRanch);
  const getCattleByRanch = useRanchOSStore((state) => state.getCattleByRanch);
  const addMilkProduction = useRanchOSStore((state) => state.addMilkProduction);
  
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [shift, setShift] = useState<'morning' | 'afternoon' | 'evening'>('morning');
  const [productions, setProductions] = useState<ProductionEntry[]>([]);
  const [globalNotes, setGlobalNotes] = useState('');
  const [cattle, setCattle] = useState<any[]>([]);

  // Obtener el ganado cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      const activeCattle = getCattleByRanch(activeRanch?.id || '');
      setCattle(activeCattle);
    }
  }, [isOpen, getCattleByRanch, activeRanch]);

  // Solo mostrar vacas hembra
  const femaleCattle = cattle.filter(c => c.sex === 'female');

  useEffect(() => {
    if (isOpen && femaleCattle.length > 0) {
      // Inicializar con todas las vacas
      setProductions(
        femaleCattle.map(cow => ({
          cattleId: cow.id,
          liters: 0,
          shift: shift
        }))
      );
    }
  }, [isOpen, shift, femaleCattle]);

  if (!isOpen) return null;

  const handleLitersChange = (cattleId: string, value: string) => {
    const liters = parseFloat(value) || 0;
    setProductions(prev => 
      prev.map(p => p.cattleId === cattleId ? { ...p, liters } : p)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!activeRanch?.id) {
      alert('No hay rancho activo');
      return;
    }

    // Guardar solo las producciones con litros > 0
    const validProductions = productions.filter(p => p.liters > 0);
    
    if (validProductions.length === 0) {
      alert('Ingrese al menos una producción');
      return;
    }

    // Guardar cada producción
    validProductions.forEach(prod => {
      addMilkProduction({
        animalId: prod.cattleId,
        date,
        quantity: prod.liters,
        period: shift,
        unit: 'liter',
        notes: globalNotes
      });
    });

    // Limpiar y cerrar
    setProductions([]);
    setGlobalNotes('');
    setCattle([]);
    onClose();
  };

  const totalLiters = productions.reduce((sum, p) => sum + p.liters, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-3xl bg-white rounded-lg shadow-xl">
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center gap-3">
              <Milk className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                Registro de Producción de Leche
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            {/* Fecha y Turno */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="inline w-4 h-4 mr-1" />
                  Fecha
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Turno
                </label>
                <select
                  value={shift}
                  onChange={(e) => setShift(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="morning">Mañana</option>
                  <option value="afternoon">Tarde</option>
                  <option value="evening">Noche</option>
                </select>
              </div>
            </div>

            {/* Lista de vacas */}
            {femaleCattle.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No hay vacas registradas en este rancho</p>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Producción por Animal
                  </h3>
                  <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-md">
                    <table className="w-full">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Etiqueta
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Nombre
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Raza
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                            Litros
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {femaleCattle.map((cow) => (
                          <tr key={cow.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-sm font-medium text-gray-900">
                              {cow.tag}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-600">
                              {cow.name || '-'}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-600">
                              {cow.breed}
                            </td>
                            <td className="px-4 py-2">
                              <input
                                type="number"
                                step="0.1"
                                min="0"
                                max="100"
                                placeholder="0"
                                value={productions.find(p => p.cattleId === cow.id)?.liters || ''}
                                onChange={(e) => handleLitersChange(cow.id, e.target.value)}
                                className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Total */}
                <div className="bg-blue-50 p-4 rounded-md mb-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-blue-900">Total Producción:</span>
                    <span className="text-2xl font-bold text-blue-900">
                      {totalLiters.toFixed(1)} L
                    </span>
                  </div>
                </div>

                {/* Notas */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notas (opcional)
                  </label>
                  <textarea
                    value={globalNotes}
                    onChange={(e) => setGlobalNotes(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Observaciones generales del día..."
                  />
                </div>
              </>
            )}

            {/* Botones */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
              {femaleCattle.length > 0 && (
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Guardar Producción
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
