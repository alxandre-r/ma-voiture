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
    // Fetch fills with vehicle information
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
        vehicles:vehicles (name, make, model, fuel_type)
      `)
      .eq('owner', user.id)
      .order('date', { ascending: false });
    
    if (error) {
      console.error('Error fetching fills:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des pleins' },
        { status: 500 }
      );
    }
    
    // Transform data to include vehicle info at top level
    const transformedFills = fills.map((fill) => {
      const vehicles = fill.vehicles as Array<{ name: string; fuel_type: string }> | null;
      return {
        ...fill,
        vehicle_name: vehicles?.[0]?.name || null,
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