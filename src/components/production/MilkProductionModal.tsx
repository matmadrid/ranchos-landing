// src/components/production/MilkProductionModal.tsx - VERSIÓN PROFESIONAL
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  // Store hooks
  const activeRanch = useRanchOSStore((state) => state.activeRanch);
  const getCattleByRanch = useRanchOSStore((state) => state.getCattleByRanch);
  const addMilkProduction = useRanchOSStore((state) => state.addMilkProduction);
  
  // State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [shift, setShift] = useState<'morning' | 'afternoon' | 'evening'>('morning');
  const [productions, setProductions] = useState<ProductionEntry[]>([]);
  const [globalNotes, setGlobalNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Memoized cattle data
  const femaleCattle = useMemo(() => {
    if (!isOpen || !activeRanch?.id) return [];
    const allCattle = getCattleByRanch(activeRanch.id);
    return allCattle.filter(c => c.sex === 'female');
  }, [isOpen, activeRanch?.id, getCattleByRanch]);

  // Initialize productions when modal opens or female cattle changes
  useEffect(() => {
    if (isOpen && femaleCattle.length > 0) {
      setProductions(prev => {
        // If we already have productions for all cattle, keep them
        if (prev.length === femaleCattle.length) {
          const cattleIds = new Set(femaleCattle.map(c => c.id));
          const allMatch = prev.every(p => cattleIds.has(p.cattleId));
          if (allMatch) return prev;
        }

        // Otherwise, create new production entries
        return femaleCattle.map(cow => {
          // Try to preserve existing values
          const existing = prev.find(p => p.cattleId === cow.id);
          return existing || {
            cattleId: cow.id,
            liters: 0,
            shift: shift
          };
        });
      });
    }
  }, [isOpen, femaleCattle, shift]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      // Reset form after animation completes
      const timer = setTimeout(() => {
        setProductions([]);
        setGlobalNotes('');
        setDate(new Date().toISOString().split('T')[0]);
        setShift('morning');
      }, 300);
      return () => clearTimeout(timer);
    }
    // Retornar función vacía cuando isOpen es true
    return () => {};
  }, [isOpen]);

  // Handlers
  const handleShiftChange = useCallback((newShift: 'morning' | 'afternoon' | 'evening') => {
    setShift(newShift);
    setProductions(prev => 
      prev.map(p => ({ ...p, shift: newShift }))
    );
  }, []);

  const handleLitersChange = useCallback((cattleId: string, value: string) => {
    const liters = value === '' ? 0 : parseFloat(value) || 0;
    setProductions(prev => 
      prev.map(p => p.cattleId === cattleId ? { ...p, liters } : p)
    );
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!activeRanch?.id) {
      alert('No hay rancho activo');
      return;
    }

    const validProductions = productions.filter(p => p.liters > 0);
    
    if (validProductions.length === 0) {
      alert('Ingrese al menos una producción');
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate async operation
      await Promise.all(
        validProductions.map(async (prod) => {
          await new Promise(resolve => setTimeout(resolve, 50)); // Simulate API delay
          addMilkProduction({
            animalId: prod.cattleId,
            date,
            quantity: prod.liters,
            period: shift,
            unit: 'liter',
            notes: globalNotes
          });
        })
      );

      // Success feedback
      onClose();
    } catch (error) {
      console.error('Error guardando producción:', error);
      alert('Error al guardar la producción');
    } finally {
      setIsSubmitting(false);
    }
  }, [activeRanch?.id, productions, date, shift, globalNotes, addMilkProduction, onClose]);

  // Computed values
  const totalLiters = useMemo(() => 
    productions.reduce((sum, p) => sum + p.liters, 0),
    [productions]
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-3xl bg-white rounded-lg shadow-xl transform transition-all">
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Milk className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Registro de Producción de Leche
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Ingrese la producción diaria por animal
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors p-2 hover:bg-gray-100 rounded-lg"
              disabled={isSubmitting}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            {/* Fecha y Turno */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Turno
                </label>
                <select
                  value={shift}
                  onChange={(e) => handleShiftChange(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  disabled={isSubmitting}
                >
                  <option value="morning">🌅 Mañana</option>
                  <option value="afternoon">☀️ Tarde</option>
                  <option value="evening">🌙 Noche</option>
                </select>
              </div>
            </div>

            {/* Lista de vacas */}
            {femaleCattle.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No hay vacas registradas
                </h3>
                <p className="text-gray-500">
                  Registre primero animales hembra en este rancho
                </p>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Producción por Animal ({femaleCattle.length} {femaleCattle.length === 1 ? 'vaca' : 'vacas'})
                  </h3>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="max-h-80 overflow-y-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 sticky top-0 z-10">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Etiqueta
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Nombre
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Raza
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Litros
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {femaleCattle.map((cow) => {
                            const production = productions.find(p => p.cattleId === cow.id);
                            const currentLiters = production?.liters || 0;
                            
                            return (
                              <tr key={cow.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                  {cow.tag}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600">
                                  {cow.name || '-'}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600">
                                  {cow.breed}
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    max="100"
                                    placeholder="0.0"
                                    value={currentLiters === 0 ? '' : currentLiters}
                                    onChange={(e) => handleLitersChange(cow.id, e.target.value)}
                                    className="w-24 px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center transition-all hover:border-gray-400"
                                    disabled={isSubmitting}
                                  />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Total */}
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg mb-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-sm text-blue-700">Total Producción</span>
                      <p className="text-xs text-blue-600 mt-1">
                        {productions.filter(p => p.liters > 0).length} de {femaleCattle.length} vacas
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-3xl font-bold text-blue-900">
                        {totalLiters.toFixed(1)}
                      </span>
                      <span className="text-lg text-blue-700 ml-1">L</span>
                    </div>
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
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                    placeholder="Observaciones generales del día..."
                    disabled={isSubmitting}
                  />
                </div>
              </>
            )}

            {/* Botones */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors font-medium"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              {femaleCattle.length > 0 && (
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  disabled={isSubmitting || totalLiters === 0}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Milk className="w-4 h-4" />
                      Guardar Producción
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}