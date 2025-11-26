/**
 * @file src/app/api/users/hasCar/route.ts
 * @fileoverview API route to check if the authenticated user has a vehicle.
 */

import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

export async function GET(request: Request) {
  const supabase = await createSupabaseServerClient();

  // Récupérer l'utilisateur connecté
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ hasCar: false });
  }

  // Vérifier si l'utilisateur a au moins un véhicule
    const { data: vehicles, error } = await supabase
        .from('vehicles')
        .select('id')
        .eq('owner', user.id)
        .limit(1);

  return NextResponse.json({ hasCar: (vehicles?.length ?? 0) > 0 });
}