// lib/data/vehicles/getFamilyVehicles.tsx
// SSR Fetch des véhicules des membres de la famille de l'utilisateur.

import { cache } from 'react';

import { createSupabaseServerClient } from '../../supabase/server';

export const getFamilyVehicles = cache(async (familyId?: string) => {
  const supabase = await createSupabaseServerClient();

  if (!familyId) return [];

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('vehicles_for_display')
    .select('*')
    .eq('family_id', familyId)
    .neq('owner_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch vehicles: ${error.message}`);
  }

  return data;
});

export const getFamilyVehiclesMinimal = cache(async (familyId?: string) => {
  const supabase = await createSupabaseServerClient();

  if (!familyId) return [];

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('vehicles_for_display')
    .select('vehicle_id, make, model, year, odometer')
    .eq('family_id', familyId)
    .neq('owner_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch vehicles: ${error.message}`);
  }

  return data;
});
