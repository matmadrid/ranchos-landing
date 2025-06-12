// src/components/analytics/TrendChart.tsx
'use client';

import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { format, subDays, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface TrendChartProps {
  productions: Array<{
    date: string;
    liters: number;
  }>;
  days?: number;
  showRegression?: boolean;
}

export default function TrendChart({ 
  productions, 
  days = 30, 
  showRegression = true 
}: TrendChartProps) {
  
  // Calcular regresión lineal simple
  const calculateLinearRegression = (data: number[]) => {
    const n = data.length;
    if (n < 2) return { slope: 0, intercept: 0 };
    
    const sumX = data.reduce((sum, _, i) => sum + i, 0);
    const sumY = data.reduce((sum, val) => sum + val, 0);
    const sumXY = data.reduce((sum, val, i) => sum + (i * val), 0);
    const sumXX = data.reduce((sum, _, i) => sum + (i * i), 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    return { slope, intercept };
  };

  // Generar datos de tendencia
  const generateTrendData = () => {
    const labels = [];
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = startOfDay(subDays(new Date(), i));
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayLabel = format(date, 'dd MMM', { locale: es });
      
      const dayProduction = productions
        .filter(p => p.date === dateStr)
        .reduce((sum, p) => sum + p.liters, 0);
      
      labels.push(dayLabel);
      data.push(dayProduction);
    }
    
    return { labels, data };
  };

  const { labels, data } = generateTrendData();
  
  // Calcular línea de tendencia
  const regression = calculateLinearRegression(data);
  const trendData = data.map((_, i) => regression.intercept + regression.slope * i);
  
  // Calcular estadísticas de tendencia
  const avg = data.reduce((sum, val) => sum + val, 0) / data.length;
  const trendDirection = regression.slope > 0 ? 'Creciente' : regression.slope < 0 ? 'Decreciente' : 'Estable';
  const trendPercentage = Math.abs(regression.slope / avg * 100).toFixed(1);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Producción Real',
        data,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.3,
        fill: false,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      ...(showRegression ? [{
        label: 'Tendencia',
        data: trendData,
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderDash: [5, 5],
        tension: 0,
        fill: false,
        pointRadius: 0,
        pointHoverRadius: 0,
      }] : [])
    ]
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `Análisis de Tendencia - ${days} días`,
        font: {
          size: 16
        }
      },
      tooltip: {
        callbacks: {
          afterBody: (context) => {
            if (context[0].datasetIndex === 0) {
              return [
                `Tendencia: ${trendDirection}`,
                `Variación: ${trendPercentage}% ${regression.slope > 0 ? '↗️' : regression.slope < 0 ? '↘️' : '➡️'}`
              ];
            }
            return [];
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Litros'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Fecha'
        }
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Estadísticas de tendencia */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-500">Tendencia</div>
          <div className="text-lg font-semibold flex items-center gap-2">
            {trendDirection}
            <span className="text-sm">
              {regression.slope > 0 ? '📈' : regression.slope < 0 ? '📉' : '📊'}
            </span>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-500">Variación</div>
          <div className="text-lg font-semibold">
            {trendPercentage}%
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-500">Promedio</div>
          <div className="text-lg font-semibold">
            {avg.toFixed(1)} L
          </div>
        </div>
      </div>

      {/* Gráfico */}
      <div className="bg-white p-6 rounded-lg border">
        <div className="h-96">
          <Line data={chartData} options={options} />
        </div>
      </div>

      {/* Análisis de tendencia */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h4 className="font-semibold text-blue-900 mb-2">Análisis de Tendencia</h4>
        <p className="text-blue-800 text-sm">
          {regression.slope > 0.1 && (
            `📈 La producción muestra una tendencia positiva con un incremento promedio de ${trendPercentage}%. Esto indica una mejora en la eficiencia productiva.`
          )}
          {regression.slope < -0.1 && (
            `📉 La producción muestra una tendencia descendente con una disminución promedio de ${trendPercentage}%. Se recomienda revisar las condiciones del ganado y la alimentación.`
          )}
          {Math.abs(regression.slope) <= 0.1 && (
            `📊 La producción se mantiene estable con variaciones mínimas (${trendPercentage}%). Esto indica consistencia en el manejo del ganado.`
          )}
        </p>
      </div>
    </div>
  );
}