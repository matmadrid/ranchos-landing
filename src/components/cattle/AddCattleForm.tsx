// src/components/cattle/AddCattleForm.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import useRanchOSStore from '@/store';

interface AddCattleFormProps {
  onSuccess?: () => void;  // Callback opcional después de guardar
  hideCancel?: boolean;    // Ocultar botón cancelar
}

// Estructura preparada para multi-país
const BREED_OPTIONS = [
  // === RAZAS GLOBALES ===
  { value: 'Angus', label: 'Angus', type: 'beef', popular: ['MX', 'CO', 'BR', 'ES'] },
  { value: 'Hereford', label: 'Hereford', type: 'beef', popular: ['MX', 'CO', 'BR'] },
  { value: 'Charolais', label: 'Charolais', type: 'beef', popular: ['MX', 'CO', 'ES'] },
  { value: 'Simmental', label: 'Simmental', type: 'dual', popular: ['MX', 'CO', 'BR'] },
  { value: 'Holstein', label: 'Holstein', type: 'dairy', popular: ['MX', 'CO', 'BR', 'ES'] },
  { value: 'Jersey', label: 'Jersey', type: 'dairy', popular: ['MX', 'CO', 'BR'] },
  { value: 'Pardo Suizo', label: 'Pardo Suizo', type: 'dual', popular: ['MX', 'CO'] },
  { value: 'Limousin', label: 'Limousin', type: 'beef', popular: ['MX', 'ES'] },
  { value: 'Guernsey', label: 'Guernsey', type: 'dairy', popular: ['MX', 'CO'] },
  { value: 'Ayrshire', label: 'Ayrshire', type: 'dairy', popular: ['MX', 'CO'] },
  
  // === RAZAS CEBUINAS (Populares en América Latina) ===
  { value: 'Brahman', label: 'Brahman', type: 'beef', popular: ['MX', 'CO', 'BR'] },
  { value: 'Nelore', label: 'Nelore', type: 'beef', popular: ['BR', 'MX', 'CO'] },
  { value: 'Gyr', label: 'Gyr', type: 'dairy', popular: ['BR', 'MX', 'CO'] },
  { value: 'Guzerat', label: 'Guzerá/Guzerat', type: 'dual', popular: ['BR', 'MX', 'CO'] },
  { value: 'Indubrasil', label: 'Indubrasil', type: 'beef', popular: ['BR', 'MX'] },
  { value: 'Tabapuã', label: 'Tabapuã', type: 'beef', popular: ['BR'] },
  
  // === RAZAS MEXICANAS 🇲🇽 ===
  { value: 'Criollo', label: 'Criollo', type: 'dual', popular: ['MX', 'CO'] },
  { value: 'Beefmaster', label: 'Beefmaster', type: 'beef', popular: ['MX'] },
  { value: 'Cebú Mexicano', label: 'Cebú Mexicano', type: 'beef', popular: ['MX'] },
  
  // === RAZAS COLOMBIANAS 🇨🇴 ===
  { value: 'Normando', label: 'Normando', type: 'dual', popular: ['CO'] },
  { value: 'Romosinuano', label: 'Romosinuano', type: 'beef', popular: ['CO'] },
  { value: 'Sanmartinero', label: 'Sanmartinero', type: 'beef', popular: ['CO'] },
  { value: 'Blanco Orejinegro', label: 'Blanco Orejinegro (BON)', type: 'dual', popular: ['CO'] },
  
  // === RAZAS BRASILEÑAS 🇧🇷 ===
  { value: 'Senepol', label: 'Senepol', type: 'beef', popular: ['BR', 'MX'] },
  { value: 'Canchim', label: 'Canchim', type: 'beef', popular: ['BR'] },
  { value: 'Pitangueiras', label: 'Pitangueiras', type: 'beef', popular: ['BR'] },
  
  // === RAZAS ESPAÑOLAS 🇪🇸 ===
  { value: 'Avileña', label: 'Avileña-Negra Ibérica', type: 'beef', popular: ['ES'] },
  { value: 'Asturiana', label: 'Asturiana de los Valles', type: 'beef', popular: ['ES'] },
  { value: 'Retinta', label: 'Retinta', type: 'beef', popular: ['ES'] },
  { value: 'Rubia Gallega', label: 'Rubia Gallega', type: 'beef', popular: ['ES'] },
  { value: 'Limusina', label: 'Limusina', type: 'beef', popular: ['ES'] },
  { value: 'Charolesa', label: 'Charolesa', type: 'beef', popular: ['ES'] },
  
  // === RAZAS AUSTRALIANAS 🇦🇺 (Importadas a México) ===
  { value: 'Droughtmaster', label: 'Droughtmaster', type: 'beef', popular: ['MX', 'BR'] },
  { value: 'Murray Grey', label: 'Murray Grey', type: 'beef', popular: ['MX'] },
  { value: 'Australian Lowline', label: 'Australian Lowline', type: 'beef', popular: ['MX'] },
  { value: 'Belmont Red', label: 'Belmont Red', type: 'beef', popular: ['MX', 'BR'] },
  { value: 'Illawarra', label: 'Illawarra', type: 'dairy', popular: ['MX'] },
  { value: 'Australian Braford', label: 'Australian Braford', type: 'beef', popular: ['MX', 'BR'] },
  { value: 'Santa Gertrudis', label: 'Santa Gertrudis', type: 'beef', popular: ['MX', 'BR'] },
  
  // === CRUCES POPULARES ===
  { value: 'Brangus', label: 'Brangus (Brahman x Angus)', type: 'beef', popular: ['MX', 'CO', 'BR'] },
  { value: 'Braford', label: 'Braford (Brahman x Hereford)', type: 'beef', popular: ['BR', 'MX'] },
  { value: 'Simbrah', label: 'Simbrah (Simmental x Brahman)', type: 'beef', popular: ['MX', 'CO'] },
  { value: 'F1 Lechero', label: 'F1 Lechero', type: 'dairy', popular: ['MX', 'CO'] },
  { value: 'Suizo x Cebú', label: 'Suizo x Cebú', type: 'dual', popular: ['MX', 'CO'] },
  { value: 'Holstein x Cebú', label: 'Holstein x Cebú', type: 'dairy', popular: ['MX', 'CO', 'BR'] },
  
  // === OPCIÓN GENERAL ===
  { value: 'Otra', label: 'Otra', type: 'other', popular: ['ALL'] }
];

// FUTURO: Función para filtrar por país
export const getBreedsByCountry = (countryCode: string): typeof BREED_OPTIONS => {
  if (countryCode === 'ALL') return BREED_OPTIONS;
  
  return BREED_OPTIONS.filter(breed => 
    breed.popular.includes(countryCode) || breed.popular.includes('ALL')
  );
};

// FUTURO: Configuración de país (preparación)
interface CountryConfig {
  code: string;
  name: string;
  currency: string;
  defaultBreeds?: string[];
  regulations?: {
    traceability: string;
    sanitary: string;
  };
}

// Preparación para futura expansión
const COUNTRY_CONFIGS: Record<string, CountryConfig> = {
  MX: {
    code: 'MX',
    name: 'México',
    currency: 'MXN',
    regulations: {
      traceability: 'SINIIGA',
      sanitary: 'SENASICA'
    }
  },
  CO: {
    code: 'CO',
    name: 'Colombia',
    currency: 'COP',
    regulations: {
      traceability: 'SINIGAN',
      sanitary: 'ICA'
    }
  },
  BR: {
    code: 'BR',
    name: 'Brasil',
    currency: 'BRL',
    regulations: {
      traceability: 'SISBOV',
      sanitary: 'MAPA'
    }
  },
  ES: {
    code: 'ES',
    name: 'España',
    currency: 'EUR',
    regulations: {
      traceability: 'SITRAN',
      sanitary: 'MAPA'
    }
  }
};

export default function AddCattleForm({ onSuccess, hideCancel = false }: AddCattleFormProps) {
  const router = useRouter();
  const addCattle = useRanchOSStore((state) => state.addCattle);
  const activeRanch = useRanchOSStore((state) => state.activeRanch);
  
  const [formData, setFormData] = useState({
    tag: '',
    name: '',
    breed: '',
    sex: 'female' as 'male' | 'female',
    birthDate: '',
    weight: '',
    healthStatus: 'good' as 'excellent' | 'good' | 'fair' | 'poor',
    location: '',
    motherTag: '',
    fatherTag: '',
    notes: ''
  });

  // Si no hay rancho activo, mostrar mensaje
  if (!activeRanch?.id || !activeRanch) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 mb-4">
          Primero debes crear o seleccionar un rancho
        </p>
        <button
          onClick={() => router.push('/profile')}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          Ir a Configuración
        </button>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Agregar el animal al rancho activo
    addCattle({
      ...formData,
      weight: formData.weight ? parseFloat(formData.weight) : undefined,
      ranchId: activeRanch?.id // Asociar con el rancho activo
    });

    // Limpiar formulario
    setFormData({
      tag: '',
      name: '',
      breed: '',
      sex: 'female',
      birthDate: '',
      weight: '',
      healthStatus: 'good',
      location: '',
      motherTag: '',
      fatherTag: '',
      notes: ''
    });

    // Si hay callback onSuccess, usarlo. Si no, ir al dashboard
    if (onSuccess) {
      onSuccess();
    } else {
      router.push('/dashboard');
    }
  };

  // Función para obtener el indicador de país de una raza
  const getCountryIndicator = (breed: typeof BREED_OPTIONS[0]) => {
    const indicators: string[] = [];
    if (breed.popular.includes('MX')) indicators.push('🇲🇽');
    if (breed.popular.includes('CO')) indicators.push('🇨🇴');
    if (breed.popular.includes('BR')) indicators.push('🇧🇷');
    if (breed.popular.includes('ES')) indicators.push('🇪🇸');
    return indicators.length > 0 ? ` ${indicators.join(' ')}` : '';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Indicador del rancho activo */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-sm text-green-800">
          Agregando animal a: <span className="font-semibold">{activeRanch.name}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Información Básica */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Información Básica</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número de Identificación *
            </label>
            <input
              type="text"
              required
              value={formData.tag}
              onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Ej: A001"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre (opcional)
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Ej: Bessie"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Raza *
            </label>
            <select
              required
              value={formData.breed}
              onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Selecciona una raza</option>
              {BREED_OPTIONS.map((breed) => (
                <option key={breed.value} value={breed.value}>
                  {breed.label}{getCountryIndicator(breed)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sexo *
            </label>
            <select
              value={formData.sex}
              onChange={(e) => setFormData({ ...formData, sex: e.target.value as 'male' | 'female' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="female">Hembra</option>
              <option value="male">Macho</option>
            </select>
          </div>
        </div>

        {/* Detalles Adicionales */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Detalles Adicionales</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de Nacimiento *
            </label>
            <input
              type="date"
              required
              value={formData.birthDate}
              onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Peso (kg)
            </label>
            <input
              type="number"
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Ej: 450"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado de Salud *
            </label>
            <select
              value={formData.healthStatus}
              onChange={(e) => setFormData({ ...formData, healthStatus: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="excellent">Excelente</option>
              <option value="good">Buena</option>
              <option value="fair">Regular</option>
              <option value="poor">Mala</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ubicación en el Rancho
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Ej: Corral A"
            />
          </div>
        </div>
      </div>

      {/* Genealogía */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Genealogía</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número de la Madre
            </label>
            <input
              type="text"
              value={formData.motherTag}
              onChange={(e) => setFormData({ ...formData, motherTag: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Ej: B023"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número del Padre
            </label>
            <input
              type="text"
              value={formData.fatherTag}
              onChange={(e) => setFormData({ ...formData, fatherTag: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Ej: C015"
            />
          </div>
        </div>
      </div>

      {/* Notas */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notas Adicionales
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Cualquier información adicional..."
        />
      </div>

      {/* Botones */}
      <div className="flex justify-end gap-4">
        {!hideCancel && (
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          Agregar Animal
        </button>
      </div>
    </form>
  );
}