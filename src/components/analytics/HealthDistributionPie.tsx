// src/components/analytics/HealthDistributionPie.tsx
'use client';

import React from 'react';
import { Pie, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface HealthDistributionPieProps {
  healthDistribution: {
    excellent: number;
    good: number;
    fair: number;
    poor: number;
  };
  totalAnimals: number;
  type?: 'pie' | 'doughnut';
}

export default function HealthDistributionPie({ 
  healthDistribution, 
  totalAnimals,
  type = 'doughnut'
}: HealthDistributionPieProps) {
  
  // Preparar datos del gráfico
  const chartValues = [
    healthDistribution.excellent,
    healthDistribution.good,
    healthDistribution.fair,
    healthDistribution.poor
  ];

  const data = {
    labels: ['Excelente', 'Buena', 'Regular', 'Mala'],
    datasets: [
      {
        data: chartValues,
        backgroundColor: [
          '#10B981', // Verde para excelente
          '#3B82F6', // Azul para buena
          '#F59E0B', // Amarillo para regular
          '#EF4444'  // Rojo para mala
        ],
        borderColor: [
          '#059669',
          '#2563EB',
          '#D97706',
          '#DC2626'
        ],
        borderWidth: 2,
        hoverBorderWidth: 3,
        hoverOffset: 4
      }
    ]
  };

  const options: ChartOptions<typeof type> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed;
            const percentage = totalAnimals > 0 ? ((value / totalAnimals) * 100).toFixed(1) : '0.0';
            return `${label}: ${value} animales (${percentage}%)`;
          },
          afterLabel: (context) => {
            // Agregar información adicional según el estado de salud
            const healthTips: Record<string, string> = {
              'Excelente': '✅ Mantener el manejo actual',
              'Buena': '👍 Monitoreo rutinario',
              'Regular': '⚠️ Revisar alimentación y cuidados',
              'Mala': '🚨 Atención veterinaria urgente'
            };
            
            return healthTips[context.label] || '';
          }
        }
      }
    }
  };

  // Calcular estadísticas adicionales
  const healthyPercentage = totalAnimals > 0 
    ? (((healthDistribution.excellent + healthDistribution.good) / totalAnimals) * 100).toFixed(1)
    : '0.0';
  
  const atRiskPercentage = totalAnimals > 0
    ? (((healthDistribution.fair + healthDistribution.poor) / totalAnimals) * 100).toFixed(1)
    : '0.0';

  const ChartComponent = type === 'pie' ? Pie : Doughnut;

  return (
    <div className="space-y-6">
      {/* Estadísticas resumidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="text-sm text-green-600 font-medium">Animales Saludables</div>
          <div className="text-2xl font-bold text-green-700">
            {healthDistribution.excellent + healthDistribution.good}
          </div>
          <div className="text-sm text-green-600">{healthyPercentage}% del total</div>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <div className="text-sm text-yellow-600 font-medium">En Riesgo</div>
          <div className="text-2xl font-bold text-yellow-700">
            {healthDistribution.fair + healthDistribution.poor}
          </div>
          <div className="text-sm text-yellow-600">{atRiskPercentage}% del total</div>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="text-sm text-blue-600 font-medium">Total Evaluado</div>
          <div className="text-2xl font-bold text-blue-700">{totalAnimals}</div>
          <div className="text-sm text-blue-600">100% del ganado</div>
        </div>
      </div>

      {/* Gráfico de distribución */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Distribución de Estado de Salud</h3>
        <div className="h-80">
          <ChartComponent data={data} options={options} />
        </div>
        
        {/* Leyenda personalizada debajo del gráfico */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
          {data.labels.map((label, index) => {
            const value = chartValues[index];
            const percentage = totalAnimals > 0 ? ((value / totalAnimals) * 100).toFixed(1) : '0.0';
            const color = data.datasets[0].backgroundColor[index];
            
            return (
              <div key={label} className="flex items-center gap-2 text-sm">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span>{label}: {value} ({percentage}%)</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recomendaciones basadas en la distribución */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Alerta si hay muchos animales en mal estado */}
        {healthDistribution.poor > 0 && (
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-red-600 text-lg">🚨</span>
              <h4 className="font-semibold text-red-700">Atención Urgente</h4>
            </div>
            <p className="text-red-600 text-sm">
              {healthDistribution.poor} animal(es) en mal estado de salud requieren atención veterinaria inmediata.
            </p>
          </div>
        )}

        {/* Recomendación si hay animales en estado regular */}
        {healthDistribution.fair > 0 && (
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-yellow-600 text-lg">⚠️</span>
              <h4 className="font-semibold text-yellow-700">Monitoreo Requerido</h4>
            </div>
            <p className="text-yellow-600 text-sm">
              {healthDistribution.fair} animal(es) con estado regular. Revisar alimentación y condiciones de manejo.
            </p>
          </div>
        )}

        {/* Felicitación si la mayoría está saludable */}
        {parseFloat(healthyPercentage) > 80 && (
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-green-600 text-lg">✅</span>
              <h4 className="font-semibold text-green-700">Excelente Manejo</h4>
            </div>
            <p className="text-green-600 text-sm">
              {healthyPercentage}% del ganado está en excelente o buena condición. ¡Mantener las prácticas actuales!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}