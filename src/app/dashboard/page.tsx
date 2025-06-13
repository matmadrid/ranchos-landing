// src/app/dashboard/page.tsx - INTEGRACIÓN COMPLETA CON MODAL INDIVIDUAL
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useRanchOSStore from '@/store';
import type { Animal } from '@/types';
import { UserProfilePrompt } from '@/components/dashboard/UserProfilePrompt';
import EditAnimalModal from '@/components/cattle/EditAnimalModal';
// 🎯 NUEVOS IMPORTS: Modal individual y analytics
import AnimalDetailModal from '@/components/cattle/AnimalDetailModal';
import ProductionChart from '@/components/analytics/ProductionChart';
// 🥛 MODAL DE PRODUCCIÓN INDIVIDUAL
import MilkProductionModal from '@/components/production/MilkProductionModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Plus, 
  Search, 
  Edit, 
  Building2, 
  TrendingUp, 
  TrendingDown,
  Sparkles,
  Activity,
  Heart,
  Calendar,
  AlertTriangle,
  Droplets,
  Users,
  Filter,
  ArrowUpRight,
  Clock,
  ChevronRight,
  Star,
  Zap,
  Package,
  Stethoscope,
  Milk,
  BarChart3,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// 🎨 COMPONENTE: KPI Card Premium (ACTUALIZADO con Modal Analytics)
const KPICard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  trendValue, 
  gradient,
  delay = 0,
  onClick,
  showAnalytics = false // 🎯 NUEVO: Para mostrar analytics en modal
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: any;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  gradient: string;
  delay?: number;
  onClick?: () => void;
  showAnalytics?: boolean;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      className="relative group cursor-pointer"
      onClick={onClick}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-300`} />
      
      <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
          <div className={`absolute inset-0 bg-gradient-to-br ${gradient} rounded-full blur-3xl`} />
        </div>
        
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">{title}</p>
                <div className="flex items-baseline space-x-2">
                  <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
                  {trend && (
                    <div className={`flex items-center space-x-1 text-sm ${
                      trend === 'up' ? 'text-green-600' : 
                      trend === 'down' ? 'text-red-600' : 
                      'text-gray-600'
                    }`}>
                      {trend === 'up' ? <TrendingUp className="h-4 w-4" /> : 
                       trend === 'down' ? <TrendingDown className="h-4 w-4" /> : null}
                      <span className="font-medium">{trendValue}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <motion.div 
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              whileHover={{ scale: 1.1 }}
            >
              {showAnalytics ? (
                <BarChart3 className="h-5 w-5 text-gray-400" />
              ) : (
                <ArrowUpRight className="h-5 w-5 text-gray-400" />
              )}
            </motion.div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <p className="text-sm text-gray-600">{subtitle}</p>
          
          {/* Mini gráfico de tendencia */}
          <div className="mt-3 flex items-end space-x-1 h-12">
            {[40, 20, 60, 35, 50, 45, 70].map((height, i) => (
              <motion.div
                key={i}
                className={`flex-1 bg-gradient-to-t ${gradient} rounded-t opacity-60`}
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ duration: 0.5, delay: delay + i * 0.1 }}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// 🎯 NUEVO: Modal de Analytics de Producción Global
const ProductionAnalyticsModal = ({ isOpen, onClose, productions }: { 
  isOpen: boolean; 
  onClose: () => void; 
  productions: any[] 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl"
        >
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-emerald-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                Analytics de Producción
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle>Últimos 7 días</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ProductionChart 
                      productions={productions}
                      days={7}
                      type="line"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Últimos 30 días</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ProductionChart 
                      productions={productions}
                      days={30}
                      type="bar"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end">
              <Button onClick={onClose} variant="outline">
                Cerrar
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// 🎨 COMPONENTE: Animal Card Premium (ACTUALIZADO con nueva interacción)
const AnimalCard = ({ animal, onViewDetails, delay = 0 }: { 
  animal: Animal; 
  onViewDetails: (animal: Animal) => void; 
  delay?: number 
}) => {
  const getHealthColor = (status?: string) => {
    switch(status) {
      case 'excellent': return 'from-green-400 to-emerald-600';
      case 'good': return 'from-blue-400 to-indigo-600';
      case 'fair': return 'from-yellow-400 to-orange-600';
      case 'poor': return 'from-red-400 to-pink-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getHealthBadge = (status?: string) => {
    switch(status) {
      case 'excellent': return { text: 'Excelente', icon: Star };
      case 'good': return { text: 'Buena', icon: Heart };
      case 'fair': return { text: 'Regular', icon: Activity };
      case 'poor': return { text: 'Atención', icon: AlertTriangle };
      default: return { text: 'Sin datos', icon: Stethoscope };
    }
  };

  const healthInfo = getHealthBadge(animal.healthStatus);
  
  const getAgeInMonths = () => {
    if (!animal.birthDate) return null;
    const birthDate = new Date(animal.birthDate);
    const today = new Date();
    const months = (today.getFullYear() - birthDate.getFullYear()) * 12 + 
                   (today.getMonth() - birthDate.getMonth());
    return Math.max(0, months);
  };

  const ageInMonths = getAgeInMonths();

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ x: 10, transition: { duration: 0.2 } }}
      className="group"
    >
      <div 
        className="relative p-4 bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-gray-200 cursor-pointer"
        onClick={() => onViewDetails(animal)} // 🎯 NUEVA INTERACCIÓN
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <motion.div 
              className="relative"
              whileHover={{ rotate: [0, -5, 5, 0] }}
              transition={{ duration: 0.5 }}
            >
              <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${
                animal.sex === 'female' ? 'from-pink-400 to-purple-600' : 'from-blue-400 to-cyan-600'
              } flex items-center justify-center shadow-lg`}>
                <Package className="h-8 w-8 text-white" />
              </div>
              
              <div className={`absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br ${getHealthColor(animal.healthStatus)} rounded-full flex items-center justify-center`}>
                <healthInfo.icon className="h-3 w-3 text-white" />
              </div>
            </motion.div>

            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-lg text-gray-900">{animal.name || animal.tag}</h3>
                <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                  {animal.tag}
                </span>
              </div>
              
              <div className="flex items-center space-x-3 mt-1">
                {animal.breed && (
                  <>
                    <span className="text-sm text-gray-600">{animal.breed}</span>
                    <span className="text-gray-400">•</span>
                  </>
                )}
                <span className="text-sm text-gray-600">
                  {animal.sex === 'female' ? '♀ Hembra' : '♂ Macho'}
                </span>
                {animal.weight && (
                  <>
                    <span className="text-gray-400">•</span>
                    <span className="text-sm font-medium text-gray-700">{animal.weight} kg</span>
                  </>
                )}
              </div>

              <div className="flex items-center space-x-4 mt-2">
                {ageInMonths !== null && (
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-500">
                      {ageInMonths} {ageInMonths === 1 ? 'mes' : 'meses'}
                    </span>
                  </div>
                )}
                
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full bg-gradient-to-r ${getHealthColor(animal.healthStatus)} bg-opacity-10`}>
                  <healthInfo.icon className="h-3 w-3" />
                  <span className="text-xs font-medium">{healthInfo.text}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
            >
              <ChevronRight className="h-4 w-4 text-gray-600" />
            </motion.div>
          </div>
        </div>

        <div className="mt-3 h-1 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className={`h-full bg-gradient-to-r ${getHealthColor(animal.healthStatus)}`}
            initial={{ width: 0 }}
            animate={{ width: `${
              animal.healthStatus === 'excellent' ? 100 : 
              animal.healthStatus === 'good' ? 75 : 
              animal.healthStatus === 'fair' ? 50 : 
              animal.healthStatus === 'poor' ? 25 : 0
            }%` }}
            transition={{ duration: 1, delay: delay + 0.5 }}
          />
        </div>
      </div>
    </motion.div>
  );
};

// 🎨 COMPONENTE: Empty State Premium (sin cambios)
const EmptyState = ({ onAddAnimal }: { onAddAnimal: () => void }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="text-center py-16"
    >
      <motion.div
        animate={{ 
          y: [0, -10, 0],
          rotate: [0, 5, -5, 0]
        }}
        transition={{ 
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="inline-block mb-6"
      >
        <div className="w-24 h-24 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center shadow-2xl">
          <Package className="h-12 w-12 text-white" />
        </div>
      </motion.div>

      <h3 className="text-2xl font-bold text-gray-900 mb-3">
        ¡Comienza tu aventura ganadera!
      </h3>
      
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        Registra tu primer animal y descubre el poder de la gestión inteligente para tu rancho
      </p>

      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button 
          size="lg"
          onClick={onAddAnimal}
          className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <Plus className="h-5 w-5 mr-2" />
          Registrar Primer Animal
        </Button>
      </motion.div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
        {[
          { icon: Zap, title: "Gestión Rápida", desc: "Control total en segundos" },
          { icon: Activity, title: "Monitoreo Salud", desc: "Alertas inteligentes" },
          { icon: TrendingUp, title: "Análisis Datos", desc: "Decisiones informadas" }
        ].map((feature, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
            className="p-4 bg-gray-50 rounded-xl"
          >
            <feature.icon className="h-8 w-8 text-primary-600 mb-2 mx-auto" />
            <h4 className="font-semibold text-gray-900">{feature.title}</h4>
            <p className="text-sm text-gray-600 mt-1">{feature.desc}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// 🚀 COMPONENTE PRINCIPAL: Dashboard Premium CON INTEGRACIÓN COMPLETA
export default function DashboardPage() {
  const router = useRouter();
  const {
    currentUser,
    currentRanch,
    profilePromptDismissed,
    setProfilePromptDismissed,
    isOnboardingComplete,
    cattle,
    getCattleByRanch,
    getTotalMilkProduction,
    milkProductions // 🎯 NUEVO: Para analytics globales
  } = useRanchOSStore();
  
  const [showProfilePrompt, setShowProfilePrompt] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGender, setFilterGender] = useState<string>('all');
  const [filterBreed, setFilterBreed] = useState<string>('all');
  const [editingAnimal, setEditingAnimal] = useState<Animal | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // 🎯 NUEVOS ESTADOS: Modal individual y analytics
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [showProductionAnalytics, setShowProductionAnalytics] = useState(false);
  const [showMilkModal, setShowMilkModal] = useState(false);
  const [milkModalAnimal, setMilkModalAnimal] = useState<Animal | null>(null);

  useEffect(() => {
    const isTemporaryUser = localStorage.getItem('isTemporaryUser') === 'true';
    const shouldShowPrompt = isTemporaryUser && !profilePromptDismissed;
    
    setShowProfilePrompt(shouldShowPrompt);
  }, [profilePromptDismissed]);

  const handleDismissPrompt = () => {
    setProfilePromptDismissed(true);
    setShowProfilePrompt(false);
  };

  const handleCompleteProfile = () => {
    setProfilePromptDismissed(true);
    setShowProfilePrompt(false);
    router.push('/auth/register?message=complete-profile&redirect=/dashboard');
  };

  const handleEditAnimal = (animal: Animal) => {
    setEditingAnimal(animal);
  };

  const handleCloseEditModal = () => {
    setEditingAnimal(null);
  };

  const handleAddAnimal = () => {
    router.push('/animals/add');
  };

  // 🎯 NUEVOS HANDLERS: Modal individual y producción
  const handleViewAnimalDetails = (animal: Animal) => {
    setSelectedAnimal(animal);
  };

  const handleCloseAnimalDetails = () => {
    setSelectedAnimal(null);
  };

  const handleRegisterProduction = (animal: Animal) => {
    setMilkModalAnimal(animal);
    setShowMilkModal(true);
    setSelectedAnimal(null); // Cerrar modal de detalles
  };

  const handleCloseMilkModal = () => {
    setShowMilkModal(false);
    setMilkModalAnimal(null);
  };

  // 🎯 ANALYTICS GLOBALES
  const handleShowProductionAnalytics = () => {
    setShowProductionAnalytics(true);
  };

  const handleCloseProductionAnalytics = () => {
    setShowProductionAnalytics(false);
  };

  // Verificaciones de rancho (sin cambios)
  if (!currentRanch) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="max-w-md w-full shadow-2xl border-0">
            <CardContent className="p-12 text-center">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="inline-block mb-6"
              >
                <Building2 className="h-16 w-16 text-gray-400" />
              </motion.div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                No hay rancho seleccionado
              </h3>
              <p className="text-gray-600 mb-8">
                Selecciona o crea un rancho para comenzar tu aventura ganadera
              </p>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  onClick={() => router.push('/profile')}
                  size="lg"
                  className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-lg"
                >
                  Configurar Rancho
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Calcular métricas (sin cambios)
  const ranchCattle = currentRanch ? getCattleByRanch(currentRanch.id) : [];
  
  const filteredCattle = ranchCattle.filter((animal: Animal) => {
    const matchesSearch = !searchTerm || 
      animal.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      animal.tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (animal.breed?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    
    const matchesGender = filterGender === 'all' || animal.sex === filterGender;
    const matchesBreed = filterBreed === 'all' || animal.breed === filterBreed;
    
    return matchesSearch && matchesGender && matchesBreed;
  });

  const totalAnimales = ranchCattle.length;
  const femaleCount = ranchCattle.filter((c: Animal) => c.sex === 'female').length;
  const maleCount = ranchCattle.filter((c: Animal) => c.sex === 'male').length;
  const produccionHoy = getTotalMilkProduction();
  const tareasPendientes = Math.min(totalAnimales, 3);
  const alertas = 0;

  const uniqueBreeds = [...new Set(ranchCattle
    .map((c: Animal) => c.breed)
    .filter((breed): breed is string => breed !== undefined)
  )];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Efecto de gradiente animado en el fondo */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200 rounded-full blur-3xl opacity-20 animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-200 rounded-full blur-3xl opacity-20 animate-pulse" />
      </div>

      <div className="relative z-10 p-6 max-w-7xl mx-auto">
        {/* Header Premium (sin cambios) */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-2">
                {getGreeting()}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">
                  {currentUser?.name || 'Ganadero'}
                </span>
              </h1>
              <div className="flex items-center space-x-2 text-gray-600">
                <Building2 className="h-5 w-5" />
                <p className="text-lg">{currentRanch?.name}</p>
                <span className="text-gray-400">•</span>
                <p className="text-lg">{new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
              </div>
            </div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                onClick={handleAddAnimal}
                size="lg"
                className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>Agregar Animal</span>
                <Sparkles className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </motion.div>
        
        {/* KPI Cards Grid - ACTUALIZADO */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KPICard
            title="Total Animales"
            value={totalAnimales}
            subtitle={`${femaleCount} hembras, ${maleCount} machos`}
            icon={Users}
            trend="up"
            trendValue="+15%"
            gradient="from-blue-400 to-cyan-600"
            delay={0}
            onClick={() => {}}
          />
          
          {/* 🎯 KPI DE PRODUCCIÓN CON ANALYTICS */}
          <KPICard
            title="Producción Hoy"
            value={`${produccionHoy.toFixed(1)} L`}
            subtitle={`${femaleCount} vacas en producción`}
            icon={Droplets}
            trend="up"
            trendValue="+8%"
            gradient="from-emerald-400 to-green-600"
            delay={0.1}
            onClick={handleShowProductionAnalytics} // 🎯 AHORA ABRE ANALYTICS
            showAnalytics={true}
          />
          
          <KPICard
            title="Tareas Pendientes"
            value={tareasPendientes}
            subtitle="Revisiones programadas"
            icon={Calendar}
            trend="neutral"
            trendValue="0%"
            gradient="from-amber-400 to-orange-600"
            delay={0.2}
            onClick={() => {}}
          />
          
          <KPICard
            title="Estado General"
            value={alertas === 0 ? "Excelente" : `${alertas} Alertas`}
            subtitle="Sin problemas detectados"
            icon={alertas === 0 ? Heart : AlertTriangle}
            trend={alertas === 0 ? "up" : "down"}
            trendValue={alertas === 0 ? "+100%" : "-20%"}
            gradient={alertas === 0 ? "from-pink-400 to-rose-600" : "from-red-400 to-pink-600"}
            delay={0.3}
            onClick={() => {}}
          />
        </div>

        {/* Sección de Animales - ACTUALIZADA */}
        {totalAnimales > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="shadow-xl border-0">
              <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-white">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div>
                    <CardTitle className="text-2xl flex items-center space-x-2">
                      <span>Gestión de Animales</span>
                      <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {filteredCattle.length} de {totalAnimales}
                      </span>
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Haz click en cualquier animal para ver detalles y registrar producción
                    </CardDescription>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Buscar animal..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 w-full sm:w-64 h-10 border-gray-200 focus:border-primary-500 focus:ring-primary-500"
                      />
                    </div>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsFilterOpen(!isFilterOpen)}
                      className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                    >
                      <Filter className="h-4 w-4" />
                      <span>Filtros</span>
                      {(filterGender !== 'all' || filterBreed !== 'all') && (
                        <span className="bg-primary-500 text-white text-xs px-2 py-0.5 rounded-full">
                          {[filterGender !== 'all', filterBreed !== 'all'].filter(Boolean).length}
                        </span>
                      )}
                    </motion.button>
                  </div>
                </div>

                <AnimatePresence>
                  {isFilterOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t">
                        <Select value={filterGender} onValueChange={setFilterGender}>
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Género" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            <SelectItem value="female">Hembras</SelectItem>
                            <SelectItem value="male">Machos</SelectItem>
                          </SelectContent>
                        </Select>

                        {uniqueBreeds.length > 1 && (
                          <Select value={filterBreed} onValueChange={setFilterBreed}>
                            <SelectTrigger className="w-40">
                              <SelectValue placeholder="Raza" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Todas las razas</SelectItem>
                              {uniqueBreeds.map(breed => (
                                <SelectItem key={breed} value={breed}>{breed}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}

                        {(filterGender !== 'all' || filterBreed !== 'all') && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              setFilterGender('all');
                              setFilterBreed('all');
                            }}
                            className="text-sm text-gray-600 hover:text-gray-900 underline"
                          >
                            Limpiar filtros
                          </motion.button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardHeader>
              
              <CardContent className="p-6">
                {filteredCattle.length > 0 ? (
                  <div className="space-y-4">
                    {filteredCattle.map((animal: Animal, index: number) => (
                      <AnimalCard 
                        key={animal.id} 
                        animal={animal} 
                        onViewDetails={handleViewAnimalDetails} // 🎯 NUEVA INTERACCIÓN
                        delay={index * 0.1}
                      />
                    ))}
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                  >
                    <p className="text-gray-500">
                      No se encontraron animales con los filtros aplicados.
                    </p>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <EmptyState onAddAnimal={handleAddAnimal} />
        )}
        
        {/* Modales */}
        {showProfilePrompt && (
          <UserProfilePrompt
            onDismiss={handleDismissPrompt}
            onComplete={handleCompleteProfile}
          />
        )}

        {editingAnimal && (
          <EditAnimalModal
            animal={editingAnimal}
            isOpen={!!editingAnimal}
            onClose={handleCloseEditModal}
          />
        )}

        {/* 🎯 MODAL INDIVIDUAL POR ANIMAL */}
        {selectedAnimal && (
          <AnimalDetailModal
            animal={selectedAnimal}
            isOpen={!!selectedAnimal}
            onClose={handleCloseAnimalDetails}
            onEditAnimal={handleEditAnimal}
            onRegisterProduction={handleRegisterProduction}
          />
        )}

        {/* 🎯 MODAL DE ANALYTICS GLOBALES */}
        <ProductionAnalyticsModal
          isOpen={showProductionAnalytics}
          onClose={handleCloseProductionAnalytics}
          productions={milkProductions || []}
        />

        {/* 🥛 MODAL DE PRODUCCIÓN INDIVIDUAL */}
        {showMilkModal && milkModalAnimal && (
          <MilkProductionModal
            isOpen={showMilkModal}
            onClose={handleCloseMilkModal}
            // Aquí podrías pasar el animal específico si modificas el modal
          />
        )}
      </div>
    </div>
  );
}