// src/app/auth/onboarding/components/StepRanch.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, MapPin, Ruler, Beef, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

interface StepRanchProps {
  data: {
    name: string;
    location: string;
    size: string;
    type: 'dairy' | 'beef' | 'mixed';
  };
  onUpdate: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function StepRanch({ data, onUpdate, onNext, onBack }: StepRanchProps) {
  const [formData, setFormData] = useState(data);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const ranchTypes = [
    {
      value: 'dairy',
      label: 'Lechero',
      icon: '🥛',
      description: 'Especializado en producción de leche',
      gradient: 'from-blue-400 to-cyan-600'
    },
    {
      value: 'beef',
      label: 'Carne',
      icon: '🥩',
      description: 'Enfocado en ganado de engorde',
      gradient: 'from-red-400 to-pink-600'
    },
    {
      value: 'mixed',
      label: 'Mixto',
      icon: '🐄',
      description: 'Producción diversificada',
      gradient: 'from-purple-400 to-indigo-600'
    }
  ];

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    
    // Clear error when user types
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre del rancho es requerido';
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'La ubicación es requerida';
    }
    
    if (formData.size && isNaN(Number(formData.size))) {
      newErrors.size = 'El tamaño debe ser un número';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validate()) {
      onUpdate(formData);
      onNext();
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <motion.div
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-400 to-green-600 rounded-full mb-4 shadow-lg"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Building2 className="h-8 w-8 text-white" />
          </motion.div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Crea tu rancho
          </h2>
          
          <p className="text-gray-600">
            Configuremos tu espacio de trabajo ganadero
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Ranch name */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Label htmlFor="name" className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Building2 className="h-4 w-4 mr-2 text-gray-400" />
              Nombre del rancho
              <span className="text-red-500 ml-1">*</span>
            </Label>
            
            <Input
              id="name"
              placeholder="Rancho Los Alamos"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className={`h-12 ${errors.name ? 'border-red-500' : ''}`}
            />
            
            {errors.name && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-1 text-sm text-red-600"
              >
                {errors.name}
              </motion.p>
            )}
          </motion.div>

          {/* Location */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Label htmlFor="location" className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <MapPin className="h-4 w-4 mr-2 text-gray-400" />
              Ubicación
              <span className="text-red-500 ml-1">*</span>
            </Label>
            
            <Input
              id="location"
              placeholder="Jalisco, México"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              className={`h-12 ${errors.location ? 'border-red-500' : ''}`}
            />
            
            {errors.location && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-1 text-sm text-red-600"
              >
                {errors.location}
              </motion.p>
            )}
          </motion.div>

          {/* Size */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Label htmlFor="size" className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Ruler className="h-4 w-4 mr-2 text-gray-400" />
              Tamaño en hectáreas
              <span className="text-gray-400 text-xs ml-2">(opcional)</span>
            </Label>
            
            <Input
              id="size"
              type="number"
              placeholder="100"
              value={formData.size}
              onChange={(e) => handleChange('size', e.target.value)}
              className={`h-12 ${errors.size ? 'border-red-500' : ''}`}
            />
            
            {errors.size && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-1 text-sm text-red-600"
              >
                {errors.size}
              </motion.p>
            )}
          </motion.div>

          {/* Ranch type */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Label className="flex items-center text-sm font-medium text-gray-700 mb-4">
              <Beef className="h-4 w-4 mr-2 text-gray-400" />
              Tipo de rancho
              <span className="text-red-500 ml-1">*</span>
            </Label>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {ranchTypes.map((type, index) => (
                <motion.div
                  key={type.value}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  whileHover={{ y: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Card
                    className={`
                      relative p-4 cursor-pointer transition-all duration-300
                      ${formData.type === type.value ? 'ring-2 ring-primary-500 shadow-lg' : 'hover:shadow-md'}
                    `}
                    onClick={() => handleChange('type', type.value)}
                  >
                    {formData.type === type.value && (
                      <motion.div
                        className="absolute top-2 right-2"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500 }}
                      >
                        <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                      </motion.div>
                    )}
                    
                    <div className="text-center">
                      <div className="text-3xl mb-2">{type.icon}</div>
                      <h3 className="font-semibold text-gray-900">{type.label}</h3>
                      <p className="text-xs text-gray-600 mt-1">{type.description}</p>
                    </div>
                    
                    <div className={`mt-3 h-1 bg-gradient-to-r ${type.gradient} rounded-full opacity-20`} />
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Preview card */}
          {formData.name && formData.location && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl"
            >
              <p className="text-sm text-gray-600 mb-2">Vista previa:</p>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-green-600 rounded-lg flex items-center justify-center text-white font-bold">
                  {formData.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{formData.name}</h4>
                  <p className="text-sm text-gray-600">
                    {formData.location}
                    {formData.size && ` • ${formData.size} hectáreas`}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Actions */}
          <motion.div
            className="flex gap-3 pt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="flex-1"
            >
              Atrás
            </Button>
            
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Continuar
            </Button>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
}