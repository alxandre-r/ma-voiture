// src/app/api/familyVehicles/route.ts
import { NextResponse } from 'next/server';

import { createSupabaseServerClient } from '@/lib/supabase/server';

/**
 * GET /api/vehicles/get/familyVehicles
 * Expects query param userId
 * Retourne les véhicules de toutes les familles de l'utilisateur, en excluant les siens
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');

    if (!userId) return NextResponse.json([], { status: 200 });

    const supabase = await createSupabaseServerClient();

    // Récupérer toutes les famille_ids de l'utilisateur (multi-famille)
    const { data: memberships, error: familyError } = await supabase
      .from('family_members')
      .select('family_id')
      .eq('user_id', userId);

    if (familyError) {
      console.error('Error fetching family ids:', familyError);
      return NextResponse.json({ error: familyError.message }, { status: 500 });
    }

    const familyIds = memberships?.map((m) => m.family_id) ?? [];
    if (familyIds.length === 0) return NextResponse.json([], { status: 200 });

    // Récupérer les véhicules de toutes les familles (sauf ceux de l'utilisateur)
    const { data, error } = await supabase
      .from('vehicles_for_display')
      .select('*')
      .overlaps('family_ids', familyIds)
      .neq('owner_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching family vehicles:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Fetch insurance contracts for all vehicles
    const vehicleIds = data?.map((v) => v.vehicle_id) || [];

    let insuranceData: Record<
      number,
      Array<{
        id: number;
        start_date: string;
        end_date: string | null;
        monthly_cost: number;
        provider: string | null;
      }>
    > = {};

    if (vehicleIds.length > 0) {
      const { data: contracts, error: insuranceError } = await supabase
        .from('insurance_contracts')
        .select('id, vehicle_id, start_date, end_date, monthly_cost, provider')
        .in('vehicle_id', vehicleIds)
        .order('start_date', { ascending: false });

      if (!insuranceError && contracts) {
        insuranceData = contracts.reduce(
          (acc, contract) => {
            const vid = contract.vehicle_id;
            if (!acc[vid]) {
              acc[vid] = [];
            }
            acc[vid].push({
              id: contract.id,
              start_date: contract.start_date,
              end_date: contract.end_date,
              monthly_cost: contract.monthly_cost,
              provider: contract.provider,
            });
            return acc;
          },
          {} as typeof insuranceData,
        );
      }
    }

    // Attach insurance data to vehicles
    const vehiclesWithInsurance =
      data?.map((vehicle) => ({
        ...vehicle,
        insurance_history: insuranceData[vehicle.vehicle_id] || [],
      })) || [];

    return NextResponse.json(vehiclesWithInsurance);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erreur inconnue';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
