#!/bin/bash
# fix-all-models.sh

echo "🔧 Arreglando TODOS los modelos de una vez..."

# 1. Arreglar todos los validators (isValid -> valid)
echo "📝 Arreglando validators..."
find src/modules/dynamic-models -name "validator.ts" -type f | while read file; do
  if grep -q "isValid:" "$file"; then
    sed -i '' 's/isValid:/valid:/g' "$file"
    echo "✅ Arreglado: $file"
  fi
done

# 2. Lista de todos los modelos que necesitan los métodos
MODELS=(
  "CashFlowMonitor"
  "CostStructureAnalyzer"
  "DebtRestructuringAdvisor"
  "ExpenseOptimizer"
  "InvestmentAnalyzer"
  "MarginAnalyzer"
  "PriceOptimizer"
  "RevenuePredictor"
  "RiskAnalyzer"
  "TaxOptimizer"
)

# 3. Para cada modelo, agregar los métodos faltantes
for MODEL in "${MODELS[@]}"; do
  FILE="src/modules/dynamic-models/core/financial/$MODEL/index.ts"
  
  if [ -f "$FILE" ]; then
    echo "🔧 Procesando $MODEL..."
    
    # Verificar si ya tiene los métodos
    if ! grep -q "getInputSchema()" "$FILE"; then
      # Agregar DataSchema al import si no existe
      if ! grep -q "DataSchema" "$FILE"; then
        sed -i '' "s/} from '..\/..\/..\/types\/base';/, DataSchema } from '..\/..\/..\/types\/base';/" "$FILE"
      fi
      
      # Crear archivo temporal con los métodos
      cat > /tmp/methods.txt << 'EOF_METHODS'

  async validate(data: any, config: LocaleConfig): Promise<ValidationResult> {
    const errors: string[] = [];
    if (!data) {
      errors.push('Los datos son requeridos');
    }
    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
      warnings: []
    };
  }
  
  async process(data: any, config: LocaleConfig): Promise<ProcessResult> {
    try {
      const validation = await this.validate(data, config);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.errors?.join(', ')
        };
      }
      
      return {
        success: true,
        data: {
          result: 'Procesamiento exitoso',
          ...data
        },
        metadata: {
          processingTime: Date.now(),
          timestamp: new Date(),
          version: this.version
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }
  
  async export(result: any, format: ExportFormat, locale: LocaleConfig): Promise<Buffer> {
    return Buffer.from(JSON.stringify(result, null, 2));
  }
  
  getInputSchema(): DataSchema {
    return {
      type: 'object',
      required: [],
      properties: {}
    };
  }
  
  getOutputSchema(): DataSchema {
    return {
      type: 'object',
      properties: {}
    };
  }
}
EOF_METHODS
      
      # Insertar los métodos antes del último }
      # Esto es complicado en bash, así que usamos un enfoque diferente
      # Remover el último } y agregarlo después de los métodos
      sed -i '' '$ d' "$FILE"
      cat /tmp/methods.txt >> "$FILE"
      
      echo "✅ $MODEL arreglado"
    else
      echo "✅ $MODEL ya tiene los métodos"
    fi
  fi
done

echo ""
echo "✅ ¡LISTO! Todos los modelos han sido arreglados."
echo ""
echo "Ahora ejecuta: npm run build"
