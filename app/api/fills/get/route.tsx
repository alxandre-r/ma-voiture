/**
 * @file app/api/fills/get/route.tsx
 * @fileoverview API endpoint for retrieving fuel fill-up records.
 */

import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { cp } from 'fs';

export async function GET(request: Request) {
  const supabase = await createSupabaseServerClient();
  
  // Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json(
      { error: 'Non autorisé - utilisateur non connecté' },
      { status: 401 }
    );
  }

  try {
    const url = new URL(request.url);
    const vehicleIdsParam = url.searchParams.get('vehicleIds'); // attend "36,37,38"
    const vehicleIds = vehicleIdsParam
      ? vehicleIdsParam
          .split(',')
          .map(id => Number(id))
          .filter(id => Number.isInteger(id) && id > 0)
      : [];
      if (vehicleIdsParam && vehicleIds.length === 0) {
      console.warn('API - invalid vehicleIds param:', vehicleIdsParam);
    }

    let query;

    // If vehicleIds are provided, fetch fills for those vehicles; otherwise, fetch fills for the user's own vehicles
    if (vehicleIds.length > 0) {
      console.log('API - fills.get : Fetching fills for vehicle IDs:', vehicleIds);
      query = supabase
      .from('family_fills')
      .select('fill_id, vehicle_id, vehicle_name, user_id, owner_name, date, odometer, liters, amount, price_per_liter, notes, created_at')
      .in('vehicle_id', vehicleIds)
      .order('date', { ascending: false });
    } else {
      console.log('API - fills.get : Fetching fills for user ID:', user.id);
      query = supabase
      .from('vehicle_fills')
      .select('fill_id, vehicle_id, vehicle_name, user_id, owner_name, date, odometer, liters, amount, price_per_liter, notes, created_at')
      .eq('user_id', user.id)
      .order('date', { ascending: false });
    }

    const { data: fills, error } = await query;
    console.log('API - fills.get : Fetched fills are ', fills);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Erreur lors de la récupération des pleins' }, { status: 500 });
    }

    // Transformation pour correspondre au format attendu par le front
    const transformedFills = fills.map((fill) => ({
      id: fill.fill_id,
      vehicle_id: fill.vehicle_id,
      owner: fill.user_id,
      date: fill.date,
      odometer: fill.odometer,
      liters: fill.liters,
      amount: fill.amount,
      price_per_liter: fill.price_per_liter,
      notes: fill.notes,
      created_at: fill.created_at,
      vehicle_name: fill.vehicle_name,
      owner_name: fill.owner_name
    }));

    return NextResponse.json({
      fills: transformedFills,
      count: transformedFills.length
    }, { status: 200 });

  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json({ error: 'Erreur serveur inattendue' }, { status: 500 });
  }
}