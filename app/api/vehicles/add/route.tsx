/**
 * @file src/app/api/vehicles/add/route.ts
 * @fileoverview API route to add a new vehicle linked to the authenticated user.
 */

import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { Vehicle } from '@/types/vehicle';

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();

    // Récupération de l'utilisateur connecté
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, make, model, year, fuel_type, odometer, plate, color } = body;

    // Insertion en base
    const { data, error } = await supabase
      .from('vehicles')
      .insert([{
        owner_id: user.id,
        name,
        make,
        model,
        year,
        fuel_type,
        odometer,
        color,
        plate
      }])
      .select()
      .single<Vehicle>();

    if (error) {
      console.error('Error inserting vehicle:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Vehicle created successfully', vehicle: data });
  } catch (err) {
    console.error('Unexpected error in /vehicles/add:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
