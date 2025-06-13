#!/bin/bash
set -e

echo "🛰️ CONFIGURANDO FAVICONS DE RANCHOS"
echo "==================================="

# Crear carpeta si no existe
mkdir -p src/app

# 1. Crear el SVG del ícono del satélite
echo "1️⃣ Creando archivos SVG..."

cat > src/app/icon.svg << 'EOF'
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <rect width="32" height="32" fill="#2563eb" rx="6"/>
  <g transform="translate(16, 16)">
    <path d="M 6 -6 L 0 0 L -6 6 M -2 -2 L -6 -6 C -6.8 -6.8 -8 -6.8 -8.8 -6 L -6 -3.2 C -5.2 -2.4 -3.6 -2.4 -2.8 -3.2 L 0 -6 C 0.8 -6.8 2.4 -6.8 3.2 -6 L 6 -3.2 C 6.8 -2.4 6.8 -0.8 6 0 L 3.2 2.8 C 2.4 3.6 2.4 5.2 3.2 6 L 6 8.8 C 6.8 9.6 6.8 11.2 6 12 M 2 2 L 4 4 M -9 -5 C -10.4 -3.6 -10.4 -1.4 -9 0 C -7.6 1.4 -5.4 1.4 -4 0 M 5 9 C 3.6 10.4 1.4 10.4 0 9 C -1.4 7.6 -1.4 5.4 0 4" 
          stroke="white" 
          stroke-width="1.5" 
          fill="none" 
          stroke-linecap="round" 
          stroke-linejoin="round"/>
  </g>
</svg>
EOF

# 2. Crear componente icon.tsx para Next.js
echo -e "\n2️⃣ Creando archivo de metadata..."

cat > src/app/icon.tsx << 'EOF'
import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const size = {
  width: 32,
  height: 32,
}

export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: '#2563eb',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          borderRadius: 6,
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m16 16-3-3 3-3" />
          <path d="M20 20a5 5 0 0 0-8-5" />
          <path d="M11.5 7.5 9 5c-.782-.782-2.048-.782-2.83 0L5 6.17c-.782.782-.782 2.048 0 2.83L7.5 11.5" />
          <path d="m8 8 7 7" />
          <path d="m4 4 3.5 3.5" />
          <path d="M20 20 16.5 16.5" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  )
}
EOF

# 3. Crear apple-icon.tsx
echo -e "\n3️⃣ Creando Apple icon..."

cat > src/app/apple-icon.tsx << 'EOF'
import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const size = {
  width: 180,
  height: 180,
}

export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 120,
          background: '#2563eb',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          borderRadius: 36,
        }}
      >
        <svg
          width="120"
          height="120"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m16 16-3-3 3-3" />
          <path d="M20 20a5 5 0 0 0-8-5" />
          <path d="M11.5 7.5 9 5c-.782-.782-2.048-.782-2.83 0L5 6.17c-.782.782-.782 2.048 0 2.83L7.5 11.5" />
          <path d="m8 8 7 7" />
          <path d="m4 4 3.5 3.5" />
          <path d="M20 20 16.5 16.5" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  )
}
EOF

# 4. Actualizar metadata en layout.tsx
echo -e "\n4️⃣ Actualizando metadata..."

if grep -q "export const metadata" src/app/layout.tsx; then
    echo "✅ Metadata encontrada en layout.tsx"

    if ! grep -q "icons:" src/app/layout.tsx; then
        cat > /tmp/update-metadata.py << 'PYEOF'
import re

with open('src/app/layout.tsx', 'r') as f:
    content = f.read()

metadata_pattern = r'(export const metadata[^=]*=\s*{[^}]*)(})'

icons_config = '''  icons: {
    icon: '/icon.svg',
    apple: '/apple-icon.png',
    other: [
      {
        rel: 'icon',
        sizes: '32x32',
        url: '/icon.svg',
      },
    ],
  },
'''

def replacer(match):
    return match.group(1).rstrip() + ',\n' + icons_config + match.group(2)

content = re.sub(metadata_pattern, replacer, content, flags=re.DOTALL)

with open('src/app/layout.tsx', 'w') as f:
    f.write(content)

print("✅ Metadata actualizada con configuración de iconos")
PYEOF

        python3 /tmp/update-metadata.py
        rm -f /tmp/update-metadata.py
    fi
fi

# 5. Crear favicon.ico de respaldo
echo -e "\n5️⃣ Creando favicon.ico de respaldo..."

echo -ne '\x00\x00\x01\x00\x01\x00\x01\x01\x00\x00\x01\x00\x18\x00\x30\x00\x00\x00\x16\x00\x00\x00\x28\x00\x00\x00\x01\x00\x00\x00\x02\x00\x00\x00\x01\x00\x18\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x25\x63\xEB\x00' > src/app/favicon.ico

echo "✅ favicon.ico creado"

echo -e "\n🎉 ¡CONFIGURACIÓN COMPLETADA!"
echo "================================"
echo "📁 Archivos creados/actualizados:"
echo "   - src/app/icon.svg (SVG estático)"
echo "   - src/app/icon.tsx (generador dinámico)"
echo "   - src/app/apple-icon.tsx (para iOS)"
echo "   - src/app/favicon.ico (fallback)"
echo ""
echo "🔄 Reinicia el servidor: npm run dev"
echo "🌐 Los iconos se generarán automáticamente"
echo ""
echo "💡 Next.js 14 generará los favicons dinámicamente"
echo "   No necesitas archivos PNG pre-generados"
