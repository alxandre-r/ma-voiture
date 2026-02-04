/**
 * @file app/api/vehicles/update/route.tsx
 * @fileoverview API route to update an existing vehicle.
 */

import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { Vehicle } from '@/types/vehicle';

const VALID_FIELDS = ['name', 'owner', 'make', 'model', 'year', 'fuel_type', 'manufacturer_consumption', 'odometer', 'plate', 'last_fill'];

export async function PATCH(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();

    // Auth user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse body
    const body = await request.json();
    const { vehicle_id: id, ...inputData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Vehicle ID is required' }, { status: 400 });
    }

    // Filter valid fields
    const updateData = Object.fromEntries(
      Object.entries(inputData).filter(([key]) => VALID_FIELDS.includes(key))
    );

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    // Verify ownership
    const { data: vehicle, error: fetchError } = await supabase
      .from('vehicles')
      .select('id, owner_id')
      .eq('id', id)
      .eq('owner_id', user.id)
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching vehicle:', fetchError);
      return NextResponse.json({ error: 'Failed to verify vehicle ownership' }, { status: 500 });
    }

    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found or no permission' }, { status: 404 });
    }

    // Update vehicle
    const { data, error: updateError } = await supabase
      .from('vehicles')
      .update(updateData)
      .eq('id', id)
      .eq('owner_id', user.id)
      .select()
      .single<Vehicle>();

    if (updateError) {
      console.error('Error updating vehicle:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Vehicle updated successfully', vehicle: data }, { status: 200 });
  } catch (err) {
    console.error('Unexpected error in /vehicles/update:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}