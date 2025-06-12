// src/app/auth/onboarding/components/StepProfile.tsx

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface StepProfileProps {
  data: {
    name: string;
    email: string;
    phone: string;
    location: string;
  };
  onUpdate: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function StepProfile({ data, onUpdate, onNext, onBack }: StepProfileProps) {
  const [formData, setFormData] = useState(data);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Auto-save on change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (Object.keys(touched).length > 0) {
        onUpdate(formData);
        setIsSaving(true);
        setTimeout(() => setIsSaving(false), 1000);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData, touched]);

  const validateField = (field: string, value: string) => {
    const newErrors = { ...errors };

    switch (field) {
      case 'name':
        if (!value.trim()) {
          newErrors.name = 'El nombre es requerido';
        } else if (value.length < 2) {
          newErrors.name = 'El nombre debe tener al menos 2 caracteres';
        } else {
          delete newErrors.name;
        }
        break;
      
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value.trim()) {
          newErrors.email = 'El email es requerido';
        } else if (!emailRegex.test(value)) {
          newErrors.email = 'Email inválido';
        } else {
          delete newErrors.email;
        }
        break;
      
      case 'phone':
        if (value && value.length < 10) {
          newErrors.phone = 'Número de teléfono inválido';
        } else {
          delete newErrors.phone;
        }
        break;
      
      case 'location':
        if (!value.trim()) {
          newErrors.location = 'La ubicación es requerida';
        } else {
          delete newErrors.location;
        }
        break;
    }

    setErrors(newErrors);
  };

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    setTouched({ ...touched, [field]: true });
    validateField(field, value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    Object.keys(formData).forEach(field => {
      validateField(field, formData[field as keyof typeof formData]);
    });

    // Check if there are errors
    if (Object.keys(errors).length === 0 && formData.name && formData.email && formData.location) {
      onUpdate(formData);
      onNext();
    } else {
      // Mark all fields as touched to show errors
      setTouched({
        name: true,
        email: true,
        phone: true,
        location: true
      });
    }
  };

  const fields = [
    { 
      name: 'name', 
      label: 'Nombre completo', 
      icon: User, 
      type: 'text', 
      placeholder: 'Juan Pérez',
      required: true 
    },
    { 
      name: 'email', 
      label: 'Correo electrónico', 
      icon: Mail, 
      type: 'email', 
      placeholder: 'juan@example.com',
      required: true 
    },
    { 
      name: 'phone', 
      label: 'Teléfono', 
      icon: Phone, 
      type: 'tel', 
      placeholder: '+52 123 456 7890',
      required: false 
    },
    { 
      name: 'location', 
      label: 'Ubicación', 
      icon: MapPin, 
      type: 'text', 
      placeholder: 'Ciudad, Estado',
      required: true 
    }
  ];

  return (
    <div className="max-w-lg mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <motion.div
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full mb-4 shadow-lg"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <User className="h-8 w-8 text-white" />
          </motion.div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Cuéntanos sobre ti
          </h2>
          
          <p className="text-gray-600">
            Personaliza tu experiencia en RanchOS
          </p>

          {/* Auto-save indicator */}
          <motion.div
            className="mt-4 flex items-center justify-center text-sm text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: isSaving ? 1 : 0 }}
          >
            <Check className="h-4 w-4 mr-1 text-green-500" />
            Guardado automáticamente
          </motion.div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {fields.map((field, index) => {
            const Icon = field.icon;
            const hasError = touched[field.name] && errors[field.name];
            const value = formData[field.name as keyof typeof formData];

            return (
              <motion.div
                key={field.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Label htmlFor={field.name} className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Icon className="h-4 w-4 mr-2 text-gray-400" />
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </Label>
                
                <div className="relative">
                  <Input
                    id={field.name}
                    type={field.type}
                    placeholder={field.placeholder}
                    value={value}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    className={`
                      pl-4 pr-10 h-12 transition-all duration-200
                      ${hasError ? 'border-red-500 focus:ring-red-500' : ''}
                      ${touched[field.name] && !hasError ? 'border-green-500 focus:ring-green-500' : ''}
                    `}
                  />
                  
                  {/* Status icon */}
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {touched[field.name] && !hasError && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500 }}
                      >
                        <Check className="h-5 w-5 text-green-500" />
                      </motion.div>
                    )}
                    {hasError && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500 }}
                      >
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      </motion.div>
                    )}
                  </div>
                </div>
                
                {/* Error message */}
                {hasError && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1 text-sm text-red-600"
                  >
                    {errors[field.name]}
                  </motion.p>
                )}
              </motion.div>
            );
          })}

          {/* Actions */}
          <motion.div
            className="flex gap-3 pt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
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