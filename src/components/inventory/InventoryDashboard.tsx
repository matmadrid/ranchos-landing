// src/components/inventory/InventoryDashboard.tsx
/**
 * @version 1.0.0
 * @author TorresLaveaga
 * @cosmovision SpaceRanch Sistemas Dinámicos Universales
 * 
 * BATALLA 6: Motor de Inventario Ganadero
 * Dashboard principal del sistema de inventario agregado
 */

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Package,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Plus,
  BarChart3,
  Settings,
  Download,
  ArrowUp,
  ArrowDown,
  Minus,
  ShoppingCart,
  RefreshCw,
  Calendar,
  Filter,
  Search,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

// Import del store principal - corregido
import useRanchOSStore from '@/store';
import type { 
  InventoryMovement, 
  MovementType, 
  AnimalCategory
} from '@/types/inventory';

// Import del formulario de movimientos
import MovementRegistration from './MovementRegistration';

// ===== COMPONENTE PRINCIPAL =====

export default function InventoryDashboard() {
  // Store principal
  const store = useRanchOSStore();
  
  // Estado local
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [showMovementModal, setShowMovementModal] = useState(false);

  // Verificar si tenemos acceso a los métodos de inventario
 const hasInventoryMethods = Boolean(
  store.movements !== undefined && 
  store.categories !== undefined && 
  typeof store.getInventoryStats === 'function' &&
  typeof store.recalculateAllBalances === 'function'
);

  // Datos del inventario (con fallbacks seguros)
  const movements = store.movements || [];
  const categories = store.categories || [];
  const categoryBalances = store.categoryBalances || new Map();
  const stats = store.getInventoryStats ? store.getInventoryStats() : {
    totalAnimals: 0,
    totalValue: 0,
    movementsThisMonth: 0,
    categoriesWithStock: 0,
    lastMovementDate: null
  };
  
  const alerts = store.alerts || [];
  const unreadCount = store.unreadAlertsCount || 0;
  const isProcessing = store.isProcessing || false;

  // Datos del rancho actual
  const currentRanch = store.activeRanch || store.currentRanch;
  const hasRanch = Boolean(currentRanch);

  // Handlers
  const handleRefreshData = async () => {
    if (!hasRanch || !store.recalculateAllBalances) return;
    
    try {
      await store.recalculateAllBalances();
      if (store.checkInventoryAlerts) {
        await store.checkInventoryAlerts();
      }
    } catch (error) {
      console.error('Error actualizando datos:', error);
    }
  };

  const handleAddMovement = () => {
    setShowMovementModal(true);
  };

  const handleMovementSuccess = (movement: InventoryMovement) => {
    console.log('✅ Movimiento registrado exitosamente:', movement);
    // El store ya se actualiza automáticamente
    setShowMovementModal(false);
  };

  // Obtener movimientos recientes (últimos 5)
  const recentMovements = store.getRecentMovements ? store.getRecentMovements(5) : movements.slice(0, 5);

  // Si no hay métodos de inventario disponibles
  if (!hasInventoryMethods) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-6 text-center">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Inventario Inicializando...
          </h3>
          <p className="text-gray-600 mb-4">
            El sistema de inventario se está configurando. Por favor espera un momento.
          </p>
          <Button onClick={() => window.location.reload()}>
            Recargar página
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Si no hay rancho activo
  if (!hasRanch) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-6 text-center">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Sin rancho activo
          </h3>
          <p className="text-gray-600 mb-4">
            Selecciona un rancho para ver el inventario de ganado
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header del Dashboard */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Package className="h-8 w-8 mr-3 text-blue-600" />
            Inventario Ganadero
          </h1>
          <p className="text-gray-600 mt-1">
            {currentRanch?.name} • Sistema agregado por categorías
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Alertas */}
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" className="relative">
              <AlertTriangle className="h-4 w-4 mr-2 text-amber-600" />
              {unreadCount} Alertas
              <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs bg-red-500">
                {unreadCount}
              </Badge>
            </Button>
          )}
          
          {/* Acciones principales */}
          <Button
            onClick={handleRefreshData}
            variant="outline"
            size="sm"
            disabled={isProcessing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isProcessing ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          
          <Button onClick={handleAddMovement} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Movimiento
          </Button>
        </div>
      </motion.div>

      {/* KPIs Principales */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        <StatsCard
          title="Total Animales"
          value={stats.totalAnimals.toLocaleString()}
          icon={Package}
          color="blue"
          trend={stats.totalAnimals > 0 ? '+2.5%' : null}
          subtitle={`${stats.categoriesWithStock} categorías activas`}
        />
        
        <StatsCard
          title="Valor Inventario"
          value={`$${(stats.totalValue).toLocaleString()}`}
          icon={DollarSign}
          color="green"
          trend="+8.2%"
          subtitle="USD estimado"
        />
        
        <StatsCard
          title="Movimientos"
          value={stats.movementsThisMonth.toString()}
          icon={TrendingUp}
          color="purple"
          trend="+15.3%"
          subtitle="Este mes"
        />
        
        <StatsCard
          title="Estado"
          value={unreadCount > 0 ? 'Atención' : 'Normal'}
          icon={AlertTriangle}
          color={unreadCount > 0 ? 'amber' : 'green'}
          subtitle={`${unreadCount} alertas pendientes`}
        />
      </motion.div>

      {/* Tabs del Dashboard */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="categories">Categorías</TabsTrigger>
          <TabsTrigger value="movements">Movimientos</TabsTrigger>
          <TabsTrigger value="reports">Reportes</TabsTrigger>
        </TabsList>

        {/* Tab: Resumen */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Distribución por Categorías */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                  Distribución por Categoría
                </CardTitle>
                <CardDescription>
                  Inventario actual por tipo de animal
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CategoryDistribution 
                  categories={categories}
                  balances={categoryBalances}
                  total={stats.totalAnimals}
                />
              </CardContent>
            </Card>

            {/* Movimientos Recientes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                  Movimientos Recientes
                </CardTitle>
                <CardDescription>
                  Últimas transacciones del inventario
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RecentMovementsList movements={recentMovements} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Categorías */}
        <TabsContent value="categories" className="space-y-6">
          <CategoriesView 
            categories={categories}
            balances={categoryBalances}
          />
        </TabsContent>

        {/* Tab: Movimientos */}
        <TabsContent value="movements" className="space-y-6">
          <MovementsView movements={movements} />
        </TabsContent>

        {/* Tab: Reportes */}
        <TabsContent value="reports" className="space-y-6">
          <ReportsView />
        </TabsContent>
      </Tabs>

      {/* Formulario de Movimientos */}
      <MovementRegistration
        isOpen={showMovementModal}
        onClose={() => setShowMovementModal(false)}
        onSuccess={handleMovementSuccess}
      />
    </div>
  );
}

// ===== COMPONENTES AUXILIARES =====

interface StatsCardProps {
  title: string;
  value: string;
  icon: React.ComponentType<any>;
  color: 'blue' | 'green' | 'purple' | 'amber';
  trend?: string | null;
  subtitle?: string;
}

function StatsCard({ title, value, icon: Icon, color, trend, subtitle }: StatsCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600', 
    purple: 'bg-purple-50 text-purple-600',
    amber: 'bg-amber-50 text-amber-600'
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {subtitle && (
              <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
        
        {trend && (
          <div className="mt-3 flex items-center">
            <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
            <span className="text-xs text-green-500 font-medium">{trend}</span>
            <span className="text-xs text-gray-500 ml-1">vs mes anterior</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface CategoryDistributionProps {
  categories: AnimalCategory[];
  balances: Map<string, number>;
  total: number;
}

function CategoryDistribution({ categories, balances, total }: CategoryDistributionProps) {
  if (total === 0) {
    return (
      <div className="text-center py-8">
        <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">Sin inventario registrado</p>
        <p className="text-sm text-gray-400 mt-2">
          Registra tu primer movimiento para comenzar
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {categories
        .filter(cat => cat.isActive)
        .map((category) => {
          const balance = balances.get(category.id) || 0;
          const percentage = total > 0 ? (balance / total) * 100 : 0;
          
          return (
            <div key={category.id} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">
                  {category.label}
                </span>
                <div className="text-right">
                  <span className="text-sm font-bold text-gray-900">{balance}</span>
                  <span className="text-xs text-gray-500 ml-1">
                    ({percentage.toFixed(1)}%)
                  </span>
                </div>
              </div>
              <Progress value={percentage} className="h-2" />
            </div>
          );
        })}
    </div>
  );
}

interface RecentMovementsListProps {
  movements: InventoryMovement[];
}

function RecentMovementsList({ movements }: RecentMovementsListProps) {
  if (movements.length === 0) {
    return (
      <div className="text-center py-8">
        <TrendingUp className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">Sin movimientos recientes</p>
        <p className="text-sm text-gray-400 mt-2">
          Los movimientos aparecerán aquí una vez registrados
        </p>
      </div>
    );
  }

  const getMovementIcon = (type: MovementType) => {
    switch (type) {
      case 'COMPRA': return ShoppingCart;
      case 'VENTA': return DollarSign;
      case 'NACIMIENTO': return Plus;
      case 'MUERTE': return Minus;
      default: return TrendingUp;
    }
  };

  const getMovementColor = (type: MovementType) => {
    switch (type) {
      case 'COMPRA': return 'text-green-600 bg-green-50';
      case 'VENTA': return 'text-red-600 bg-red-50';
      case 'NACIMIENTO': return 'text-blue-600 bg-blue-50';
      case 'MUERTE': return 'text-gray-600 bg-gray-50';
      default: return 'text-purple-600 bg-purple-50';
    }
  };

  return (
    <div className="space-y-3">
      {movements.map((movement) => {
        const Icon = getMovementIcon(movement.tipo);
        const colorClass = getMovementColor(movement.tipo);
        
        return (
          <div key={movement.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${colorClass}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {movement.tipo} • {movement.categoria}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(movement.fecha).toLocaleDateString('es-ES')}
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-sm font-bold text-gray-900">
                {movement.cantidad > 0 ? '+' : ''}{movement.cantidad}
              </p>
              {movement.valorTotal && (
                <p className="text-xs text-gray-500">
                  ${movement.valorTotal.toLocaleString()}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Componentes placeholder para las otras vistas
function CategoriesView({ categories, balances }: { categories: AnimalCategory[], balances: Map<string, number> }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-center py-8">
          <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Vista de categorías en desarrollo</p>
          <p className="text-sm text-gray-400 mt-2">
            Próximamente: gestión avanzada de categorías
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function MovementsView({ movements }: { movements: InventoryMovement[] }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-center py-8">
          <TrendingUp className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Vista de movimientos en desarrollo</p>
          <p className="text-sm text-gray-400 mt-2">
            Movimientos registrados: {movements.length}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function ReportsView() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-center py-8">
          <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Vista de reportes en desarrollo</p>
          <p className="text-sm text-gray-400 mt-2">
            Próximamente: reportes financieros automáticos
          </p>
        </div>
      </CardContent>
    </Card>
  );
}