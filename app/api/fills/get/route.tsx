/**
 * @file app/api/fills/get/route.tsx
 * @fileoverview API endpoint for retrieving fuel fill-up records.
 * 
 * This endpoint handles GET requests to fetch fill-up records
 * for the authenticated user.
 */

import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

/**
 * GET /api/fills/get
 * 
 * Retrieve all fuel fill-up records for the authenticated user.
 * Returns fills with associated vehicle information.
 */
export async function GET() {
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
    // First, check if fills table exists by trying a simple query
    const { data: fills, error } = await supabase
      .from('fills')
      .select(`
        id,
        vehicle_id,
        owner,
        date,
        odometer,
        liters,
        amount,
        price_per_liter,
        is_full,
        notes,
        created_at,
        vehicles:vehicles (name, fuel_type)
      `)
      .eq('owner', user.id)
      .order('date', { ascending: false });
    
    if (error) {
      console.error('Detailed Supabase error:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      
      // Try fallback query without vehicle join if the error is related to vehicles table
      if (error.message.includes('relation') || error.message.includes('vehicles')) {
        console.log('Attempting fallback query without vehicle join...');
        
        const { data: fallbackFills, error: fallbackError } = await supabase
          .from('fills')
          .select('id, vehicle_id, owner, date, odometer, liters, amount, price_per_liter, is_full, notes, created_at')
          .eq('owner', user.id)
          .order('date', { ascending: false });
        
        if (!fallbackError && fallbackFills) {
          console.log('Fallback query successful, returning fills without vehicle info');
          const transformedFallbackFills = fallbackFills.map((fill) => ({
            ...fill,
            vehicle_name: `Véhicule #${fill.vehicle_id}`,
            fuel_type: null,
          }));
          
          return NextResponse.json(
            { 
              fills: transformedFallbackFills,
              count: transformedFallbackFills.length,
              warning: 'Les informations sur les véhicules ne sont pas disponibles'
            },
            { status: 200 }
          );
        }
      }
      
      // Provide more specific error messages based on error type
      let errorMessage = 'Erreur lors de la récupération des pleins';
      
      if (error.code === '42P01') { // Table doesn't exist
        errorMessage = 'La table des pleins n\'existe pas dans la base de données.';
      } else if (error.code === '42703') { // Column doesn't exist
        errorMessage = 'Structure de base de données incompatible.';
      } else if (error.code === '42883') { // Function doesn't exist
        errorMessage = 'Fonction de base de données manquante.';
      } else if (error.message.includes('permission')) {
        errorMessage = 'Problème de permissions sur la base de données.';
      } else if (error.message.includes('relation')) {
        errorMessage = 'La table des véhicules n\'existe pas ou est inaccessible.';
      }
      
      console.error('Error fetching fills:', errorMessage, 'Original error:', error);
      return NextResponse.json(
        { 
          error: errorMessage,
          debug: process.env.NODE_ENV === 'development' ? {
            code: error.code,
            message: error.message,
            hint: error.hint
          } : undefined
        },
        { status: 500 }
      );
    }
    
    // Transform data to include vehicle info at top level
    const transformedFills = fills.map((fill) => {
      const vehicles = fill.vehicles as Array<{ name: string; fuel_type: string }> | null;
      const vehicleName = vehicles?.[0]?.name || `Véhicule #${fill.vehicle_id}`;
      
      return {
        ...fill,
        vehicle_name: vehicleName,
        fuel_type: vehicles?.[0]?.fuel_type || null,
      };
    });
    
    return NextResponse.json(
      { 
        fills: transformedFills,
        count: transformedFills.length
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