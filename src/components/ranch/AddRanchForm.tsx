'use client';

import React, { useState } from 'react';
import { Building2, MapPin, Trees, FileText } from 'lucide-react';
import useRanchOSStore from '@/store';

interface AddRanchFormProps {
  onClose?: () => void;
  onSuccess?: () => void;
}

export default function AddRanchForm({ onClose, onSuccess }: AddRanchFormProps) {
  const addRanch = useRanchOSStore((state) => state.addRanch);
  const currentCountry = useRanchOSStore((state) => state.currentCountry);
  const unitSystem = useRanchOSStore((state) => state.unitSystem);
  
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    size: '',
    type: 'mixed' as 'dairy' | 'beef' | 'mixed',
    description: '',
    isActive: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación básica
    if (!formData.name || !formData.location) {
      alert('Por favor complete los campos requeridos');
      return;
    }

    // Agregar rancho
    addRanch({
      name: formData.name,
      location: formData.location,
      size: formData.size ? parseFloat(formData.size) : 0,
      countryCode: currentCountry,
      sizeUnit: unitSystem.area,
      type: formData.type,
      description: formData.description,
      isActive: true
    });

    // Limpiar formulario
    setFormData({
      name: '',
      location: '',
      size: '',
      type: 'mixed',
      description: '',
      isActive: true
    });

    // Callbacks
    if (onSuccess) onSuccess();
    if (onClose) onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {/* Nombre del Rancho */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
            <Building2 className="w-4 h-4" />
            Nombre del Rancho *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Ej: Rancho Los Álamos"
            required
          />
        </div>

        {/* Ubicación */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
            <MapPin className="w-4 h-4" />
            Ubicación *
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Ej: Mexicali, Baja California"
            required
          />
        </div>

        {/* Tamaño y Tipo */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
              <Trees className="w-4 h-4" />
              Tamaño ({unitSystem.area === 'hectare' ? 'hectáreas' : 'acres'})
            </label>
            <input
              type="number"
              value={formData.size}
              onChange={(e) => setFormData({ ...formData, size: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Opcional"
              min="0"
              step="0.1"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Tipo de Rancho
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as 'dairy' | 'beef' | 'mixed' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="dairy">Lechero</option>
              <option value="beef">Cárnico</option>
              <option value="mixed">Mixto</option>
            </select>
          </div>
        </div>

        {/* Descripción */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
            <FileText className="w-4 h-4" />
            Descripción
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Descripción opcional del rancho..."
            rows={3}
          />
        </div>
      </div>

      {/* Botones */}
      <div className="flex justify-end gap-3 pt-4">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          Agregar Rancho
        </button>
      </div>
    </form>
  );
}
