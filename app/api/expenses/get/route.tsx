/**
 * @file app/api/expenses/get/route.tsx
 * @fileoverview API endpoint for retrieving expense records from expenses_for_display view.
 */

import { NextResponse } from 'next/server';

import { createSupabaseServerClient } from '@/lib/supabase/supabaseServer';

export async function GET(request: Request) {
  const supabase = await createSupabaseServerClient();

  // Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Non autorisé - utilisateur non connecté' }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const vehicleIdsParam = url.searchParams.get('vehicleIds');
    const vehicleIds = vehicleIdsParam
      ? vehicleIdsParam
          .split(',')
          .map((id) => Number(id))
          .filter((id) => Number.isInteger(id) && id > 0)
      : [];

    let query = supabase
      .from('expenses_for_display')
      .select('*')
      .order('date', { ascending: false });

    if (vehicleIds.length > 0) {
      query = query.in('vehicle_id', vehicleIds);
    } else {
      query = query.eq('owner_id', user.id);
    }

    const { data: expenses, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des dépenses' },
        { status: 500 },
      );
    }
    return NextResponse.json({ expenses });
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json({ error: 'Erreur serveur inattendue' }, { status: 500 });
  }
}
