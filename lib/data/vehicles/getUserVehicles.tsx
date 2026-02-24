// lib/data/vehicles/getUserVehicles.tsx
// SSR Fetch des véhicules de l'utilisateur.

import { cache } from 'react';

import { createSupabaseServerClient } from '../../supabase/supabaseServer';

export const getUserVehicles = cache(async (userId: string) => {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from('vehicles_for_display') // On récupère les données depuis la vue
    .select('*')
    .eq('owner_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch vehicles: ${error.message}`);
  }

  return data;
});
