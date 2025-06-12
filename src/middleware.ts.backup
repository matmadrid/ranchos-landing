// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rutas públicas que no requieren autenticación
const publicRoutes = [
  '/',
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/onboarding', // Permitir onboarding sin autenticación
];

// Rutas que requieren NO estar autenticado
const authRoutes = [
  '/auth/login',
  '/auth/register',
];

// Rutas que requieren autenticación
const protectedRoutes = [
  '/dashboard',
  '/analytics',
  '/profile',
  '/settings',
  '/animals',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Obtener el estado de autenticación de las cookies
  const isAuthenticated = request.cookies.get('isAuthenticated')?.value === 'true';
  const onboardingCompleted = request.cookies.get('onboardingCompleted')?.value === 'true';
  
  // Permitir acceso libre a /auth/onboarding SIEMPRE
  if (pathname === '/auth/onboarding') {
    return NextResponse.next();
  }
  
  // Si está en la página principal y está autenticado
  if (pathname === '/' && isAuthenticated) {
    // Si no ha completado onboarding, ir a onboarding
    if (!onboardingCompleted) {
      return NextResponse.redirect(new URL('/auth/onboarding', request.url));
    }
    // Si ya completó onboarding, ir al dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // Si está en la página principal y NO está autenticado, permitir acceso
  if (pathname === '/' && !isAuthenticated) {
    return NextResponse.next();
  }
  
  // Si el usuario está autenticado y trata de acceder a rutas de auth,
  // redirigir según el estado del onboarding
  if (isAuthenticated && authRoutes.includes(pathname)) {
    if (!onboardingCompleted) {
      return NextResponse.redirect(new URL('/auth/onboarding', request.url));
    }
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // Si el usuario NO está autenticado y trata de acceder a rutas protegidas,
  // redirigir al login
  if (!isAuthenticated && protectedRoutes.some(route => pathname.startsWith(route))) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};