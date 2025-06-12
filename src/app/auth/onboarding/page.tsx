// src/app/auth/onboarding/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Package } from 'lucide-react';
import useRanchOSStore from '@/store';
import { AuthCookieManager } from '@/lib/auth-cookies';
import { useToast } from '@/hooks/useToast';
import OnboardingLayout from './components/OnboardingLayout';
import StepWelcome from './components/StepWelcome';
import StepProfile from './components/StepProfile';
import StepRanch from './components/StepRanch';
import StepAnimal from './components/StepAnimal';
import StepSuccess from './components/StepSuccess';

const TOTAL_STEPS = 5;

interface OnboardingData {
  profile: {
    name: string;
    email: string;
    phone: string;
    location: string;
  };
  ranch: {
    name: string;
    location: string;
    size: string;
    type: 'dairy' | 'beef' | 'mixed';
  };
  animal: {
    tag: string;
    name: string;
    breed: string;
    sex: 'male' | 'female';
    birthDate: string;
    weight: string;
  };
}

/**
 * Flujo de Onboarding RanchOS
 * 
 * Permite a usuarios nuevos explorar la plataforma antes de registrarse
 * Crea un usuario temporal con datos de demostración
 */
export default function OnboardingPage() {
  const router = useRouter();
  const { success: showSuccess, error: showError } = useToast();
  
  const { 
    setCurrentUser,
    addRanch,
    setActiveRanch,
    addCattle,
    ranches
  } = useRanchOSStore();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Datos del formulario
  const [formData, setFormData] = useState<OnboardingData>({
    profile: {
      name: '',
      email: '',
      phone: '',
      location: ''
    },
    ranch: {
      name: '',
      location: '',
      size: '',
      type: 'mixed'
    },
    animal: {
      tag: '',
      name: '',
      breed: '',
      sex: 'female',
      birthDate: '',
      weight: ''
    }
  });

  // Cargar progreso guardado
  useEffect(() => {
    const savedStep = localStorage.getItem('onboarding-step');
    const savedData = localStorage.getItem('onboarding-data');
    
    if (savedStep) {
      setCurrentStep(parseInt(savedStep));
    }
    
    if (savedData) {
      try {
        setFormData(JSON.parse(savedData));
      } catch (e) {
        console.error('Error al cargar datos guardados:', e);
      }
    }
  }, []);

  // Guardar progreso
  const saveProgress = () => {
    localStorage.setItem('onboarding-step', currentStep.toString());
    localStorage.setItem('onboarding-data', JSON.stringify(formData));
  };

  // Limpiar progreso
  const clearProgress = () => {
    localStorage.removeItem('onboarding-step');
    localStorage.removeItem('onboarding-data');
  };

  // Navegación entre pasos
  const handleNext = () => {
    if (currentStep < TOTAL_STEPS && !isTransitioning) {
      setIsTransitioning(true);
      setCompletedSteps([...completedSteps, currentStep]);
      
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        saveProgress();
        setIsTransitioning(false);
      }, 300);
    }
  };

  const handleBack = () => {
    if (currentStep > 1 && !isTransitioning) {
      setIsTransitioning(true);
      
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
        saveProgress();
        setIsTransitioning(false);
      }, 300);
    }
  };

  const handleSkip = () => {
    if (currentStep === 4) {
      // Saltar creación de animal
      handleNext();
    }
  };

  // Actualizar datos del formulario
  const updateFormData = (step: keyof OnboardingData, data: any) => {
    setFormData(prev => ({
      ...prev,
      [step]: { ...prev[step], ...data }
    }));
  };

  // Completar onboarding
  const completeOnboarding = async () => {
    if (isProcessing) return;
    
    try {
      setIsProcessing(true);
      
      // 1. Crear usuario TEMPORAL (demo)
      const tempUserId = `demo-${Date.now()}`;
      const tempUser = {
        id: tempUserId,
        name: formData.profile.name || 'Ganadero Demo',
        email: formData.profile.email || `demo${Date.now()}@ranchos.app`,
        phone: formData.profile.phone,
        location: formData.profile.location,
        countryCode: 'MX' as const, // México por defecto
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setCurrentUser(tempUser);

      // 2. Crear rancho
      const ranchData = {
        name: formData.ranch.name || 'Rancho Demo',
        location: formData.ranch.location || 'México',
        size: parseInt(formData.ranch.size) || 100,
        sizeUnit: 'hectare' as const,
        type: formData.ranch.type,
        description: `Rancho ${formData.ranch.type === 'dairy' ? 'lechero' : formData.ranch.type === 'beef' ? 'de carne' : 'mixto'}`,
        isActive: true,
        countryCode: 'MX' as const
      };
      
      // El store devuelve una Promise con ProcessingResult
      const ranchResult = await addRanch(ranchData);
      
      if (!ranchResult.success) {
        throw new Error('Error al crear el rancho');
      }

      // 3. Obtener el ID del rancho creado
      const newRanchId = ranchResult.data?.id;
      
      if (!newRanchId) {
        throw new Error('No se pudo obtener el ID del rancho');
      }

      // 4. Establecer rancho activo
      if (ranchResult.data) {
        setActiveRanch(ranchResult.data);
      }

      // 5. Crear animal si se proporcionó
      if (formData.animal.tag && formData.animal.breed) {
        const animalData = {
          tag: formData.animal.tag,
          name: formData.animal.name || `${formData.animal.breed} #1`,
          breed: formData.animal.breed,
          sex: formData.animal.sex,
          birthDate: formData.animal.birthDate,
          weight: formData.animal.weight ? parseInt(formData.animal.weight) : undefined,
          healthStatus: 'good' as const,
          notes: 'Animal de demostración',
          ranchId: newRanchId
        };
        
        await addCattle(animalData);
      }

      // 6. Configurar cookies para usuario temporal
      AuthCookieManager.setTemporaryUser(tempUserId, newRanchId);
      
      // 7. Limpiar progreso guardado
      clearProgress();
      
      // 8. Mostrar notificación de éxito
      showSuccess(
        '¡Excelente!', 
        'Tu rancho demo está listo. Explora todas las funciones.'
      );
      
      // 9. Navegar al dashboard después de la celebración
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);
      
    } catch (error) {
      console.error('Error al completar onboarding:', error);
      showError(
        'Error al crear tu rancho',
        'Por favor intenta nuevamente o contacta soporte.'
      );
      setIsProcessing(false);
    }
  };

  // Renderizar paso actual
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <StepWelcome 
            onNext={handleNext}
            userName={formData.profile.name}
          />
        );
      case 2:
        return (
          <StepProfile 
            data={formData.profile}
            onUpdate={(data) => updateFormData('profile', data)}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 3:
        return (
          <StepRanch
            data={formData.ranch}
            onUpdate={(data) => updateFormData('ranch', data)}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 4:
        return (
          <StepAnimal
            data={formData.animal}
            onUpdate={(data) => updateFormData('animal', data)}
            onNext={handleNext}
            onBack={handleBack}
            onSkip={handleSkip}
          />
        );
      case 5:
        return (
          <StepSuccess
            data={formData}
            onComplete={completeOnboarding}
          />
        );
      default:
        return null;
    }
  };

  return (
    <OnboardingLayout
      currentStep={currentStep}
      totalSteps={TOTAL_STEPS}
      completedSteps={completedSteps}
      onBack={currentStep > 1 ? handleBack : undefined}
      onSkip={currentStep === 4 ? handleSkip : undefined}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ 
            duration: 0.5,
            ease: [0.4, 0, 0.2, 1]
          }}
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>
      
      {/* Indicador de procesamiento */}
      {isProcessing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
        >
          <div className="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center">
            <Package className="h-12 w-12 text-blue-600 animate-pulse mb-4" />
            <p className="text-lg font-semibold text-gray-900">Creando tu rancho...</p>
            <p className="text-sm text-gray-600 mt-2">Esto tomará solo un momento</p>
          </div>
        </motion.div>
      )}
    </OnboardingLayout>
  );
}