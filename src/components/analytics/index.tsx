// src/components/analytics/index.ts
import dynamic from 'next/dynamic';
import { ChartSkeleton, StatsSkeleton } from '@/components/ui/chart-skeleton';

// Lazy loading de componentes de gráficos
export const ProductionChart = dynamic(
  () => import('./ProductionChart'),
  { 
    ssr: false, 
    loading: () => <ChartSkeleton /> 
  }
);

export const BreedDistributionChart = dynamic(
  () => import('./BreedDistributionChart').then(mod => ({ default: mod.BreedDistributionChart })),
  { 
    ssr: false, 
    loading: () => <ChartSkeleton /> 
  }
);

export const AnalyticsStats = dynamic(
  () => import('./AnalyticsStats'),
  { 
    ssr: false, 
    loading: () => <StatsSkeleton /> 
  }
);

// Futuros componentes lazy
export const TrendChart = dynamic(
  () => import('./TrendChart'),
  { 
    ssr: false, 
    loading: () => <ChartSkeleton /> 
  }
);

export const HealthDistributionPie = dynamic(
  () => import('./HealthDistributionPie'),
  { 
    ssr: false, 
    loading: () => <ChartSkeleton /> 
  }
);