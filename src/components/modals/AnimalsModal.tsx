// src/components/modals/AnimalsModal.tsx
'use client';

import React, { useState } from 'react';
import BaseModal from './BaseModal';
import { Users, Search, Heart, Calendar, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Animal {
  id: string;
  name: string;
  breed: string;
  age: number;
  gender: 'Hembra' | 'Macho';
  weight: number;
  health: 'Excelente' | 'Buena' | 'Regular' | 'Mala';
  location: string;
  production: number;
  lastCheckup: string;
}

interface AnimalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalAnimals: number;
  femaleCount: number;
  maleCount: number;
}

export default function AnimalsModal({ 
  isOpen, 
  onClose, 
  totalAnimals, 
  femaleCount, 
  maleCount 
}: AnimalsModalProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data profesional
  const mockAnimals: Animal[] = Array.from({ length: totalAnimals }, (_, i) => ({
    id: `A${String(i + 1).padStart(3, '0')}`,
    name: `${['Bonita', 'Luna', 'Estrella', 'Rosa', 'Toro', 'Zeus', 'Max', 'Bruno'][i % 8]} #${i + 1}`,
    breed: ['Holstein', 'Jersey', 'Angus', 'Brahman'][i % 4],
    age: Math.floor(Math.random() * 8) + 1,
    gender: i < femaleCount ? 'Hembra' : 'Macho',
    weight: Math.floor(Math.random() * 300) + 400,
    health: ['Excelente', 'Buena', 'Regular', 'Mala'][Math.floor(Math.random() * 4)] as any,
    location: `Sector ${Math.floor(i / 3) + 1}`,
    production: Math.floor(Math.random() * 30) + 15,
    lastCheckup: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES')
  }));

  const filteredAnimals = mockAnimals.filter(animal => 
    animal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    animal.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    animal.breed.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getHealthColor = (health: string) => {
    switch(health) {
      case 'Excelente': return 'text-green-600 bg-green-100';
      case 'Buena': return 'text-blue-600 bg-blue-100';
      case 'Regular': return 'text-yellow-600 bg-yellow-100';
      case 'Mala': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Total de Animales (${totalAnimals})`}
      size="xl"
    >
      {/* Estadísticas */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-pink-50 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-pink-600" />
            <span className="font-medium text-pink-600">Hembras</span>
          </div>
          <div className="text-2xl font-bold text-pink-700 mt-1">{femaleCount}</div>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-blue-600">Machos</span>
          </div>
          <div className="text-2xl font-bold text-blue-700 mt-1">{maleCount}</div>
        </div>
      </div>

      {/* Búsqueda */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por ID, nombre o raza..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Lista de animales */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredAnimals.map((animal) => (
          <div
            key={animal.id}
            className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-gray-900">{animal.name}</h3>
                  <span className="text-sm text-gray-500">ID: {animal.id}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getHealthColor(animal.health)}`}>
                    {animal.health}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Raza:</span>
                    <div className="font-medium">{animal.breed}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Género:</span>
                    <div className="font-medium">{animal.gender}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Edad:</span>
                    <div className="font-medium">{animal.age} años</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Peso:</span>
                    <div className="font-medium">{animal.weight} kg</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {animal.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {animal.lastCheckup}
                  </div>
                  {animal.gender === 'Hembra' && (
                    <div className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      {animal.production} L/día
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </BaseModal>
  );
}
