// src/components/analytics/AnalyticsStats.tsx
'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus, Download } from 'lucide-react';

interface StatsData {
  totalAnimals: number;
  femaleCount: number;
  maleCount: number;
  avgProduction: number;
  totalProduction: number;
  topBreed: { name: string; count: number };
  avgWeight: number;
  healthDistribution: {
    excellent: number;
    good: number;
    fair: number;
    poor: number;
  };
}

interface AnalyticsStatsProps {
  stats: StatsData;
  onExport?: () => void;
}

export default function AnalyticsStats({ stats, onExport }: AnalyticsStatsProps) {
  const getTrendIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (value < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const getHealthPercentage = (status: keyof typeof stats.healthDistribution) => {
    if (stats.totalAnimals === 0) return 0;
    return ((stats.healthDistribution[status] / stats.totalAnimals) * 100).toFixed(1);
  };

  return (
    <div className="space-y-6">
      {/* Header con botón de exportación */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Estadísticas Generales</h2>
      </div>

      {/* Grid de métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total de Animales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAnimals}</div>
            <div className="text-sm text-gray-600 mt-1">
              {stats.femaleCount} hembras, {stats.maleCount} machos
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Producción Promedio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgProduction.toFixed(1)} L</div>
            <div className="text-sm text-gray-600 mt-1">
              Por vaca/día
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Raza Predominante
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.topBreed.name}</div>
            <div className="text-sm text-gray-600 mt-1">
              {stats.topBreed.count} animales
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Peso Promedio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgWeight.toFixed(0)} kg</div>
            <div className="text-sm text-gray-600 mt-1">
              Todos los animales
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Distribución de salud */}
      <Card>
        <CardHeader>
          <CardTitle>Estado de Salud del Ganado</CardTitle>
          <CardDescription>
            Distribución porcentual del estado de salud
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Excelente</span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${getHealthPercentage('excellent')}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-12 text-right">
                  {getHealthPercentage('excellent')}%
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Buena</span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${getHealthPercentage('good')}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-12 text-right">
                  {getHealthPercentage('good')}%
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Regular</span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-500 h-2 rounded-full"
                    style={{ width: `${getHealthPercentage('fair')}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-12 text-right">
                  {getHealthPercentage('fair')}%
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Mala</span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full"
                    style={{ width: `${getHealthPercentage('poor')}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-12 text-right">
                  {getHealthPercentage('poor')}%
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}