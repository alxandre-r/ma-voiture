/**
 * @file app/api/auth/sign-out/route.tsx
 * @fileoverview API route to sign out user and invalidate session.
 * 
 * This endpoint clears the user's authentication session and redirects to sign-in page.
 */

import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

/**
 * POST /api/auth/sign-out
 * 
 * Sign out current user by invalidating Supabase session.
 * Redirects to sign-in page after successful logout.
 * 
 * @returns {Promise<NextResponse>} Redirect response to sign-in page
 */
export async function POST() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL('/auth/sign-in', process.env.NEXT_PUBLIC_BASE_URL));
}
