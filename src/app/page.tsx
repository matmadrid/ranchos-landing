'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  BarChart3, 
  Satellite, 
  Shield, 
  Sparkles,
  Package,
  Trees,
  Truck,
  Sprout,
  TrendingUp,
  Leaf,
  DollarSign,
  Smartphone,
  Brain,
  Zap,
  Users,
  Activity,
  Cloud
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LogoSatellite } from '@/components/ui/logo-static';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Formas animadas de fondo */}
        <div className="absolute inset-0">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute bg-gradient-to-br from-blue-400/10 to-green-400/10 rounded-full"
              style={{
                width: `${20 + i * 10}%`,
                height: `${20 + i * 10}%`,
                left: `${10 + i * 15}%`,
                top: `${10 + i * 12}%`,
              }}
              animate={{
                x: [0, 50 - i * 10, 0],
                y: [0, 30 - i * 8, 0],
              }}
              transition={{
                duration: 20 + i * 2,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>

        {/* Contenido */}
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            {/* Logo */}
            <motion.div 
              className="flex justify-center mb-8"
              whileHover={{ scale: 1.05 }}
            >
              <LogoSatellite size="xl" />
            </motion.div>

            {/* Título Principal */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6">
              Gestión Ganadera Moderna
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">
                Simplificada
              </span>
            </h1>

            {/* Subtítulo */}
            <p className="mx-auto max-w-2xl text-xl sm:text-2xl text-gray-600 mb-10">
              Rastrea tu ganado, analiza el rendimiento y optimiza operaciones con nuestra plataforma inteligente diseñada para el ganadero moderno.
            </p>

            {/* Botones CTA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href="/auth/onboarding">
                  <Button size="lg" className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300">
                    Comenzar Gratis
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href="/auth/login">
                  <Button size="lg" variant="outline" className="px-8 py-6 text-lg border-2 hover:bg-gray-50 transition-all duration-300">
                    Iniciar Sesión
                  </Button>
                </Link>
              </motion.div>
            </div>

            {/* Badges de confianza */}
            <motion.div 
              className="mt-10 flex flex-wrap justify-center gap-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <div className="flex items-center space-x-2 text-gray-600">
                <Shield className="h-5 w-5 text-blue-600" />
                <span>Seguridad bancaria</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Activity className="h-5 w-5 text-green-600" />
                <span>Análisis en tiempo real</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Satellite className="h-5 w-5 text-purple-600" />
                <span>Rastreo satelital</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Sección de Características */}
      <div className="py-24 bg-white/50 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Todo lo que necesitas para administrar tu rancho
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Desde el rastreo del ganado hasta análisis financieros, tenemos todo cubierto
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Package className="h-10 w-10" />,
                color: 'text-green-600',
                bgColor: 'bg-green-50',
                title: 'Gestión de Ganado',
                description: 'Rastrea salud, reproducción y ubicación de cada animal'
              },
              {
                icon: <TrendingUp className="h-10 w-10" />,
                color: 'text-blue-600',
                bgColor: 'bg-blue-50',
                title: 'Análisis de Rendimiento',
                description: 'Toma decisiones basadas en datos con información en tiempo real'
              },
              {
                icon: <Trees className="h-10 w-10" />,
                color: 'text-emerald-600',
                bgColor: 'bg-emerald-50',
                title: 'Optimización de Pastos',
                description: 'Maximiza el uso de la tierra con planificación inteligente'
              },
              {
                icon: <DollarSign className="h-10 w-10" />,
                color: 'text-amber-600',
                bgColor: 'bg-amber-50',
                title: 'Control Financiero',
                description: 'Monitorea gastos, ingresos y rentabilidad'
              },
              {
                icon: <Smartphone className="h-10 w-10" />,
                color: 'text-indigo-600',
                bgColor: 'bg-indigo-50',
                title: 'Acceso Móvil',
                description: 'Administra tu rancho desde cualquier lugar'
              },
              {
                icon: <Brain className="h-10 w-10" />,
                color: 'text-purple-600',
                bgColor: 'bg-purple-50',
                title: 'Inteligencia Artificial',
                description: 'Obtén predicciones y recomendaciones automatizadas'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className={`inline-flex p-3 rounded-xl ${feature.bgColor} mb-4`}>
                  <div className={feature.color}>{feature.icon}</div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Sección de Estadísticas */}
      <div className="py-16 bg-gradient-to-r from-blue-600 to-green-600">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            {[
              { icon: <Users className="h-8 w-8" />, number: '10,000+', label: 'Ganaderos activos' },
              { icon: <Package className="h-8 w-8" />, number: '50,000+', label: 'Animales registrados' },
              { icon: <Cloud className="h-8 w-8" />, number: '99.9%', label: 'Disponibilidad' },
              { icon: <Zap className="h-8 w-8" />, number: '24/7', label: 'Soporte técnico' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-white"
              >
                <div className="inline-flex p-3 bg-white/20 rounded-full mb-4">
                  {stat.icon}
                </div>
                <div className="text-4xl font-bold mb-2">{stat.number}</div>
                <div className="text-white/80">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Final */}
      <div className="py-24 bg-gradient-to-br from-gray-50 to-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-4xl text-center px-4 sm:px-6 lg:px-8"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            ¿Listo para modernizar tu rancho?
          </h2>
          <p className="text-xl text-gray-600 mb-10">
            Únete a miles de ganaderos que ya confían en RanchOS
          </p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link href="/auth/onboarding">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300">
                Inicia tu prueba gratis
                <Sparkles className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
          
          <p className="mt-6 text-sm text-gray-500">
            Sin tarjeta de crédito • Configuración en 3 minutos • Cancela cuando quieras
          </p>
        </motion.div>
      </div>
    </div>
  );
}