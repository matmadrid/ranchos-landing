'use client';

import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface BreedDistributionChartProps {
  animals: Array<{
    breed: string;
    gender: string;
  }>;
}

export function BreedDistributionChart({ animals }: BreedDistributionChartProps) {
  // Datos para el gráfico de dona (distribución por raza)
  const breedCounts = animals.reduce((acc, animal) => {
    acc[animal.breed] = (acc[animal.breed] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedBreeds = Object.entries(breedCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10); // Top 10 razas

  const doughnutData = {
    labels: sortedBreeds.map(([breed]) => breed),
    datasets: [
      {
        data: sortedBreeds.map(([, count]) => count),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
          '#FF6384',
          '#C9CBCF',
          '#4BC0C0',
          '#FF9F40'
        ],
        borderWidth: 2,
        borderColor: '#fff'
      }
    ]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          generateLabels: (chart: any) => {
            const data = chart.data;
            if (data.labels && data.labels.length && data.datasets.length) {
              const dataset = data.datasets[0];
              const total = dataset.data.reduce((sum: number, value: number) => sum + value, 0);
              
              return data.labels.map((label: string, i: number) => {
                const value = dataset.data[i];
                const percentage = ((value / total) * 100).toFixed(1);
                
                return {
                  text: `${label} (${percentage}%)`,
                  fillStyle: dataset.backgroundColor[i],
                  strokeStyle: dataset.borderColor || '#fff',
                  lineWidth: dataset.borderWidth || 2,
                  hidden: false,
                  index: i
                };
              });
            }
            return [];
          },
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((sum: number, val: number) => sum + val, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };

  // Datos para el gráfico de barras (distribución por género)
  const genderCounts = animals.reduce((acc, animal) => {
    acc[animal.gender] = (acc[animal.gender] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const barData = {
    labels: Object.keys(genderCounts),
    datasets: [
      {
        label: 'Cantidad',
        data: Object.values(genderCounts),
        backgroundColor: ['#36A2EB', '#FF6384'],
        borderColor: ['#2E86AB', '#E63946'],
        borderWidth: 2
      }
    ]
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Distribución por Género',
        font: {
          size: 16
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Top 10 Razas</h3>
        <div className="h-[300px]">
          <Doughnut data={doughnutData} options={doughnutOptions} />
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="h-[300px]">
          <Bar data={barData} options={barOptions} />
        </div>
      </div>
    </div>
  );
}
