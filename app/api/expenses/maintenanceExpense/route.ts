/**
 * @file app/api/expenses/MaintenanceExpense/route.tsx
 * @fileoverview API endpoint for retrieving expense records of type Maintenance from expenses_for_display view.
 */

import { NextResponse } from 'next/server';

import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
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
      .eq('type', 'maintenance')
      .order('date', { ascending: false });

    if (vehicleIds.length > 0) {
      query = query.in('vehicle_id', vehicleIds);
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
