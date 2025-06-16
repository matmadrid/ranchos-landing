// src/components/inventory/MovementRegistration.tsx
/**
 * @version 1.0.0
 * @author TorresLaveaga
 * @cosmovision SpaceRanch Sistemas Dinámicos Universales
 * 
 * BATALLA 6: Motor de Inventario Ganadero
 * Formulario completo para registro de movimientos de inventario
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Save,
  Calculator,
  AlertTriangle,
  CheckCircle,
  Package,
  DollarSign,
  Calendar,
  FileText,
  Truck,
  Scale
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Import del store y tipos
import useRanchOSStore from '@/store';
import { 
  MovementType, 
  MovementStatus,
  type InventoryMovement,
  MOVEMENT_TYPE_COLORS,
  MOVEMENT_TYPE_ICONS
} from '@/types/inventory';

// ===== INTERFACES =====

interface MovementFormData {
  fecha: string;
  tipo: MovementType | '';
  categoriaId: string;
  cantidad: number | '';
  valorUnitario: number | '';
  valorTotal: number | '';
  costoFlete: number | '';
  costoComisiones: number | '';
  precioMercadoDia: number | '';
  precioNegociado: number | '';
  vendedorComprador: string;
  destino: string;
  origen: string;
  pesoObservado: number | '';
  pesoPromedio: number | '';
  observaciones: string;
}

interface MovementRegistrationProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (movement: InventoryMovement) => void;
}

// ===== COMPONENTE PRINCIPAL =====

export default function MovementRegistration({ 
  isOpen, 
  onClose, 
  onSuccess 
}: MovementRegistrationProps) {
  // Store principal
  const store = useRanchOSStore();
  
  // Estados del formulario
  const [formData, setFormData] = useState<MovementFormData>({
    fecha: new Date().toISOString().split('T')[0],
    tipo: '',
    categoriaId: '',
    cantidad: '',
    valorUnitario: '',
    valorTotal: '',
    costoFlete: '',
    costoComisiones: '',
    precioMercadoDia: '',
    precioNegociado: '',
    vendedorComprador: '',
    destino: '',
    origen: '',
    pesoObservado: '',
    pesoPromedio: '',
    observaciones: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calculatedBalance, setCalculatedBalance] = useState<number | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Datos del store
  const categories = store.categories || [];
  const currentRanch = store.activeRanch || store.currentRanch;
  const currentUser = store.currentUser;
  const isProcessing = store.isProcessing || false;

  // Efectos

  useEffect(() => {
    if (formData.cantidad && formData.valorUnitario) {
      const total = Number(formData.cantidad) * Number(formData.valorUnitario);
      setFormData(prev => ({ ...prev, valorTotal: total }));
    }
  }, [formData.cantidad, formData.valorUnitario]);

  // Handlers
  const handleInputChange = (field: keyof MovementFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const calculateBalance = useCallback(() => {
    if (!store.getCategoryBalance || !formData.categoriaId || !formData.tipo || !formData.cantidad) {
      setCalculatedBalance(null);
      return;
    }

    const currentBalance = store.getCategoryBalance(formData.categoriaId);
    const quantity = Number(formData.cantidad);
    
    let newBalance = currentBalance;
    
    switch (formData.tipo) {
      case MovementType.COMPRA:
      case MovementType.NACIMIENTO:
      case MovementType.TRANSFERENCIA_IN:
        newBalance += quantity;
        break;
      case MovementType.VENTA:
      case MovementType.MUERTE:
      case MovementType.TRANSFERENCIA_OUT:
        newBalance -= quantity;
        break;
      case MovementType.AJUSTE:
        newBalance += quantity; // quantity puede ser +/-
        break;
    }
    
    setCalculatedBalance(newBalance);
  }, [store, formData.categoriaId, formData.tipo, formData.cantidad]);

  // Efecto para recalcular balance cuando cambien los datos
  useEffect(() => {
    if (formData.categoriaId && formData.tipo && formData.cantidad) {
      calculateBalance();
    }
  }, [formData.categoriaId, formData.tipo, formData.cantidad, calculateBalance]);

  // Efecto para recalcular balance cuando cambien los datos
  useEffect(() => {
    if (formData.categoriaId && formData.tipo && formData.cantidad) {
      calculateBalance();
    }
  }, [formData.categoriaId, formData.tipo, formData.cantidad, calculateBalance]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validaciones básicas
    if (!formData.fecha) newErrors.fecha = 'Fecha es requerida';
    if (!formData.tipo) newErrors.tipo = 'Tipo de movimiento es requerido';
    if (!formData.categoriaId) newErrors.categoriaId = 'Categoría es requerida';
    if (!formData.cantidad || formData.cantidad === 0) {
      newErrors.cantidad = 'Cantidad debe ser diferente de cero';
    }

    // Validaciones por tipo de movimiento
    if (formData.tipo === MovementType.COMPRA || formData.tipo === MovementType.VENTA) {
      if (!formData.vendedorComprador.trim()) {
        newErrors.vendedorComprador = 'Vendedor/Comprador es requerido para compras y ventas';
      }
      if (!formData.valorUnitario || Number(formData.valorUnitario) <= 0) {
        newErrors.valorUnitario = 'Valor unitario es requerido para compras y ventas';
      }
    }

    if (formData.tipo === MovementType.TRANSFERENCIA_IN || formData.tipo === MovementType.TRANSFERENCIA_OUT) {
      if (!formData.origen && formData.tipo === MovementType.TRANSFERENCIA_IN) {
        newErrors.origen = 'Origen es requerido para transferencias entrantes';
      }
    }

    // Validación de stock negativo
    if (calculatedBalance !== null && calculatedBalance < 0) {
      newErrors.cantidad = `El movimiento resultaría en stock negativo (${calculatedBalance})`;
    }

    // Validaciones financieras
    if (formData.valorTotal && Number(formData.valorTotal) < 0) {
      newErrors.valorTotal = 'Valor total no puede ser negativo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !currentRanch || !currentUser || !store.addMovement) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const currentBalance = store.getCategoryBalance ? store.getCategoryBalance(formData.categoriaId) : 0;
      const selectedCategory = categories.find(c => c.id === formData.categoriaId);
      
      const movementData = {
        fecha: formData.fecha,
        tipo: formData.tipo as MovementType,
        status: MovementStatus.CONFIRMED,
        numeroMovimiento: `${formData.tipo.substr(0, 4)}-${Date.now()}`,
        categoriaId: formData.categoriaId,
        categoria: selectedCategory?.label || 'Categoría desconocida',
        cantidad: Number(formData.cantidad),
        saldoInicial: currentBalance,
        valorUnitario: formData.valorUnitario ? Number(formData.valorUnitario) : undefined,
        valorTotal: formData.valorTotal ? Number(formData.valorTotal) : undefined,
        costoFlete: formData.costoFlete ? Number(formData.costoFlete) : undefined,
        costoComisiones: formData.costoComisiones ? Number(formData.costoComisiones) : undefined,
        precioMercadoDia: formData.precioMercadoDia ? Number(formData.precioMercadoDia) : undefined,
        precioNegociado: formData.precioNegociado ? Number(formData.precioNegociado) : undefined,
        vendedorComprador: formData.vendedorComprador || 'No especificado',
        destino: formData.destino || currentRanch.name,
        origen: formData.origen || undefined,
        pesoObservado: formData.pesoObservado ? Number(formData.pesoObservado) : undefined,
        pesoPromedio: formData.pesoPromedio ? Number(formData.pesoPromedio) : undefined,
        observaciones: formData.observaciones || undefined,
        ranchId: currentRanch.id,
        userId: currentUser.id
      };

      const result = await store.addMovement(movementData);
      
      if (result.success && result.data) {
        setShowSuccess(true);
        setTimeout(() => {
          onSuccess?.(result.data!);
          onClose();
          resetForm();
        }, 1500);
      } else {
        const errorMessage = result.errors?.[0]?.message || 'Error desconocido al crear movimiento';
        setErrors({ submit: errorMessage });
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error inesperado';
      setErrors({ submit: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      fecha: new Date().toISOString().split('T')[0],
      tipo: '',
      categoriaId: '',
      cantidad: '',
      valorUnitario: '',
      valorTotal: '',
      costoFlete: '',
      costoComisiones: '',
      precioMercadoDia: '',
      precioNegociado: '',
      vendedorComprador: '',
      destino: '',
      origen: '',
      pesoObservado: '',
      pesoPromedio: '',
      observaciones: ''
    });
    setErrors({});
    setCalculatedBalance(null);
    setShowSuccess(false);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      resetForm();
      onClose();
    }
  };

  if (!isOpen) return null;

  // Vista de éxito
  if (showSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center"
        >
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            ¡Movimiento Registrado!
          </h3>
          <p className="text-gray-600">
            El movimiento se ha guardado exitosamente en el inventario.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden"
      >
        <Card className="border-0">
          <CardHeader className="border-b bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Package className="h-6 w-6 text-blue-600" />
                <div>
                  <CardTitle>Registrar Movimiento de Inventario</CardTitle>
                  <CardDescription>
                    Agregar nuevo movimiento al sistema de inventario ganadero
                  </CardDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="overflow-y-auto max-h-[calc(90vh-120px)]">
            <form onSubmit={handleSubmit} className="space-y-6 py-6">
              {/* Información Básica */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fecha" className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Fecha
                  </Label>
                  <Input
                    id="fecha"
                    type="date"
                    value={formData.fecha}
                    onChange={(e) => handleInputChange('fecha', e.target.value)}
                    className={errors.fecha ? 'border-red-500' : ''}
                  />
                  {errors.fecha && (
                    <p className="text-sm text-red-500">{errors.fecha}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo de Movimiento</Label>
                  <Select
                    value={formData.tipo}
                    onValueChange={(value) => handleInputChange('tipo', value as MovementType)}
                  >
                    <SelectTrigger className={errors.tipo ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(MovementType).map((type) => (
                        <SelectItem key={type} value={type}>
                          <div className="flex items-center space-x-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: MOVEMENT_TYPE_COLORS[type] }}
                            />
                            <span>{type}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.tipo && (
                    <p className="text-sm text-red-500">{errors.tipo}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoriaId">Categoría</Label>
                  <Select
                    value={formData.categoriaId}
                    onValueChange={(value) => handleInputChange('categoriaId', value)}
                  >
                    <SelectTrigger className={errors.categoriaId ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.filter(cat => cat.isActive).map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.categoriaId && (
                    <p className="text-sm text-red-500">{errors.categoriaId}</p>
                  )}
                </div>
              </div>

              {/* Cantidad y Balance */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cantidad">Cantidad</Label>
                  <Input
                    id="cantidad"
                    type="number"
                    value={formData.cantidad}
                    onChange={(e) => handleInputChange('cantidad', Number(e.target.value))}
                    placeholder="Número de animales"
                    className={errors.cantidad ? 'border-red-500' : ''}
                  />
                  {errors.cantidad && (
                    <p className="text-sm text-red-500">{errors.cantidad}</p>
                  )}
                </div>

                {calculatedBalance !== null && (
                  <div className="space-y-2">
                    <Label className="flex items-center">
                      <Calculator className="h-4 w-4 mr-2" />
                      Balance Resultante
                    </Label>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <Badge 
                        variant={calculatedBalance >= 0 ? "default" : "destructive"}
                        className="text-lg px-3 py-1"
                      >
                        {calculatedBalance} animales
                      </Badge>
                    </div>
                  </div>
                )}
              </div>

              {/* Información Financiera */}
              {(formData.tipo === MovementType.COMPRA || formData.tipo === MovementType.VENTA) && (
                <div className="space-y-4 p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                  <h4 className="font-semibold text-green-900 flex items-center">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Información Financiera
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="valorUnitario">Valor Unitario ($)</Label>
                      <Input
                        id="valorUnitario"
                        type="number"
                        step="0.01"
                        value={formData.valorUnitario}
                        onChange={(e) => handleInputChange('valorUnitario', Number(e.target.value))}
                        className={errors.valorUnitario ? 'border-red-500' : ''}
                      />
                      {errors.valorUnitario && (
                        <p className="text-sm text-red-500">{errors.valorUnitario}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="valorTotal">Valor Total ($)</Label>
                      <Input
                        id="valorTotal"
                        type="number"
                        step="0.01"
                        value={formData.valorTotal}
                        onChange={(e) => handleInputChange('valorTotal', Number(e.target.value))}
                        className={errors.valorTotal ? 'border-red-500' : ''}
                      />
                      {errors.valorTotal && (
                        <p className="text-sm text-red-500">{errors.valorTotal}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="precioNegociado">Precio Negociado (@)</Label>
                      <Input
                        id="precioNegociado"
                        type="number"
                        step="0.01"
                        value={formData.precioNegociado}
                        onChange={(e) => handleInputChange('precioNegociado', Number(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="costoFlete">Costo Flete ($)</Label>
                      <Input
                        id="costoFlete"
                        type="number"
                        step="0.01"
                        value={formData.costoFlete}
                        onChange={(e) => handleInputChange('costoFlete', Number(e.target.value))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="costoComisiones">Comisiones ($)</Label>
                      <Input
                        id="costoComisiones"
                        type="number"
                        step="0.01"
                        value={formData.costoComisiones}
                        onChange={(e) => handleInputChange('costoComisiones', Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Información de Ubicación */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vendedorComprador" className="flex items-center">
                    <Truck className="h-4 w-4 mr-2" />
                    {formData.tipo === MovementType.COMPRA ? 'Vendedor' : 
                     formData.tipo === MovementType.VENTA ? 'Comprador' : 'Contacto'}
                  </Label>
                  <Input
                    id="vendedorComprador"
                    value={formData.vendedorComprador}
                    onChange={(e) => handleInputChange('vendedorComprador', e.target.value)}
                    placeholder="Nombre del vendedor/comprador"
                    className={errors.vendedorComprador ? 'border-red-500' : ''}
                  />
                  {errors.vendedorComprador && (
                    <p className="text-sm text-red-500">{errors.vendedorComprador}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="destino">Destino</Label>
                  <Input
                    id="destino"
                    value={formData.destino}
                    onChange={(e) => handleInputChange('destino', e.target.value)}
                    placeholder={currentRanch?.name || 'Destino'}
                  />
                </div>
              </div>

              {/* Información de Peso */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pesoObservado" className="flex items-center">
                    <Scale className="h-4 w-4 mr-2" />
                    Peso Total Observado (kg)
                  </Label>
                  <Input
                    id="pesoObservado"
                    type="number"
                    step="0.1"
                    value={formData.pesoObservado}
                    onChange={(e) => handleInputChange('pesoObservado', Number(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pesoPromedio">Peso Promedio (kg/animal)</Label>
                  <Input
                    id="pesoPromedio"
                    type="number"
                    step="0.1"
                    value={formData.pesoPromedio}
                    onChange={(e) => handleInputChange('pesoPromedio', Number(e.target.value))}
                  />
                </div>
              </div>

              {/* Observaciones */}
              <div className="space-y-2">
                <Label htmlFor="observaciones" className="flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Observaciones
                </Label>
                <Textarea
                  id="observaciones"
                  value={formData.observaciones}
                  onChange={(e) => handleInputChange('observaciones', e.target.value)}
                  placeholder="Notas adicionales sobre el movimiento..."
                  className="min-h-[80px]"
                />
              </div>

              {/* Alertas */}
              {calculatedBalance !== null && calculatedBalance < 0 && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-700">
                    ⚠️ Este movimiento resultaría en stock negativo ({calculatedBalance} animales).
                    Verifica la cantidad antes de continuar.
                  </AlertDescription>
                </Alert>
              )}

              {errors.submit && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-700">
                    {errors.submit}
                  </AlertDescription>
                </Alert>
              )}

              {/* Botones */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || isProcessing || (calculatedBalance !== null && calculatedBalance < 0)}
                  className="min-w-[120px]"
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Guardando...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Save className="h-4 w-4 mr-2" />
                      Guardar
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}