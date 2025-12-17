/**
 * @file app/api/vehicles/update/route.tsx
 * @fileoverview API route to update an existing vehicle.
 * 
 * This endpoint allows authenticated users to update their own vehicles.
 * Includes proper authentication, authorization, and validation checks.
 */

import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { Vehicle } from '@/types/vehicle';

/**
 * PATCH /api/vehicles/update
 * 
 * Update a vehicle owned by the authenticated user.
 * 
 * @param {Request} request - The incoming HTTP request with vehicle data in JSON body
 * @returns {Promise<NextResponse>} JSON response with success or error message
 */
export async function PATCH(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();

    // Get authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { id, ...inputData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Vehicle ID is required' }, { status: 400 });
    }

    // Check if any update data was provided
    if (Object.keys(inputData).length === 0) {
      return NextResponse.json({ error: 'No update data provided' }, { status: 400 });
    }

    // Filter update data to only include fields that exist in the database schema
    // This prevents errors when UI tries to update fields that don't exist in the schema
    const validFields = ['name', 'owner', 'make', 'model', 'year', 'fuel_type', 'manufacturer_consumption', 'odometer', 'plate', 'last_fill'];
    const updateData = Object.fromEntries(
      Object.entries(inputData).filter(([key]) => validFields.includes(key))
    );

    // Check if any valid fields remain after filtering
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    // First, verify the vehicle exists and is owned by the user
    const { data: vehicle, error: fetchError } = await supabase
      .from('vehicles')
      .select('id, owner')
      .eq('id', id)
      .eq('owner', user.id)
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching vehicle:', fetchError);
      return NextResponse.json({ error: 'Failed to verify vehicle ownership' }, { status: 500 });
    }

    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found or you do not have permission to update it' }, { status: 404 });
    }



    // Query the fills table for the most recent fill for this vehicle
    const { data: mostRecentFill, error: fillError } = await supabase
      .from('fills')
      .select('date')
      .eq('vehicle_id', id)
      .eq('owner', user.id)
      .order('date', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fillError) {
      console.error('Error fetching most recent fill:', fillError);
      // Continue with update even if we can't get fill data
    }

    // If we found a recent fill and last_fill wasn't explicitly provided in the update,
    // automatically set it to the date of the most recent fill
    if (mostRecentFill && !updateData.last_fill) {
      updateData.last_fill = mostRecentFill.date;
    }

    // Update the vehicle
    const { data, error: updateError } = await supabase
      .from('vehicles')
      .update(updateData)
      .eq('id', id)
      .eq('owner', user.id)
      .select()
      .single<Vehicle>();

    if (updateError) {
      console.error('Error updating vehicle:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json(
      { message: 'Vehicle updated successfully', vehicle: data },
      { status: 200 }
    );
  } catch (err) {
    console.error('Unexpected error in /vehicles/update:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}