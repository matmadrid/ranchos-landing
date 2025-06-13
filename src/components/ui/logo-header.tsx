// src/components/ui/logo-header.tsx
'use client';

import { cn } from '@/lib/utils';
import { Satellite } from 'lucide-react';

interface LogoHeaderProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

// Logo ESPECÍFICO para el header - estilizado como la imagen
export function LogoHeader({ className, size = 'md' }: LogoHeaderProps) {
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
      {/* ✅ Satélite con color específico #080434 */}
      <Satellite 
        className={cn(sizes[size])} 
        style={{ color: '#080434' }}
      />
      
      {/* ✅ Texto con degradado de oscuro a claro (Ranch más oscuro, OS más claro) */}
      <span className={cn("font-bold", textSizes[size])}>
        <span 
          className="bg-gradient-to-r from-gray-900 via-gray-700 to-gray-500 bg-clip-text text-transparent"
        >
          Ranch
        </span>
        <span 
          className="text-gray-400"
        >
          OS
        </span>
      </span>
    </div>
  );
}

export default LogoHeader;