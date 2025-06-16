#!/bin/bash

echo "🔧 Corrigiendo DebugPanel.tsx..."

# 1. Cambiar uid por id
sed -i '' 's/uid: '\''demo-debug-001'\''/id: '\''demo-debug-001'\''/g' src/components/debug/DebugPanel.tsx
sed -i '' 's/\.uid/\.id/g' src/components/debug/DebugPanel.tsx

# 2. Eliminar phone del profile
sed -i '' '/phone: '\''+52 686 123 4567'\''/d' src/components/debug/DebugPanel.tsx

echo "✅ Cambios aplicados"
echo "🔍 Verificando..."
npx tsc --noEmit
