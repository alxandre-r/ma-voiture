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
  const { data: { session } } = await supabase.auth.getSession();
  console.log("Middleware - session:", Boolean(session), "path:", req.nextUrl.pathname);

  if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/auth/not-identified', req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
