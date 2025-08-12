/**
 * API - Sign Out
 * --------------
 * Déconnecte l'utilisateur en invalidant la session Supabase.
 */

import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

export async function POST() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL('/auth/sign-in', process.env.NEXT_PUBLIC_BASE_URL));
}
