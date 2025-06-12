
// src/app/auth/onboarding/components/OnboardingLayout.tsx

'use client';

import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProgressBar from './ProgressBar';

interface OnboardingLayoutProps {
  currentStep: number;
  totalSteps: number;
  completedSteps: number[];
  onBack?: () => void;
  onSkip?: () => void;
  children: React.ReactNode;
}

export default function OnboardingLayout({
  currentStep,
  totalSteps,
  completedSteps,
  onBack,
  onSkip,
  children
}: OnboardingLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200 rounded-full blur-3xl opacity-20"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-200 rounded-full blur-3xl opacity-20"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.2, 0.25, 0.2]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Main container */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="px-6 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            {onBack ? (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onBack}
                  className="group"
                >
                  <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                  Atrás
                </Button>
              </motion.div>
            ) : (
              <div />
            )}

            {onSkip && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onSkip}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Omitir por ahora
                </Button>
              </motion.div>
            )}
          </div>
        </header>

        {/* Progress bar */}
        <div className="px-6">
          <div className="max-w-4xl mx-auto">
            <ProgressBar
              currentStep={currentStep}
              totalSteps={totalSteps}
              completedSteps={completedSteps}
            />
          </div>
        </div>

        {/* Content */}
        <main className="flex-1 px-6 py-8">
          <div className="max-w-4xl mx-auto">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="px-6 py-4 border-t bg-white/50 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto">
            <p className="text-center text-sm text-gray-500">
              🛰️ RanchOS - La plataforma más moderna para gestión ganadera
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}