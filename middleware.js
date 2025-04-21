import { NextResponse } from 'next/server';

export const config = {
  matcher: [

    '/((?!api|_next|_static|_vercel|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
  unstable_allowDynamic: [
    // Permitir que estos módulos se carguen dinámicamente en el middleware
    '/node_modules/jsonwebtoken/**',
    '/node_modules/jose/**',
    '/node_modules/crypto/**',
  ],
};

// Obtener la clave secreta de las variables de entorno
const JWT_SECRET = process.env.JWT_SECRET;

// Verificar que la clave secreta esté definida
if (!JWT_SECRET) {
  console.error('La variable de entorno JWT_SECRET no está definida');
}


// Rutas que requieren autenticación
const protectedRoutes = [
  '/profile',
  '/favorites',
  '/collections',
  '/shopping-list'
];

// Rutas de autenticación (no redirigir si ya está autenticado)
const authRoutes = [
  '/login',
  '/register'
];

export async function middleware(request) {
  const path = request.nextUrl.pathname;
  
  // Obtener token de la cookie
  const token = request.cookies.get('token')?.value || '';
  
  // Verificar si la ruta requiere autenticación
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route));
  const isAuthRoute = authRoutes.some(route => path.startsWith(route));
  
  // Si no hay token y la ruta está protegida, redirigir al login
  if (!token && isProtectedRoute) {
    const url = new URL('/login', request.url);
    url.searchParams.set('from', path);
    return NextResponse.redirect(url);
  }
  
  // Si hay token y es una ruta de autenticación, redirigir a la página principal
  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  // Para rutas protegidas, verificar que el token sea válido
  if (token && isProtectedRoute) {
    // En lugar de verificar el token aquí, simplemente permitimos el acceso
    // La verificación real se realizará en las rutas API protegidas
    // Esto evita el uso de jwt.verify en el middleware (que causa problemas en Edge Runtime)
    return NextResponse.next();
  }
  
  // Para todas las demás rutas, continuar
  return NextResponse.next();
}