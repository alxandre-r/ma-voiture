/**
 * Middleware Next.js
 * ------------------
 * - Protège les pages privées en redirigeant vers /auth/sign-in si l'utilisateur n'est pas connecté.
 * - Laisse passer les pages publiques.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

export async function middleware(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Si pas de session → rediriger
  if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
    console.log('Utilisateur non connecté, redirection vers /auth/sign-in');
    return NextResponse.redirect(new URL('/auth/sign-in', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
