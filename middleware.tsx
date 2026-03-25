/**
 * Middleware Next.js
 * ------------------
 * - Protège les pages privées en redirigeant vers / si l'utilisateur n'est pas connecté.
 * - Laisse passer les pages publiques (/, /auth/*, /api/*, etc.)
 * - Lorsque c'est un lien d'invitation, si !session, redirige vers la page de connexion en passant le token
 */

import { NextResponse } from 'next/server';

import { createSupabaseServerClient } from '@/lib/supabase/server';

import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const isProtectedRoute = req.nextUrl.pathname.startsWith('/(app)');

  // For protected routes, we need to verify the session
  if (isProtectedRoute) {
    const supabase = await createSupabaseServerClient();
    const token = req.cookies.get('sb-access-token')?.value;
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      if (req.nextUrl.pathname.startsWith('/(app)/family/join')) {
        return NextResponse.redirect(
          new URL(
            '/?redirect=' + encodeURIComponent(req.nextUrl.pathname + req.nextUrl.search),
            req.url,
          ),
        );
      }
      // Redirect to home page (login page) for protected routes when not authenticated
      return NextResponse.redirect(new URL('/', req.url));
    }

    if (token) {
      req.headers.set('x-user-token', token);
    }
  }

  // Add caching headers for static assets and public routes
  const response = NextResponse.next();

  // Cache static assets for 1 year
  if (req.nextUrl.pathname.startsWith('/_next/static/')) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  }
  // Cache public assets
  else if (
    req.nextUrl.pathname.startsWith('/icons/') ||
    req.nextUrl.pathname.startsWith('/images/')
  ) {
    response.headers.set('Cache-Control', 'public, max-age=86400');
  }

  return response;
}
