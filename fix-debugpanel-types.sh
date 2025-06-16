#!/bin/bash

echo "🔧 Corrigiendo tipos en DebugPanel..."

# 1. Eliminar emailVerified
sed -i '' '/emailVerified: true/d' src/components/debug/DebugPanel.tsx

# 2. Buscar y reemplazar definición de demoRanches para agregar propiedades
# Primero encontrar el patrón
LINE=$(grep -n "demoRanches = \[" src/components/debug/DebugPanel.tsx | cut -d: -f1)

# Agregar propiedades a cada rancho
sed -i '' "${LINE},/\];/s/userId: userId/userId: userId,\
        countryCode: 'MX' as const,\
        sizeUnit: 'hectare' as const,\
        createdAt: new Date().toISOString()/g" src/components/debug/DebugPanel.tsx

# 3. Corregir el profile
sed -i '' '/profile: {/,/}/s/location: '\''Baja California'\''/location: '\''Baja California'\'',\
        ranch: demoRanches[0].name,\
        countryCode: '\''MX'\'' as const/' src/components/debug/DebugPanel.tsx

echo "✅ Tipos corregidos"
