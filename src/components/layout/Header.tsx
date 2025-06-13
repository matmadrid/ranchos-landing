// src/components/layout/Header.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  Home, 
  BarChart3, 
  User, 
  Menu, 
  X, 
  ChevronDown,
  Sparkles,
  LogOut,
  Settings
} from 'lucide-react';
import { useState } from 'react';
import { useRouter } from "next/navigation";
import useRanchOSStore from '@/store';
import { Button } from '@/components/ui/button';

// ✅ IMPORTAR EL LOGO ESPECÍFICO PARA HEADER
import { LogoHeader } from '@/components/ui/logo-header';

// ✅ TRADUCCIONES AL ESPAÑOL (Dashboard se mantiene en inglés)
const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Analítica', href: '/analytics', icon: BarChart3 },
];

export default function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { currentUser, currentRanch } = useRanchOSStore();

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/auth/onboarding";
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* ✅ Logo - Izquierda */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 group">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <LogoHeader size="md" />
              </motion.div>
              
              {/* Sparkle effect on hover */}
              <motion.div
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                initial={{ scale: 0 }}
                whileHover={{ scale: 1 }}
              >
                <Sparkles className="h-4 w-4 text-yellow-500" />
              </motion.div>
            </Link>
          </div>

          {/* ✅ Navigation + User Menu - PEGADOS A LA DERECHA */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            
            {/* Navigation Desktop - junto al botón */}
            {navigation.map((item, index) => {
              const isActive = pathname === item.href;
              return (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      'relative px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'text-blue-600'
                        : 'text-gray-700 hover:text-blue-600'
                    )}
                  >
                    <div className="flex items-center space-x-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </div>
                    
                    {/* Active indicator animado */}
                    {isActive && (
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-green-600"
                        layoutId="activeNav"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      />
                    )}
                  </Link>
                </motion.div>
              );
            })}

            {/* User Menu - al final */}
            {!currentUser ? (
              <Button
                variant="outline"
                onClick={() => router.push("/auth/login")}
              >
                Ingresar
              </Button>
            ) : (
              <>
                {/* Ranch Selector */}
                {currentRanch && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center space-x-2 px-3 py-1.5 bg-gray-100 rounded-lg"
                  >
                    <span className="text-sm text-gray-600">Rancho:</span>
                    <span className="text-sm font-medium text-gray-900">{currentRanch.name}</span>
                  </motion.div>
                )}

                {/* User Dropdown con animaciones */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <motion.div 
                      whileHover={{ scale: 1.1 }}
                      className="w-8 h-8 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white font-medium"
                    >
                      {currentUser?.name?.charAt(0) || 'U'}
                    </motion.div>
                    <span className="text-sm font-medium text-gray-700">
                      {currentUser?.name || 'Usuario'}
                    </span>
                    <ChevronDown className={cn(
                      "h-4 w-4 text-gray-500 transition-transform",
                      userMenuOpen && "rotate-180"
                    )} />
                  </button>

                  {/* Dropdown Menu animado */}
                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border overflow-hidden"
                      >
                        {/* 🎯 ENLACE CORREGIDO: /profile (no /profile/settings) */}
                        <Link
                          href="/profile"
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          <Settings className="h-4 w-4" />
                          <span>Configuración</span>
                        </Link>
                        <button 
                          onClick={handleLogout}
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left transition-colors"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Cerrar sesión</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              type="button"
              className="p-2 text-gray-700"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <motion.div
                animate={{ rotate: mobileMenuOpen ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </motion.div>
            </button>
          </div>
        </div>

        {/* Mobile Navigation animada */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden py-4 border-t"
            >
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center space-x-2 px-3 py-2 text-base font-medium rounded-lg transition-colors',
                      isActive
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              
              {/* ✅ SIGN IN → INGRESAR en móvil */}
              {!currentUser ? (
                <div className="mt-4 px-3 py-2 border-t pt-4">
                  <Button
                    variant="outline"
                    onClick={() => router.push("/auth/login")}
                    className="w-full"
                  >
                    Ingresar
                  </Button>
                </div>
              ) : (
                <>
                  {/* Información del rancho en móvil */}
                  {currentRanch && (
                    <div className="mt-4 px-3 py-2 border-t pt-4">
                      <div className="flex items-center space-x-2 text-sm">
                        <span className="text-gray-600">Rancho:</span>
                        <span className="font-medium text-gray-900">{currentRanch.name}</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Usuario en móvil */}
                  <div className="mt-4 px-3 py-2 border-t pt-4">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white font-medium">
                        {currentUser?.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{currentUser?.name || 'Usuario'}</p>
                        <p className="text-sm text-gray-600">{currentUser?.email}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      {/* 🎯 ENLACE CORREGIDO EN MÓVIL TAMBIÉN: /profile */}
                      <Link
                        href="/profile"
                        className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Settings className="h-4 w-4" />
                        <span>Configuración</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg w-full text-left"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Cerrar sesión</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}