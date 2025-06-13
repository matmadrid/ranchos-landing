// src/components/cattle/EditAnimalModal.tsx
'use client';
import type { Cattle } from '@/types';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Save, Trash2, AlertTriangle } from 'lucide-react';
import useRanchOSStore from '@/store'; // CORRECCIÓN: import default


interface EditAnimalModalProps {
  animal: Cattle;
  isOpen: boolean;
  onClose: () => void;
}

const COMMON_BREEDS = [
  'Angus', 'Hereford', 'Charolais', 'Simmental', 'Limousin',
  'Brahman', 'Brangus', 'Beefmaster', 'Gelbvieh', 'Red Angus',
  'Holstein', 'Jersey', 'Pardo Suizo', 'Cebu'
];

const HEALTH_STATUS_OPTIONS = [
  { value: 'excellent', label: 'Excelente' },
  { value: 'good', label: 'Buena' },
  { value: 'fair', label: 'Regular' },
  { value: 'poor', label: 'Mala' }
];

export default function EditAnimalModal({ animal, isOpen, onClose }: EditAnimalModalProps) {
  const { updateAnimal, deleteAnimal } = useRanchOSStore(); // CORRECCIÓN: nombres de funciones del store
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formData, setFormData] = useState({
    tag: animal.tag,
    name: animal.name || '',
    breed: animal.breed,
    sex: animal.sex,
    birthDate: animal.birthDate,
    weight: animal.weight || '',
    healthStatus: animal.healthStatus,
    location: animal.location || '',
    notes: animal.notes || '',
    purchasePrice: animal.purchasePrice || '',
    purchaseDate: animal.purchaseDate || ''
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        tag: animal.tag,
        name: animal.name || '',
        breed: animal.breed,
        sex: animal.sex,
        birthDate: animal.birthDate,
        weight: animal.weight || '',
        healthStatus: animal.healthStatus,
        location: animal.location || '',
        notes: animal.notes || '',
        purchasePrice: animal.purchasePrice || '',
        purchaseDate: animal.purchaseDate || ''
      });
    }
  }, [animal, isOpen]);

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const updates = {
        tag: formData.tag,
        name: formData.name || undefined,
        breed: formData.breed,
        sex: formData.sex,
        birthDate: formData.birthDate,
        weight: formData.weight ? Number(formData.weight) : undefined,
        healthStatus: formData.healthStatus,
        location: formData.location || undefined,
        notes: formData.notes || undefined,
        purchasePrice: formData.purchasePrice ? Number(formData.purchasePrice) : undefined,
        purchaseDate: formData.purchaseDate || undefined,
        updatedAt: new Date().toISOString()
      };

      updateAnimal(animal.id, updates); // CORRECCIÓN: updateAnimal en lugar de updateCattle
      
      // Simular delay para mejor UX
      setTimeout(() => {
        setIsLoading(false);
        onClose();
      }, 500);
    } catch (error) {
      console.error('Error al actualizar animal:', error);
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    
    try {
      setTimeout(() => {
        deleteAnimal(animal.id); // CORRECCIÓN: deleteAnimal en lugar de removeCattle
        setIsLoading(false);
        setShowDeleteConfirm(false);
        onClose();
      }, 800);
    } catch (error) {
      console.error('Error al eliminar animal:', error);
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <Card className="border-0 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle>Editar animal</CardTitle>
              <CardDescription>
                Modifica los datos de {animal.name || animal.tag}
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Tag/ID */}
                <div className="space-y-2">
                  <Label htmlFor="tag">Etiqueta/ID *</Label>
                  <Input
                    id="tag"
                    value={formData.tag}
                    onChange={(e) => handleChange('tag', e.target.value)}
                    required
                  />
                </div>

                {/* Nombre */}
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="Opcional"
                  />
                </div>

                {/* Raza */}
                <div className="space-y-2">
                  <Label htmlFor="breed">Raza *</Label>
                  <Select value={formData.breed} onValueChange={(value) => handleChange('breed', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COMMON_BREEDS.map((breed) => (
                        <SelectItem key={breed} value={breed}>
                          {breed}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Género */}
                <div className="space-y-2">
                  <Label htmlFor="sex">Género *</Label>
                  <Select value={formData.sex} onValueChange={(value) => handleChange('sex', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="female">🐄 Hembra</SelectItem>
                      <SelectItem value="male">🐂 Macho</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Fecha nacimiento */}
                <div className="space-y-2">
                  <Label htmlFor="birthDate">Fecha de nacimiento *</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => handleChange('birthDate', e.target.value)}
                    required
                  />
                </div>

                {/* Peso */}
                <div className="space-y-2">
                  <Label htmlFor="weight">Peso (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    value={formData.weight}
                    onChange={(e) => handleChange('weight', e.target.value)}
                    placeholder="Ej: 450"
                  />
                </div>

                {/* Estado de salud */}
                <div className="space-y-2">
                  <Label htmlFor="healthStatus">Estado de salud</Label>
                  <Select value={formData.healthStatus} onValueChange={(value) => handleChange('healthStatus', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {HEALTH_STATUS_OPTIONS.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Ubicación */}
                <div className="space-y-2">
                  <Label htmlFor="location">Ubicación</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                    placeholder="Ej: Potrero 1"
                  />
                </div>

              </div>

              {/* Notas */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notas</Label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md resize-none"
                  rows={3}
                  placeholder="Observaciones adicionales..."
                />
              </div>

              {/* Botones */}
              {!showDeleteConfirm ? (
                <div className="flex justify-between pt-4">
                  {/* Botón eliminar a la izquierda */}
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={isLoading}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar Animal
                  </Button>
                  
                  {/* Botones de acción a la derecha */}
                  <div className="flex space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onClose}
                      disabled={isLoading}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="flex items-center space-x-2"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Guardando...</span>
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          <span>Guardar Cambios</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                /* Confirmación de eliminación */
                <div className="space-y-4 pt-4">
                  <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-red-900 mb-2">
                          ¿Eliminar {animal.name || animal.tag}?
                        </h4>
                        <p className="text-sm text-red-700 mb-3">
                          Esta acción eliminará permanentemente toda la información del animal, 
                          incluyendo registros de producción e historial médico. 
                          <strong> Esta acción no se puede deshacer.</strong>
                        </p>
                        <div className="text-sm text-red-600">
                          <strong>Animal:</strong> {animal.name || animal.tag} • {animal.breed} • 
                          {animal.sex === 'female' ? ' Hembra' : ' Macho'}
                          {animal.weight && ` • ${animal.weight} kg`}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowDeleteConfirm(false)}
                      disabled={isLoading}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={handleDelete}
                      disabled={isLoading}
                      className="flex items-center space-x-2"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Eliminando...</span>
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4" />
                          <span>Eliminar Definitivamente</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}