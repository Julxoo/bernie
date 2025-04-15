import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/middleware';

// Routes qui ne nécessitent pas d'authentification
const publicRoutes = ['/login', '/forgot-password', '/reset-password'];

// Routes qui sont accessibles seulement aux utilisateurs non connectés
const authRoutes = ['/login', '/forgot-password'];

export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request);

  // Vérifier si l'utilisateur est authentifié
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const isAuthenticated = !!session;
  const { pathname } = request.nextUrl;

  // Rediriger vers le tableau de bord si l'utilisateur accède à une page d'authentification alors qu'il est déjà connecté
  if (isAuthenticated && authRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Pour les routes protégées, vérifier si l'utilisateur est authentifié
  if (!isAuthenticated && !publicRoutes.some(route => pathname.startsWith(route))) {
    // Si l'utilisateur n'est pas connecté et tente d'accéder à une route protégée, rediriger vers la page de connexion
    const redirectUrl = new URL('/login', request.url);
    // Toujours rediriger vers /dashboard après connexion
    redirectUrl.searchParams.set('redirectUrl', '/dashboard');
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  // Matcher pour toutes les routes sauf les ressources statiques
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 