// src/app/api/familyVehicles/route.ts
import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/supabaseServer';

/**
 * GET /api/familyVehicles
 * Expects query param userId
 * Retourne les véhicules de la famille, en excluant ceux de l'utilisateur
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');

    if (!userId) return NextResponse.json([], { status: 200 });

    const supabase = await createSupabaseServerClient();

    // Récupérer la family_id de l'utilisateur
    const { data: familyData, error: familyError } = await supabase
      .from('family_members')
      .select('family_id')
      .eq('user_id', userId)
      .single();

    if (familyError) {
      console.error('Error fetching family id:', familyError);
      return NextResponse.json({ error: familyError.message }, { status: 500 });
    }

    const family_id = familyData.family_id;

    // Récupérer les véhicules de la famille (sauf ceux de l'utilisateur)
    const { data, error } = await supabase
      .from('vehicles_for_display')
      .select('*')
      .eq('family_id', family_id)
      .neq('owner_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching family vehicles:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erreur inconnue';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}