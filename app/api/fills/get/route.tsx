/**
 * @file app/api/fills/get/route.tsx
 * @fileoverview API endpoint for retrieving fuel fill-up records.
 */

import { NextResponse } from 'next/server';

import { createSupabaseServerClient } from '@/lib/supabase/server';

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
      .select(
        'id, vehicle_id, vehicle_name, owner_id, owner_name, date, odometer, liters, amount, price_per_liter, notes, created_at, charge_type, kwh, price_per_kwh',
      )
      .in('type', ['fuel', 'electric_charge'])
      .order('date', { ascending: false });

    if (vehicleIds.length > 0) {
      query = query.in('vehicle_id', vehicleIds);
    } else {
      query = query.eq('owner_id', user.id);
    }

    const { data: fills, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des pleins' },
        { status: 500 },
      );
    }

    const transformedFills = fills.map((fill) => ({
      id: fill.id,
      vehicle_id: fill.vehicle_id,
      vehicle_name: fill.vehicle_name,
      owner_id: fill.owner_id,
      owner_name: fill.owner_name,
      date: fill.date,
      odometer: fill.odometer,
      liters: fill.liters,
      amount: fill.amount,
      price_per_liter: fill.price_per_liter,
      notes: fill.notes,
      created_at: fill.created_at,
      // Electric vehicle fields
      charge_type: fill.charge_type,
      kwh: fill.kwh,
      price_per_kwh: fill.price_per_kwh,
    }));

    return NextResponse.json(
      {
        fills: transformedFills,
        count: transformedFills.length,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json({ error: 'Erreur serveur inattendue' }, { status: 500 });
  }
}
