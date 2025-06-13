// src/components/auth/CompleteProfileMessage.tsx
'use client';

import { motion } from 'framer-motion';
import { 
  Shield, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  Building2,
  Package,
  TrendingUp,
  AlertCircle,
  Zap,
  Cloud,
  BarChart3
} from 'lucide-react';

interface CompleteProfileMessageProps {
  ranchName?: string;
  animalCount?: number;
  productionData?: {
    totalProduction?: number;
    trend?: 'up' | 'down' | 'stable';
  };
}

export const CompleteProfileMessage = ({ 
  ranchName = 'tu rancho',
  animalCount = 0,
  productionData
}: CompleteProfileMessageProps) => {
  const benefits = [
    { 
      icon: Cloud, 
      text: 'Sincroniza tu información en todos tus dispositivos',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    { 
      icon: BarChart3, 
      text: 'Visualiza el progreso histórico de tu rancho',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    { 
      icon: Shield, 
      text: 'Respaldo automático de todos tus datos',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    { 
      icon: Zap, 
      text: 'Acceso completo a todas las funciones',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50'
    }
  ];

  const statsToSave = [
    { label: 'Rancho', value: ranchName, icon: Building2 },
    { label: 'Animales', value: `${animalCount} registrados`, icon: Package },
    ...(productionData?.totalProduction ? [{
      label: 'Producción',
      value: `${productionData.totalProduction.toFixed(1)} L`,
      icon: TrendingUp
    }] : [])
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="relative overflow-hidden"
    >
      {/* Fondo con gradiente animado */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50/50 to-purple-50/30" />
      
      {/* Patrón decorativo */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236366f1' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
      </div>
      
      {/* Contenido */}
      <div className="relative p-6 border border-blue-200/50 rounded-xl backdrop-blur-sm">
        {/* Header con animación */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-3">
            <motion.div
              initial={{ rotate: -10 }}
              animate={{ rotate: 0 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="relative"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <motion.div
                className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
            
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                ¡Asegura tu progreso!
                <motion.span
                  className="ml-2"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                </motion.span>
              </h3>
              
              <p className="text-sm text-gray-700 mt-1">
                Completa tu registro para mantener todos los datos que ya ingresaste
              </p>
            </div>
          </div>
          
          {/* Badge "Gratis" */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-semibold rounded-full shadow-md"
          >
            GRATIS
          </motion.div>
        </div>

        {/* Stats a guardar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
          {statsToSave.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + index * 0.1 }}
              className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-gray-200/50 shadow-sm"
            >
              <div className="flex items-center space-x-2 mb-1">
                <stat.icon className="w-4 h-4 text-gray-500" />
                <span className="text-xs text-gray-600">{stat.label}</span>
              </div>
              <p className="font-semibold text-gray-900 text-sm">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Beneficios con iconos */}
        <div className="space-y-2 mb-5">
          <p className="text-xs font-medium text-gray-700 mb-2">Al completar tu registro obtienes:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.05 }}
                className="flex items-center space-x-2"
              >
                <div className={`w-8 h-8 ${benefit.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <benefit.icon className={`w-4 h-4 ${benefit.color}`} />
                </div>
                <span className="text-xs text-gray-700">{benefit.text}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Alerta de temporalidad */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-start space-x-2 p-3 bg-amber-50 border border-amber-200 rounded-lg"
        >
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs font-medium text-amber-800">Importante</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Los datos temporales se eliminan al cerrar sesión. Regístrate ahora para conservarlos permanentemente.
            </p>
          </div>
        </motion.div>

        {/* Progress indicator animado */}
        <div className="mt-4 flex items-center justify-between text-xs text-gray-600">
          <span className="flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            Solo toma 2 minutos
          </span>
          <div className="flex items-center space-x-1">
            {[1, 2, 3].map((step) => (
              <motion.div
                key={step}
                className={`w-2 h-2 rounded-full ${step === 1 ? 'bg-blue-600' : 'bg-gray-300'}`}
                animate={step === 1 ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 1, repeat: Infinity }}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
