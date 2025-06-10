'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar, Weight, Heart, Tag } from 'lucide-react';

export interface CattleData {
  id?: string;
  tag: string;
  name?: string;
  breed: string;
  sex: 'male' | 'female';
  birthDate: string;
  weight?: number;
  healthStatus: 'excellent' | 'good' | 'fair' | 'poor';
  location?: string;
  notes?: string;
  purchasePrice?: number;
  purchaseDate?: string;
  motherId?: string;
  fatherId?: string;
}

interface AddCattleFormProps {
  onSubmit: (data: CattleData) => void;
  onCancel?: () => void;
  initialData?: Partial<CattleData>;
  isLoading?: boolean;
  submitLabel?: string;
  showOptionalFields?: boolean;
}

const COMMON_BREEDS = [
  'Angus',
  'Hereford', 
  'Charolais',
  'Simmental',
  'Limousin',
  'Brahman',
  'Brangus',
  'Beefmaster',
  'Gelbvieh',
  'Red Angus',
  'Holstein',
  'Jersey',
  'Guernsey',
  'Brown Swiss',
  'Ayrshire',
  'Criollo',
  'Cebu',
  'Santa Gertrudis',
  'Otro'
];

const AddCattleForm: React.FC<AddCattleFormProps> = ({
  onSubmit,
  onCancel,
  initialData = {},
  isLoading = false,
  submitLabel = 'Agregar Animal',
  showOptionalFields = true
}) => {
  const [formData, setFormData] = useState<CattleData>({
    tag: '',
    name: '',
    breed: '',
    sex: 'female',
    birthDate: '',
    weight: undefined,
    healthStatus: 'good',
    location: '',
    notes: '',
    purchasePrice: undefined,
    purchaseDate: '',
    motherId: '',
    fatherId: '',
    ...initialData
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showAdvanced, setShowAdvanced] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields validation
    if (!formData.tag.trim()) {
      newErrors.tag = 'El número de arete es obligatorio';
    }

    if (!formData.breed) {
      newErrors.breed = 'La raza es obligatoria';
    }

    if (!formData.birthDate) {
      newErrors.birthDate = 'La fecha de nacimiento es obligatoria';
    } else {
      const birthDate = new Date(formData.birthDate);
      const today = new Date();
      if (birthDate > today) {
        newErrors.birthDate = 'La fecha de nacimiento no puede ser futura';
      }
    }

    // Weight validation
    if (formData.weight && (formData.weight <= 0 || formData.weight > 2000)) {
      newErrors.weight = 'El peso debe estar entre 1 y 2000 kg';
    }

    // Purchase price validation
    if (formData.purchasePrice && formData.purchasePrice < 0) {
      newErrors.purchasePrice = 'El precio de compra no puede ser negativo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Clean up undefined values
      const cleanedData = Object.fromEntries(
        Object.entries(formData).filter(([_, value]) => value !== undefined && value !== '')
      ) as CattleData;

      onSubmit(cleanedData);
    }
  };

const handleInputChange = (field: keyof CattleData, value: string | number | undefined) => {    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const calculateAge = (birthDate: string): string => {
    if (!birthDate) return '';
    
    const birth = new Date(birthDate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - birth.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      return `${diffDays} días`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} ${months === 1 ? 'mes' : 'meses'}`;
    } else {
      const years = Math.floor(diffDays / 365);
      const remainingMonths = Math.floor((diffDays % 365) / 30);
      return `${years} ${years === 1 ? 'año' : 'años'}${remainingMonths > 0 ? ` ${remainingMonths} meses` : ''}`;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tag className="h-5 w-5" />
          {submitLabel}
        </CardTitle>
        <CardDescription>
          Complete la información básica del animal. Los campos marcados con * son obligatorios.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tag Number */}
            <div>
              <Label htmlFor="tag" className="text-sm font-medium">
                Número de Arete *
              </Label>
              <Input
                id="tag"
                value={formData.tag}
                onChange={(e) => handleInputChange('tag', e.target.value)}
                placeholder="Ej: 001, A-123"
                className={errors.tag ? 'border-red-500' : ''}
              />
              {errors.tag && (
                <p className="text-sm text-red-500 mt-1">{errors.tag}</p>
              )}
            </div>

            {/* Name */}
            <div>
              <Label htmlFor="name" className="text-sm font-medium">
                Nombre (Opcional)
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Ej: Estrella, Toro Negro"
              />
            </div>
          </div>

          {/* Breed and Sex */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Breed */}
            <div>
              <Label htmlFor="breed" className="text-sm font-medium">
                Raza *
              </Label>
              <Select
                value={formData.breed}
                onValueChange={(value) => handleInputChange('breed', value)}
              >
                <SelectTrigger className={errors.breed ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Seleccione la raza" />
                </SelectTrigger>
                <SelectContent>
                  {COMMON_BREEDS.map(breed => (
                    <SelectItem key={breed} value={breed}>
                      {breed}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.breed && (
                <p className="text-sm text-red-500 mt-1">{errors.breed}</p>
              )}
            </div>

            {/* Sex */}
            <div>
              <Label htmlFor="sex" className="text-sm font-medium">
                Sexo *
              </Label>
              <Select
                value={formData.sex}
                onValueChange={(value: 'male' | 'female') => handleInputChange('sex', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="female">Hembra</SelectItem>
                  <SelectItem value="male">Macho</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Birth Date and Weight */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Birth Date */}
            <div>
              <Label htmlFor="birthDate" className="text-sm font-medium">
                Fecha de Nacimiento *
              </Label>
              <div className="relative">
                <Input
                  id="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => handleInputChange('birthDate', e.target.value)}
                  className={errors.birthDate ? 'border-red-500' : ''}
                />
                <Calendar className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
              </div>
              {formData.birthDate && (
                <p className="text-sm text-gray-600 mt-1">
                  Edad: {calculateAge(formData.birthDate)}
                </p>
              )}
              {errors.birthDate && (
                <p className="text-sm text-red-500 mt-1">{errors.birthDate}</p>
              )}
            </div>

            {/* Weight */}
            <div>
              <Label htmlFor="weight" className="text-sm font-medium">
                Peso Actual (kg)
              </Label>
              <div className="relative">
                <Input
                  id="weight"
                  type="number"
                  value={formData.weight || ''}
                  onChange={(e) => handleInputChange('weight', parseFloat(e.target.value) || undefined)}
                  placeholder="Ej: 250"
                  min="1"
                  max="2000"
                  className={errors.weight ? 'border-red-500' : ''}
                />
                <Weight className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
              </div>
              {errors.weight && (
                <p className="text-sm text-red-500 mt-1">{errors.weight}</p>
              )}
            </div>
          </div>

          {/* Health Status */}
          <div>
            <Label htmlFor="healthStatus" className="text-sm font-medium">
              Estado de Salud
            </Label>
            <Select
              value={formData.healthStatus}
              onValueChange={(value: 'excellent' | 'good' | 'fair' | 'poor') => 
                handleInputChange('healthStatus', value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="excellent">
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="bg-green-500">Excelente</Badge>
                  </div>
                </SelectItem>
                <SelectItem value="good">
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="bg-blue-500">Bueno</Badge>
                  </div>
                </SelectItem>
                <SelectItem value="fair">
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="bg-yellow-500">Regular</Badge>
                  </div>
                </SelectItem>
                <SelectItem value="poor">
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive">Malo</Badge>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Advanced Fields Toggle */}
          {showOptionalFields && (
            <div>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="p-0 h-auto text-sm text-blue-600 hover:text-blue-800"
              >
                {showAdvanced ? 'Ocultar' : 'Mostrar'} campos adicionales
              </Button>
            </div>
          )}

          {/* Advanced Fields */}
          {showAdvanced && showOptionalFields && (
            <div className="space-y-4 border-t pt-4">
              {/* Location and Purchase Price */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location" className="text-sm font-medium">
                    Ubicación/Potrero
                  </Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="Ej: Potrero Norte, Establo A"
                  />
                </div>

                <div>
                  <Label htmlFor="purchasePrice" className="text-sm font-medium">
                    Precio de Compra
                  </Label>
                  <Input
                    id="purchasePrice"
                    type="number"
                    value={formData.purchasePrice || ''}
                    onChange={(e) => handleInputChange('purchasePrice', parseFloat(e.target.value) || undefined)}
                    placeholder="Ej: 15000"
                    min="0"
                    className={errors.purchasePrice ? 'border-red-500' : ''}
                  />
                  {errors.purchasePrice && (
                    <p className="text-sm text-red-500 mt-1">{errors.purchasePrice}</p>
                  )}
                </div>
              </div>

              {/* Purchase Date */}
              <div>
                <Label htmlFor="purchaseDate" className="text-sm font-medium">
                  Fecha de Compra
                </Label>
                <Input
                  id="purchaseDate"
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) => handleInputChange('purchaseDate', e.target.value)}
                />
              </div>

              {/* Parent IDs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="motherId" className="text-sm font-medium">
                    ID de la Madre
                  </Label>
                  <Input
                    id="motherId"
                    value={formData.motherId}
                    onChange={(e) => handleInputChange('motherId', e.target.value)}
                    placeholder="Ej: 001, M-123"
                  />
                </div>

                <div>
                  <Label htmlFor="fatherId" className="text-sm font-medium">
                    ID del Padre
                  </Label>
                  <Input
                    id="fatherId"
                    value={formData.fatherId}
                    onChange={(e) => handleInputChange('fatherId', e.target.value)}
                    placeholder="Ej: 002, T-456"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <Label htmlFor="notes" className="text-sm font-medium">
                  Notas Adicionales
                </Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Observaciones, características especiales, historial médico..."
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
                className="flex-1"
              >
                Cancelar
              </Button>
            )}
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Guardando...' : submitLabel}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddCattleForm;