#!/bin/bash

echo "🔧 Aplicando todas las correcciones a DebugPanel..."

# 1. Buscar línea del useEffect closing
LINE=$(grep -n "}, \[isOpen\]);" src/components/debug/DebugPanel.tsx | cut -d: -f1)

# Insertar return antes del cierre del useEffect
sed -i '' "${LINE}i\\
\ \ \ \ return; // Return cuando isOpen es false" src/components/debug/DebugPanel.tsx

# 2. Corregir definición de profile para incluir las propiedades requeridas
# Buscar la línea donde se define profile
PROFILE_LINE=$(grep -n "profile: {" src/components/debug/DebugPanel.tsx | cut -d: -f1)

# Reemplazar toda la definición del profile
sed -i '' "${PROFILE_LINE},/^ *}/s/profile: {.*$/profile: {\
        name: 'Usuario Debug',\
        email: store.currentUser?.email || 'debug@ranchos.io',\
        location: 'Baja California',\
        ranch: 'Rancho Santa María',\
        countryCode: 'MX' as const\
      },/" src/components/debug/DebugPanel.tsx

echo "✅ Correcciones aplicadas"
npx tsc --noEmit
