/**
 * @file app/api/fills/delete/route.tsx
 * @fileoverview API endpoint for deleting fuel fill-up records.
 * 
 * This endpoint handles DELETE requests to remove fill-up records
 * with proper authentication and ownership verification.
 */

import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

/**
 * DELETE /api/fills/delete
 * 
 * Delete an existing fuel fill-up record.
 * Requires authentication and ownership verification.
 * 
 * Request body should contain:
 * - fillId: number (required)
 */
export async function DELETE(request: Request) {
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
    if (!body.fillId) {
      return NextResponse.json(
        { error: 'Le champ fillId est requis' },
        { status: 400 }
      );
    }
    
    // Verify fill ownership
    const { data: existingFill, error: fillError } = await supabase
      .from('fills')
      .select('id, owner, vehicle_id, date')
      .eq('id', body.fillId)
      .single();
    
    if (fillError || !existingFill) {
      return NextResponse.json(
        { error: 'Plein non trouvé' },
        { status: 404 }
      );
    }
    
    if (existingFill.owner !== user.id) {
      return NextResponse.json(
        { error: 'Vous n&apos;êtes pas autorisé à supprimer ce plein' },
        { status: 403 }
      );
    }
    
    // Use the vehicle_id and date from the existing fill verification
    const vehicleId = existingFill.vehicle_id;
    
    // Delete fill record
    const { error } = await supabase
      .from('fills')
      .delete()
      .eq('id', body.fillId)
      .eq('owner', user.id);
    
    if (error) {
      console.error('Error deleting fill:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la suppression du plein' },
        { status: 500 }
      );
    }
    
    // After deleting the fill, find the most recent remaining fill for this vehicle
    const { data: mostRecentFill, error: recentFillError } = await supabase
      .from('fills')
      .select('date')
      .eq('vehicle_id', vehicleId)
      .eq('owner', user.id)
      .order('date', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (recentFillError) {
      console.error('Error finding most recent fill after deletion:', recentFillError);
      // Don't fail the entire operation if we can't find the most recent fill
    }
    
    // Update the vehicle's last_fill field
    const newLastFillDate = mostRecentFill ? mostRecentFill.date : null;
    
    const { error: updateError } = await supabase
      .from('vehicles')
      .update({ last_fill: newLastFillDate })
      .eq('id', vehicleId)
      .eq('owner', user.id);
      
    if (updateError) {
      console.error('Error updating vehicle last_fill after fill deletion:', updateError);
      // Don't fail the entire operation if last_fill update fails
    }
    
    return NextResponse.json(
      { 
        message: 'Plein supprimé avec succès',
        fillId: body.fillId
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