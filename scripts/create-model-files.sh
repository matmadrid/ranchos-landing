#!/bin/bash

# Base directory
BASE_DIR="src/modules/dynamic-models"

# Array de todos los modelos
MODELS=(
  "core/financial/LivestockProfitabilityEngine"
  "core/financial/CashFlowMonitor"
  "core/financial/AnnualPerformanceAnalyzer"
  "core/financial/BreakEvenOptimizer"
  "core/operational/FeedOptimizationEngine"
  "core/operational/CarryingCapacityOptimizer"
  "core/operational/DailyRateCalculator"
  "core/operational/LivestockInventoryTracker"
  "core/operational/WeightManagementSystem"
  "core/operational/InfrastructureCostCalculator"
  "core/strategic/StrategicBudgetPlanner"
  "core/strategic/EquityDilutionAnalyzer"
  "core/strategic/MarketPlacementOptimizer"
  "core/strategic/ExchangeRatioAnalyzer"
  "core/human-resources/LaborCostOptimizer"
)

# Archivos que debe tener cada modelo
FILES=("index.ts" "types.ts" "calculator.ts" "validator.ts" "exporter.ts" "localizer.ts" "README.md")

echo "🚀 Creando archivos en cada modelo..."

for model in "${MODELS[@]}"; do
  echo "📦 $model"
  for file in "${FILES[@]}"; do
    filepath="$BASE_DIR/$model/$file"
    if [ ! -f "$filepath" ]; then
      touch "$filepath"
      echo "  ✅ Creado: $file"
    else
      echo "  ⏩ Ya existe: $file"
    fi
  done
done

echo "✨ Completado!"
