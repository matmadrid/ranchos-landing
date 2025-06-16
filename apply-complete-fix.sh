#!/bin/bash

# apply-complete-fix.sh - Aplicar TODAS las correcciones necesarias
echo "🚀 Aplicando correcciones completas para RanchOS..."

# 1. Crear el hook adaptador
echo "📝 Creando hook adaptador..."
mkdir -p src/hooks
cat > src/hooks/useDashboardStore.ts << 'EOF'
// Adaptador para hacer compatible el dashboard con el store actual
import { useRanchOSStore } from '@/store/useStore';

export const useDashboardStore = () => {
  const store = useRanchOSStore();
  
  return {
    currentUser: store.currentUser,
    currentRanch: store.activeRanch,
    cattle: store.animals || [],
    getCattleByRanch: (ranchId: string) => {
      return (store.animals || []).filter(animal => animal.ranchId === ranchId);
    },
    getTotalMilkProduction: () => {
      if (typeof store.getTotalMilkProduction === 'function') {
        return store.getTotalMilkProduction();
      }
      return 0;
    },
    milkProductions: store.milkProductions || [],
    profilePromptDismissed: store.profilePromptDismissed || false,
    setProfilePromptDismissed: store.setProfilePromptDismissed || (() => {}),
    isOnboardingComplete: store.isOnboardingComplete !== false,
    ranches: store.ranches || [],
    profile: store.profile || null
  };
};
EOF

# 2. Actualizar dashboard para usar el adaptador
echo "📝 Actualizando dashboard..."
sed -i '' '1s/^/\/\/ FIXED: Using adapter for store compatibility\n/' src/app/dashboard/page.tsx
sed -i '' "s|import useRanchOSStore from '@/store';|import { useDashboardStore } from '@/hooks/useDashboardStore';|" src/app/dashboard/page.tsx
sed -i '' 's/useRanchOSStore()/useDashboardStore()/' src/app/dashboard/page.tsx

# 3. Crear panel de debug
echo "📝 Creando panel de debug..."
mkdir -p src/components/debug
# El contenido ya está en el artifact anterior

# 4. Agregar panel de debug al layout
echo "📝 Agregando panel de debug al layout..."
sed -i '' '/import.*globals.css/a\
import dynamic from "next/dynamic";\
const DebugPanel = dynamic(() => import("@/components/debug/DebugPanel"), { ssr: false });
' src/app/layout.tsx

sed -i '' '/{children}/i\
        {process.env.NODE_ENV === "development" && <DebugPanel />}
' src/app/layout.tsx

# 5. Crear fix temporal para el NavBar
echo "📝 Creando fix para NavBar..."
cat > src/components/layout/NavBarFixed.tsx << 'EOF'
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, BarChart3, Package, LogOut, User } from 'lucide-react';
import { useRanchOSStore } from '@/store/useStore';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Analítica', href: '/analytics', icon: BarChart3 },
  { name: 'Inventario', href: '/inventory', icon: Package },
];

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const store = useRanchOSStore();
  const currentUser = store.currentUser;

  const handleLogout = async () => {
    console.log('Logout clicked');
    // Limpiar store
    await store.signOut();
    
    // Limpiar localStorage
    localStorage.clear();
    sessionStorage.clear();
    
    // Redirigir
    router.push('/auth/login');
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/dashboard" className="text-2xl font-bold text-primary">
                RanchOS
              </Link>
            </div>

            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive
                        ? 'border-primary text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center">
            {currentUser ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-gray-600" />
                  <span className="text-sm text-gray-700">
                    {currentUser.email}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Salir
                </button>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-700"
              >
                Ingresar
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
EOF

# 6. Fix para auth.slice.ts
echo "📝 Aplicando fix en auth.slice.ts..."
sed -i '' 's/fullStore.ranches.length === 0) && /fullStore.ranches.length === 0) || /' src/store/slices/auth.slice.ts 2>/dev/null || true

echo "✅ Correcciones aplicadas!"
echo ""
echo "📋 Próximos pasos:"
echo "1. Reinicia el servidor: npm run dev"
echo "2. Abre http://localhost:3000/dashboard"
echo "3. Usa el panel de debug (botón rojo abajo a la izquierda)"
echo "4. Haz clic en 'Cargar Datos Demo' en el panel"
echo ""
echo "🐛 Si el botón 'Ingresar' sigue sin funcionar:"
echo "   - Verifica en el panel de debug si hay un usuario logueado"
echo "   - Si no hay usuario, el botón dirá 'Ingresar'"
echo "   - Si hay usuario, debería decir 'Salir'"