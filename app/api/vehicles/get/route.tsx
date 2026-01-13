/**
 * @file app/api/vehicles/get/route.tsx
 * @fileoverview API route to fetch vehicles for authenticated user.
 * 
 * This endpoint returns all vehicles owned by the currently authenticated user,
 * ordered by creation date (newest first).
 */

import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

/**
 * GET /api/vehicles/get
 * 
 * Fetch vehicles for authenticated user.
 * 
 * @returns {Promise<NextResponse>} JSON response with vehicles array or error
 */
export async function GET() {
  const supabase = await createSupabaseServerClient();

  // Get authenticated user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  // Fetch vehicles owned by this user
  const { data: vehicles, error: vehiclesError } = await supabase
    .from('user_vehicles')
    .select('*')
    .eq('owner', user.id);

  if (vehiclesError) {
    return NextResponse.json({ error: vehiclesError.message }, { status: 500 });
  }

  return NextResponse.json({ vehicles });
}