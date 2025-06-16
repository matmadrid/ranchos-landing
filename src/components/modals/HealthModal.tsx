'use client';

import React, { useState } from 'react';
import BaseModal from './BaseModal';
import { 
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, AreaChart, Area
} from 'recharts';
import { 
  Heart, Shield, AlertTriangle, Calendar, 
  Activity, Thermometer, Stethoscope, Pill,
  CheckCircle, Clock, TrendingUp, Target
} from 'lucide-react';

interface HealthModalProps {
  isOpen: boolean;
  onClose: () => void;
  healthDistribution: {
    excellent: number;
    good: number;
    fair: number;
    poor: number;
  };
}

export default function HealthModal({ 
  isOpen, 
  onClose, 
  healthDistribution 
}: HealthModalProps) {
  const [selectedView, setSelectedView] = useState('overview');

  // Mock data para análisis de salud
  const healthStatusData = [
    { status: 'Excelente', count: healthDistribution.excellent, percentage: Math.round((healthDistribution.excellent / 5) * 100), color: '#10b981' },
    { status: 'Buena', count: healthDistribution.good, percentage: Math.round((healthDistribution.good / 5) * 100), color: '#3b82f6' },
    { status: 'Regular', count: healthDistribution.fair, percentage: Math.round((healthDistribution.fair / 5) * 100), color: '#f59e0b' },
    { status: 'Mala', count: healthDistribution.poor, percentage: Math.round((healthDistribution.poor / 5) * 100), color: '#ef4444' }
  ];

  const healthTrends = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (11 - i));
    return {
      month: date.toLocaleDateString('es-ES', { month: 'short' }),
      healthIndex: 85 + Math.random() * 10,
      vaccinations: Math.floor(Math.random() * 3),
      treatments: Math.floor(Math.random() * 2),
      mortality: Math.random() * 0.5
    };
  });

  const animalHealthDetails = [
    {
      id: 'A001',
      name: 'Bonita #1',
      status: 'Regular',
      lastCheckup: '2025-06-10',
      temperature: 38.8,
      heartRate: 65,
      issues: ['Revisión veterinaria pendiente'],
      nextVaccination: '2025-06-20',
      medications: ['Vitaminas'],
      riskLevel: 'Medium'
    },
    {
      id: 'A002', 
      name: 'Luna #2',
      status: 'Excelente',
      lastCheckup: '2025-06-12',
      temperature: 38.5,
      heartRate: 62,
      issues: [],
      nextVaccination: '2025-07-15',
      medications: [],
      riskLevel: 'Low'
    },
    {
      id: 'A003',
      name: 'Estrella #3', 
      status: 'Mala',
      lastCheckup: '2025-06-08',
      temperature: 39.2,
      heartRate: 78,
      issues: ['Fiebre', 'Pérdida de apetito'],
      nextVaccination: '2025-06-18',
      medications: ['Antibiótico', 'Antiinflamatorio'],
      riskLevel: 'High'
    },
    {
      id: 'A004',
      name: 'Rosa #4',
      status: 'Buena', 
      lastCheckup: '2025-06-11',
      temperature: 38.6,
      heartRate: 64,
      issues: [],
      nextVaccination: '2025-07-01',
      medications: ['Suplemento mineral'],
      riskLevel: 'Low'
    },
    {
      id: 'A005',
      name: 'Toro #5',
      status: 'Buena',
      lastCheckup: '2025-06-09', 
      temperature: 38.7,
      heartRate: 68,
      issues: [],
      nextVaccination: '2025-06-25',
      medications: [],
      riskLevel: 'Low'
    }
  ];

  const vaccinationSchedule = [
    { vaccine: 'Brucelosis', date: '2025-06-18', animals: 2, status: 'pending' },
    { vaccine: 'Aftosa', date: '2025-06-20', animals: 1, status: 'pending' },
    { vaccine: 'IBR/BVD', date: '2025-06-25', animals: 1, status: 'pending' },
    { vaccine: 'Clostridiosis', date: '2025-07-01', animals: 1, status: 'scheduled' },
    { vaccine: 'Rabia', date: '2025-07-15', animals: 1, status: 'scheduled' }
  ];

  const healthMetrics = [
    { metric: 'Índice General', value: 89, target: 90, unit: '%', status: 'good' },
    { metric: 'Mortalidad', value: 0.5, target: 1.0, unit: '%', status: 'excellent' },
    { metric: 'Cobertura Vacunal', value: 95, target: 100, unit: '%', status: 'good' },
    { metric: 'Tratamientos Activos', value: 1, target: 0, unit: 'casos', status: 'warning' }
  ];

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Excelente': return 'text-green-600 bg-green-100';
      case 'Buena': return 'text-blue-600 bg-blue-100';
      case 'Regular': return 'text-yellow-600 bg-yellow-100';
      case 'Mala': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskColor = (risk: string) => {
    switch(risk) {
      case 'Low': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'High': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Análisis Integral de Salud"
      size="xl"
    >
      {/* Selector de vista */}
      <div className="flex gap-2 mb-6">
        {[
          { id: 'overview', label: 'Resumen', icon: Heart },
          { id: 'individual', label: 'Individual', icon: Stethoscope },
          { id: 'vaccinations', label: 'Vacunaciones', icon: Shield },
          { id: 'trends', label: 'Tendencias', icon: TrendingUp }
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

      {/* Vista: Resumen */}
      {selectedView === 'overview' && (
        <div className="space-y-6">
          {/* Métricas principales */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {healthMetrics.map((metric) => (
              <div key={metric.metric} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-4 w-4 text-gray-600" />
                  <span className="font-medium text-gray-600 text-sm">{metric.metric}</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{metric.value}{metric.unit}</div>
                <div className="text-xs text-gray-500">Meta: {metric.target}{metric.unit}</div>
              </div>
            ))}
          </div>

          {/* Gráficos principales */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Estado de Salud General</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={healthStatusData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="count"
                      label={({ status, percentage }) => `${status}: ${percentage}%`}
                    >
                      {healthStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Distribución por Estado</h3>
              <div className="space-y-4">
                {healthStatusData.map((item) => (
                  <div key={item.status} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-medium">{item.status}</span>
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

          {/* Alertas y próximas acciones */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Alertas Activas
              </h4>
              <div className="space-y-2 text-sm text-red-700">
                <div>• Estrella #3 - Fiebre alta, requiere atención inmediata</div>
                <div>• Bonita #1 - Revisión veterinaria pendiente</div>
                <div>• 2 vacunaciones vencidas próximamente</div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Próximas Actividades
              </h4>
              <div className="space-y-2 text-sm text-blue-700">
                <div>• Vacunación Brucelosis - 18 Jun (2 animales)</div>
                <div>• Control veterinario semanal - 17 Jun</div>
                <div>• Análisis de sangre - 20 Jun</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vista: Individual */}
      {selectedView === 'individual' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Estado de Salud Individual</h3>
          <div className="space-y-3">
            {animalHealthDetails.map((animal) => (
              <div key={animal.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-gray-900">{animal.name}</h4>
                      <span className="text-sm text-gray-500">ID: {animal.id}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(animal.status)}`}>
                        {animal.status}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(animal.riskLevel)}`}>
                        Riesgo {animal.riskLevel}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm mb-3">
                      <div>
                        <span className="text-gray-500">Temperatura:</span>
                        <div className={`font-medium ${animal.temperature > 39 ? 'text-red-600' : 'text-green-600'}`}>
                          {animal.temperature}°C
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">Frecuencia:</span>
                        <div className="font-medium">{animal.heartRate} bpm</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Último control:</span>
                        <div className="font-medium">{animal.lastCheckup}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Próxima vacuna:</span>
                        <div className="font-medium">{animal.nextVaccination}</div>
                      </div>
                    </div>

                    {animal.issues.length > 0 && (
                      <div className="mb-3">
                        <span className="text-sm font-medium text-red-600">Problemas activos:</span>
                        <ul className="text-sm text-red-700 mt-1">
                          {animal.issues.map((issue, idx) => (
                            <li key={idx}>• {issue}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {animal.medications.length > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <Pill className="h-4 w-4 text-blue-500" />
                        <span>Medicamentos: {animal.medications.join(', ')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vista: Vacunaciones */}
      {selectedView === 'vaccinations' && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Calendario de Vacunaciones</h3>
            <div className="space-y-3">
              {vaccinationSchedule.map((vaccination, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      vaccination.status === 'pending' ? 'bg-yellow-500' : 'bg-blue-500'
                    }`} />
                    <div>
                      <div className="font-medium">{vaccination.vaccine}</div>
                      <div className="text-sm text-gray-500">{vaccination.animals} animales</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{vaccination.date}</div>
                    <div className={`text-xs ${
                      vaccination.status === 'pending' ? 'text-yellow-600' : 'text-blue-600'
                    }`}>
                      {vaccination.status === 'pending' ? 'Pendiente' : 'Programado'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 mb-3">Vacunas al Día</h4>
              <div className="text-2xl font-bold text-green-600 mb-1">95%</div>
              <div className="text-sm text-green-700">4 de 5 animales con vacunas completas</div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-800 mb-3">Próximas en 7 días</h4>
              <div className="text-2xl font-bold text-yellow-600 mb-1">3</div>
              <div className="text-sm text-yellow-700">Vacunaciones programadas</div>
            </div>
          </div>
        </div>
      )}

      {/* Vista: Tendencias */}
      {selectedView === 'trends' && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Evolución del Índice de Salud</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={healthTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="healthIndex" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    name="Índice de Salud"
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Tratamientos por Mes</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={healthTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip />
                    <Bar dataKey="treatments" fill="#3b82f6" name="Tratamientos" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Vacunaciones por Mes</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={healthTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="vaccinations" 
                      stroke="#8b5cf6" 
                      fill="#8b5cf6" 
                      fillOpacity={0.6}
                      name="Vacunaciones"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
    </BaseModal>
  );
}
