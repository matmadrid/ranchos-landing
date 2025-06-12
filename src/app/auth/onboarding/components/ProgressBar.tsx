// src/app/auth/onboarding/components/ProgressBar.tsx

'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  completedSteps: number[];
}

const stepNames = [
  'Bienvenida',
  'Tu Perfil',
  'Tu Rancho',
  'Primer Animal',
  '¡Listo!'
];

export default function ProgressBar({ 
  currentStep, 
  totalSteps, 
  completedSteps 
}: ProgressBarProps) {
  const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div className="relative">
      {/* Progress line background */}
      <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200" />
      
      {/* Animated progress line */}
      <motion.div
        className="absolute top-5 left-0 h-0.5 bg-gradient-to-r from-primary-500 to-primary-600"
        initial={{ width: '0%' }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />

      {/* Steps */}
      <div className="relative flex justify-between">
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1;
          const isCompleted = completedSteps.includes(stepNumber);
          const isCurrent = stepNumber === currentStep;
          const isPast = stepNumber < currentStep;

          return (
            <motion.div
              key={stepNumber}
              className="flex flex-col items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {/* Step circle */}
              <motion.div
                className={`
                  relative w-10 h-10 rounded-full flex items-center justify-center
                  transition-all duration-300 cursor-pointer
                  ${isCurrent ? 'bg-gradient-to-br from-primary-500 to-primary-600 shadow-lg shadow-primary-500/30' : ''}
                  ${isPast ? 'bg-primary-500' : ''}
                  ${!isCurrent && !isPast ? 'bg-gray-200' : ''}
                `}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {isPast ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500 }}
                  >
                    <Check className="h-5 w-5 text-white" />
                  </motion.div>
                ) : (
                  <span className={`text-sm font-medium ${
                    isCurrent ? 'text-white' : 'text-gray-500'
                  }`}>
                    {stepNumber}
                  </span>
                )}

                {/* Pulse effect for current step */}
                {isCurrent && (
                  <motion.div
                    className="absolute inset-0 rounded-full bg-primary-500"
                    animate={{
                      scale: [1, 1.3, 1.3],
                      opacity: [0.3, 0, 0]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeOut"
                    }}
                  />
                )}
              </motion.div>

              {/* Step name */}
              <motion.span
                className={`
                  mt-2 text-xs font-medium transition-colors duration-300
                  ${isCurrent ? 'text-primary-600' : ''}
                  ${isPast ? 'text-gray-700' : ''}
                  ${!isCurrent && !isPast ? 'text-gray-400' : ''}
                `}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                {stepNames[index]}
              </motion.span>

              {/* Tooltip on hover */}
              {isCurrent && (
                <motion.div
                  className="absolute -bottom-8 px-2 py-1 bg-gray-900 text-white text-xs rounded"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  Paso actual
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}