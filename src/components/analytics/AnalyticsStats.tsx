// src/components/analytics/AnalyticsStats.tsx
'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus, Download, ChevronRight, Users, BarChart3, Scale, Award } from 'lucide-react';

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
  // 🚀 NUEVOS: Callbacks para drill-down
  onTotalAnimalsClick?: () => void;
  onProductionClick?: () => void;
  onBreedClick?: () => void;
  onWeightClick?: () => void;
  onHealthClick?: (status: string) => void;
}

export default function AnalyticsStats({ 
  stats, 
  onExport,
  onTotalAnimalsClick,
  onProductionClick,
  onBreedClick,
  onWeightClick,
  onHealthClick
}: AnalyticsStatsProps) {
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

      {/* Grid de métricas principales - AHORA INTERACTIVAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* 🚀 KPI 1: Total de Animales - INTERACTIVO */}
        <Card 
          className={`transition-all duration-200 ${
            onTotalAnimalsClick ? 'cursor-pointer hover:shadow-lg hover:scale-105 hover:border-blue-300' : ''
          }`}
          onClick={onTotalAnimalsClick}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Total de Animales
              </CardTitle>
              {onTotalAnimalsClick && <ChevronRight className="w-4 h-4 text-gray-400" />}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalAnimals}</div>
            <div className="text-sm text-gray-600 mt-1">
              {stats.femaleCount} hembras, {stats.maleCount} machos
            </div>
            {onTotalAnimalsClick && (
              <div className="text-xs text-blue-500 mt-2 font-medium">
                Clic para ver detalle →
              </div>
            )}
          </CardContent>
        </Card>

        {/* 🚀 KPI 2: Producción Promedio - INTERACTIVO */}
        <Card 
          className={`transition-all duration-200 ${
            onProductionClick ? 'cursor-pointer hover:shadow-lg hover:scale-105 hover:border-green-300' : ''
          }`}
          onClick={onProductionClick}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Producción Promedio
              </CardTitle>
              {onProductionClick && <ChevronRight className="w-4 h-4 text-gray-400" />}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.avgProduction.toFixed(1)} L</div>
            <div className="text-sm text-gray-600 mt-1">
              Por vaca/día
            </div>
            {onProductionClick && (
              <div className="text-xs text-green-500 mt-2 font-medium">
                Clic para ver detalle →
              </div>
            )}
          </CardContent>
        </Card>

        {/* 🚀 KPI 3: Raza Predominante - INTERACTIVO */}
        <Card 
          className={`transition-all duration-200 ${
            onBreedClick ? 'cursor-pointer hover:shadow-lg hover:scale-105 hover:border-purple-300' : ''
          }`}
          onClick={onBreedClick}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Award className="w-4 h-4" />
                Raza Predominante
              </CardTitle>
              {onBreedClick && <ChevronRight className="w-4 h-4 text-gray-400" />}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.topBreed.name}</div>
            <div className="text-sm text-gray-600 mt-1">
              {stats.topBreed.count} animales
            </div>
            {onBreedClick && (
              <div className="text-xs text-purple-500 mt-2 font-medium">
                Clic para ver distribución →
              </div>
            )}
          </CardContent>
        </Card>

        {/* 🚀 KPI 4: Peso Promedio - INTERACTIVO */}
        <Card 
          className={`transition-all duration-200 ${
            onWeightClick ? 'cursor-pointer hover:shadow-lg hover:scale-105 hover:border-orange-300' : ''
          }`}
          onClick={onWeightClick}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Scale className="w-4 h-4" />
                Peso Promedio
              </CardTitle>
              {onWeightClick && <ChevronRight className="w-4 h-4 text-gray-400" />}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.avgWeight.toFixed(0)} kg</div>
            <div className="text-sm text-gray-600 mt-1">
              Todos los animales
            </div>
            {onWeightClick && (
              <div className="text-xs text-orange-500 mt-2 font-medium">
                Clic para ver distribución →
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 🚀 Distribución de salud - TAMBIÉN INTERACTIVA */}
      <Card>
        <CardHeader>
          <CardTitle>Estado de Salud del Ganado</CardTitle>
          <CardDescription>
            Distribución porcentual del estado de salud {onHealthClick && '(clic en cualquier estado para detalle)'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Excelente */}
            <div 
              className={`flex items-center justify-between p-2 rounded-lg transition-all duration-200 ${
                onHealthClick ? 'cursor-pointer hover:bg-green-50 hover:shadow-sm' : ''
              }`}
              onClick={() => onHealthClick?.('excellent')}
            >
              <span className="text-sm font-medium">Excelente</span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getHealthPercentage('excellent')}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-12 text-right">
                  {getHealthPercentage('excellent')}%
                </span>
                {onHealthClick && <ChevronRight className="w-3 h-3 text-gray-400" />}
              </div>
            </div>

            {/* Buena */}
            <div 
              className={`flex items-center justify-between p-2 rounded-lg transition-all duration-200 ${
                onHealthClick ? 'cursor-pointer hover:bg-blue-50 hover:shadow-sm' : ''
              }`}
              onClick={() => onHealthClick?.('good')}
            >
              <span className="text-sm font-medium">Buena</span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getHealthPercentage('good')}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-12 text-right">
                  {getHealthPercentage('good')}%
                </span>
                {onHealthClick && <ChevronRight className="w-3 h-3 text-gray-400" />}
              </div>
            </div>

            {/* Regular */}
            <div 
              className={`flex items-center justify-between p-2 rounded-lg transition-all duration-200 ${
                onHealthClick ? 'cursor-pointer hover:bg-yellow-50 hover:shadow-sm' : ''
              }`}
              onClick={() => onHealthClick?.('fair')}
            >
              <span className="text-sm font-medium">Regular</span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getHealthPercentage('fair')}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-12 text-right">
                  {getHealthPercentage('fair')}%
                </span>
                {onHealthClick && <ChevronRight className="w-3 h-3 text-gray-400" />}
              </div>
            </div>

            {/* Mala */}
            <div 
              className={`flex items-center justify-between p-2 rounded-lg transition-all duration-200 ${
                onHealthClick ? 'cursor-pointer hover:bg-red-50 hover:shadow-sm' : ''
              }`}
              onClick={() => onHealthClick?.('poor')}
            >
              <span className="text-sm font-medium">Mala</span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getHealthPercentage('poor')}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-12 text-right">
                  {getHealthPercentage('poor')}%
                </span>
                {onHealthClick && <ChevronRight className="w-3 h-3 text-gray-400" />}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}