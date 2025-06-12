// src/app/analytics/page.tsx
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  AreaChart, Area, ResponsiveContainer, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { 
  Building2, Download, FileText, Calendar, BarChart3, 
  TrendingUp, TrendingDown, Activity, Users, Droplets,
  ArrowLeft, Filter, Search, ChevronDown, Info,
  DollarSign, Heart, AlertTriangle, Zap, Target,
  Package, Clock, ChevronRight, Sparkles
} from 'lucide-react';

// TypeScript interfaces
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  className?: string;
}

interface TabsProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

interface Animal {
  id: string;
  tag: string;
  name?: string;
  breed: string;
  sex: 'male' | 'female';
  weight?: number;
  healthStatus: 'excellent' | 'good' | 'fair' | 'poor';
}

interface MilkProduction {
  id: string;
  date: string;
  liters: number;
  shift?: 'morning' | 'afternoon' | 'evening';
}

// Mock UI Components
const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'default', 
  size = 'default',
  onClick, 
  disabled, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
  
  const variants = {
    default: "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl",
    outline: "border border-gray-300 bg-white hover:bg-gray-50 text-gray-700",
    ghost: "hover:bg-gray-100 text-gray-700"
  };
  
  const sizes = {
    default: "h-10 px-4 py-2 text-sm",
    sm: "h-8 px-3 text-xs",
    lg: "h-12 px-6 text-base",
    icon: "h-10 w-10"
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

const Card: React.FC<CardProps> = ({ children, className = '' }) => (
  <div className={`rounded-xl border bg-white shadow-sm ${className}`}>{children}</div>
);

const CardHeader: React.FC<CardProps> = ({ children, className = '' }) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>{children}</div>
);

const CardTitle: React.FC<CardProps> = ({ children, className = '' }) => (
  <h3 className={`text-xl font-semibold leading-none tracking-tight ${className}`}>{children}</h3>
);

const CardContent: React.FC<CardProps> = ({ children, className = '' }) => (
  <div className={`p-6 pt-0 ${className}`}>{children}</div>
);

const Select: React.FC<SelectProps> = ({ children, className = '', ...props }) => (
  <select
    className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${className}`}
    {...props}
  >
    {children}
  </select>
);

// Tabs components
const Tabs: React.FC<TabsProps> = ({ value, onValueChange, children, className = '' }) => {
  const [activeTab, setActiveTab] = useState(value || 'overview');
  
  const handleTabChange = (newValue: string) => {
    setActiveTab(newValue);
    onValueChange?.(newValue);
  };

  return (
    <div className={className}>
      {React.Children.map(children, child =>
        React.isValidElement(child) ? React.cloneElement(child as React.ReactElement<any>, { activeTab, onTabChange: handleTabChange }) : child
      )}
    </div>
  );
};

const TabsList: React.FC<any> = ({ children, className = '', activeTab, onTabChange }) => (
  <div className={`inline-flex h-12 items-center justify-center rounded-lg bg-gray-100 p-1 text-gray-600 ${className}`}>
    {React.Children.map(children, child =>
      React.isValidElement(child) ? React.cloneElement(child as React.ReactElement<any>, { activeTab, onTabChange }) : child
    )}
  </div>
);

const TabsTrigger: React.FC<any> = ({ value, children, className = '', activeTab, onTabChange }) => {
  const isActive = activeTab === value;
  return (
    <button
      onClick={() => onTabChange?.(value)}
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
        isActive 
          ? 'bg-white text-gray-900 shadow-sm' 
          : 'text-gray-700 hover:text-gray-900 hover:bg-white/50'
      } ${className}`}
    >
      {children}
    </button>
  );
};

const TabsContent: React.FC<any> = ({ value, children, activeTab }) => {
  if (value !== activeTab) return null;
  return <div className="mt-6">{children}</div>;
};

// 🎨 KPI Card Component
const KPICard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  trendValue, 
  gradient,
  delay = 0 
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: any;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  gradient: string;
  delay?: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      className="relative group"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} rounded-xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-300`} />
      
      <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
          <div className={`absolute inset-0 bg-gradient-to-br ${gradient} rounded-full blur-3xl`} />
        </div>
        
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <motion.div
                whileHover={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.5 }}
                className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}
              >
                <Icon className="h-6 w-6 text-white" />
              </motion.div>
              <div>
                <p className="text-sm font-medium text-gray-600">{title}</p>
                <div className="flex items-baseline space-x-2">
                  <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
                  {trend && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`flex items-center space-x-1 text-sm ${
                        trend === 'up' ? 'text-green-600' : 
                        trend === 'down' ? 'text-red-600' : 
                        'text-gray-600'
                      }`}
                    >
                      {trend === 'up' ? <TrendingUp className="h-4 w-4" /> : 
                       trend === 'down' ? <TrendingDown className="h-4 w-4" /> : null}
                      <span className="font-medium">{trendValue}</span>
                    </motion.div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
              </div>
            </div>
          </div>
          
          {/* Mini sparkline */}
          <div className="mt-4 h-8">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[
                { value: 20 }, { value: 35 }, { value: 30 }, 
                { value: 45 }, { value: 40 }, { value: 60 }, { value: 55 }
              ]}>
                <defs>
                  <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#10b981" 
                  fill={`url(#gradient-${title})`}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// 🎨 Chart Card Component
const ChartCard = ({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="shadow-xl border-0">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl font-bold">{title}</CardTitle>
          {action}
        </CardHeader>
        <CardContent>
          {children}
        </CardContent>
      </Card>
    </motion.div>
  );
};

// 🎨 Custom Tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-3 rounded-lg shadow-xl border border-gray-100"
      >
        <p className="text-sm font-medium text-gray-900">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: <span className="font-bold">{entry.value}</span>
          </p>
        ))}
      </motion.div>
    );
  }
  return null;
};

// 🚀 MAIN COMPONENT: Analytics Page Premium
export default function AnalyticsPage() {
  // Mock data
  const [activeRanch] = useState({ id: '1', name: 'Rancho Principal' });
  const [productionDays, setProductionDays] = useState(7);
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [dateRange, setDateRange] = useState('7days');
  const [activeTab, setActiveTab] = useState('overview');

  // Mock cattle data
  const cattle: Animal[] = [
    { id: '1', tag: 'A001', name: 'Bella', breed: 'Holstein', sex: 'female', weight: 500, healthStatus: 'excellent' },
    { id: '2', tag: 'A002', name: 'Luna', breed: 'Jersey', sex: 'female', weight: 450, healthStatus: 'good' },
    { id: '3', tag: 'A003', name: 'Toro', breed: 'Angus', sex: 'male', weight: 700, healthStatus: 'excellent' },
    { id: '4', tag: 'A004', name: 'Daisy', breed: 'Holstein', sex: 'female', weight: 520, healthStatus: 'fair' },
    { id: '5', tag: 'A005', name: 'Max', breed: 'Angus', sex: 'male', weight: 680, healthStatus: 'good' },
  ];

  // Generate mock production data
  const generateProductionData = () => {
    const data = [];
    const today = new Date();
    
    for (let i = productionDays - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      data.push({
        date: date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
        production: Math.floor(Math.random() * 200) + 300,
        morning: Math.floor(Math.random() * 100) + 100,
        afternoon: Math.floor(Math.random() * 100) + 100,
        temperature: Math.floor(Math.random() * 5) + 20,
      });
    }
    return data;
  };

  const productionData = useMemo(() => generateProductionData(), [productionDays]);

  // Calculate statistics
  const stats = useMemo(() => {
    const femaleCount = cattle.filter(c => c.sex === 'female').length;
    const maleCount = cattle.filter(c => c.sex === 'male').length;
    const avgWeight = cattle.reduce((sum, c) => sum + (c.weight || 0), 0) / cattle.length;
    const totalProduction = productionData.reduce((sum, d) => sum + d.production, 0);
    const avgProduction = totalProduction / productionDays;
    
    const healthDistribution = {
      excellent: cattle.filter(c => c.healthStatus === 'excellent').length,
      good: cattle.filter(c => c.healthStatus === 'good').length,
      fair: cattle.filter(c => c.healthStatus === 'fair').length,
      poor: cattle.filter(c => c.healthStatus === 'poor').length
    };

    const breedDistribution = cattle.reduce((acc, animal) => {
      acc[animal.breed] = (acc[animal.breed] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalAnimals: cattle.length,
      femaleCount,
      maleCount,
      avgWeight: Math.round(avgWeight),
      totalProduction: Math.round(totalProduction),
      avgProduction: Math.round(avgProduction),
      healthDistribution,
      breedDistribution
    };
  }, [cattle, productionData, productionDays]);

  // Prepare chart data
  const healthChartData = Object.entries(stats.healthDistribution).map(([status, count]) => ({
    name: status === 'excellent' ? 'Excelente' : 
          status === 'good' ? 'Buena' : 
          status === 'fair' ? 'Regular' : 'Mala',
    value: count,
    color: status === 'excellent' ? '#10b981' : 
           status === 'good' ? '#3b82f6' : 
           status === 'fair' ? '#f59e0b' : '#ef4444'
  }));

  const breedChartData = Object.entries(stats.breedDistribution).map(([breed, count]) => ({
    breed,
    count,
    percentage: Math.round((count / cattle.length) * 100)
  }));

  // Performance metrics for radar chart
  const performanceData = [
    { metric: 'Producción', value: 85, fullMark: 100 },
    { metric: 'Salud', value: 90, fullMark: 100 },
    { metric: 'Peso Promedio', value: 75, fullMark: 100 },
    { metric: 'Eficiencia', value: 88, fullMark: 100 },
    { metric: 'Reproductividad', value: 70, fullMark: 100 },
    { metric: 'Bienestar', value: 92, fullMark: 100 },
  ];

  const handleExportPDF = async () => {
    setIsGeneratingPDF(true);
    // Simulate PDF generation
    setTimeout(() => {
      setIsGeneratingPDF(false);
      alert('PDF generado exitosamente!');
    }, 2000);
  };

  const handleExportCSV = () => {
    alert('CSV exportado exitosamente!');
  };

  if (!activeRanch) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay rancho seleccionado
            </h3>
            <p className="text-gray-600 text-center mb-6">
              Selecciona un rancho para ver las analíticas
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-200 rounded-full blur-3xl opacity-20 animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full blur-3xl opacity-20 animate-pulse" />
      </div>

      <div className="relative z-10 p-6 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </motion.button>
              
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600">
                    Analytics
                  </span>
                </h1>
                <p className="text-gray-600 mt-1">
                  Análisis detallado de {activeRanch.name}
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Select
                value={dateRange}
                onChange={(e) => {
                  setDateRange(e.target.value);
                  setProductionDays(
                    e.target.value === '7days' ? 7 :
                    e.target.value === '15days' ? 15 :
                    e.target.value === '30days' ? 30 : 7
                  );
                }}
                className="w-40"
              >
                <option value="7days">Últimos 7 días</option>
                <option value="15days">Últimos 15 días</option>
                <option value="30days">Últimos 30 días</option>
              </Select>
              
              <Button
                onClick={handleExportCSV}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                CSV
              </Button>
              
              <Button
                onClick={handleExportPDF}
                disabled={isGeneratingPDF}
                className="flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                {isGeneratingPDF ? 'Generando...' : 'PDF'}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KPICard
            title="Total Animales"
            value={stats.totalAnimals}
            subtitle={`${stats.femaleCount} hembras, ${stats.maleCount} machos`}
            icon={Users}
            trend="up"
            trendValue="+12%"
            gradient="from-blue-400 to-cyan-600"
            delay={0}
          />
          
          <KPICard
            title="Producción Total"
            value={`${stats.totalProduction} L`}
            subtitle={`Promedio: ${stats.avgProduction} L/día`}
            icon={Droplets}
            trend="up"
            trendValue="+8%"
            gradient="from-emerald-400 to-green-600"
            delay={0.1}
          />
          
          <KPICard
            title="Peso Promedio"
            value={`${stats.avgWeight} kg`}
            subtitle="Ganado en producción"
            icon={Package}
            trend="neutral"
            trendValue="0%"
            gradient="from-amber-400 to-orange-600"
            delay={0.2}
          />
          
          <KPICard
            title="Eficiencia"
            value="92%"
            subtitle="Índice de productividad"
            icon={Zap}
            trend="up"
            trendValue="+5%"
            gradient="from-purple-400 to-pink-600"
            delay={0.3}
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-3xl grid-cols-5 mx-auto">
            <TabsTrigger value="overview">General</TabsTrigger>
            <TabsTrigger value="production">Producción</TabsTrigger>
            <TabsTrigger value="health">Salud</TabsTrigger>
            <TabsTrigger value="distribution">Distribución</TabsTrigger>
            <TabsTrigger value="trends">Tendencias</TabsTrigger>
          </TabsList>

          {/* Tab: General Overview */}
          <TabsContent value="overview" activeTab={activeTab}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Production Chart */}
              <ChartCard 
                title="Producción de Leche" 
                action={
                  <div className="flex gap-2">
                    <Button
                      variant={chartType === 'line' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setChartType('line')}
                    >
                      Línea
                    </Button>
                    <Button
                      variant={chartType === 'bar' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setChartType('bar')}
                    >
                      Barras
                    </Button>
                  </div>
                }
              >
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    {chartType === 'line' ? (
                      <LineChart data={productionData}>
                        <defs>
                          <linearGradient id="productionGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis 
                          dataKey="date" 
                          stroke="#6b7280"
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis 
                          stroke="#6b7280"
                          tick={{ fontSize: 12 }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Line 
                          type="monotone" 
                          dataKey="production" 
                          stroke="#10b981" 
                          strokeWidth={3}
                          fill="url(#productionGradient)"
                          dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    ) : (
                      <BarChart data={productionData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis 
                          dataKey="date" 
                          stroke="#6b7280"
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis 
                          stroke="#6b7280"
                          tick={{ fontSize: 12 }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar 
                          dataKey="morning" 
                          stackId="a" 
                          fill="#3b82f6" 
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar 
                          dataKey="afternoon" 
                          stackId="a" 
                          fill="#10b981" 
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </ChartCard>

              {/* Performance Radar */}
              <ChartCard title="Índices de Rendimiento">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={performanceData}>
                      <PolarGrid stroke="#e5e7eb" />
                      <PolarAngleAxis 
                        dataKey="metric" 
                        tick={{ fontSize: 12 }}
                        className="text-gray-600"
                      />
                      <PolarRadiusAxis 
                        angle={90} 
                        domain={[0, 100]} 
                        tick={{ fontSize: 10 }}
                      />
                      <Radar 
                        name="Rendimiento" 
                        dataKey="value" 
                        stroke="#10b981" 
                        fill="#10b981" 
                        fillOpacity={0.6}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              {[
                { label: 'Vacas Lactantes', value: stats.femaleCount, icon: Users, color: 'text-blue-600' },
                { label: 'Producción Promedio', value: `${stats.avgProduction} L`, icon: Droplets, color: 'text-green-600' },
                { label: 'Temperatura Media', value: '23°C', icon: Activity, color: 'text-orange-600' },
                { label: 'Eficiencia Feed', value: '1.4:1', icon: Target, color: 'text-purple-600' },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                >
                  <Card className="hover:shadow-lg transition-shadow duration-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">{stat.label}</p>
                          <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                        </div>
                        <stat.icon className={`h-8 w-8 ${stat.color} opacity-20`} />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Tab: Production Details */}
          <TabsContent value="production" activeTab={activeTab}>
            <ChartCard title="Análisis Detallado de Producción">
              <div className="space-y-6">
                {/* Area chart with production trends */}
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={productionData}>
                      <defs>
                        <linearGradient id="morningGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                        </linearGradient>
                        <linearGradient id="afternoonGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="morning" 
                        stackId="1"
                        stroke="#3b82f6" 
                        fill="url(#morningGradient)"
                        name="Mañana"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="afternoon" 
                        stackId="1"
                        stroke="#10b981" 
                        fill="url(#afternoonGradient)"
                        name="Tarde"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Production metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-gray-600">Mejor Día</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">485 L</p>
                      <p className="text-xs text-gray-500 mt-1">Hace 3 días</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-gray-600">Horario Pico</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">6:00 AM</p>
                      <p className="text-xs text-gray-500 mt-1">Mayor producción</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <DollarSign className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium text-gray-600">Valor Estimado</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">$12,450</p>
                      <p className="text-xs text-gray-500 mt-1">Este período</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </ChartCard>
          </TabsContent>

          {/* Tab: Health */}
          <TabsContent value="health" activeTab={activeTab}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartCard title="Estado de Salud del Ganado">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={healthChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {healthChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>

              <ChartCard title="Alertas de Salud">
                <div className="space-y-3">
                  {[
                    { type: 'warning', message: 'A004 - Daisy requiere revisión veterinaria', icon: AlertTriangle, color: 'text-yellow-600 bg-yellow-50' },
                    { type: 'info', message: 'Vacunación programada para el 15 de enero', icon: Info, color: 'text-blue-600 bg-blue-50' },
                    { type: 'success', message: 'Todos los animales pasaron el control mensual', icon: Heart, color: 'text-green-600 bg-green-50' },
                  ].map((alert, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className={`p-4 rounded-lg ${alert.color} flex items-start space-x-3`}
                    >
                      <alert.icon className="h-5 w-5 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{alert.message}</p>
                        <p className="text-xs opacity-75 mt-1">Hace 2 horas</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ChartCard>
            </div>

            {/* Health metrics */}
            <div className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Métricas de Salud</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                      { label: 'Tasa de Mortalidad', value: '0.5%', trend: 'down', good: true },
                      { label: 'Animales en Tratamiento', value: '2', trend: 'neutral', good: false },
                      { label: 'Índice de Bienestar', value: '94%', trend: 'up', good: true },
                      { label: 'Última Inspección', value: 'Hace 5 días', trend: 'neutral', good: true },
                    ].map((metric, index) => (
                      <div key={index} className="text-center">
                        <p className="text-sm text-gray-600 mb-1">{metric.label}</p>
                        <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                        <div className="flex items-center justify-center mt-2">
                          {metric.trend === 'up' && <TrendingUp className={`h-4 w-4 ${metric.good ? 'text-green-600' : 'text-red-600'}`} />}
                          {metric.trend === 'down' && <TrendingDown className={`h-4 w-4 ${metric.good ? 'text-green-600' : 'text-red-600'}`} />}
                          {metric.trend === 'neutral' && <Activity className="h-4 w-4 text-gray-600" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab: Distribution */}
          <TabsContent value="distribution" activeTab={activeTab}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartCard title="Distribución por Raza">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={breedChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="breed" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="count" fill="#10b981" radius={[8, 8, 0, 0]}>
                        {breedChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#10b981' : '#3b82f6'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>

              <ChartCard title="Distribución por Género">
                <div className="h-80 flex items-center justify-center">
                  <div className="space-y-6">
                    <div className="flex items-center space-x-8">
                      <div className="text-center">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.5, type: "spring" }}
                          className="w-32 h-32 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center shadow-xl"
                        >
                          <span className="text-4xl font-bold text-white">{stats.femaleCount}</span>
                        </motion.div>
                        <p className="mt-3 text-sm font-medium text-gray-600">Hembras</p>
                        <p className="text-2xl font-bold text-gray-900">{Math.round((stats.femaleCount / stats.totalAnimals) * 100)}%</p>
                      </div>
                      
                      <div className="text-center">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.5, type: "spring", delay: 0.1 }}
                          className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-xl"
                        >
                          <span className="text-4xl font-bold text-white">{stats.maleCount}</span>
                        </motion.div>
                        <p className="mt-3 text-sm font-medium text-gray-600">Machos</p>
                        <p className="text-2xl font-bold text-gray-900">{Math.round((stats.maleCount / stats.totalAnimals) * 100)}%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </ChartCard>
            </div>
          </TabsContent>

          {/* Tab: Trends */}
          <TabsContent value="trends" activeTab={activeTab}>
            <ChartCard title="Análisis de Tendencias">
              <div className="space-y-6">
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={productionData}>
                      <defs>
                        <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" stroke="#6b7280" />
                      <YAxis yAxisId="left" stroke="#6b7280" />
                      <YAxis yAxisId="right" orientation="right" stroke="#6b7280" />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Line 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="production" 
                        stroke="#10b981" 
                        strokeWidth={3}
                        name="Producción (L)"
                        dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                      />
                      <Line 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="temperature" 
                        stroke="#8b5cf6" 
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        name="Temperatura (°C)"
                        dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Trend insights */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { 
                      title: 'Proyección Mensual', 
                      value: '+15%', 
                      description: 'Incremento esperado en producción',
                      icon: TrendingUp,
                      color: 'from-green-400 to-green-600'
                    },
                    { 
                      title: 'Correlación Temp/Prod', 
                      value: '0.82', 
                      description: 'Fuerte correlación negativa',
                      icon: Activity,
                      color: 'from-purple-400 to-purple-600'
                    },
                    { 
                      title: 'Mejor Período', 
                      value: 'Mañana', 
                      description: '65% de la producción diaria',
                      icon: Clock,
                      color: 'from-blue-400 to-blue-600'
                    },
                  ].map((insight, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
                        <div className={`h-2 bg-gradient-to-r ${insight.color}`} />
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-gray-900">{insight.title}</h4>
                            <insight.icon className="h-5 w-5 text-gray-400" />
                          </div>
                          <p className="text-2xl font-bold text-gray-900 mb-1">{insight.value}</p>
                          <p className="text-xs text-gray-600">{insight.description}</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            </ChartCard>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}