#!/bin/bash
# 🩺 DIAGNÓSTICO FINAL Y SOLUCIONES

echo "🔍 Diagnóstico completo del estado actual..."

# Verificar si los imports están presentes
echo "1️⃣ Verificando imports de Image:"
if grep -q "import Image from 'next/image'" "src/app/animals/[id]/page.tsx"; then
    echo "   ✅ animals/[id]/page.tsx tiene import de Image"
else
    echo "   ❌ animals/[id]/page.tsx NO tiene import de Image"
    echo "   🔧 Ejecutar: sed -i '' '1a\\import Image from '\\''next/image'\\'';' \"src/app/animals/[id]/page.tsx\""
fi

if grep -q "import Image from 'next/image'" "src/app/profile/page.tsx"; then
    echo "   ✅ profile/page.tsx tiene import de Image"
else
    echo "   ❌ profile/page.tsx NO tiene import de Image"
    echo "   🔧 Ejecutar: sed -i '' '1a\\import Image from '\\''next/image'\\'';' \"src/app/profile/page.tsx\""
fi

echo ""
echo "2️⃣ Verificando elementos <img> vs <Image>:"
IMG_COUNT=$(grep -c "<img" src/app/animals/[id]/page.tsx src/app/profile/page.tsx 2>/dev/null || echo "0")
IMAGE_COUNT=$(grep -c "<Image" src/app/animals/[id]/page.tsx src/app/profile/page.tsx 2>/dev/null || echo "0")

echo "   📊 Elementos <img> restantes: $IMG_COUNT"
echo "   📊 Elementos <Image> encontrados: $IMAGE_COUNT"

if [ "$IMG_COUNT" -gt 0 ]; then
    echo "   ⚠️ Aún hay elementos <img> sin corregir"
    echo "   🔍 Ubicaciones:"
    grep -n "<img" src/app/animals/[id]/page.tsx src/app/profile/page.tsx 2>/dev/null
fi

echo ""
echo "3️⃣ Verificando si hay errores de sintaxis:"
echo "   🔍 Buscando posibles errores de sintaxis..."
grep -n "width.*height.*width\|height.*width.*height" src/app/animals/[id]/page.tsx src/app/profile/page.tsx 2>/dev/null || echo "   ✅ No se encontraron duplicaciones"

echo ""
echo "4️⃣ Resumen de correcciones necesarias:"
echo "   ✅ analytics/page.tsx - Completado"
echo "   ✅ login/page.tsx - Completado"
echo "   ✅ Hooks - Ya tenían dependencias correctas"
echo "   ⏳ Verificar imports de Image"
echo "   ⏳ Verificar elementos <img> → <Image>"

echo ""
echo "🎯 PRÓXIMO PASO: Ejecutar npm run lint para ver warnings exactos"
