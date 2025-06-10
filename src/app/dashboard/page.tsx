// src/app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store';
import { UserProfilePrompt } from '@/components/dashboard/UserProfilePrompt';

export default function DashboardPage() {
  const router = useRouter();
  const { 
    currentUser, 
    currentRanch,
    profilePromptDismissed, 
    setProfilePromptDismissed,
    isOnboardingComplete 
  } = useStore();
  const [showProfilePrompt, setShowProfilePrompt] = useState(false);

  useEffect(() => {
    // Mostrar el prompt solo si:
    // 1. El usuario no tiene perfil completo
    // 2. No lo ha descartado previamente
    // 3. Ha pasado el onboarding
    const shouldShowPrompt = 
      (!currentUser?.name || !currentUser?.phone) && 
      !profilePromptDismissed &&
      isOnboardingComplete;
    
    setShowProfilePrompt(shouldShowPrompt);
  }, [currentUser, profilePromptDismissed, isOnboardingComplete]);

  const handleDismissPrompt = () => {
    setProfilePromptDismissed(true);
    setShowProfilePrompt(false);
  };

  const handleCompleteProfile = () => {
    setProfilePromptDismissed(true);
    setShowProfilePrompt(false);
    router.push('/profile');
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Bienvenido {currentUser?.name || 'Ganadero'}
        </h1>
        <p className="text-gray-600 mt-1">
          {currentRanch ? `Rancho ${currentRanch.name}` : 'Dashboard principal'}
        </p>
      </div>
      
      {/* Métricas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Animales</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Producción Hoy</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">0 L</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Tareas Pendientes</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Alertas</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
        </div>
      </div>

      {/* Contenido principal del dashboard */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Actividad Reciente</h2>
        <p className="text-gray-500">No hay actividad reciente para mostrar.</p>
      </div>
      
      {/* Prompt de perfil */}
      {showProfilePrompt && (
        <UserProfilePrompt 
          onDismiss={handleDismissPrompt}
          onComplete={handleCompleteProfile}
        />
      )}
    </div>
  );
}