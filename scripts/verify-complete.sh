#!/bin/bash
echo "🔍 Verificación Final de Dynamic Models"
echo "======================================"
echo ""

# Contar archivos
total_files=$(find src/modules/dynamic-models -type f \( -name "*.ts" -o -name "*.tsx" \) | wc -l)
empty_files=$(find src/modules/dynamic-models -type f -empty | wc -l)
implemented_files=$((total_files - empty_files))

echo "📊 Estadísticas:"
echo "  Total archivos: $total_files"
echo "  Implementados: $implemented_files"
echo "  Vacíos: $empty_files"
echo ""

# Verificar archivos críticos
echo "✅ Archivos críticos:"
critical_files=(
  "types/base.ts"
  "registry.ts"
  "interfaces/DynamicModelInterface.tsx"
  "localization/config/colombia.config.ts"
  "localization/adapters/CurrencyAdapter.ts"
)

for file in "${critical_files[@]}"; do
  full_path="src/modules/dynamic-models/$file"
  if [ -f "$full_path" ]; then
    lines=$(wc -l < "$full_path")
    if [ $lines -gt 10 ]; then
      echo "  ✓ $file ($lines líneas)"
    else
      echo "  ⚠ $file ($lines líneas - verificar contenido)"
    fi
  else
    echo "  ✗ $file (NO EXISTE)"
  fi
done

echo ""
echo "🐮 LivestockProfitabilityEngine (modelo ejemplo):"
lpe_path="src/modules/dynamic-models/core/financial/LivestockProfitabilityEngine"
for file in index.ts types.ts calculator.ts validator.ts exporter.ts localizer.ts; do
  if [ -f "$lpe_path/$file" ]; then
    lines=$(wc -l < "$lpe_path/$file")
    if [ $lines -gt 50 ]; then
      echo "  ✓ $file ($lines líneas)"
    else
      echo "  ⚠ $file ($lines líneas)"
    fi
  fi
done

echo ""
echo "✨ Verificación completada"
