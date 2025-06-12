// src/components/analytics/ProductionChart.tsx
'use client';

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { format, subDays, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ProductionChartProps {
  productions: any[];
  days?: number;
  type?: 'line' | 'bar';
}

export default function ProductionChart({ 
  productions, 
  days = 7, 
  type = 'line' 
}: ProductionChartProps) {
  // Generar datos para los últimos X días
  const generateChartData = () => {
    const labels = [];
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = startOfDay(subDays(new Date(), i));
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayLabel = format(date, 'EEE dd', { locale: es });
      
      // Calcular producción total para ese día
      const dayProduction = productions
        .filter(p => p.date === dateStr)
        .reduce((sum, p) => sum + p.liters, 0);
      
      labels.push(dayLabel);
      data.push(dayProduction);
    }
    
    return { labels, data };
  };

  const { labels, data } = generateChartData();

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Producción de Leche (Litros)',
        data,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: type === 'bar' ? 'rgba(59, 130, 246, 0.5)' : 'rgba(59, 130, 246, 0.1)',
        tension: 0.3,
        fill: type === 'line'
      }
    ]
  };

  const options: ChartOptions<typeof type> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `Producción de los últimos ${days} días`,
        font: {
          size: 16
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            return `${context.parsed.y.toFixed(1)} L`;
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
      }
    }
  };

  const ChartComponent = type === 'line' ? Line : Bar;

  return (
    <div className="w-full h-full">
      <ChartComponent data={chartData} options={options} />
    </div>
  );
}