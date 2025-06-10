// src/modules/dynamic-models/interfaces/DynamicModelInterface.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  FileSpreadsheet, 
  BarChart3, 
  Download, 
  Play, 
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { BaseDynamicModelLoader } from '../registry';
import { BaseDynamicModel, LocaleConfig, ProcessResult } from '../types/base';
import { useStore } from '@/store';

interface DynamicModelInterfaceProps {
  modelId: string;
  initialData?: any;
}

export const DynamicModelInterface: React.FC<DynamicModelInterfaceProps> = ({ 
  modelId, 
  initialData 
}) => {
  const [model, setModel] = useState<BaseDynamicModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [activeView, setActiveView] = useState<'spreadsheet' | 'dashboard'>('dashboard');
  const [error, setError] = useState<string | null>(null);
  
  const { currentUser } = useStore();
  
  // Get locale config based on user's country
  const getLocaleConfig = (): LocaleConfig => {
    // Default to Colombia if no user country
    const country = currentUser?.location || 'CO';
    
    const configs: Record<string, LocaleConfig> = {
      CO: {
        country: 'CO',
        currency: 'COP',
        language: 'es-CO',
        units: 'metric',
        dateFormat: 'DD/MM/YYYY',
        numberFormat: { locale: 'es-CO', options: {} },
        taxRules: {
          incomeTax: { rate: 0.35, name: 'Impuesto de Renta' },
          vatRate: { rate: 0.19, name: 'IVA' },
          specialTaxes: []
        },
        regulations: {
          taxRates: [],
          requiredDocuments: [],
          complianceRules: [],
          reportingRequirements: []
        }
      },
      MX: {
        country: 'MX',
        currency: 'MXN',
        language: 'es-MX',
        units: 'metric',
        dateFormat: 'DD/MM/YYYY',
        numberFormat: { locale: 'es-MX', options: {} },
        taxRules: {
          incomeTax: { rate: 0.30, name: 'ISR' },
          vatRate: { rate: 0.16, name: 'IVA' },
          specialTaxes: []
        },
        regulations: {
          taxRates: [],
          requiredDocuments: [],
          complianceRules: [],
          reportingRequirements: []
        }
      },
      ES: {
        country: 'ES',
        currency: 'EUR',
        language: 'es-ES',
        units: 'metric',
        dateFormat: 'DD/MM/YYYY',
        numberFormat: { locale: 'es-ES', options: {} },
        taxRules: {
          incomeTax: { rate: 0.25, name: 'IRPF' },
          vatRate: { rate: 0.21, name: 'IVA' },
          specialTaxes: []
        },
        regulations: {
          taxRates: [],
          requiredDocuments: [],
          complianceRules: [],
          reportingRequirements: []
        }
      },
      BR: {
        country: 'BR',
        currency: 'BRL',
        language: 'pt-BR',
        units: 'metric',
        dateFormat: 'DD/MM/YYYY',
        numberFormat: { locale: 'pt-BR', options: {} },
        taxRules: {
          incomeTax: { rate: 0.275, name: 'IRPJ' },
          vatRate: { rate: 0.18, name: 'ICMS' },
          specialTaxes: []
        },
        regulations: {
          taxRates: [],
          requiredDocuments: [],
          complianceRules: [],
          reportingRequirements: []
        }
      }
    };
    
    return configs[country] || configs.CO;
  };
  
  // Load model on mount
  useEffect(() => {
    loadModel();
  }, [modelId]);
  
  const loadModel = async () => {
    try {
      setLoading(true);
      setError(null);
      const loadedModel = await BaseDynamicModelLoader.loadModel(modelId);
      setModel(loadedModel);
    } catch (err) {
      setError(`Error al cargar el modelo: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleProcess = async (data: any) => {
    if (!model) return;
    
    try {
      setProcessing(true);
      setError(null);
      
      const locale = getLocaleConfig();
      
      // Validate first
      const validation = await model.validate(data, locale);
      if (!validation.valid) {
        setError(`Errores de validación: ${validation.errors?.map(e => e).join(", ") || "Error desconocido"}`);
        return;
      }
      
      // Process data
      const processResult = await model.process(data, locale);
      setResult(processResult);
      
      if (!processResult.success) {
        setError(`Error en el procesamiento: ${processResult.error}`);
      }
    } catch (err) {
      setError(`Error inesperado: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setProcessing(false);
    }
  };
  
  const handleExport = async (format: 'excel' | 'pdf' | 'csv' | 'json') => {
    if (!model || !result?.data) return;
    
    try {
      const locale = getLocaleConfig();
      const buffer = await model.export(result, format, locale);
      
      // Create blob and download
      const blob = new Blob([buffer], { 
        type: format === 'excel' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' :
              format === 'pdf' ? 'application/pdf' :
              format === 'csv' ? 'text/csv' :
              'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${model.name}_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(`Error al exportar: ${err instanceof Error ? err.message : String(err)}`);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        <span className="ml-2">Cargando modelo...</span>
      </div>
    );
  }
  
  if (!model) {
    return (
      <Alert className="m-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No se pudo cargar el modelo {modelId}
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{model.name}</h1>
          <p className="text-gray-600 mt-1">{model.description}</p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline">{model.id}</Badge>
            <Badge variant="outline">v{model.version}</Badge>
            <Badge variant="secondary">{model.category}</Badge>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={() => handleProcess(initialData)}
            disabled={!initialData || processing}
          >
            {processing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Procesar
              </>
            )}
          </Button>
        </div>
      </div>
      
      {/* Error display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {/* Success display */}
      {result?.success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Procesamiento completado exitosamente
          </AlertDescription>
        </Alert>
      )}
      
      {/* Main content */}
      <Tabs value={activeView} onValueChange={(v) => setActiveView(v as any)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dashboard">
            <BarChart3 className="mr-2 h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="spreadsheet">
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Planilla
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="space-y-4">
          {result?.data ? (
            <DashboardView model={model} data={result.data} />
          ) : (
            <EmptyState message="Procesa los datos para ver el dashboard" />
          )}
        </TabsContent>
        
        <TabsContent value="spreadsheet" className="space-y-4">
          <SpreadsheetView model={model} initialData={initialData} onProcess={handleProcess} />
        </TabsContent>
      </Tabs>
      
      {/* Export options */}
      {result?.success && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Exportar Resultados</CardTitle>
            <CardDescription>
              Descarga los resultados en el formato que prefieras
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => handleExport('excel')}>
                <Download className="mr-2 h-4 w-4" />
                Excel
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleExport('pdf')}>
                <Download className="mr-2 h-4 w-4" />
                PDF
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleExport('csv')}>
                <Download className="mr-2 h-4 w-4" />
                CSV
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleExport('json')}>
                <Download className="mr-2 h-4 w-4" />
                JSON
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Dashboard view component
const DashboardView: React.FC<{ model: BaseDynamicModel; data: any }> = ({ model, data }) => {
  const dashboardConfig = model.getDashboardView();
  
  return (
    <div className="grid grid-cols-12 gap-4">
      {dashboardConfig.widgets.map((widget: any) => (
        <div
          key={widget.id}
          className={`col-span-${widget.span?.columns || 12}`}
          style={{ gridColumn: `span ${widget.span?.columns || 12}` }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{widget.title}</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Render widget based on type */}
              {widget.type === 'metric-card' && (
                <div className="text-3xl font-bold">
                  {formatValue(getNestedValue(data, widget.dataKey), widget.format)}
                </div>
              )}
              {widget.type === 'chart' && (
                <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
                  <span className="text-gray-500">Gráfico: {widget.chartType}</span>
                </div>
              )}
              {/* Add more widget types as needed */}
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
};

// Spreadsheet view component
const SpreadsheetView: React.FC<{ 
  model: BaseDynamicModel; 
  initialData: any;
  onProcess: (data: any) => void;
}> = ({ model, initialData, onProcess }) => {
  const [formData, setFormData] = useState(initialData || {});
  const requiredFields = model.getRequiredFields();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Datos de Entrada</CardTitle>
        <CardDescription>
          Completa los campos requeridos para procesar el análisis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {requiredFields.map(field => (
            <div key={field.name}>
              <label className="block text-sm font-medium mb-1">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              <input
                type={field.type === 'number' ? 'number' : 'text'}
                className="w-full px-3 py-2 border rounded-md"
                value={formData[field.name] || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  [field.name]: field.type === 'number' ? 
                    parseFloat(e.target.value) : e.target.value
                })}
                placeholder={field.helpText}
              />
              {field.unit && (
                <span className="text-xs text-gray-500 mt-1">{field.unit}</span>
              )}
            </div>
          ))}
        </div>
        
        <Button 
          className="mt-6" 
          onClick={() => onProcess(formData)}
          disabled={!isFormValid(formData, requiredFields)}
        >
          Procesar Datos
        </Button>
      </CardContent>
    </Card>
  );
};

// Empty state component
const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex flex-col items-center justify-center p-12 text-center">
    <FileSpreadsheet className="h-12 w-12 text-gray-400 mb-4" />
    <p className="text-gray-500">{message}</p>
  </div>
);

// Utility functions
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

function formatValue(value: any, format?: string): string {
  if (value === null || value === undefined) return '-';
  
  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
      }).format(value);
    case 'percentage':
      return `${value.toFixed(2)}%`;
    case 'number':
      return new Intl.NumberFormat('es-CO').format(value);
    default:
      return String(value);
  }
}

function isFormValid(data: any, fields: any[]): boolean {
  return fields
    .filter(f => f.required)
    .every(f => data[f.name] !== undefined && data[f.name] !== '');
}

export default DynamicModelInterface;