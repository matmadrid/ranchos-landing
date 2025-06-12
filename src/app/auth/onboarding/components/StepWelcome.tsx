// src/app/auth/onboarding/components/StepWelcome.tsx

'use client';

import { motion } from 'framer-motion';
import { Sparkles, BarChart3, Heart, Shield, ArrowRight, Clock, Zap, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StepWelcomeProps {
  onNext: () => void;
  userName?: string;
}

export default function StepWelcome({ onNext, userName }: StepWelcomeProps) {
  const features = [
    {
      icon: BarChart3,
      title: 'Analytics Potentes',
      description: 'Visualiza el rendimiento de tu rancho en tiempo real',
      gradient: 'from-blue-400 to-cyan-600'
    },
    {
      icon: Heart,
      title: 'Salud del Ganado',
      description: 'Monitorea la salud y bienestar de cada animal',
      gradient: 'from-pink-400 to-rose-600'
    },
    {
      icon: Shield,
      title: 'Datos Seguros',
      description: 'Tu información siempre protegida y respaldada',
      gradient: 'from-emerald-400 to-green-600'
    }
  ];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Logo animation */}
      <motion.div
        className="text-center mb-8"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
      >
        <motion.div
          className="inline-block mb-4"
          animate={{
            y: [0, -10, 0],
            rotate: [0, 5, -5, 0]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <span className="text-6xl">🛰️</span>
        </motion.div>

        <motion.h1
          className="text-4xl md:text-5xl font-bold mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {userName ? (
            <>¡Hola, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">{userName}</span>!</>
          ) : (
            <>¡Bienvenido a <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">RanchOS</span>!</>
          )}
        </motion.h1>

        <motion.p
          className="text-xl text-gray-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          La plataforma más moderna para gestión ganadera
        </motion.p>
      </motion.div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="relative group"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity`} />
            
            <div className="relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 shadow-lg`}>
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              
              <h3 className="font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              
              <p className="text-sm text-gray-600">
                {feature.description}
              </p>

              <motion.div
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                whileHover={{ scale: 1.2 }}
              >
                <Sparkles className="h-4 w-4 text-yellow-500" />
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick stats */}
      <motion.div
        className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-2xl p-6 mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="flex justify-center mb-2">
              <Users className="h-5 w-5 text-primary-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">10</div>
            <div className="text-sm text-gray-600">Ganaderos activos</div>
          </div>
          <div>
            <div className="flex justify-center mb-2">
              <span className="text-xl">🐄</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">50</div>
            <div className="text-sm text-gray-600">Animales registrados</div>
          </div>
          <div>
            <div className="flex justify-center mb-2">
              <Zap className="h-5 w-5 text-yellow-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900">99.9%</div>
            <div className="text-sm text-gray-600">Uptime garantizado</div>
          </div>
        </div>
      </motion.div>

      {/* CTA section */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={onNext}
            size="lg"
            className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 group"
          >
            <span className="mr-2">Comenzar</span>
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>

        <motion.p
          className="mt-4 text-sm text-gray-500 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <Clock className="h-4 w-4 mr-1" />
          Tiempo estimado: 3 minutos
        </motion.p>
      </motion.div>
    </div>
  );
}