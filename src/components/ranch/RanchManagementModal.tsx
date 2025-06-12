// src/components/ranch/RanchManagementModal.tsx
'use client';

import React, { useState } from 'react';
import { X, Building2, MapPin, ToggleLeft, ToggleRight, Edit2, Trash2 } from 'lucide-react';
import { useStore } from '@/store';

interface RanchManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Ranch {
  id: string;
  name: string;
  location: string;
  size?: number;
  type?: 'dairy' | 'beef' | 'mixed';
  isActive: boolean;
}

export default function RanchManagementModal({ isOpen, onClose }: RanchManagementModalProps) {
  // USANDO LAS FUNCIONES CORRECTAS DEL STORE ACTUALIZADO
  const ranches = useStore((state) => state.ranches);
  const updateRanch = useStore((state) => state.updateRanch);
  const removeRanch = useStore((state) => state.removeRanch);
  const activeRanchId = useStore((state) => state.activeRanchId);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', location: '' });

  if (!isOpen) return null;

  const handleToggleActive = (ranchId: string, currentStatus: boolean) => {
    updateRanch(ranchId, { isActive: !currentStatus });
  };

  const handleEdit = (ranch: Ranch) => {
    setEditingId(ranch.id);
    setEditForm({ name: ranch.name, location: ranch.location });
  };

  const handleSaveEdit = (ranchId: string) => {
    updateRanch(ranchId, {
      name: editForm.name,
      location: editForm.location
    });
    setEditingId(null);
  };

  const handleDelete = (ranchId: string, ranchName: string) => {
    if (confirm(`¿Estás seguro de eliminar "${ranchName}"? Se eliminarán todos los animales asociados.`)) {
      removeRanch(ranchId);
    }
  };

  const getRanchTypeLabel = (type?: string) => {
    switch (type) {
      case 'dairy': return 'Lechero';
      case 'beef': return 'Cárnico';
      case 'mixed': return 'Mixto';
      default: return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              Gestión de Ranchos
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 max-h-96 overflow-y-auto">
            {ranches.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                No hay ranchos registrados
              </p>
            ) : (
              <div className="space-y-4">
                {ranches.map((ranch) => (
                  <div 
                    key={ranch.id} 
                    className={`border rounded-lg p-4 ${
                      ranch.id === activeRanchId ? 'border-green-500 bg-green-50' : 'border-gray-200'
                    }`}
                  >
                    {editingId === ranch.id ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          placeholder="Nombre del rancho"
                        />
                        <input
                          type="text"
                          value={editForm.location}
                          onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          placeholder="Ubicación"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSaveEdit(ranch.id)}
                            className="px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
                          >
                            Guardar
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-3 py-1 bg-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-400"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Building2 className="w-5 h-5 text-gray-600" />
                              <h3 className="font-semibold text-gray-900">
                                {ranch.name}
                              </h3>
                              {ranch.id === activeRanchId && (
                                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                                  Activo
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                              <MapPin className="w-4 h-4" />
                              <span>{ranch.location}</span>
                            </div>
                            {ranch.size && (
                              <p className="text-sm text-gray-500 mt-1">
                                {ranch.size} hectáreas • {getRanchTypeLabel(ranch.type)}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleToggleActive(ranch.id, ranch.isActive)}
                              className={`p-2 rounded-md transition-colors ${
                                ranch.isActive
                                  ? 'text-green-600 hover:bg-green-100'
                                  : 'text-gray-400 hover:bg-gray-100'
                              }`}
                              title={ranch.isActive ? 'Desactivar' : 'Activar'}
                            >
                              {ranch.isActive ? (
                                <ToggleRight className="w-5 h-5" />
                              ) : (
                                <ToggleLeft className="w-5 h-5" />
                              )}
                            </button>

                            <button
                              onClick={() => handleEdit(ranch)}
                              className="p-2 text-blue-600 hover:bg-blue-100 rounded-md transition-colors"
                              title="Editar"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleDelete(ranch.id, ranch.name)}
                              className="p-2 text-red-600 hover:bg-red-100 rounded-md transition-colors"
                              title="Eliminar"
                              disabled={ranch.id === activeRanchId}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="mt-2 pt-2 border-t border-gray-100">
                          <p className="text-xs text-gray-500">
                            Estado:{' '}
                            {ranch.isActive ? (
                              <span className="text-green-600 font-medium">Activo</span>
                            ) : (
                              <span className="text-orange-600 font-medium">Inactivo</span>
                            )}
                            {!ranch.isActive && (
                              <span className="ml-2 italic">
                                (No aparece en el selector principal)
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-6 border-t bg-gray-50">
            <p className="text-sm text-gray-600">
              💡 <strong>Tip:</strong> Los ranchos inactivos mantienen su historial y animales, 
              pero no aparecen en el selector del header. Útil para ranchos en transición o temporalmente fuera de servicio.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}