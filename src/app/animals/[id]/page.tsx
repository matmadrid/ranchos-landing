'use client';
// src/app/animals/[id]/page.tsx

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart, Line, AreaChart, Area, ResponsiveContainer, 
  XAxis, YAxis, CartesianGrid, Tooltip, RadarChart, 
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { 
  ArrowLeft, Heart, Activity, Weight, Droplets, Calendar,
  Edit, Share2, Download, Camera, ChevronRight, Star,
  AlertTriangle, TrendingUp, TrendingDown, Clock, MapPin,
  Users, Baby, Dna, Syringe, FileText, MoreVertical,
  Shield, Award, Zap, Info, Check, X, Plus, ChevronDown,
  Thermometer, Stethoscope, Pill, ClipboardList, Eye
} from 'lucide-react';

// TypeScript interfaces
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'ghost' | 'danger';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
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
  name: string;
  breed: string;
  sex: 'male' | 'female';
  birthDate: string;
  weight: number;
  healthStatus: 'excellent' | 'good' | 'fair' | 'poor';
  location: string;
  motherTag?: string;
  fatherTag?: string;
  imageUrl?: string;
  vaccinations: Vaccination[];
  events: HealthEvent[];
  milkProduction?: MilkProduction[];
}

interface Vaccination {
  id: string;
  name: string;
  date: string;
  nextDose?: string;
  veterinarian: string;
}

interface HealthEvent {
  id: string;
  type: 'checkup' | 'treatment' | 'vaccination' | 'birth' | 'other';
  title: string;
  date: string;
  description: string;
  severity?: 'low' | 'medium' | 'high';
  veterinarian?: string;
}

interface MilkProduction {
  date: string;
  liters: number;
  quality: 'A' | 'B' | 'C';
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
    ghost: "hover:bg-gray-100 text-gray-700",
    danger: "bg-red-500 text-white hover:bg-red-600"
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

const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800'
  };
  
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

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

// 🎨 Custom Tooltip Component
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

// 🎨 Timeline Event Component
const TimelineEvent = ({ event, index }: { event: HealthEvent; index: number }) => {
  const getEventIcon = () => {
    switch (event.type) {
      case 'checkup': return Stethoscope;
      case 'treatment': return Pill;
      case 'vaccination': return Syringe;
      case 'birth': return Baby;
      default: return ClipboardList;
    }
  };

  const getEventColor = () => {
    switch (event.severity) {
      case 'high': return 'from-red-400 to-red-600';
      case 'medium': return 'from-yellow-400 to-yellow-600';
      default: return 'from-green-400 to-green-600';
    }
  };

  const Icon = getEventIcon();

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative flex items-start space-x-4"
    >
      {/* Timeline line */}
      <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gray-200" />
      
      {/* Event icon */}
      <motion.div
        whileHover={{ scale: 1.1 }}
        className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${getEventColor()} shadow-lg`}
      >
        <Icon className="h-6 w-6 text-white" />
      </motion.div>
      
      {/* Event content */}
      <div className="flex-1 pb-8">
        <motion.div
          whileHover={{ x: 5 }}
          className="bg-white p-4 rounded-lg shadow-md border border-gray-100"
        >
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-semibold text-gray-900">{event.title}</h4>
            <span className="text-xs text-gray-500">
              {new Date(event.date).toLocaleDateString('es-ES')}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-2">{event.description}</p>
          {event.veterinarian && (
            <p className="text-xs text-gray-500">
              <span className="font-medium">Veterinario:</span> {event.veterinarian}
            </p>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

// 🎨 Stat Card Component
const StatCard = ({ icon: Icon, label, value, trend, gradient, delay = 0 }: any) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.02 }}
      className="relative group"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} rounded-xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-300`} />
      
      <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg bg-gradient-to-br ${gradient}`}>
              <Icon className="h-6 w-6 text-white" />
            </div>
            {trend && (
              <div className={`flex items-center space-x-1 text-sm ${
                trend > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {trend > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                <span>{Math.abs(trend)}%</span>
              </div>
            )}
          </div>
          <p className="text-sm text-gray-600 mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// 🎨 Family Tree Component
const FamilyTree = ({ mother, father }: { mother?: string; father?: string }) => {
  return (
    <div className="flex justify-center">
      <div className="relative">
        {/* Current Animal */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="relative z-10 w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-xl"
        >
          <span className="text-3xl">🐄</span>
        </motion.div>
        
        {/* Parent connections */}
        {(mother || father) && (
          <>
            <svg className="absolute -top-20 left-1/2 -translate-x-1/2 w-40 h-20" style={{ zIndex: 0 }}>
              {mother && (
                <line
                  x1="40"
                  y1="20"
                  x2="80"
                  y2="80"
                  stroke="#e5e7eb"
                  strokeWidth="2"
                />
              )}
              {father && (
                <line
                  x1="120"
                  y1="20"
                  x2="80"
                  y2="80"
                  stroke="#e5e7eb"
                  strokeWidth="2"
                />
              )}
            </svg>
            
            {/* Mother */}
            {mother && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="absolute -top-20 -left-20"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center shadow-lg">
                  <span className="text-2xl">🐄</span>
                </div>
                <p className="text-xs text-center mt-2 font-medium">{mother}</p>
              </motion.div>
            )}
            
            {/* Father */}
            {father && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="absolute -top-20 -right-20"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg">
                  <span className="text-2xl">🐂</span>
                </div>
                <p className="text-xs text-center mt-2 font-medium">{father}</p>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// 🚀 MAIN COMPONENT: Animal Detail Page
export default function AnimalDetailPage() {
  // Mock animal data
  const [animal] = useState<Animal>({
    id: '1',
    tag: 'A001',
    name: 'Bella',
    breed: 'Holstein',
    sex: 'female',
    birthDate: '2020-03-15',
    weight: 520,
    healthStatus: 'excellent',
    location: 'Establo A - Corral 3',
    motherTag: 'M042',
    fatherTag: 'F018',
    imageUrl: '',
    vaccinations: [
      { id: '1', name: 'Aftosa', date: '2024-01-15', nextDose: '2024-07-15', veterinarian: 'Dr. García' },
      { id: '2', name: 'Brucelosis', date: '2023-12-20', veterinarian: 'Dr. López' },
      { id: '3', name: 'Rabia', date: '2024-02-10', nextDose: '2025-02-10', veterinarian: 'Dr. García' },
    ],
    events: [
      { id: '1', type: 'checkup', title: 'Control Mensual', date: '2024-03-01', description: 'Control rutinario, todo en orden', severity: 'low', veterinarian: 'Dr. García' },
      { id: '2', type: 'vaccination', title: 'Vacunación Aftosa', date: '2024-01-15', description: 'Aplicación de vacuna contra aftosa', severity: 'low', veterinarian: 'Dr. García' },
      { id: '3', type: 'treatment', title: 'Tratamiento Preventivo', date: '2023-12-10', description: 'Desparasitación preventiva', severity: 'medium', veterinarian: 'Dr. López' },
      { id: '4', type: 'birth', title: 'Nacimiento', date: '2020-03-15', description: 'Parto sin complicaciones', severity: 'low' },
    ],
    milkProduction: generateMilkProductionData()
  });

  const [activeTab, setActiveTab] = useState('overview');
  const [showAllEvents, setShowAllEvents] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Generate mock data
  function generateMilkProductionData(): MilkProduction[] {
    const data: MilkProduction[] = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      data.push({
        date: date.toISOString().split('T')[0],
        liters: Math.floor(Math.random() * 10) + 25,
        quality: Math.random() > 0.7 ? 'A' : Math.random() > 0.3 ? 'B' : 'C'
      });
    }
    return data;
  }

  // Calculate age
  const calculateAge = () => {
    const birth = new Date(animal.birthDate);
    const today = new Date();
    const months = (today.getFullYear() - birth.getFullYear()) * 12 + today.getMonth() - birth.getMonth();
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    if (years > 0) {
      return `${years} año${years > 1 ? 's' : ''} ${remainingMonths > 0 ? `y ${remainingMonths} mes${remainingMonths > 1 ? 'es' : ''}` : ''}`;
    }
    return `${months} mes${months > 1 ? 'es' : ''}`;
  };

  // Calculate production metrics
  const productionMetrics = animal.milkProduction ? {
    average: (animal.milkProduction.reduce((sum, p) => sum + p.liters, 0) / animal.milkProduction.length).toFixed(1),
    total: animal.milkProduction.reduce((sum, p) => sum + p.liters, 0),
    trend: 8.5,
    qualityA: animal.milkProduction.filter(p => p.quality === 'A').length,
    qualityB: animal.milkProduction.filter(p => p.quality === 'B').length,
    qualityC: animal.milkProduction.filter(p => p.quality === 'C').length,
  } : null;

  // Performance data for radar chart
  const performanceData = [
    { metric: 'Producción', value: 85, fullMark: 100 },
    { metric: 'Salud', value: 95, fullMark: 100 },
    { metric: 'Peso', value: 88, fullMark: 100 },
    { metric: 'Fertilidad', value: 90, fullMark: 100 },
    { metric: 'Longevidad', value: 82, fullMark: 100 },
  ];

  // Weight history data
  const weightHistory = [
    { month: 'Ene', weight: 480 },
    { month: 'Feb', weight: 490 },
    { month: 'Mar', weight: 495 },
    { month: 'Abr', weight: 505 },
    { month: 'May', weight: 515 },
    { month: 'Jun', weight: 520 },
  ];

  const getHealthColor = () => {
    switch(animal.healthStatus) {
      case 'excellent': return 'from-green-400 to-green-600';
      case 'good': return 'from-blue-400 to-blue-600';
      case 'fair': return 'from-yellow-400 to-yellow-600';
      default: return 'from-red-400 to-red-600';
    }
  };

  const getHealthBadge = () => {
    switch(animal.healthStatus) {
      case 'excellent': return { text: 'Excelente', variant: 'success' as const };
      case 'good': return { text: 'Buena', variant: 'info' as const };
      case 'fair': return { text: 'Regular', variant: 'warning' as const };
      default: return { text: 'Atención', variant: 'danger' as const };
    }
  };

  const healthBadge = getHealthBadge();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-200 rounded-full blur-3xl opacity-20 animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full blur-3xl opacity-20 animate-pulse" />
      </div>

      {/* Quick Actions Floating Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <div className="relative">
          <Button
            size="icon"
            className="h-14 w-14 rounded-full shadow-2xl"
          >
            <Plus className="h-6 w-6" />
          </Button>
          
          {/* Quick action menu would go here */}
        </div>
      </motion.div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="relative h-96 bg-gradient-to-br from-green-400 to-blue-600 overflow-hidden">
          {/* Pattern overlay */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>

          {/* Navigation */}
          <div className="absolute top-0 left-0 right-0 p-6">
            <div className="flex items-center justify-between">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 bg-white/20 backdrop-blur-md rounded-lg text-white hover:bg-white/30 transition-colors duration-200"
              >
                <ArrowLeft className="h-5 w-5" />
              </motion.button>
              
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                  <Share2 className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                  <Download className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Animal Info */}
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="flex items-end space-x-6">
              {/* Animal Avatar */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, type: "spring" }}
                className="relative"
              >
                <div className="w-32 h-32 rounded-full bg-white p-2 shadow-2xl">
                  {animal.imageUrl ? (
                    <Image 
                      src={animal.imageUrl} 
                      alt={animal.name}
                      className="w-full h-full rounded-full object-cover"
                      onLoadingComplete={() => setImageLoading(false)}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                      <span className="text-5xl">{animal.sex === 'female' ? '🐄' : '🐂'}</span>
                    </div>
                  )}
                </div>
                
                {/* Camera button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="absolute bottom-0 right-0 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center"
                >
                  <Camera className="h-5 w-5 text-gray-600" />
                </motion.button>
              </motion.div>

              {/* Name and basic info */}
              <div className="flex-1 text-white">
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-4xl font-bold mb-2"
                >
                  {animal.name}
                </motion.h1>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="flex items-center space-x-4 text-white/90"
                >
                  <span className="flex items-center space-x-1">
                    <span className="text-lg">#{animal.tag}</span>
                  </span>
                  <span>•</span>
                  <span>{animal.breed}</span>
                  <span>•</span>
                  <span>{animal.sex === 'female' ? '♀ Hembra' : '♂ Macho'}</span>
                  <span>•</span>
                  <span>{calculateAge()}</span>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="flex items-center space-x-4 mt-3"
                >
                  <Badge variant={healthBadge.variant} className="text-sm px-3 py-1">
                    <Heart className="h-3 w-3 mr-1" />
                    {healthBadge.text}
                  </Badge>
                  
                  <div className="flex items-center space-x-2 text-sm">
                    <MapPin className="h-4 w-4" />
                    <span>{animal.location}</span>
                  </div>
                </motion.div>
              </div>

              {/* Action buttons */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="flex items-center space-x-3"
              >
                <Button variant="outline" className="bg-white/90 backdrop-blur-md">
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                <Button className="bg-white text-gray-900 hover:bg-gray-100">
                  <Syringe className="h-4 w-4 mr-2" />
                  Registrar Evento
                </Button>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 -mt-12">
            <StatCard
              icon={Weight}
              label="Peso Actual"
              value={`${animal.weight} kg`}
              trend={3.2}
              gradient="from-blue-400 to-blue-600"
              delay={0}
            />
            
            {animal.sex === 'female' && productionMetrics && (
              <StatCard
                icon={Droplets}
                label="Producción Promedio"
                value={`${productionMetrics.average} L/día`}
                trend={productionMetrics.trend}
                gradient="from-green-400 to-green-600"
                delay={0.1}
              />
            )}
            
            <StatCard
              icon={Calendar}
              label="Edad"
              value={calculateAge()}
              gradient="from-purple-400 to-purple-600"
              delay={0.2}
            />
            
            <StatCard
              icon={Activity}
              label="Última Revisión"
              value="Hace 5 días"
              gradient="from-orange-400 to-orange-600"
              delay={0.3}
            />
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full max-w-3xl grid-cols-5 mx-auto">
              <TabsTrigger value="overview">General</TabsTrigger>
              <TabsTrigger value="health">Salud</TabsTrigger>
              <TabsTrigger value="production">Producción</TabsTrigger>
              <TabsTrigger value="genealogy">Genealogía</TabsTrigger>
              <TabsTrigger value="history">Historial</TabsTrigger>
            </TabsList>

            {/* Tab: Overview */}
            <TabsContent value="overview" activeTab={activeTab}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Info Card */}
                <Card className="shadow-xl border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Info className="h-5 w-5 text-gray-600" />
                      <span>Información General</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { label: 'Etiqueta', value: animal.tag, icon: Award },
                        { label: 'Nombre', value: animal.name, icon: Users },
                        { label: 'Raza', value: animal.breed, icon: Dna },
                        { label: 'Sexo', value: animal.sex === 'female' ? 'Hembra' : 'Macho', icon: Heart },
                        { label: 'Fecha de Nacimiento', value: new Date(animal.birthDate).toLocaleDateString('es-ES'), icon: Calendar },
                        { label: 'Ubicación', value: animal.location, icon: MapPin },
                      ].map((item, index) => (
                        <motion.div
                          key={item.label}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: index * 0.05 }}
                          className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                        >
                          <div className="flex items-center space-x-3">
                            <item.icon className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{item.label}</span>
                          </div>
                          <span className="font-medium text-gray-900">{item.value}</span>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Performance Radar */}
                <Card className="shadow-xl border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Zap className="h-5 w-5 text-gray-600" />
                      <span>Índices de Rendimiento</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
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
                  </CardContent>
                </Card>
              </div>

              {/* Weight History */}
              <Card className="shadow-xl border-0 mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Weight className="h-5 w-5 text-gray-600" />
                    <span>Historial de Peso</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={weightHistory}>
                        <defs>
                          <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="month" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" />
                        <Tooltip content={<CustomTooltip />} />
                        <Area 
                          type="monotone" 
                          dataKey="weight" 
                          stroke="#3b82f6" 
                          fill="url(#weightGradient)"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab: Health */}
            <TabsContent value="health" activeTab={activeTab}>
              <div className="space-y-6">
                {/* Health Status */}
                <Card className="shadow-xl border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center space-x-2">
                        <Heart className="h-5 w-5 text-gray-600" />
                        <span>Estado de Salud</span>
                      </span>
                      <Badge variant={healthBadge.variant} className="text-sm">
                        {healthBadge.text}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`h-4 rounded-full bg-gray-200 overflow-hidden`}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: animal.healthStatus === 'excellent' ? '100%' : 
                                         animal.healthStatus === 'good' ? '75%' :
                                         animal.healthStatus === 'fair' ? '50%' : '25%' }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className={`h-full bg-gradient-to-r ${getHealthColor()}`}
                      />
                    </div>
                    
                    <div className="mt-6 grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <Thermometer className="h-4 w-4 text-gray-600" />
                          <span className="text-sm font-medium text-gray-600">Temperatura</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">38.5°C</p>
                        <p className="text-xs text-green-600 mt-1">Normal</p>
                      </div>
                      
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <Activity className="h-4 w-4 text-gray-600" />
                          <span className="text-sm font-medium text-gray-600">Frecuencia Cardíaca</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">72 bpm</p>
                        <p className="text-xs text-green-600 mt-1">Normal</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Vaccinations */}
                <Card className="shadow-xl border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Syringe className="h-5 w-5 text-gray-600" />
                      <span>Vacunaciones</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {animal.vaccinations.map((vaccination, index) => (
                        <motion.div
                          key={vaccination.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900">{vaccination.name}</h4>
                              <p className="text-sm text-gray-600 mt-1">
                                Aplicada: {new Date(vaccination.date).toLocaleDateString('es-ES')}
                              </p>
                              {vaccination.nextDose && (
                                <p className="text-sm text-blue-600 mt-1">
                                  Próxima dosis: {new Date(vaccination.nextDose).toLocaleDateString('es-ES')}
                                </p>
                              )}
                            </div>
                            <Badge variant={vaccination.nextDose ? 'warning' : 'success'}>
                              {vaccination.nextDose ? 'Pendiente' : 'Completa'}
                            </Badge>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Tab: Production */}
            <TabsContent value="production" activeTab={activeTab}>
              {animal.sex === 'female' && animal.milkProduction ? (
                <div className="space-y-6">
                  {/* Production Chart */}
                  <Card className="shadow-xl border-0">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center space-x-2">
                          <Droplets className="h-5 w-5 text-gray-600" />
                          <span>Producción de Leche (30 días)</span>
                        </span>
                        <div className="flex items-center space-x-2 text-sm">
                          <span className="text-gray-600">Promedio:</span>
                          <span className="font-bold text-gray-900">{productionMetrics?.average} L/día</span>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={animal.milkProduction}>
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
                              tickFormatter={(date) => new Date(date).getDate().toString()}
                            />
                            <YAxis stroke="#6b7280" />
                            <Tooltip 
                              content={<CustomTooltip />}
                              labelFormatter={(date) => new Date(date).toLocaleDateString('es-ES')}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="liters" 
                              stroke="#10b981" 
                              strokeWidth={3}
                              fill="url(#productionGradient)"
                              dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                              activeDot={{ r: 6 }}
                              name="Litros"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Quality Distribution */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="shadow-lg border-0">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-sm font-medium text-gray-600">Calidad A</span>
                          <Badge variant="success">Premium</Badge>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">{productionMetrics?.qualityA}</p>
                        <p className="text-xs text-gray-500 mt-1">muestras este mes</p>
                        <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-green-500" 
                            style={{ width: `${(productionMetrics?.qualityA || 0) / 30 * 100}%` }}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="shadow-lg border-0">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-sm font-medium text-gray-600">Calidad B</span>
                          <Badge variant="info">Estándar</Badge>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">{productionMetrics?.qualityB}</p>
                        <p className="text-xs text-gray-500 mt-1">muestras este mes</p>
                        <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500" 
                            style={{ width: `${(productionMetrics?.qualityB || 0) / 30 * 100}%` }}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="shadow-lg border-0">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-sm font-medium text-gray-600">Calidad C</span>
                          <Badge variant="warning">Básica</Badge>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">{productionMetrics?.qualityC}</p>
                        <p className="text-xs text-gray-500 mt-1">muestras este mes</p>
                        <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-yellow-500" 
                            style={{ width: `${(productionMetrics?.qualityC || 0) / 30 * 100}%` }}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ) : (
                <Card className="shadow-xl border-0">
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <Droplets className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No hay datos de producción
                    </h3>
                    <p className="text-gray-600 text-center">
                      {animal.sex === 'male' ? 
                        'Los machos no tienen registro de producción de leche' : 
                        'No se han registrado datos de producción para este animal'}
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Tab: Genealogy */}
            <TabsContent value="genealogy" activeTab={activeTab}>
              <Card className="shadow-xl border-0">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Dna className="h-5 w-5 text-gray-600" />
                    <span>Árbol Genealógico</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="py-12">
                    <FamilyTree mother={animal.motherTag} father={animal.fatherTag} />
                  </div>
                  
                  {/* Parent details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                    {animal.motherTag && (
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        className="p-4 bg-pink-50 rounded-lg border border-pink-200"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900">Madre</h4>
                          <Badge variant="default" className="bg-pink-100 text-pink-800">
                            {animal.motherTag}
                          </Badge>
                        </div>
                        <div className="space-y-2 text-sm">
                          <p><span className="text-gray-600">Raza:</span> <span className="font-medium">Holstein</span></p>
                          <p><span className="text-gray-600">Producción promedio:</span> <span className="font-medium">32 L/día</span></p>
                          <p><span className="text-gray-600">Estado:</span> <span className="font-medium text-green-600">Activa</span></p>
                        </div>
                        <Button variant="outline" size="sm" className="mt-3 w-full">
                          <Eye className="h-3 w-3 mr-2" />
                          Ver detalles
                        </Button>
                      </motion.div>
                    )}
                    
                    {animal.fatherTag && (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        className="p-4 bg-blue-50 rounded-lg border border-blue-200"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900">Padre</h4>
                          <Badge variant="default" className="bg-blue-100 text-blue-800">
                            {animal.fatherTag}
                          </Badge>
                        </div>
                        <div className="space-y-2 text-sm">
                          <p><span className="text-gray-600">Raza:</span> <span className="font-medium">Holstein</span></p>
                          <p><span className="text-gray-600">Peso:</span> <span className="font-medium">850 kg</span></p>
                          <p><span className="text-gray-600">Estado:</span> <span className="font-medium text-gray-600">Vendido</span></p>
                        </div>
                        <Button variant="outline" size="sm" className="mt-3 w-full">
                          <Eye className="h-3 w-3 mr-2" />
                          Ver detalles
                        </Button>
                      </motion.div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab: History */}
            <TabsContent value="history" activeTab={activeTab}>
              <Card className="shadow-xl border-0">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-gray-600" />
                      <span>Historial de Eventos</span>
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAllEvents(!showAllEvents)}
                    >
                      {showAllEvents ? 'Ver menos' : 'Ver todos'}
                      <ChevronDown className={`h-4 w-4 ml-2 transition-transform duration-200 ${showAllEvents ? 'rotate-180' : ''}`} />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    {animal.events
                      .slice(0, showAllEvents ? undefined : 3)
                      .map((event, index) => (
                        <TimelineEvent key={event.id} event={event} index={index} />
                      ))}
                    
                    {!showAllEvents && animal.events.length > 3 && (
                      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent" />
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}