// src/components/ui/logo.tsx
'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  animated?: boolean;
  className?: string;
}

export function Logo({ 
  size = 'md', 
  showText = true, 
  animated = true,
  className 
}: LogoProps) {
  const sizeClasses = {
    sm: { emoji: 'text-2xl', text: 'text-xl' },
    md: { emoji: 'text-3xl', text: 'text-2xl' },
    lg: { emoji: 'text-4xl', text: 'text-3xl' },
    xl: { emoji: 'text-5xl', text: 'text-4xl' }
  };

  const { emoji: emojiSize, text: textSize } = sizeClasses[size];

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      {/* Satellite Emoji with rotation */}
      <motion.div
        className="relative"
        animate={animated ? { rotate: 360 } : {}}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        <span className={emojiSize}>🛰️</span>
        
        {/* Orbital dots effect */}
        {animated && (
          <motion.div
            className="absolute inset-0"
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="absolute top-0 left-1/2 w-1 h-1 bg-blue-500 rounded-full -translate-x-1/2" />
            <div className="absolute bottom-0 left-1/2 w-1 h-1 bg-green-500 rounded-full -translate-x-1/2" />
            <div className="absolute left-0 top-1/2 w-1 h-1 bg-purple-500 rounded-full -translate-y-1/2" />
            <div className="absolute right-0 top-1/2 w-1 h-1 bg-yellow-500 rounded-full -translate-y-1/2" />
          </motion.div>
        )}
      </motion.div>

      {/* RanchOS Text */}
      {showText && (
        <motion.span
          className={cn(
            "font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent",
            textSize
          )}
          initial={animated ? { opacity: 0, x: -20 } : {}}
          animate={animated ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          RanchOS
        </motion.span>
      )}
    </div>
  );
}

// Variantes del logo para diferentes usos
export function LogoSimple() {
  return (
    <div className="flex items-center space-x-1">
      <span className="text-2xl">🛰️</span>
      <span className="font-bold text-gray-900">RanchOS</span>
    </div>
  );
}

export function LogoAnimated() {
  return (
    <div className="flex items-center space-x-2 group cursor-pointer">
      <motion.div
        whileHover={{ scale: 1.1, rotate: 180 }}
        transition={{ duration: 0.5 }}
      >
        <span className="text-3xl">🛰️</span>
      </motion.div>
      <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent animate-gradient">
        RanchOS
      </span>
    </div>
  );
}

// Loading animation version
export function LogoLoading() {
  return (
    <div className="flex flex-col items-center space-y-4">
      <motion.div
        animate={{ 
          rotate: 360,
          scale: [1, 1.2, 1]
        }}
        transition={{ 
          rotate: { duration: 2, repeat: Infinity, ease: "linear" },
          scale: { duration: 1, repeat: Infinity }
        }}
      >
        <span className="text-5xl">🛰️</span>
      </motion.div>
      <motion.span
        className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        RanchOS
      </motion.span>
      <motion.div className="flex space-x-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-blue-600 rounded-full"
            animate={{ y: [0, -10, 0] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.2
            }}
          />
        ))}
      </motion.div>
    </div>
  );
}