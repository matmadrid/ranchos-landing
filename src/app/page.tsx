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
  Cloud,
  MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WaitlistWidget } from '@/components/ui/waitlist-widget';

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
            {/* Título Principal */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6">
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">
                Gestión Ganadera
              </span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">
                de Síntesis
              </span>
            </h1>

            {/* Subtítulo */}
            <p className="mx-auto max-w-2xl text-xl sm:text-2xl text-gray-600 mb-10">
              Mejora tu operación, comprende el rendimiento y toma mejores decisiones con una herramienta diseñada para el rancho.

            </p>

            {/* Botones CTA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href="/waitlist">
                  <Button size="lg" className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300">
                    Comenzar 
                    <ArrowRight className="ml-2 h-5 w-5" />
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
                <Activity className="h-5 w-5 text-green-600" />
                <span>Análisis en tiempo real</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <MapPin className="h-5 w-5 text-purple-600" />
                <span>Trazabilidad</span>
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

      {/* ✅ SECCIONES ELIMINADAS: Estadísticas y CTA Final */}
      
      <WaitlistWidget />
    </div>
  );
}
// Force rebuild Mon Jun 16 13:54:47 PDT 2025
