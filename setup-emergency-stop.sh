#!/bin/zsh

# Paso 1: Crea el archivo public/emergency-stop.js
mkdir -p public
echo 'window.STOP_RENDERS = true;' > public/emergency-stop.js
echo "✅ Archivo creado: public/emergency-stop.js"

# Paso 2: Detecta si estás usando App Router o Pages Router
if [ -f "src/app/layout.tsx" ]; then
  file="src/app/layout.tsx"
elif [ -f "src/pages/_app.tsx" ]; then
  file="src/pages/_app.tsx"
else
  echo "⚠️  No se encontró layout.tsx ni _app.tsx. Agrega el <Script /> manualmente."
  file=""
fi

# Paso 3: Inserta el <Script /> si se puede
if [ -n "$file" ]; then
  if ! grep -q "emergency-stop.js" "$file"; then
    echo "🔧 Insertando <Script /> en: $file"
    sed -i '' '1i\
import Script from "next/script";
' "$file"

    sed -i '' 's|<body[^>]*>|&\
    <Script src="/emergency-stop.js" strategy="beforeInteractive" />|' "$file"

    echo "✅ Script insertado en: $file"
  else
    echo "✅ El <Script /> ya está presente en: $file"
  fi
fi

# Paso 4: Imprimir cómo usar en componentes
echo ""
echo "🧩 Ahora en tus componentes sospechosos, pega esto:"
echo ""
echo 'if (typeof window !== "undefined" && window.STOP_RENDERS) return null;'
