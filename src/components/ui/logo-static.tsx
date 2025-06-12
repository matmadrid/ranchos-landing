// src/components/ui/logo-static.tsx
'use client';

import { cn } from '@/lib/utils';
import { Cpu, Layers, Box, Hexagon, Home, Satellite } from 'lucide-react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

// OPCIÓN 1: Ícono SVG personalizado estilo tech
export function LogoTech({ className, size = 'md' }: LogoProps) {
  const sizes = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
    xl: 'h-12 w-12'
  };

  const textSizes = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl'
  };

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <svg 
        className={cn(sizes[size], "text-blue-600")}
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          d="M12 2L2 7L12 12L22 7L12 2Z" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        <path 
          d="M2 17L12 22L22 17" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        <path 
          d="M2 12L12 17L22 12" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </svg>
      <span className={cn(
        "font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent",
        textSizes[size]
      )}>
        RanchOS
      </span>
    </div>
  );
}

// OPCIÓN 2: Ícono de granja modernizado
export function LogoFarm({ className, size = 'md' }: LogoProps) {
  const sizes = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
    xl: 'h-12 w-12'
  };

  const textSizes = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl'
  };

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <svg 
        className={cn(sizes[size])}
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          d="M3 21H21M4 21V7L12 3L20 7V21" 
          stroke="url(#gradient1)" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        <path 
          d="M9 9H9.01M15 9H15.01M9 15H15V21" 
          stroke="url(#gradient1)" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        <defs>
          <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>
      </svg>
      <span className={cn(
        "font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent",
        textSizes[size]
      )}>
        RanchOS
      </span>
    </div>
  );
}

// OPCIÓN 3: Ícono hexagonal (panal/tech) - AZUL SÓLIDO
export function LogoHex({ className, size = 'md' }: LogoProps) {
  const sizes = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
    xl: 'h-12 w-12'
  };

  const textSizes = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl'
  };

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <svg 
        className={cn(sizes[size])}
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Fondo del hexágono con opacidad */}
        <path 
          d="M12 2L20 7V17L12 22L4 17V7L12 2Z" 
          fill="#2563eb"
          opacity="0.1"
        />
        {/* Borde del hexágono */}
        <path 
          d="M12 2L20 7V17L12 22L4 17V7L12 2Z" 
          stroke="#2563eb" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        {/* Diseño interior */}
        <path 
          d="M12 8V16M8 10L12 8L16 10M8 14L12 16L16 14" 
          stroke="#2563eb" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </svg>
      <span className={cn(
        "font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent",
        textSizes[size]
      )}>
        RanchOS
      </span>
    </div>
  );
}

// OPCIÓN 4: Ícono circular con R
export function LogoCircle({ className, size = 'md' }: LogoProps) {
  const sizes = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
    xl: 'h-12 w-12'
  };

  const textSizes = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl'
  };

  const fontSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  };

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <div className={cn(
        "relative flex items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-green-600 text-white font-bold",
        sizes[size]
      )}>
        <span className={fontSizes[size]}>R</span>
      </div>
      <span className={cn(
        "font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent",
        textSizes[size]
      )}>
        RanchOS
      </span>
    </div>
  );
}

// OPCIÓN 5: Usar Lucide Icons
export function LogoLucide({ className, size = 'md', icon = 'cpu' }: LogoProps & { icon?: string }) {
  const sizes = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
    xl: 'h-12 w-12'
  };

  const textSizes = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl'
  };

  const icons = {
    cpu: Cpu,
    layers: Layers,
    box: Box,
    hexagon: Hexagon,
    home: Home,
    satellite: Satellite
  };

  const Icon = icons[icon as keyof typeof icons] || Cpu;

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <Icon className={cn(sizes[size], "text-blue-600")} />
      <span className={cn(
        "font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent",
        textSizes[size]
      )}>
        RanchOS
      </span>
    </div>
  );
}

// OPCIÓN 6: Logo con Satellite (como Space Ranch)
export function LogoSatellite({ className, size = 'md' }: LogoProps) {
  const sizes = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
    xl: 'h-12 w-12'
  };

  const textSizes = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl'
  };

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <Satellite className={cn(sizes[size], "text-blue-600")} />
      <span className={cn(
        "font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent",
        textSizes[size]
      )}>
        RanchOS
      </span>
    </div>
  );
}

// Componente de logo simple sin gradientes
export function LogoSimple({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <Satellite className="h-8 w-8 text-blue-600" />
      <span className="text-2xl font-bold text-gray-900">RanchOS</span>
    </div>
  );
}

// Componente de logo para loading
export function LogoLoading() {
  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="animate-pulse">
        <Satellite className="h-12 w-12 text-blue-600" />
      </div>
      <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent animate-pulse">
        RanchOS
      </span>
    </div>
  );
}

// Exportar LogoSatellite como default
export default LogoSatellite;