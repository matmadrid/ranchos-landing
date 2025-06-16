'use client';

import React, { useState } from 'react';
import BaseModal from './BaseModal';
import { 
  BarChart, Bar, LineChart, Line, AreaChart, Area, 
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ScatterChart, Scatter
} from 'recharts';
import { 
  Scale, TrendingUp, Calendar, Target, 
  Activity, Award, Filter, AlertCircle
} from 'lucide-react';

interface WeightModalProps {
  isOpen: boolean;
  onClose: () => void;
  avgWeight: number;
}

export default function WeightModal({ 
  isOpen, 
  onClose, 
  avgWeight 
}: WeightModalProps) {
  const [selectedView, setSelectedView] = useState('distribution');

  // Mock data para análisis de peso
  const weightDistribution = [
    { range: '300-400 kg', count: 1, percentage: 20, category: 'Bajo', color: '#ef4444' },
    { range: '400-500 kg', count: 1, percentage: 20, category: 'Normal', color: '#f59e0b' },
    { range: '500-600 kg', count: 2, percentage: 40, category: 'Óptimo', color: '#10b981' },
    { range: '600-700 kg', count: 1, percentage: 20, category: 'Alto', color: '#3b82f6' }
  ];

  const weightTrends = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (11 - i));
    return {
      month: date.toLocaleDateString('es-ES', { month: 'short' }),
      avgWeight: 450 + (i * 15) + Math.random() * 20,
      targetWeight: 500 + (i * 10),
      feedIntake: 12 + (i * 0.5) + Math.random() * 2
    };
  });

  const animalWeights = [
    { 
      id: 'A001', 
      name: 'Bonita #1', 
      currentWeight: 408, 
      targetWeight: 450, 
      age: 8, 
      breed: 'Holstein',
      weightGain: 2.1,
      bodyCondition: 3.2,
      nutritionScore: 85
    },
    { 
      id: 'A002', 
      name: 'Luna #2', 
      currentWeight: 507, 
      targetWeight: 520, 
      age: 1, 
      breed: 'Jersey',
      weightGain: 1.8,
      bodyCondition: 3.8,
      nutritionScore: 92
    },
    { 
      id: 'A003', 
      name: 'Estrella #3', 
      currentWeight: 529, 
      targetWeight: 550, 
      age: 1, 
      breed: 'Angus',
      weightGain: -0.5,
      bodyCondition: 2.9,
      nutritionScore: 78
    },
    { 
      id: 'A004', 
      name: 'Rosa #4', 
      currentWeight: 485, 
      targetWeight: 500, 
      age: 2, 
      breed: 'Holstein',
      weightGain: 1.2,
      bodyCondition: 3.5,
      nutritionScore: 88
    },
    { 
      id: 'A005', 
      name: 'Toro #5', 
      currentWeight: 645, 
      targetWeight: 700, 
      age: 3, 
      breed: 'Brahman',
      weightGain: 3.2,
      bodyCondition: 4.1,
      nutritionScore: 82
    }
  ];

  const nutritionMetrics = [
    { metric: 'Proteína Diaria', current: 2.1, target: 2.5, unit: 'kg', status: 'warning' },
    { metric: 'Energía', current: 18.5, target: 20.0, unit: 'Mcal', status: 'good' },
    { metric: 'Fibra', current: 6.8, target: 7.0, unit: 'kg', status: 'good' },
    { metric: 'Minerales', current: 0.85, target: 1.0, unit: 'kg', status: 'warning' }
  ];

  const getWeightStatus = (current: number, target: number) => {
    const percentage = (current / target) * 100;
    if (percentage >= 95 && percentage <= 105) return { status: 'optimal', color: 'text-green-600 bg-green-100' };
    if (percentage >= 85 && percentage < 95) return { status: 'low', color: 'text-yellow-600 bg-yellow-100' };
    if (percentage > 105) return { status: 'high', color: 'text-blue-600 bg-blue-100' };
    return { status: 'critical', color: 'text-red-600 bg-red-100' };
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Análisis de Peso - Promedio: ${avgWeight} kg`}
      size="xl"
    >
      {/* Selector de vista */}
      <div className="flex gap-2 mb-6">
        {[
          { id: 'distribution', label: 'Distribución', icon: Scale },
          { id: 'trends', label: 'Tendencias', icon: TrendingUp },
          { id: 'individual', label: 'Individual', icon: Target },
          { id: 'nutrition', label: 'Nutrición', icon: Activity }
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
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Distribución de Pesos</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weightDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="range" stroke="#6b7280" angle={-45} textAnchor="end" height={80} />
                    <YAxis stroke="#6b7280" />
                    <Tooltip />
                    <Bar dataKey="count" fill="#10b981" name="Cantidad de Animales" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Categorías de Peso</h3>
              <div className="space-y-4">
                {weightDistribution.map((item) => (
                  <div key={item.range} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <div>
                        <span className="font-medium">{item.category}</span>
                        <div className="text-sm text-gray-500">{item.range}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{item.count} animales</div>
                      <div className="text-sm text-gray-500">{item.percentage}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-gray-900">{Math.min(...animalWeights.map(a => a.currentWeight))} kg</div>
              <div className="text-sm text-gray-600">Peso Mínimo</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-gray-900">{Math.max(...animalWeights.map(a => a.currentWeight))} kg</div>
              <div className="text-sm text-gray-600">Peso Máximo</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-gray-900">{avgWeight} kg</div>
              <div className="text-sm text-gray-600">Peso Promedio</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-gray-900">
                {Math.round(animalWeights.reduce((sum, a) => sum + a.weightGain, 0) / animalWeights.length * 10) / 10} kg
              </div>
              <div className="text-sm text-gray-600">Ganancia/Semana</div>
            </div>
          </div>
        </div>
      )}

      {/* Vista: Tendencias */}
      {selectedView === 'trends' && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Evolución del Peso Promedio</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weightTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="avgWeight" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    name="Peso Real"
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="targetWeight" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Peso Objetivo"
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Correlación Peso vs Consumo</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart data={weightTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="feedIntake" stroke="#6b7280" name="Consumo (kg/día)" />
                  <YAxis dataKey="avgWeight" stroke="#6b7280" name="Peso (kg)" />
                  <Tooltip />
                  <Scatter name="Datos" dataKey="avgWeight" fill="#8b5cf6" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Vista: Individual */}
      {selectedView === 'individual' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Análisis Individual de Pesos</h3>
          <div className="space-y-3">
            {animalWeights.map((animal) => {
              const weightStatus = getWeightStatus(animal.currentWeight, animal.targetWeight);
              return (
                <div key={animal.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-gray-900">{animal.name}</h4>
                        <span className="text-sm text-gray-500">ID: {animal.id}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${weightStatus.color}`}>
                          {animal.currentWeight} kg
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Raza:</span>
                          <div className="font-medium">{animal.breed}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Edad:</span>
                          <div className="font-medium">{animal.age} años</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Objetivo:</span>
                          <div className="font-medium">{animal.targetWeight} kg</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Ganancia/sem:</span>
                          <div className={`font-medium ${
                            animal.weightGain > 0 ? 'text-green-600' : 
                            animal.weightGain < 0 ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {animal.weightGain > 0 ? '+' : ''}{animal.weightGain} kg
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Activity className="h-4 w-4 text-gray-400" />
                          <span>Condición: {animal.bodyCondition}/5</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Target className="h-4 w-4 text-gray-400" />
                          <span>Nutrición: {animal.nutritionScore}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Vista: Nutrición */}
      {selectedView === 'nutrition' && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Métricas Nutricionales</h3>
            <div className="space-y-4">
              {nutritionMetrics.map((metric) => (
                <div key={metric.metric} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{metric.metric}</span>
                    {metric.status === 'warning' && (
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          metric.status === 'good' ? 'bg-green-500' : 'bg-yellow-500'
                        }`}
                        style={{ width: `${(metric.current / metric.target) * 100}%` }}
                      />
                    </div>
                    <span className="font-medium w-20 text-right">
                      {metric.current}/{metric.target} {metric.unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 mb-2">Recomendaciones</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Incrementar proteína para animales en crecimiento</li>
                <li>• Mantener fibra constante para digestión óptima</li>
                <li>• Suplementar minerales según análisis de suelo</li>
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">Próximos Controles</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Pesaje semanal: Lunes 17 Jun</li>
                <li>• Análisis corporal: Viernes 21 Jun</li>
                <li>• Revisión nutricional: Lunes 24 Jun</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </BaseModal>
  );
}
