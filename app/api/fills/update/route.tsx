/**
 * @file app/api/fills/update/route.tsx
 * @fileoverview API endpoint for updating fuel fill-up records.
 * 
 * This endpoint handles PATCH requests to update existing fill-up records
 * with proper authentication and ownership verification.
 */

import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

/**
 * PATCH /api/fills/update
 * 
 * Update an existing fuel fill-up record.
 * Requires authentication and ownership verification.
 * 
 * Request body should contain:
 * - id: number (required)
 * - Any other fields to update (date, odometer, liters, amount, etc.)
 */
export async function PATCH(request: Request) {
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
    
    // Validate required field
    if (!body.id) {
      return NextResponse.json(
        { error: 'Le champ id est requis' },
        { status: 400 }
      );
    }
    
    // Verify fill ownership
    const { data: existingFill, error: fillError } = await supabase
      .from('fills')
      .select('id, owner, vehicle_id')
      .eq('id', body.id)
      .single();
    
    if (fillError || !existingFill) {
      return NextResponse.json(
        { error: 'Plein non trouvé' },
        { status: 404 }
      );
    }
    
    if (existingFill.owner !== user.id) {
      return NextResponse.json(
        { error: 'Vous n&apos;êtes pas autorisé à modifier ce plein' },
        { status: 403 }
      );
    }
    
    // Prepare update data (exclude id and owner)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _, owner: __, ...updateData } = body;
    
    // Update fill record
    const { data: updatedFill, error } = await supabase
      .from('fills')
      .update(updateData)
      .eq('id', body.id)
      .eq('owner', user.id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating fill:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour du plein' },
        { status: 500 }
      );
    }
    
    // Update vehicle odometer if fill has odometer data
    if (body.odometer) {
      const { error: updateError } = await supabase
        .from('vehicles')
        .update({ odometer: body.odometer })
        .eq('id', existingFill.vehicle_id)
        .eq('owner', user.id);
        
      if (updateError) {
        console.error('Error updating vehicle odometer:', updateError);
        // Don't fail the entire operation if odometer update fails
      }
    }
    
    // Get vehicle info for response
    const { data: vehicle } = await supabase
      .from('vehicles')
      .select('name, fuel_type')
      .eq('id', existingFill.vehicle_id)
      .single();
    
    // Add vehicle info to response
    const responseFill = {
      ...updatedFill,
      vehicle_name: vehicle?.name || null,
      fuel_type: vehicle?.fuel_type || null,
    };
    
    return NextResponse.json(
      { 
        fill: responseFill,
        message: 'Plein mis à jour avec succès'
      },
      { status: 200 }
    );
    
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json(
      { error: 'Erreur serveur inattendue' },
      { status: 500 }
    );
  }
}