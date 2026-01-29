/**
 * Middleware Next.js
 * ------------------
 * - Protège les pages privées en redirigeant vers /auth/sign-in si l'utilisateur n'est pas connecté.
 * - Laisse passer les pages publiques
 * - Lorsque c'est un lien d'invitation, si !session, redirige vers la page de connexion en passant le token
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

export async function middleware(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    if (req.nextUrl.pathname.startsWith('/family/join')) {
      return NextResponse.redirect(new URL('/?redirect=/family/join?token=' + req.nextUrl.searchParams.get('token'), req.url));
    }
    return NextResponse.redirect(new URL('/auth/not-identified', req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/garage/:path*', '/historique/:path*', '/family/:path*', '/settings/:path*'],
};
