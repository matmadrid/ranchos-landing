// src/app/auth/onboarding/components/StepAnimal.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Tag, Heart, Calendar, Weight, Info, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface StepAnimalProps {
  data: {
    tag: string;
    name: string;
    breed: string;
    sex: 'male' | 'female';
    birthDate: string;
    weight: string;
  };
  onUpdate: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

export default function StepAnimal({ data, onUpdate, onNext, onBack, onSkip }: StepAnimalProps) {
  const [formData, setFormData] = useState(data);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const commonBreeds = [
    'Holstein',
    'Jersey',
    'Angus',
    'Hereford',
    'Brahman',
    'Charolais',
    'Simmental',
    'Limousin',
    'Nelore',
    'Guzerat'
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
    
    if (!formData.tag.trim()) {
      newErrors.tag = 'La etiqueta es requerida';
    }
    
    if (!formData.breed) {
      newErrors.breed = 'La raza es requerida';
    }
    
    if (!formData.birthDate) {
      newErrors.birthDate = 'La fecha de nacimiento es requerida';
    } else {
      const birthDate = new Date(formData.birthDate);
      const today = new Date();
      if (birthDate > today) {
        newErrors.birthDate = 'La fecha no puede ser futura';
      }
    }
    
    if (formData.weight && isNaN(Number(formData.weight))) {
      newErrors.weight = 'El peso debe ser un número';
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

  const handleSkipClick = () => {
    // Clear animal data and proceed
    onUpdate({
      tag: '',
      name: '',
      breed: '',
      sex: 'female',
      birthDate: '',
      weight: ''
    });
    onSkip();
  };

  // Calculate age from birthDate
  const calculateAge = (birthDate: string) => {
    if (!birthDate) return '';
    
    const birth = new Date(birthDate);
    const today = new Date();
    const months = (today.getFullYear() - birth.getFullYear()) * 12 + 
                  (today.getMonth() - birth.getMonth());
    
    if (months < 12) {
      return `${months} meses`;
    } else {
      const years = Math.floor(months / 12);
      const remainingMonths = months % 12;
      return `${years} año${years > 1 ? 's' : ''}${remainingMonths > 0 ? ` y ${remainingMonths} meses` : ''}`;
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
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-600 rounded-full mb-4 shadow-lg"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <span className="text-3xl">🐄</span>
          </motion.div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Registra tu primer animal
          </h2>
          
          <p className="text-gray-600">
            Comienza a construir tu inventario ganadero
          </p>

          {/* Skip notice */}
          <motion.div
            className="mt-4 inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Info className="h-4 w-4 mr-2" />
            Este paso es opcional, puedes omitirlo
          </motion.div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tag and Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Label htmlFor="tag" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Tag className="h-4 w-4 mr-2 text-gray-400" />
                Etiqueta
                <span className="text-red-500 ml-1">*</span>
              </Label>
              
              <Input
                id="tag"
                placeholder="A-001"
                value={formData.tag}
                onChange={(e) => handleChange('tag', e.target.value)}
                className={`h-12 ${errors.tag ? 'border-red-500' : ''}`}
              />
              
              {errors.tag && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1 text-sm text-red-600"
                >
                  {errors.tag}
                </motion.p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Label htmlFor="name" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Heart className="h-4 w-4 mr-2 text-gray-400" />
                Nombre
                <span className="text-gray-400 text-xs ml-2">(opcional)</span>
              </Label>
              
              <Input
                id="name"
                placeholder="Bessie"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="h-12"
              />
            </motion.div>
          </div>

          {/* Breed and Sex */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Label htmlFor="breed" className="text-sm font-medium text-gray-700 mb-2">
                Raza
                <span className="text-red-500 ml-1">*</span>
              </Label>
              
              <Select value={formData.breed} onValueChange={(value) => handleChange('breed', value)}>
                <SelectTrigger className={`h-12 ${errors.breed ? 'border-red-500' : ''}`}>
                  <SelectValue placeholder="Seleccionar raza" />
                </SelectTrigger>
                <SelectContent>
                  {commonBreeds.map(breed => (
                    <SelectItem key={breed} value={breed}>{breed}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {errors.breed && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1 text-sm text-red-600"
                >
                  {errors.breed}
                </motion.p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Label className="text-sm font-medium text-gray-700 mb-2">
                Sexo
                <span className="text-red-500 ml-1">*</span>
              </Label>
              
              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  type="button"
                  onClick={() => handleChange('sex', 'female')}
                  className={`
                    h-12 rounded-lg border-2 transition-all duration-200
                    ${formData.sex === 'female' 
                      ? 'border-pink-500 bg-pink-50 text-pink-700' 
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="text-lg mr-1">♀</span> Hembra
                </motion.button>
                
                <motion.button
                  type="button"
                  onClick={() => handleChange('sex', 'male')}
                  className={`
                    h-12 rounded-lg border-2 transition-all duration-200
                    ${formData.sex === 'male' 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="text-lg mr-1">♂</span> Macho
                </motion.button>
              </div>
            </motion.div>
          </div>

          {/* Birth date and Weight */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Label htmlFor="birthDate" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                Fecha de nacimiento
                <span className="text-red-500 ml-1">*</span>
              </Label>
              
              <Input
                id="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={(e) => handleChange('birthDate', e.target.value)}
                className={`h-12 ${errors.birthDate ? 'border-red-500' : ''}`}
                max={new Date().toISOString().split('T')[0]}
              />
              
              {formData.birthDate && (
                <p className="mt-1 text-sm text-gray-600">
                  Edad: {calculateAge(formData.birthDate)}
                </p>
              )}
              
              {errors.birthDate && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1 text-sm text-red-600"
                >
                  {errors.birthDate}
                </motion.p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Label htmlFor="weight" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Weight className="h-4 w-4 mr-2 text-gray-400" />
                Peso (kg)
                <span className="text-gray-400 text-xs ml-2">(opcional)</span>
              </Label>
              
              <Input
                id="weight"
                type="number"
                placeholder="450"
                value={formData.weight}
                onChange={(e) => handleChange('weight', e.target.value)}
                className={`h-12 ${errors.weight ? 'border-red-500' : ''}`}
              />
              
              {errors.weight && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1 text-sm text-red-600"
                >
                  {errors.weight}
                </motion.p>
              )}
            </motion.div>
          </div>

          {/* Preview card */}
          {formData.tag && formData.breed && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl"
            >
              <p className="text-sm text-gray-600 mb-2">Vista previa:</p>
              <div className="flex items-center space-x-3">
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center text-2xl
                  ${formData.sex === 'female' 
                    ? 'bg-gradient-to-br from-pink-400 to-purple-600' 
                    : 'bg-gradient-to-br from-blue-400 to-cyan-600'
                  }
                `}>
                  {formData.sex === 'female' ? '🐄' : '🐂'}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {formData.name || formData.tag}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {formData.breed} • {formData.sex === 'female' ? 'Hembra' : 'Macho'}
                    {formData.weight && ` • ${formData.weight} kg`}
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
            transition={{ delay: 0.7 }}
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
              type="button"
              variant="ghost"
              onClick={handleSkipClick}
              className="flex-1 text-gray-600 hover:text-gray-900"
            >
              <SkipForward className="h-4 w-4 mr-2" />
              Omitir
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