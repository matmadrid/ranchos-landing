// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * RanchOS Middleware - Gestión de Rutas y Autenticación
 * 
 * Flujo Principal:
 * 1. Home → Onboarding (sin auth)
 * 2. Onboarding → Dashboard Temporal
 * 3. Dashboard → Prompt Registro
 * 4. Registro → Dashboard Permanente
 */

// Configuración de rutas
const ROUTES = {
  // Rutas completamente públicas
  public: [
    '/',
    '/auth/onboarding',
    '/auth/login', 
    '/auth/register',
    '/auth/forgot-password',
    '/api/public',
  ],
  
  // Rutas que requieren NO estar autenticado
  guestOnly: [
    '/auth/login',
    '/auth/register',
  ],
  
  // Rutas protegidas (requieren auth real)
  protected: [
    '/dashboard',
    '/analytics', 
    '/animals',
    '/profile',
    '/settings',
  ],
  
  // Rutas con acceso temporal (usuarios demo)
  temporaryAccess: [
    '/dashboard',
    '/animals/add', // Permitir agregar primer animal
  ]
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Obtener estado de cookies
  const cookies = {
    isAuthenticated: request.cookies.get('isAuthenticated')?.value === 'true',
    isTemporaryUser: request.cookies.get('isTemporaryUser')?.value === 'true',
    onboardingCompleted: request.cookies.get('onboardingCompleted')?.value === 'true',
    userId: request.cookies.get('userId')?.value
  };
  
  // Log para debugging (remover en producción)
  console.log('[Middleware]', { pathname, cookies });
  
  // === REGLA 1: Onboarding SIEMPRE accesible ===
  if (pathname === '/auth/onboarding') {
    return NextResponse.next();
  }
  
  // === REGLA 2: Página principal - Redirecciones inteligentes ===
  if (pathname === '/') {
    // Usuario autenticado real
    if (cookies.isAuthenticated && !cookies.isTemporaryUser) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    
    // Usuario temporal (viene del onboarding)
    if (cookies.isTemporaryUser) {
      // Permitir ver home para decidir si registrarse
      return NextResponse.next();
    }
    
    // Usuario no autenticado - mostrar home
    return NextResponse.next();
  }
  
  // === REGLA 3: Rutas guest-only (login/register) ===
  if (ROUTES.guestOnly.includes(pathname)) {
    // Usuario autenticado real no puede acceder
    if (cookies.isAuthenticated && !cookies.isTemporaryUser) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    
    // Usuario temporal PUEDE acceder para convertirse en permanente
    return NextResponse.next();
  }
  
  // === REGLA 4: Rutas protegidas ===
  if (ROUTES.protected.some(route => pathname.startsWith(route))) {
    // Usuario temporal tiene acceso limitado
    if (cookies.isTemporaryUser) {
      // Verificar si la ruta está en acceso temporal
      const hasTemporaryAccess = ROUTES.temporaryAccess.some(
        route => pathname.startsWith(route)
      );
      
      if (hasTemporaryAccess) {
        // Agregar header para identificar usuario temporal en la app
        const response = NextResponse.next();
        response.headers.set('X-Temporary-User', 'true');
        return response;
      }
      
      // Redirigir a registro si intenta acceder a áreas no permitidas
      const registerUrl = new URL('/auth/register', request.url);
      registerUrl.searchParams.set('message', 'complete-profile');
      registerUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(registerUrl);
    }
    
    // Usuario no autenticado - redirigir a login
    if (!cookies.isAuthenticated) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }
  
  // === REGLA 5: Rutas de API ===
  if (pathname.startsWith('/api/')) {
    // Las APIs manejan su propia autenticación
    return NextResponse.next();
  }
  
  // === DEFAULT: Permitir acceso ===
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Incluir todas las rutas excepto recursos estáticos
    '/((?!_next/static|_next/image|favicon.ico|public|.*\\.(?:jpg|jpeg|gif|png|svg|ico|webp)$).*)',
  ],
};