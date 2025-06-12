// src/app/auth/onboarding/components/StepSuccess.tsx
'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Sparkles, Home, Plus, Share2, Trophy, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import confetti from 'canvas-confetti';

interface StepSuccessProps {
  data: {
    profile: { name: string; location: string };
    ranch: { name: string; type: string };
    animal: { tag: string; breed: string };
  };
  onComplete: () => void;
}

export default function StepSuccess({ data, onComplete }: StepSuccessProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Trigger confetti after component mounts
    const timer = setTimeout(() => {
      setShowConfetti(true);
      
      // Fire confetti
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      }, 250);

      return () => clearInterval(interval);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const achievements = [
    {
      icon: Trophy,
      title: 'Perfil Creado',
      description: 'Tu cuenta está lista',
      gradient: 'from-yellow-400 to-orange-600'
    },
    {
      icon: Building2,
      title: data.ranch.name,
      description: `Rancho ${data.ranch.type === 'dairy' ? 'lechero' : data.ranch.type === 'beef' ? 'de carne' : 'mixto'} activo`,
      gradient: 'from-emerald-400 to-green-600'
    },
    ...(data.animal.tag ? [{
      icon: '🐄' as any,
      title: 'Primer Animal',
      description: `${data.animal.breed} registrado`,
      gradient: 'from-purple-400 to-indigo-600'
    }] : [])
  ];

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'RanchOS - Gestión Ganadera',
        text: `¡Acabo de registrar mi rancho ${data.ranch.name} en RanchOS! 🐄`,
        url: window.location.origin
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto text-center">
      {/* Success icon */}
      <motion.div
        className="mb-8"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
      >
        <div className="relative inline-block">
          <motion.div
            className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl"
            animate={{
              boxShadow: [
                '0 0 0 0 rgba(16, 185, 129, 0.4)',
                '0 0 0 20px rgba(16, 185, 129, 0)',
                '0 0 0 0 rgba(16, 185, 129, 0)',
              ]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeOut"
            }}
          >
            <CheckCircle className="h-12 w-12 text-white" />
          </motion.div>
          
          {/* Sparkles around */}
          <motion.div
            className="absolute -top-2 -right-2"
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="h-6 w-6 text-yellow-500" />
          </motion.div>
        </div>
      </motion.div>

      {/* Title */}
      <motion.h1
        className="text-4xl md:text-5xl font-bold mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        ¡Felicidades, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">{data.profile.name}</span>!
      </motion.h1>

      <motion.p
        className="text-xl text-gray-600 mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        Tu aventura ganadera comienza ahora
      </motion.p>

      {/* Achievements */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {achievements.map((achievement, index) => (
          <motion.div
            key={achievement.title}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            whileHover={{ y: -5 }}
          >
            <Card className="p-6 text-center hover:shadow-lg transition-all duration-300">
              {typeof achievement.icon === 'string' ? (
                <div className="text-3xl mb-3">{achievement.icon}</div>
              ) : (
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${achievement.gradient} flex items-center justify-center mx-auto mb-3 shadow-lg`}>
                  <achievement.icon className="h-6 w-6 text-white" />
                </div>
              )}
              
              <h3 className="font-semibold text-gray-900 mb-1">
                {achievement.title}
              </h3>
              
              <p className="text-sm text-gray-600">
                {achievement.description}
              </p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Stats summary */}
      <motion.div
        className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-2xl p-6 mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <h3 className="font-semibold text-gray-900 mb-4">Tu RanchOS está listo</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-primary-600">1</div>
            <div className="text-sm text-gray-600">Rancho activo</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-secondary-600">
              {data.animal.tag ? '1' : '0'}
            </div>
            <div className="text-sm text-gray-600">Animal{data.animal.tag ? '' : 'es'}</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-amber-600">∞</div>
            <div className="text-sm text-gray-600">Posibilidades</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">24/7</div>
            <div className="text-sm text-gray-600">Soporte</div>
          </div>
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div
        className="space-y-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            onClick={onComplete}
            size="lg"
            className="w-full md:w-auto bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 group"
          >
            <Home className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform" />
            Ir al Dashboard
          </Button>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-3 justify-center">
          {!data.animal.tag && (
            <Button
              variant="outline"
              onClick={() => window.location.href = '/animals/new'}
              className="group"
            >
              <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform" />
              Agregar animales
            </Button>
          )}
          
          <Button
            variant="ghost"
            onClick={handleShare}
            className="text-gray-600 hover:text-gray-900"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Compartir logro
          </Button>
        </div>
      </motion.div>

      {/* Motivational quote */}
      <motion.div
        className="mt-12 p-6 border-l-4 border-primary-500 bg-gray-50 rounded-r-lg"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.2 }}
      >
        <p className="text-gray-700 italic">
          "El éxito en la ganadería comienza con un buen sistema de gestión"
        </p>
        <p className="text-sm text-gray-500 mt-2">
          - Equipo RanchOS
        </p>
      </motion.div>
    </div>
  );
}