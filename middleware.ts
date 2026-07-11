// middleware.ts (en la raíz del proyecto)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rutas públicas que no requieren autenticación
const PUBLIC_PATHS = [
  '/login',
  '/register',
  '/recover-account',
  '/reset-password',
  '/',
  '/about',
  '/contact',
  '/properties',
  '/cars',
  '/yachts'
];

// Rutas protegidas que requieren autenticación
const PROTECTED_PATHS = [
  '/admin',
  '/dashboard',
  '/profile',
  '/account',
  '/reservations',
  '/my-properties'
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  console.log('🔍 Middleware - Path:', pathname);
  
  // Verificar si la ruta es pública
  const isPublicPath = PUBLIC_PATHS.some(path => 
    pathname === path || pathname.startsWith(`${path}/`)
  );
  
  // Verificar si la ruta está protegida
  const isProtectedPath = PROTECTED_PATHS.some(path => 
    pathname.startsWith(path)
  );

  // 🔥 OBTENER TOKEN DE LAS COOKIES
  const token = request.cookies.get('accessToken')?.value || null;
  
  console.log('🔑 Token en cookies:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');

  // 🔥 Si está en /login y tiene token, redirigir al dashboard
  if (pathname === '/login' && token) {
    console.log('✅ Usuario ya logueado, redirigiendo a dashboard');
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  // 🔥 Si está en ruta protegida y NO tiene token, redirigir al login
  if (isProtectedPath && !token) {
    console.log('❌ Ruta protegida sin token, redirigiendo a login');
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 🔥 Para rutas públicas con token, permitir el acceso
  if (isPublicPath && token) {
    console.log('✅ Ruta pública con token, permitiendo acceso');
    return NextResponse.next();
  }

  console.log('✅ Permitiendo acceso a:', pathname);
  return NextResponse.next();
}

// Configurar en qué rutas se ejecuta el middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api (API routes)
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api).*)',
  ],
};