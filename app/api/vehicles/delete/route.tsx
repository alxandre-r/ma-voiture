/**
 * @file app/api/vehicles/delete/route.tsx
 * @fileoverview API route to delete a vehicle.
 * 
 * This endpoint allows authenticated users to delete their own vehicles.
 * Includes proper authentication and authorization checks.
 */

import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

/**
 * DELETE /api/vehicles/delete
 * 
 * Delete a vehicle owned by the authenticated user.
 * 
 * @param {Request} request - The incoming HTTP request with vehicle ID in JSON body
 * @returns {Promise<NextResponse>} JSON response with success or error message
 */
export async function DELETE(request: Request) {
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
    const { vehicle_id } = await request.json();

    if (!vehicle_id) {
      return NextResponse.json({ error: 'Vehicle ID is required' }, { status: 400 });
    }

    // First, verify the vehicle exists and is owned by the user
    const { data: vehicle, error: fetchError } = await supabase
      .from('vehicles')
      .select('id, owner_id')
      .eq('id', vehicle_id)
      .eq('owner_id', user.id)
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching vehicle:', fetchError);
      return NextResponse.json({ error: 'Failed to verify vehicle ownership' }, { status: 500 });
    }

    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found or you do not have permission to delete it' }, { status: 404 });
    }

    // Delete the vehicle
    const { error: deleteError } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', vehicle_id)
      .eq('owner_id', user.id);

    if (deleteError) {
      console.error('Error deleting vehicle:', deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json(
      { message: 'Vehicle deleted successfully', vehicle_id },
      { status: 200 }
    );
  } catch (err) {
    console.error('Unexpected error in /vehicles/delete:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}