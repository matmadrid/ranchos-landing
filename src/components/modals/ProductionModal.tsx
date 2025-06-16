'use client';

import React, { useState } from 'react';
import BaseModal from './BaseModal';
import { 
  BarChart, Bar, LineChart, Line, ResponsiveContainer, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell
} from 'recharts';
import { 
  Droplets, TrendingUp, Calendar, Clock, 
  Thermometer, Target, Filter
} from 'lucide-react';

interface ProductionModalProps {
  isOpen: boolean;
  onClose: () => void;
  avgProduction: number;
  totalProduction: number;
}

export default function ProductionModal({ 
  isOpen, 
  onClose, 
  avgProduction, 
  totalProduction 
}: ProductionModalProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('7days');

  // Mock data para análisis detallado de producción
  const dailyProduction = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return {
      date: date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' }),
      morning: Math.floor(Math.random() * 50) + 120,
      afternoon: Math.floor(Math.random() * 40) + 100,
      evening: Math.floor(Math.random() * 30) + 80,
      temperature: Math.floor(Math.random() * 8) + 20,
      humidity: Math.floor(Math.random() * 20) + 60
    };
  }).map(day => ({
    ...day,
    total: day.morning + day.afternoon + day.evening
  }));

  const milkQualityData = [
    { metric: 'Grasa', value: 3.8, unit: '%', color: '#10b981' },
    { metric: 'Proteína', value: 3.2, unit: '%', color: '#3b82f6' },
    { metric: 'Lactosa', value: 4.9, unit: '%', color: '#8b5cf6' },
    { metric: 'SCC', value: 185, unit: 'k/ml', color: '#f59e0b' }
  ];

  const shiftDistribution = [
    { name: 'Mañana', value: 45, color: '#10b981' },
    { name: 'Tarde', value: 35, color: '#3b82f6' },
    { name: 'Noche', value: 20, color: '#8b5cf6' }
  ];

  const topProducers = [
    { name: 'Luna #2', production: 28, breed: 'Jersey', trend: 'up' },
    { name: 'Bonita #1', production: 26, breed: 'Holstein', trend: 'stable' },
    { name: 'Estrella #3', production: 24, breed: 'Angus', trend: 'up' },
    { name: 'Rosa #4', production: 22, breed: 'Holstein', trend: 'down' },
  ];

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Análisis Detallado de Producción"
      size="xl"
    >
      {/* Estadísticas principales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Droplets className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-blue-600">Promedio Diario</span>
          </div>
          <div className="text-2xl font-bold text-blue-700">{avgProduction} L</div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-5 w-5 text-green-600" />
            <span className="font-medium text-green-600">Total Período</span>
          </div>
          <div className="text-2xl font-bold text-green-700">{totalProduction} L</div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            <span className="font-medium text-purple-600">Mejor Día</span>
          </div>
          <div className="text-2xl font-bold text-purple-700">485 L</div>
        </div>

        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-5 w-5 text-orange-600" />
            <span className="font-medium text-orange-600">Eficiencia</span>
          </div>
          <div className="text-2xl font-bold text-orange-700">92%</div>
        </div>
      </div>

      {/* Gráfico principal */}
      <div className="mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Producción por Turno (Últimos 7 días)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyProduction}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px' 
                  }}
                />
                <Legend />
                <Bar dataKey="morning" stackId="a" fill="#10b981" name="Mañana" />
                <Bar dataKey="afternoon" stackId="a" fill="#3b82f6" name="Tarde" />
                <Bar dataKey="evening" stackId="a" fill="#8b5cf6" name="Noche" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Análisis secundarios */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Calidad de leche */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Calidad de Leche</h3>
          <div className="space-y-4">
            {milkQualityData.map((metric) => (
              <div key={metric.metric} className="flex items-center justify-between">
                <span className="text-gray-600">{metric.metric}</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full" 
                      style={{ 
                        backgroundColor: metric.color,
                        width: `${(metric.value / (metric.metric === 'SCC' ? 400 : 10)) * 100}%`
                      }}
                    />
                  </div>
                  <span className="font-medium">{metric.value}{metric.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Distribución por turno */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Distribución por Turno</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={shiftDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {shiftDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top productores */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Top Productores</h3>
        <div className="space-y-3">
          {topProducers.map((producer, index) => (
            <div key={producer.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                  {index + 1}
                </div>
                <div>
                  <div className="font-medium">{producer.name}</div>
                  <div className="text-sm text-gray-500">{producer.breed}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{producer.production} L/día</span>
                <div className={`p-1 rounded ${
                  producer.trend === 'up' ? 'text-green-600 bg-green-100' :
                  producer.trend === 'down' ? 'text-red-600 bg-red-100' :
                  'text-gray-600 bg-gray-100'
                }`}>
                  <TrendingUp className="h-4 w-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </BaseModal>
  );
}
