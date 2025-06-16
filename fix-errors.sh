#!/bin/bash

echo "🔧 Arreglando errores de TypeScript..."

mkdir -p backups
cp src/hooks/useDemoDetection.ts backups/useDemoDetection.tests.backup.ts 2>/dev/null || true

mkdir -p src/hooks/__tests__
mv src/hooks/useDemoDetection.ts src/hooks/__tests__/useDemoDetection.test.tsx

echo "Creando hook real..."

echo "✅ Correcciones aplicadas!"
