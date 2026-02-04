/**
 * @file app/api/fills/add/route.tsx
 * @fileoverview API endpoint for adding new fuel fill-up records.
 * 
 * This endpoint handles POST requests to create new fill-up records
 * with proper authentication and validation.
 */

import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

export async function POST(request: Request) {
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
    // Parse request body
    const body = await request.json();
    
    // Validate required fields
    if (!body.vehicle_id) {
      return NextResponse.json(
        { error: 'Le champ vehicle_id est requis' },
        { status: 400 }
      );
    }
    
    // Verify vehicle ownership
    const { data: vehicle, error: vehicleError } = await supabase
      .from('vehicles')
      .select('id, name, fuel_type')
      .eq('id', body.vehicle_id)
      .eq('owner_id', user.id)
      .single();
    
    if (vehicleError || !vehicle) {
      return NextResponse.json(
        { error: 'Véhicule non trouvé ou vous n&apos;êtes pas le propriétaire' },
        { status: 404 }
      );
    }
    
    // Create fill record
    const { data: fill, error } = await supabase
      .from('fills')
      .insert([{
        vehicle_id: body.vehicle_id,
        owner_id: user.id,
        date: body.date,
        odometer: body.odometer || null,
        liters: body.liters || null,
        amount: body.amount || null,
        price_per_liter: body.price_per_liter || null,
        notes: body.notes || null,
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Error adding fill:', error);
      return NextResponse.json(
        { error: 'Erreur lors de l&apos;ajout du plein' },
        { status: 500 }
      );
    }
    
    // Update vehicle odometer if fill has odometer data
    if (body.odometer) {
      const { error: updateError } = await supabase
        .from('vehicles')
        .update({ odometer: body.odometer })
        .eq('id', body.vehicle_id)
        .eq('owner_id', user.id);
        
      if (updateError) {
        console.error('Error updating vehicle odometer:', updateError);
      }
    }
    
    // Add vehicle info to response for UI
    const responseFill = {
      ...fill,
      vehicle_name: vehicle.name,
      fuel_type: vehicle.fuel_type,
    };
    
    return NextResponse.json(
      { 
        fill: responseFill,
        message: 'Plein ajouté avec succès'
      },
      { status: 201 }
    );
    
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json(
      { error: 'Erreur serveur inattendue' },
      { status: 500 }
    );
  }
}