'use client';

import React, { useState } from 'react';
import BaseModal from './BaseModal';
import { 
  PieChart, Pie, Cell, BarChart, Bar, ResponsiveContainer, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { 
  Users, Award, TrendingUp, DollarSign, 
  Heart, Activity, Filter, Star
} from 'lucide-react';

interface BreedModalProps {
  isOpen: boolean;
  onClose: () => void;
  topBreed: {
    name: string;
    count: number;
  };
}

export default function BreedModal({ 
  isOpen, 
  onClose, 
  topBreed 
}: BreedModalProps) {
  const [selectedView, setSelectedView] = useState('distribution');

  // Mock data para análisis de razas
  const breedData = [
    { 
      name: 'Holstein', 
      count: 2, 
      percentage: 40,
      avgProduction: 28.5,
      avgWeight: 550,
      healthIndex: 92,
      reproductiveRate: 85,
      feedEfficiency: 1.4,
      color: '#10b981'
    },
    { 
      name: 'Jersey', 
      count: 1, 
      percentage: 20,
      avgProduction: 22.0,
      avgWeight: 400,
      healthIndex: 95,
      reproductiveRate: 88,
      feedEfficiency: 1.6,
      color: '#3b82f6'
    },
    { 
      name: 'Angus', 
      count: 1, 
      percentage: 20,
      avgProduction: 15.0,
      avgWeight: 650,
      healthIndex: 88,
      reproductiveRate: 82,
      feedEfficiency: 1.2,
      color: '#8b5cf6'
    },
    { 
      name: 'Brahman', 
      count: 1, 
      percentage: 20,
      avgProduction: 18.0,
      avgWeight: 580,
      healthIndex: 90,
      reproductiveRate: 79,
      feedEfficiency: 1.3,
      color: '#f59e0b'
    }
  ];

  const performanceMetrics = breedData.map(breed => ({
    breed: breed.name,
    Producción: Math.round((breed.avgProduction / 30) * 100),
    Salud: breed.healthIndex,
    Reproducción: breed.reproductiveRate,
    Eficiencia: Math.round(breed.feedEfficiency * 50),
    Peso: Math.round((breed.avgWeight / 700) * 100)
  }));

  const economicImpact = [
    { breed: 'Holstein', revenue: 1250, cost: 890, profit: 360 },
    { breed: 'Jersey', revenue: 950, cost: 680, profit: 270 },
    { breed: 'Angus', revenue: 800, cost: 750, profit: 50 },
    { breed: 'Brahman', revenue: 750, cost: 720, profit: 30 }
  ];

  const breedCharacteristics = {
    Holstein: {
      origin: 'Holanda',
      speciality: 'Alta producción lechera',
      advantages: ['Máxima producción de leche', 'Adaptabilidad', 'Longevidad'],
      considerations: ['Mayor consumo de alimento', 'Sensible al calor']
    },
    Jersey: {
      origin: 'Reino Unido',
      speciality: 'Calidad de leche superior',
      advantages: ['Leche con alto contenido graso', 'Eficiencia alimentaria', 'Resistencia'],
      considerations: ['Menor volumen de producción', 'Tamaño pequeño']
    },
    Angus: {
      origin: 'Escocia',
      speciality: 'Carne de calidad premium',
      advantages: ['Carne marmoleada', 'Facilidad de parto', 'Rusticidad'],
      considerations: ['Menor producción lechera', 'Mayor peso corporal']
    },
    Brahman: {
      origin: 'India',
      speciality: 'Resistencia a clima tropical',
      advantages: ['Tolerancia al calor', 'Resistencia a parásitos', 'Longevidad'],
      considerations: ['Temperamento variable', 'Menor producción lechera']
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Análisis de Razas - Predominante: ${topBreed.name}`}
      size="xl"
    >
      {/* Selector de vista */}
      <div className="flex gap-2 mb-6">
        {[
          { id: 'distribution', label: 'Distribución', icon: Users },
          { id: 'performance', label: 'Rendimiento', icon: TrendingUp },
          { id: 'economics', label: 'Económico', icon: DollarSign },
          { id: 'details', label: 'Características', icon: Star }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setSelectedView(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              selectedView === id 
                ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Vista: Distribución */}
      {selectedView === 'distribution' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Distribución por Raza</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={breedData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="count"
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                  >
                    {breedData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Producción por Raza</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={breedData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip />
                  <Bar dataKey="avgProduction" fill="#10b981" name="L/día" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Vista: Rendimiento */}
      {selectedView === 'performance' && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Comparativa de Rendimiento</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={performanceMetrics}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis dataKey="breed" tick={{ fontSize: 12 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
                  {breedData.map((breed, index) => (
                    <Radar
                      key={breed.name}
                      name={breed.name}
                      dataKey={breed.name}
                      stroke={breed.color}
                      fill={breed.color}
                      fillOpacity={0.1}
                      strokeWidth={2}
                    />
                  ))}
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {breedData.map((breed) => (
              <div key={breed.name} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: breed.color }}
                  />
                  <h4 className="font-semibold">{breed.name}</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Producción:</span>
                    <span className="font-medium">{breed.avgProduction} L</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Peso:</span>
                    <span className="font-medium">{breed.avgWeight} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Salud:</span>
                    <span className="font-medium">{breed.healthIndex}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vista: Económico */}
      {selectedView === 'economics' && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Análisis Económico por Raza</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={economicImpact}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="breed" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" fill="#10b981" name="Ingresos" />
                  <Bar dataKey="cost" fill="#ef4444" name="Costos" />
                  <Bar dataKey="profit" fill="#3b82f6" name="Ganancia" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {economicImpact.map((data) => (
              <div key={data.breed} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold mb-3">{data.breed}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Ingresos:</span>
                    <span className="font-medium text-green-600">${data.revenue}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Costos:</span>
                    <span className="font-medium text-red-600">${data.cost}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-medium">Ganancia:</span>
                    <span className="font-bold text-blue-600">${data.profit}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vista: Características */}
      {selectedView === 'details' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Object.entries(breedCharacteristics).map(([breed, info]) => (
            <div key={breed} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: breedData.find(b => b.name === breed)?.color }}
                />
                <h3 className="text-lg font-semibold">{breed}</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <span className="text-sm font-medium text-gray-600">Origen:</span>
                  <p className="text-gray-900">{info.origin}</p>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-600">Especialidad:</span>
                  <p className="text-gray-900">{info.speciality}</p>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-600">Ventajas:</span>
                  <ul className="list-disc list-inside text-sm text-gray-700 mt-1">
                    {info.advantages.map((advantage, idx) => (
                      <li key={idx}>{advantage}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-600">Consideraciones:</span>
                  <ul className="list-disc list-inside text-sm text-gray-700 mt-1">
                    {info.considerations.map((consideration, idx) => (
                      <li key={idx}>{consideration}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </BaseModal>
  );
}
